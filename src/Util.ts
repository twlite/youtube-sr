import Channel from "./Structures/Channel";
import Playlist from "./Structures/Playlist";
import Video from "./Structures/Video";

const PLAYLIST_REGEX = /^https?:\/\/(www.)?youtube.com\/playlist\?list=((PL|UU|LL|RD|OL)[a-zA-Z0-9-_]{16,41})$/;
const PLAYLIST_ID = /(PL|UU|LL|RD|OL)[a-zA-Z0-9-_]{16,41}/;
const VIDEO_URL = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
const VIDEO_ID = /^[a-zA-Z0-9-_]{11}$/;
const fetch = getFetch();
const DEFAULT_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

export interface ParseSearchInterface {
    type?: "video" | "playlist" | "channel" | "all";
    limit?: number;
    requestOptions?: RequestInit;
}

function getFetch(): typeof window.fetch {
    // browser/deno
    if (typeof window !== "undefined") return window.fetch;

    // node
    return require("node-fetch");
}

class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    static get VideoRegex(): RegExp {
        return VIDEO_URL;
    }

    static get VideoIDRegex(): RegExp {
        return VIDEO_ID;
    }

    /**
     * YouTube playlist URL Regex
     * @type {RegExp}
     */
    static get PlaylistURLRegex(): RegExp {
        return PLAYLIST_REGEX;
    }

    /**
     * YouTube Playlist ID regex
     * @type {RegExp}
     */
    static get PlaylistIDRegex(): RegExp {
        return PLAYLIST_ID;
    }

    /**
     * Parse HTML
     * @param {string} url Website URL
     * @param {RequestInit} [requestOptions] Request Options
     * @returns {Promise<string>}
     */
    static getHTML(url: string, requestOptions?: RequestInit): Promise<string> {
        if (!requestOptions)
            requestOptions = {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0"
                }
            };

        return new Promise((resolve, reject) => {
            fetch(url, requestOptions)
                .then((res: Response) => {
                    if (!res.ok) throw new Error(`Rejected with status code: ${res.status}`);
                    return res.text();
                })
                .then((html: string) => resolve(html))
                .catch((e: Error) => reject(e));
        });
    }

    /**
     * Returns duration in ms
     * @param {string} duration Duration to parse
     */
    static parseDuration(duration: string): number {
        duration ??= "0:00";
        const args = duration.split(":");
        let dur = 0;

        switch (args.length) {
            case 3:
                dur = parseInt(args[0]) * 60 * 60 * 1000 + parseInt(args[1]) * 60 * 1000 + parseInt(args[2]) * 1000;
                break;
            case 2:
                dur = parseInt(args[0]) * 60 * 1000 + parseInt(args[1]) * 1000;
                break;
            default:
                dur = parseInt(args[0]) * 1000;
        }

        return dur;
    }

    /**
     * Parse items from html
     * @param {string} html HTML
     * @param options Options
     */
    static parseSearchResult(html: string, options?: ParseSearchInterface): (Video | Channel | Playlist)[] {
        if (!html) throw new Error("Invalid raw data");
        if (!options) options = { type: "video", limit: 0 };
        if (!options.type) options.type = "video";

        const results = [];
        let details = [];
        let fetched = false;

        // try to parse html
        try {
            let data = html.split("ytInitialData = JSON.parse('")[1].split("');</script>")[0];
            html = data.replace(/\\x([0-9A-F]{2})/gi, (...items) => {
                return String.fromCharCode(parseInt(items[1], 16));
            });
        } catch {
            /* do nothing */
        }

        try {
            details = JSON.parse(html.split('{"itemSectionRenderer":{"contents":')[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]);
            fetched = true;
        } catch {
            /* do nothing */
        }

        if (!fetched) {
            try {
                details = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
                fetched = true;
            } catch {
                /* do nothing */
            }
        }

        if (!fetched) return [];

        for (let i = 0; i < details.length; i++) {
            if (typeof options.limit === "number" && options.limit > 0 && results.length >= options.limit) break;
            let data = details[i];
            let res;
            if (options.type === "all") {
                if (!!data.videoRenderer) options.type = "video";
                else if (!!data.channelRenderer) options.type = "channel";
                else if (!!data.playlistRenderer) options.type = "playlist";
                else continue;
            }

            if (options.type === "video") {
                const parsed = Util.parseVideo(data);
                if (!parsed) continue;
                res = parsed;
            } else if (options.type === "channel") {
                const parsed = Util.parseChannel(data);
                if (!parsed) continue;
                res = parsed;
            } else if (options.type === "playlist") {
                const parsed = Util.parsePlaylist(data);
                if (!parsed) continue;
                res = parsed;
            }

            results.push(res);
        }

        return results;
    }

    /**
     * Parse channel from raw data
     * @param {object} data Raw data to parse video from
     */
    static parseChannel(data?: any): Channel {
        if (!data || !data.channelRenderer) return;
        const badge = data.channelRenderer.ownerBadges && data.channelRenderer.ownerBadges[0];
        let url = `https://www.youtube.com${data.channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`;
        let res = new Channel({
            id: data.channelRenderer.channelId,
            name: data.channelRenderer.title.simpleText,
            icon: data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1],
            url: url,
            verified: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes("verified")),
            subscribers: data.channelRenderer.subscriberCountText.simpleText
        });

        return res;
    }

    /**
     * Parse video from raw data
     * @param {object} data Raw data to parse video from
     */
    static parseVideo(data?: any): Video {
        if (!data || !data.videoRenderer) return;

        const badge = data.videoRenderer.ownerBadges && data.videoRenderer.ownerBadges[0];
        let res = new Video({
            id: data.videoRenderer.videoId,
            url: `https://www.youtube.com/watch?v=${data.videoRenderer.videoId}`,
            title: data.videoRenderer.title.runs[0].text,
            description: data.videoRenderer.descriptionSnippet && data.videoRenderer.descriptionSnippet.runs[0] ? data.videoRenderer.descriptionSnippet.runs[0].text : "",
            duration: data.videoRenderer.lengthText ? Util.parseDuration(data.videoRenderer.lengthText.simpleText) : 0,
            duration_raw: data.videoRenderer.lengthText ? data.videoRenderer.lengthText.simpleText : null,
            thumbnail: {
                id: data.videoRenderer.videoId,
                url: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].url,
                height: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].height,
                width: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].width
            },
            channel: {
                id: data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId || null,
                name: data.videoRenderer.ownerText.runs[0].text || null,
                url: `https://www.youtube.com${data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.videoRenderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
                icon: {
                    url: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url,
                    width: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].width,
                    height: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].height
                },
                verified: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes("verified"))
            },
            uploadedAt: data.videoRenderer.publishedTimeText?.simpleText ?? null,
            views: data.videoRenderer.viewCountText?.simpleText?.replace(/[^0-9]/g, "") ?? 0
        });

        return res;
    }

    static parsePlaylist(data?: any): Playlist {
        if (!data.playlistRenderer) return;

        const res = new Playlist(
            {
                id: data.playlistRenderer.playlistId,
                title: data.playlistRenderer.title.simpleText,
                thumbnail: {
                    id: data.playlistRenderer.playlistId,
                    url: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].url,
                    height: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].height,
                    width: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].width
                },
                channel: {
                    id: data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                    name: data.playlistRenderer.shortBylineText.runs[0].text,
                    url: `https://www.youtube.com${data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`
                },
                videos: parseInt(data.playlistRenderer.videoCount.replace(/[^0-9]/g, ""))
            },
            true
        );

        return res;
    }

    static getPlaylistVideos(data: any, limit: number = Infinity) {
        const videos = [];

        for (let i = 0; i < data.length; i++) {
            if (limit === videos.length) break;
            const info = data[i].playlistVideoRenderer;
            if (!info || !info.shortBylineText) continue; // skip unknown videos

            videos.push(
                new Video({
                    id: info.videoId,
                    index: parseInt(info.index?.simpleText) || 0,
                    duration: Util.parseDuration(info.lengthText?.simpleText) || 0,
                    duration_raw: info.lengthText?.simpleText ?? "0:00",
                    thumbnail: {
                        id: info.videoId,
                        url: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].url,
                        height: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].height,
                        width: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].width
                    },
                    title: info.title.runs[0].text,
                    channel: {
                        id: info.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId || null,
                        name: info.shortBylineText.runs[0].text || null,
                        url: `https://www.youtube.com${info.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl || info.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
                        icon: null
                    }
                })
            );
        }

        return videos;
    }

    static getPlaylist(html: string, limit?: number): Playlist {
        if (!limit || typeof limit !== "number") limit = 100;
        if (limit <= 0) limit = Infinity;
        let parsed;
        let playlistDetails;
        try {
            const rawJSON = `${html.split('{"playlistVideoListRenderer":{"contents":')[1].split('}],"playlistId"')[0]}}]`;
            parsed = JSON.parse(rawJSON);
            playlistDetails = JSON.parse(html.split('{"playlistSidebarRenderer":')[1].split("}};</script>")[0]).items;
        } catch {
            return null;
        }
        const API_KEY = html.split('INNERTUBE_API_KEY":"')[1]?.split('"')[0] ?? html.split('innertubeApiKey":"')[1]?.split('"')[0] ?? DEFAULT_API_KEY;
        const videos = Util.getPlaylistVideos(parsed, limit);

        const data = playlistDetails[0].playlistSidebarPrimaryInfoRenderer;

        if (!data.title.runs || !data.title.runs.length) return null;
        const author = playlistDetails[1]?.playlistSidebarSecondaryInfoRenderer.videoOwner;
        const views = data.stats.length === 3 ? data.stats[1].simpleText.replace(/[^0-9]/g, "") : 0;
        const lastUpdate = data.stats.find((x: any) => "runs" in x && x["runs"].find((y: any) => y.text.toLowerCase().includes("last update")))?.runs.pop()?.text ?? null;
        const videosCount = data.stats[0].runs[0].text.replace(/[^0-9]/g, "") || 0;

        const res = new Playlist({
            continuation: {
                api: API_KEY,
                token: Util.getContinuationToken(parsed),
                clientVersion: html.split('"INNERTUBE_CONTEXT_CLIENT_VERSION":"')[1]?.split('"')[0] ?? html.split('"innertube_context_client_version":"')[1]?.split('"')[0] ?? "<some version>"
            },
            id: data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId,
            title: data.title.runs[0].text,
            videoCount: parseInt(videosCount) || 0,
            lastUpdate: lastUpdate,
            views: parseInt(views) || 0,
            videos: videos,
            url: `https://www.youtube.com/playlist?list=${data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId}`,
            link: `https://www.youtube.com${data.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
            author: author
                ? {
                      name: author.videoOwnerRenderer.title.runs[0].text,
                      id: author.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId,
                      url: `https://www.youtube.com${author.videoOwnerRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url || author.videoOwnerRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
                      icon: author.videoOwnerRenderer.thumbnail.thumbnails.length ? author.videoOwnerRenderer.thumbnail.thumbnails[author.videoOwnerRenderer.thumbnail.thumbnails.length - 1].url : null
                  }
                : {},
            thumbnail: data.thumbnailRenderer.playlistVideoThumbnailRenderer?.thumbnail.thumbnails.length ? data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.length - 1].url : null
        });

        return res;
    }

    static getContinuationToken(ctx: any): string {
        const continuationToken = ctx.find((x: any) => Object.keys(x)[0] === "continuationItemRenderer")?.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
        return continuationToken;
    }

    static getVideo(html: string) {
        let data,
            nextData = {};
        try {
            const parsed = JSON.parse(html.split("var ytInitialData = ")[1].split(";</script>")[0]);
            data = parsed.contents.twoColumnWatchNextResults.results.results.contents;

            try {
                nextData = parsed.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;
            } catch {}
        } catch {
            throw new Error("Could not parse video metadata!");
        }

        const raw = {
            primary: data[0].videoPrimaryInfoRenderer,
            secondary: data[1].videoSecondaryInfoRenderer
        };

        let info;

        try {
            info = JSON.parse(html.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0]).videoDetails;
        } catch {
            info = JSON.parse(html.split("var ytInitialPlayerResponse = ")[1].split(";var meta")[0]).videoDetails;
        }

        info = {
            ...raw.primary,
            ...raw.secondary,
            info
        };

        const payload = new Video({
            id: info.info.videoId,
            title: info.info.title,
            views: parseInt(info.info.viewCount) || 0,
            tags: info.info.keywords,
            private: info.info.isPrivate,
            live: info.info.isLiveContent,
            duration: parseInt(info.info.lengthSeconds) * 1000,
            duration_raw: Util.durationString(Util.parseMS(parseInt(info.info.lengthSeconds) * 1000 || 0)),
            channel: {
                name: info.info.author,
                id: info.info.channelId,
                url: `https://www.youtube.com${info.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
                icon: info.owner.videoOwnerRenderer.thumbnail.thumbnails[0],
                subscribers: info.owner.videoOwnerRenderer.subscriberCountText?.simpleText?.replace(" subscribers", "")
            },
            description: info.info.shortDescription,
            thumbnail: {
                ...info.info.thumbnail.thumbnails[info.info.thumbnail.thumbnails.length - 1],
                id: info.info.videoId
            },
            uploadedAt: info.dateText.simpleText,
            ratings: {
                likes: parseInt(info.sentimentBar.sentimentBarRenderer.tooltip.split(" / ")[0].replace(/,/g, "")),
                dislikes: parseInt(info.sentimentBar.sentimentBarRenderer.tooltip.split(" / ")[1].replace(/,/g, ""))
            },
            videos: Util.getNext(nextData ?? {})
        });

        return payload;
    }

    static getNext(body: any, home = false): Video[] {
        const results: Video[] = [];
        if (typeof body[Symbol.iterator] !== "function") return results;

        for (const result of body) {
            const details = home ? result : result.compactVideoRenderer;

            if (details) {
                try {
                    let viewCount = details.viewCountText.simpleText;
                    viewCount = (/^\d/.test(viewCount) ? viewCount : "0").split(" ")[0];

                    results.push(
                        new Video({
                            id: details.videoId,
                            title: details.title.simpleText ?? details.title.runs[0]?.text,
                            views: parseInt(viewCount.replace(/,/g, "")) || 0,
                            duration_raw: details.lengthText.simpleText ?? details.lengthText.accessibility.accessibilityData.label,
                            duration: Util.parseDuration(details.lengthText.simpleText) / 1000,
                            channel: {
                                name: details.shortBylineText.runs[0].text,
                                id: details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                                url: `https://www.youtube.com${details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
                                icon: home ? details.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0] : details.channelThumbnail.thumbnails[0],
                                subscribers: "0",
                                verified: Boolean(details.ownerBadges[0].metadataBadgeRenderer.tooltip === "Verified")
                            },
                            thumbnail: {
                                ...details.thumbnail.thumbnails[details.thumbnail.thumbnails.length - 1],
                                id: details.videoId
                            },
                            uploadedAt: details.publishedTimeText.simpleText,
                            ratings: {
                                likes: 0,
                                dislikes: 0
                            },
                            description: details.descriptionSnippet?.runs[0]?.text
                        })
                    );
                } catch {
                    continue;
                }
            }
        }

        return results;
    }

    static parseHomepage(html: string): Video[] {
        let contents: any;

        try {
            contents = html.split("var ytInitialData = ")[1].split(";</script>")[0];
            contents = JSON.parse(contents).contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents;
        } catch {
            return [];
        }

        if (!contents || !contents.length || !contents.find((x: any) => Object.keys(x)[0] === "richItemRenderer")) return [];
        contents = contents.filter((a: any) => Object.keys(a)[0] === "richItemRenderer").map((m: any) => m.richItemRenderer.content.videoRenderer);

        return Util.getNext(contents, true);
    }

    static getPlaylistURL(url: string): string {
        if (typeof url !== "string") return null;
        const group = PLAYLIST_ID.exec(url);
        if (!group) return null;
        const finalURL = `https://www.youtube.com/playlist?list=${group[0]}`;
        return finalURL;
    }

    static validatePlaylist(url: string): void {
        if (typeof url === "string" && url.match(PLAYLIST_ID) !== null) return;
        throw new Error("Invalid playlist url");
    }

    static filter(ftype: string): string {
        switch (ftype) {
            case "playlist":
                return "EgIQAw%253D%253D";
            case "video":
                return "EgIQAQ%253D%253D";
            case "channel":
                return "EgIQAg%253D%253D";
            default:
                throw new TypeError(`Invalid filter type "${ftype}"!`);
        }
    }

    static parseMS(milliseconds: number) {
        const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

        return {
            days: roundTowardsZero(milliseconds / 86400000),
            hours: roundTowardsZero(milliseconds / 3600000) % 24,
            minutes: roundTowardsZero(milliseconds / 60000) % 60,
            seconds: roundTowardsZero(milliseconds / 1000) % 60
        };
    }

    static durationString(data: any): string {
        const items = Object.keys(data);
        const required = ["days", "hours", "minutes", "seconds"];

        const parsed = items.filter((x) => required.includes(x)).map((m) => (data[m] > 0 ? data[m] : ""));
        const final = parsed
            .filter((x) => !!x)
            .map((x) => x.toString().padStart(2, "0"))
            .join(":");
        return final.length <= 3 ? `0:${final.padStart(2, "0") || 0}` : final;
    }

    static json(data: string) {
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }
}

export default Util;
