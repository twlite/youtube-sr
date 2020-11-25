const fetch = typeof window !== "undefined" && window.fetch || require("node-fetch").default;
const Channel = require("./Structures/Channel");
const Playlist = require("./Structures/Playlist");
const Video = require("./Structures/Video");
const PLAYLIST_REGEX = /https?:\/\/(www.)?youtube.com\/playlist\?list=((PL|UU|LL|RD)[a-zA-Z0-9-_]{16,41})/;
const PLAYLIST_ID = /(PL|UU|LL|RD)[a-zA-Z0-9-_]{16,41}/;

class Util {

    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    /**
     * YouTube playlist URL Regex
     * @type {RegExp}
     */
    static get PlaylistURLRegex() {
        return PLAYLIST_REGEX;
    }

    /**
     * YouTube Playlist ID regex
     * @type {RegExp}
     */
    static get PlaylistIDRegex() {
        return PLAYLIST_ID;
    }

    /**
     * Parse HTML
     * @param {string} url Website URL
     * @param {RequestInit} [requestOptions] Request Options
     * @returns {Promise<string>}
     */
    static getHTML(url, requestOptions = {}) {
        return new Promise((resolve, reject) => {
            const prop = typeof window === "undefined" ? requestOptions : Object.defineProperty(requestOptions, "mode", { value: "no-cors" });
            fetch(url, prop)
                .then(res => res.text())
                .then(html => resolve(html))
                .catch(e => reject(e));
        });
    }

    /**
     * Returns duration in ms
     * @param {string} duration Duration to parse
     */
    static parseDuration(duration) {
        const args = duration.split(":");
        let dur = 0;

        switch(args.length) {
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
    static parseSearchResult(html, options = { type: "video", limit: 0 }) {
        if (!html) throw new Error("Invalid raw data");
        if (!options.type) options.type = "video";
        
        const results = [];
        let details = [];
        let fetched = false;

        // try to parse html
        try {
            let data = html.split("ytInitialData = JSON.parse('")[1].split("');</script>")[0];
            html = data.replace(/\\x([0-9A-F]{2})/ig, (...items) => {
                return String.fromCharCode(parseInt(items[1], 16));
            });
        } catch(e) { /* do nothing */ }
        
        try {
            details = JSON.parse(html.split('{"itemSectionRenderer":{"contents":')[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]);
            fetched = true;
        } catch(e) { /* do nothing */ }

        if (!fetched) {
            try {
                details = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
                fetched = true;
            } catch(e) { /* do nothing */ }
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
    static parseChannel(data = {}) {
        if (!data || !data.channelRenderer) return;
        const badge = data.channelRenderer.ownerBadges && data.channelRenderer.ownerBadges[0];
        let url = `https://www.youtube.com${data.channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`;
        let res = new Channel({
            id: data.channelRenderer.channelId,
            name: data.channelRenderer.title.simpleText,
            icon: data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1],
            url: url,
            verified: badge && badge.metadataBadgeRenderer && badge.metadataBadgeRenderer.style && badge.metadataBadgeRenderer.style.toLowerCase().includes("verified"),
            subscribers: data.channelRenderer.subscriberCountText.simpleText
        });

        return res;
    }

    /**
     * Parse video from raw data
     * @param {object} data Raw data to parse video from
     */
    static parseVideo(data = {}) {
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
                verified: badge && badge.metadataBadgeRenderer && badge.metadataBadgeRenderer.style && badge.metadataBadgeRenderer.style.toLowerCase().includes("verified")
            },
            uploadedAt: data.videoRenderer.publishedTimeText ? data.videoRenderer.publishedTimeText.simpleText : null,
            views: data.videoRenderer.viewCountText && data.videoRenderer.viewCountText.simpleText ? data.videoRenderer.viewCountText.simpleText.replace(/[^0-9]/g, "") : 0
        });

        return res;
    }

    static parsePlaylist(data = {}) {
        if (!data.playlistRenderer) return;
        
        const res = new Playlist({
            id: data.playlistRenderer.playlistId,
            title: data.playlistRenderer.title.simpleText,
            thumbnail: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].url,
            channel: {
                id: data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                name: data.playlistRenderer.shortBylineText.runs[0].text,
                url: `https://www.youtube.com${data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
            },
            videos: parseInt(data.playlistRenderer.videoCount.replace(/[^0-9]/g, ""))
        }, true);

        return res;
    }

    static getPlaylist(html, limit = 100) {
        if (!limit || typeof limit !== "number") limit = 100;
        if (limit <= 0) limit = 100;
        const videos = [];
        let parsed;
        let playlistDetails;
        try {
            const rawJSON = `${html.split("{\"playlistVideoListRenderer\":{\"contents\":")[1].split("}],\"playlistId\"")[0]}}]`;
            parsed = JSON.parse(rawJSON);
            playlistDetails = JSON.parse(html.split("{\"playlistSidebarRenderer\":")[1].split("\n")[0].slice(0, -3)).items;
		} catch (e) {
			return null;
        }
        
        for (let i = 0; i < parsed.length; i++) {
            if (limit === videos.length) break;
            const info = parsed[i].playlistVideoRenderer;
            if (!info.shortBylineText) continue; // skip unknown videos

            videos.push(new Video({
                id: info.videoId,
                index: parseInt(info.index.simpleText) || 0,
                duration: Util.parseDuration(info.lengthText.simpleText) || 0,
                duration_raw: info.lengthText.simpleText,
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
            }));
        }
        
        const data = playlistDetails[0].playlistSidebarPrimaryInfoRenderer;

        if (!data.title.runs || !data.title.runs.length) return null;

		const author = playlistDetails[1].playlistSidebarSecondaryInfoRenderer.videoOwner;
        const views = data.stats.length === 3 ? data.stats[1].simpleText.replace(/[^0-9]/g, "") : 0;
        const lastUpdate = data.stats.length === 3 ? (data.stats[2].runs ? data.stats[2].runs[0].text : data.stats[2].simpleText) : primaryRenderer.stats[1].simpleText;
        const videosCount = data.stats[0].runs[0].text.replace(/[^0-9]/g, "") || 0;

        const res = new Playlist({
            id: data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId,
            title: data.title.runs[0].text,
            videoCount: parseInt(videosCount) || 0,
            lastUpdate: lastUpdate || null,
            views: parseInt(views) || 0,
            videos: videos,
            url: `https://www.youtube.com/playlist?list=${data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId}`,
            link: `https://www.youtube.com${data.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
            author: {
                name: author.videoOwnerRenderer.title.runs[0].text,
                id: author.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId,
                url: `https://www.youtube.com${author.videoOwnerRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url || author.videoOwnerRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
                icon: author.videoOwnerRenderer.thumbnail.thumbnails.length ? author.videoOwnerRenderer.thumbnail.thumbnails[author.videoOwnerRenderer.thumbnail.thumbnails.length - 1].url : null
            },
            thumbnail: data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.length ? data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.length - 1].url : null
        });

        return res;
    }

    static getPlaylistURL(url) {
        if (typeof url !== "string") return null;
        const group = PLAYLIST_ID.exec(url);
        if (!group) return null;
        const finalURL = `https://www.youtube.com/playlist?list=${group[0]}`;
        return finalURL;
    }

    static validatePlaylist(url) {
        if (typeof url === "string" && !!(PLAYLIST_REGEX.test(url) || PLAYLIST_ID.test(url))) return;
        throw new Error("Invalid playlist url");
    }

}

module.exports = Util;
