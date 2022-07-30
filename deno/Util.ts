// @ts-nocheck
/*
 * MIT License
 *
 * Copyright (c) 2020-present DevAndromeda
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Formatter } from "./formatter.ts";
import { Channel, Video, Playlist } from "./Structures/exports.ts";

const PLAYLIST_REGEX = /^https?:\/\/(www.)?youtube.com\/playlist\?list=((PL|FL|UU|LL|RD|OL)[a-zA-Z0-9-_]{16,41})$/;
const PLAYLIST_ID = /(PL|FL|UU|LL|RD|OL)[a-zA-Z0-9-_]{16,41}/;
const ALBUM_REGEX = /(RDC|O)LAK5uy_[a-zA-Z0-9-_]{33}/;
const VIDEO_URL = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
const VIDEO_ID = /^[a-zA-Z0-9-_]{11}$/;
const DEFAULT_INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
let innertubeCache: string = null;
let __fetch: typeof globalThis.fetch;
const isNode = typeof process !== "undefined" && "node" in (process.versions || {});
const FETCH_LIBS = ["undici", "node-fetch", "cross-fetch", "@vercel/fetch"];

export interface ParseSearchInterface {
    type?: "video" | "playlist" | "channel" | "all" | "film";
    limit?: number;
    requestOptions?: RequestInit;
}

async function getFetch(): Promise<typeof globalThis.fetch> {
    // return if fetch is already resolved
    if (typeof __fetch === "function") return __fetch;
    // try to locate fetch in window
    if (typeof window !== "undefined" && "fetch" in window) return window.fetch;
    // try to locate fetch in globalThis
    if ("fetch" in globalThis) return globalThis.fetch;

    // try to resolve fetch by importing fetch libs
    for (const fetchLib of FETCH_LIBS) {
        try {
            const pkg = await import(fetchLib);
            const mod = pkg.fetch || pkg.default || pkg;
            if (mod) return (__fetch = mod);
        } catch {}
    }

    if (isNode) throw new Error(`Could not resolve fetch library. Install one of ${FETCH_LIBS.map((m) => `"${m}"`).join(", ")} or define "fetch" in global scope!`);
    throw new Error("Could not resolve fetch in global scope");
}

class Util {
    private constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    static async innertubeKey(): Promise<string> {
        if (innertubeCache) return innertubeCache;
        return await Util.fetchInnerTubeKey();
    }

    static get VideoRegex(): RegExp {
        return VIDEO_URL;
    }

    static get VideoIDRegex(): RegExp {
        return VIDEO_ID;
    }

    static get AlbumRegex(): RegExp {
        return ALBUM_REGEX;
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

    static async fetchInnerTubeKey() {
        const html = await Util.getHTML("https://www.youtube.com?hl=en");
        const key = html.split('INNERTUBE_API_KEY":"')[1]?.split('"')[0] ?? html.split('innertubeApiKey":"')[1]?.split('"')[0];
        if (key) innertubeCache = key;
        return key ?? DEFAULT_INNERTUBE_KEY;
    }

    /**
     * Parse HTML
     * @param {string} url Website URL
     * @param {RequestInit} [requestOptions] Request Options
     * @returns {Promise<string>}
     */
    static getHTML(url: string, requestOptions: RequestInit = {}): Promise<string> {
        requestOptions = Object.assign(
            {},
            {
                headers: Object.assign(
                    {},
                    {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0"
                    },
                    requestOptions?.headers || {}
                )
            } as RequestInit,
            requestOptions || {}
        );

        return new Promise(async (resolve, reject) => {
            // lazy load fetch
            if (!__fetch) __fetch = await getFetch();
            __fetch(url, requestOptions)
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

        return Formatter.formatSearchResult(details, options);
    }

    /**
     * Parse channel from raw data
     * @param {object} data Raw data to parse video from
     */
    static parseChannel(data?: any): Channel {
        if (!data || !data.channelRenderer) return;
        const badges = data.channelRenderer.ownerBadges as any[];
        let url = `https://www.youtube.com${data.channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`;
        let res = new Channel({
            id: data.channelRenderer.channelId,
            name: data.channelRenderer.title.simpleText,
            icon: data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1],
            url: url,
            verified: !badges?.length ? false : badges.some((badge) => badge["verifiedBadge"] || badge?.metadataBadgeRenderer?.style?.toLowerCase().includes("verified")),
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
                    url: data.videoRenderer.channelThumbnail?.thumbnails?.[0]?.url || data.videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url,
                    width: data.videoRenderer.channelThumbnail?.thumbnails?.[0]?.width || data.videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.width,
                    height: data.videoRenderer.channelThumbnail?.thumbnails?.[0]?.height || data.videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.height
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
                    url: `https://www.youtube.com${data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint?.canonicalBaseUrl || data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata?.webCommandMetadata?.url}`
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
        const API_KEY = html.split('INNERTUBE_API_KEY":"')[1]?.split('"')[0] ?? html.split('innertubeApiKey":"')[1]?.split('"')[0] ?? DEFAULT_INNERTUBE_KEY;
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
            primary: data.find((section: any) => "videoPrimaryInfoRenderer" in section)?.videoPrimaryInfoRenderer,
            secondary: data.find((section: any) => "videoSecondaryInfoRenderer" in section)?.videoSecondaryInfoRenderer
        };

        let info;

        try {
            info = JSON.parse(html.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0]);
        } catch {
            info = JSON.parse(html.split("var ytInitialPlayerResponse = ")[1].split(";var meta")[0]);
        }

        if (!info?.videoDetails) return null;

        info = {
            ...raw.primary,
            ...raw.secondary,
            info
        };

        const payload = new Video({
            id: info.info.videoDetails.videoId,
            title: info.info.videoDetails.title,
            views: parseInt(info.info.videoDetails.viewCount) || 0,
            tags: info.info.videoDetails.keywords,
            private: info.info.videoDetails.isPrivate,
            live: info.info.videoDetails.isLiveContent,
            duration: parseInt(info.info.videoDetails.lengthSeconds) * 1000,
            duration_raw: Util.durationString(Util.parseMS(parseInt(info.info.videoDetails.lengthSeconds) * 1000 || 0)),
            channel: {
                name: info.info.videoDetails.author,
                id: info.info.videoDetails.channelId,
                url: `https://www.youtube.com${info.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
                icon: info.owner.videoOwnerRenderer.thumbnail.thumbnails[0],
                subscribers: info.owner.videoOwnerRenderer.subscriberCountText?.simpleText?.replace(" subscribers", "")
            },
            description: info.info.videoDetails.shortDescription,
            thumbnail: {
                ...info.info.videoDetails.thumbnail.thumbnails[info.info.videoDetails.thumbnail.thumbnails.length - 1],
                id: info.info.videoDetails.videoId
            },
            uploadedAt: info.dateText.simpleText,
            ratings: {
                likes: this.getInfoLikesCount(info) || 0,
                dislikes: 0
            },
            videos: Util.getNext(nextData ?? {}) || [],
            streamingData: info.info.streamingData || null
        });

        return payload;
    }

    static getInfoLikesCount(info: Record<string, any>) {
        const buttons = info.videoActions.menuRenderer.topLevelButtons as any[];
        const button = buttons.find((button) => button.toggleButtonRenderer?.defaultIcon.iconType === "LIKE");
        if (!button) return 0;

        return parseInt(button.toggleButtonRenderer.defaultText.accessibility?.accessibilityData.label.split(" ")[0].replace(/,/g, ""));
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
        const group = PLAYLIST_ID.exec(url) || ALBUM_REGEX.exec(url);
        if (!group) return null;
        if (group[0].startsWith("RD") && !ALBUM_REGEX.exec(group[0])) throw new Error("Mixes are not supported!");
        const finalURL = `https://www.youtube.com/playlist?list=${group[0]}`;
        return finalURL;
    }

    static validatePlaylist(url: string): void {
        if (typeof url === "string" && (url.match(PLAYLIST_ID) !== null || url.match(ALBUM_REGEX) !== null)) return;
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
            case "film":
                return "EgIQBA%253D%253D";
            default:
                throw new TypeError(`Invalid filter type "${ftype}"!`);
        }
    }

    static parseMS(milliseconds: number) {
        return {
            days: Math.trunc(milliseconds / 86400000),
            hours: Math.trunc(milliseconds / 3600000) % 24,
            minutes: Math.trunc(milliseconds / 60000) % 60,
            seconds: Math.trunc(milliseconds / 1000) % 60
        };
    }

    static durationString(data: any): string {
        const items = Object.keys(data);
        const required = ["days", "hours", "minutes", "seconds"];

        const parsed = items.filter((x) => required.includes(x)).map((m) => (data[m] > 0 ? data[m] : ""));
        const final = parsed
            .slice(parsed.findIndex((x) => !!x))
            .map((x, i) => (i == 0 ? x.toString() : x.toString().padStart(2, "0")))
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

    static async makeRequest(url = "", data: any = { data: {}, requestOptions: {} }) {
        const key = await Util.innertubeKey();
        const res = await Util.getHTML(`https://youtube.com/youtubei/v1${url}?key=${key}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Host: "www.youtube.com",
                Referer: "https://www.youtube.com"
            },
            body: JSON.stringify({
                context: {
                    client: {
                        utcOffsetMinutes: 0,
                        gl: "US",
                        hl: "en",
                        clientName: "WEB",
                        clientVersion: "1.20220406.00.00",
                        originalUrl: "https://www.youtube.com/",
                        ...(data.clientCtx || {})
                    },
                    ...(data.ctx || {})
                },
                ...(data.data || {})
            }),
            ...(data.requestOptions || {})
        });
        return Util.json(res);
    }
}

export default Util;
