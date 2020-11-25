(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.YouTube = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require("./src/main");
module.exports.default = require("./src/main");
module.exports.Video = require("./src/Structures/Video");
module.exports.Channel = require("./src/Structures/Channel");
module.exports.Thumbnail = require("./src/Structures/Thumbnail");
module.exports.Util = require("./src/Util");
module.exports.Playlist = require("./src/Structures/Playlist");
},{"./src/Structures/Channel":4,"./src/Structures/Playlist":5,"./src/Structures/Thumbnail":6,"./src/Structures/Video":7,"./src/Util":8,"./src/main":9}],2:[function(require,module,exports){
(function (global){(function (){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports.default = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
module.exports={
  "name": "youtube-sr",
  "version": "2.0.1",
  "description": "Simple package to search videos or channels on YouTube.",
  "main": "index.js",
  "types": "typings/index.d.ts",
  "scripts": {
    "webpack": "browserify index.js src/Util.js src/main.js src/Structures/Channel.js src/Structures/Thumbnail.js src/Structures/Video.js --standalone YouTube > webpack/youtube-sr.js",
    "test": "cd test && node index.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/DevSnowflake/youtube-sr.git"
  },
  "keywords": [
    "youtube",
    "api",
    "search",
    "playlist",
    "channel",
    "video",
    "scrape"
  ],
  "author": "Snowflake107",
  "license": "Apache-2.0",
  "bugs": {
    "url": "https://github.com/DevSnowflake/youtube-sr/issues"
  },
  "homepage": "https://github.com/DevSnowflake/youtube-sr#readme",
  "dependencies": {
    "node-fetch": "^2.6.1"
  }
}

},{}],4:[function(require,module,exports){
class Channel {

    constructor(data) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        this._patch(data);
    }

    /**
     * Patch raw data
     * @private
     * @ignore
     */
    _patch(data = {}) {
        this.name = data.name || null;
        this.verified = !!data.verified || false;
        this.id = data.id || null;
        this.url = data.url || null;
        this.icon = data.icon || { url: null, width: 0, height: 0 };
        this.subscribers = data.subscribers || null;
    }

    /**
     * Returns channel icon url
     * @param {object} options Icon options
     * @param {number} [options.size=0] Icon size. **Default is 0**
     */
    iconURL(options = { size: 0 }) {
        if (typeof options.size !== "number" || options.size < 0) throw new Error("invalid icon size");
        if (!this.icon.url) return null;
        const def = this.icon.url.split("=s")[1].split("-c")[0];
        return this.icon.url.replace(`=s${def}-c`, `=s${options.size}-c`);
    }

    get type() {
        return "channel";
    }

    toString() {
        return this.name || "";
    }

    toJSON() {
        return {
            name: this.name,
            verified: this.verified,
            id: this.id,
            url: this.url,
            iconURL: this.iconURL(),
            type: this.type,
            subscribers: this.subscribers
        };
    }

}

module.exports = Channel;
},{}],5:[function(require,module,exports){
class Playlist {

    constructor(data = {}, searchResult = false) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        if (!!searchResult) this._patchSearch(data);
        else this._patch(data);
    }

    _patch(data) {
        this.id = data.id || null;
        this.title = data.title || null;
        this.videoCount = data.videoCount || 0;
        this.lastUpdate = data.lastUpdate || null;
        this.views = data.views || 0;
        this.url = data.url || null;
        this.link = data.link || null;
        this.channel = data.author || null;
        this.thumbnail = data.thumbnail || null;
        this.videos = data.videos || [];
    }

    _patchSearch(data) {
        this.id = data.id || null;
        this.title = data.title || null;
        this.thumbnail = data.thumbnail || null;
        this.channel = data.channel || null;
        this.videos = [];
        this.videoCount = data.videos || 0;
        this.url = this.id ? `https://www.youtube.com/playlist?list=${this.id}` : null;
        this.link = null;
        this.lastUpdate = null;
        this.views = 0;
    }

    get type() {
        return "playlist";
    }

}

module.exports = Playlist;
},{}],6:[function(require,module,exports){
class Thumbnail {

    /**
     * Thumbnail constructor
     * @param data Thumbnail constructor params
     */
    constructor(data) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        this._patch(data);
    }

    /**
     * Patch raw data
     * @param data Raw Data
     * @private
     * @ignore
     */
    _patch(data = {}) {
        this.id = data.id || null;
        this.width = data.width || 0;
        this.height = data.height || 0;
        this.url = data.url || null;
    }

    /**
     * Returns thumbnail url
     * @param {"default"|"hqdefault"|"mqdefault"|"sddefault"|"maxresdefault"|"ultrares"} thumbnailType Thumbnail type
     */
    displayThumbnailURL(thumbnailType = "ultrares") {
        if (!["default", "hqdefault", "mqdefault", "sddefault", "maxresdefault", "ultrares"].includes(thumbnailType)) throw new Error(`Invalid thumbnail type "${thumbnailType}"!`);
        if (thumbnailType === "ultrares") return this.url;
        return `https://i3.ytimg.com/vi/${this.id}/${thumbnailType}.jpg`;
    }

    /**
     * Returns default thumbnail
     * @param {"0"|"1"|"2"|"3"|"4"} id Thumbnail id. **4 returns thumbnail placeholder.**
     */
    defaultThumbnailURL(id = "0") {
        if (!["0", "1", "2", "3", "4"].includes(id)) throw new Error(`Invalid thumbnail id "${id}"!`);
        return `https://i3.ytimg.com/vi/${this.id}/${id}.jpg`;
    }

    toString() {
        return this.url ? `${this.url}` : "";
    }

    toJSON() {
        return {
            id: this.id,
            width: this.width,
            height: this.height,
            url: this.url
        };
    }

}

module.exports = Thumbnail;
},{}],7:[function(require,module,exports){
const Thumbnail = require("./Thumbnail");
const Channel = require("./Channel");

class Video {

    constructor(data) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        this._patch(data);
    }

    /**
     * Patch raw data
     * @private
     * @ignore
     */
    _patch(data = {}) {
        this.id = data.id || null;
        this.title = data.title || null;
        this.description = data.description || null;
        this.durationFormatted = data.duration_raw || "0:00";
        this.duration = data.duration || 0;
        this.uploadedAt = data.uploadedAt || null;
        this.views = parseInt(data.views) || 0;
        this.thumbnail = new Thumbnail(data.thumbnail || {});
        this.channel = new Channel(data.channel || {});
        if (data.videos) this.videos = data.videos;
    }

    get url() {
        if (!this.id) return null;
        return `https://www.youtube.com/watch?v=${this.id}`;
    }

    /**
     * YouTube video embed html
     * @param {object} options Options
     * @param {string} [options.id] DOM element id
     * @param {number} [options.width] Iframe width
     * @param {number} [options.height] Iframe height
     */
    embedHTML(options = { id: "ytplayer", width: 640, height: 360 }) {
        if (!this.id) return null;
        return `<iframe id="${options.id || "ytplayer"}" type="text/html" width="${options.width || 640}" height="${options.height || 360}" src="${this.embedURL}" frameborder="0"></iframe>`
    }

    /**
     * YouTube video embed url
     */
    get embedURL() {
        if (!this.id) return null;
        return `https://www.youtube.com/embed/${this.id}`;
    }

    get type() {
        return "video";
    }

    toString() {
        return this.url || "";
    }

    toJSON() {
        return {
            id: this.id,
            url: this.url,
            title: this.title,
            description: this.description,
            duration: this.duration,
            duration_formatted: this.durationFormatted,
            uploadedAt: this.uploadedAt,
            thumbnail: this.thumbnail.toJSON(),
            channel: this.channel.toJSON(),
            views: this.views,
            type: this.type
        };
    }

}

module.exports = Video;
},{"./Channel":4,"./Thumbnail":6}],8:[function(require,module,exports){
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
        const finalURL = `https://www.youtube.com/playlist?list=${group[0]}`;
        return finalURL;
    }

    static validatePlaylist(url) {
        if (typeof url === "string" && !!(PLAYLIST_REGEX.test(url) || PLAYLIST_ID.test(url))) return;
        throw new Error("Invalid playlist url");
    }

}

