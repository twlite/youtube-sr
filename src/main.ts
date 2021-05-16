/**
 * YouTube Search
 * @author Snowflake107
 */

import Util from "./Util";
import Channel from "./Structures/Channel";
import Playlist from "./Structures/Playlist";
import Video from "./Structures/Video";
import Thumbnail from "./Structures/Thumbnail";

const SAFE_SEARCH_COOKIE = "PREF=f2=8000000";

export interface SearchOptions {
    limit?: number;
    type?: "video" | "channel" | "playlist" | "all";
    requestOptions?: RequestInit;
    safeSearch?: boolean;
}

export interface PlaylistOptions {
    limit?: number;
    requestOptions?: RequestInit;
}

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
     * @param {boolean} [options.safeSearch] Safe search filter
     */
    static async search(query: string, options?: SearchOptions & { type: "video" }): Promise<Video[]>;
    static async search(query: string, options?: SearchOptions & { type: "channel" }): Promise<Channel[]>;
    static async search(query: string, options?: SearchOptions & { type: "playlist" }): Promise<Playlist[]>;
    static async search(query: string, options?: SearchOptions & { type: "all" }): Promise<(Video | Channel | Playlist)[]>;
    static async search(query: string, options?: SearchOptions): Promise<(Video|Channel|Playlist)[]> {
        if (!options) options = { limit: 20, type: "video", requestOptions: {} };
        if (!query || typeof query !== "string") throw new Error(`Invalid search query "${query}"!`);
        options.type = options.type || "video";
        
        const filter = options.type === "all" ? "" : `&sp=${Util.filter(options.type)}`;
        
        const searchQuery = query.trim().replace(/ /g, '+').replace(/&/g, '%26');

        const url = `https://youtube.com/results?q=${searchQuery}&hl=en${filter}`;
        const requestOptions = options.safeSearch ? { ...options.requestOptions, headers: { cookie: SAFE_SEARCH_COOKIE } } : {};

        const html = await Util.getHTML(url, requestOptions);
        return Util.parseSearchResult(html, options);
    }

    /**
     * Search one
     * @param {string} query Search query
     * @param {"video"|"channel"|"playlist"|"all"} type Search type
     * @param {boolean} safeSearch Safe search filter
     * @param {RequestInit} requestOptions Request options
     */
    static searchOne(query: string, type?: "video", safeSearch?: boolean, requestOptions?: RequestInit): Promise<Video>;
    static searchOne(query: string, type?: "channel", safeSearch?: boolean, requestOptions?: RequestInit): Promise<Channel>;
    static searchOne(query: string, type?: "playlist", safeSearch?: boolean, requestOptions?: RequestInit): Promise<Playlist>;
    static searchOne(query: string, type?: "video" | "channel" | "playlist" | "all", safeSearch?: boolean, requestOptions?: RequestInit): Promise<(Video|Channel|Playlist)> {
        if (!type) type = "video";
        return new Promise((resolve) => {
            // @ts-ignore
            YouTube.search(query, { limit: 1, type: type, requestOptions: requestOptions, safeSearch: !!safeSearch })
                .then(res => {
                    if (!res || !res.length) return resolve(null);
                    resolve(res[0]);
                })
                .catch(() => {
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
    static async getPlaylist(url: string, options?: PlaylistOptions): Promise<Playlist> {
        if (!options) options = { limit: 100, requestOptions: {} };
        if (!url || typeof url !== "string") throw new Error(`Expected playlist url, received ${typeof url}!`);
        Util.validatePlaylist(url);
        url = Util.getPlaylistURL(url);
        
        const html = await Util.getHTML(`${url}&hl=en`, options && options.requestOptions);
        return Util.getPlaylist(html, options && options.limit);
    }

    /**
     * Returns basic video info
     * @param url Video url to parse
     * @param requestOptions Request options
     */
    static async getVideo(url: string | Video, requestOptions?: RequestInit): Promise<Video> {
        if (!url) throw new Error("Missing video url");
        if (url instanceof Video) url = url.url;
        const isValid = YouTube.validate(url, "VIDEO");
        if (!isValid) throw new Error("Invalid video url");

        const html = await Util.getHTML(`${url}&hl=en`, requestOptions);
        return Util.getVideo(html);
    }

    /**
     * Validates playlist
     * @param {string} url Playlist id or url/video id or url to validate
     * @param {"VIDEO"|"VIDEO_ID"|"PLAYLIST"|"PLAYLIST_ID"} type URL validation type
     * @returns {boolean}
     */
    static validate(url: string, type?: "VIDEO" | "VIDEO_ID" | "PLAYLIST" | "PLAYLIST_ID"): boolean {
        if (typeof url !== "string") return false;
        if (!type) type = "PLAYLIST";
        switch (type) {
            case "PLAYLIST":
                return YouTube.Regex.PLAYLIST_URL.test(url);
            case "PLAYLIST_ID":
                return YouTube.Regex.PLAYLIST_ID.test(url);
            case "VIDEO":
                return YouTube.Regex.VIDEO_URL.test(url);
            case "VIDEO_ID":
                return YouTube.Regex.VIDEO_ID.test(url);
            default:
                return false;
        }
    }

    static isPlaylist(src: string) {
        try {
            Util.validatePlaylist(src);
            return true;
        } catch {
            return false;
        }
    }

    static get Regex() {
        return {
            PLAYLIST_URL: Util.PlaylistURLRegex,
            PLAYLIST_ID: Util.PlaylistIDRegex,
            VIDEO_ID: Util.VideoIDRegex,
            VIDEO_URL: Util.VideoRegex
        };
    }
}

export { Util, Thumbnail, Channel, Playlist, Video, YouTube };

export default YouTube;