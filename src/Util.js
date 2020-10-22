const fetch = require("node-fetch");
const Channel = require("./Structures/Channel");
const Video = require("./Structures/Video");

class Util {

    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    /**
     * Parse HTML
     * @param {string} url Website URL
     * @param {RequestInit} [requestOptions] Request Options
     * @returns {Promise<string>}
     */
    static getHTML(url, requestOptions = {}) {
        return new Promise((resolve, reject) => {
            fetch(url, requestOptions)
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

}

module.exports = Util;