module.exports = Util;

},{"./Structures/Channel":4,"./Structures/Playlist":5,"./Structures/Video":7,"node-fetch":2}],9:[function(require,module,exports){
const Util = require("./Util");

class YouTube {

    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    /**
     * Search
     * @param {string} query Search youtube
     * @param {object} options Search options
     * @param {number} [options.limit=20] Limit
     * @param {"video"|"channel"|"playlist"|"all"} options.type Type
     * @param {RequestInit} [options.requestOptions] Request options
     */
    static async search(query, options = { limit: 20, type: "video", requestOptions: {} }) {
        if (!query || typeof query !== "string") throw new Error(`Invalid search query "${query}"!`);
        const url = `https://youtube.com/results?q=${encodeURI(query.trim())}&hl=en`;
        const html = await Util.getHTML(url, options.requestOptions);
        return Util.parseSearchResult(html, options);
    }

    /**
     * Search one
     * @param {string} query Search query
     * @param {"video"|"channel"|"playlist"|"all"} type Search type
     * @param {RequestInit} requestOptions Request options
     */
    static searchOne(query, type = "video", requestOptions = {}) {
        return new Promise((resolve) => {
            YouTube.search(query, { limit: 1, type: type, requestOptions: requestOptions })
                .then(res => {
                    if (!res || !res.length) return resolve(null);
                    resolve(res[0]);
                })
                .catch(e => {
                    resolve(null);
                });
        });
    }

    /**
     * Returns playlist details
     * @param {string} url Playlist URL
     * @param {object} [options] Options
     * @param {number} [options.limit=100] Playlist video limit
     * @param {RequestInit} [options.requestOptions] Request Options
     */
    static async getPlaylist(url, options = { limit: 100, requestOptions: {} }) {
        if (!url || typeof url !== "string") throw new Error(`Expected playlist url, received ${typeof url}!`);
        Util.validatePlaylist(url);
        url = Util.getPlaylistURL(url);
        const html = await Util.getHTML(`${url}&hl=en`, options && options.requestOptions);
        
        try {
            return Util.getPlaylist(html, options && options.limit);
        } catch(e) {
            throw new Error(`Could not parse playist: ${e.message || e}`);
        }
    }

    /**
     * Validates playlist
     * @param {string} url Playlist id or url/video id or url to validate
     * @param {"VIDEO"|"VIDEO_ID"|"PLAYLIST"|"PLAYLIST_ID"} type URL validation type
     * @returns {boolean}
     */
    static validate(url, type = "PLAYLIST") {
        if (typeof url !== "string") return false;
        if (!type) type = "PLAYLIST";
        switch(type) {
            case "PLAYLIST":
                return this.Regex.PLAYLIST_URL.test(url);
            case "PLAYLIST_ID":
                return this.Regex.PLAYLIST_ID.test(url);
            case "VIDEO":
                return this.Regex.VIDEO_URL.test(url);
            case "VIDEO_ID":
                return this.Regex.VIDEO_ID.test(url);
            default:
                return false;
        }
    }

    static get Regex() {
        return {
            PLAYLIST_URL: Util.PlaylistURLRegex,
            PLAYLIST_ID: Util.PlaylistIDRegex,
            VIDEO_ID: /^[a-zA-Z0-9-_]{11}$/,
            VIDEO_URL: /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
        };
    }

    /**
     * Returns package version
     */
    static get version() {
        return require("../package.json").version;
    }

}

module.exports = YouTube;
},{"../package.json":3,"./Util":8}]},{},[1,8,9,4,6,7])(9)
});
