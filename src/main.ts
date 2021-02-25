import Util from "./Util";
import Channel from "./Structures/Channel";
import Playlist from "./Structures/Playlist";
import Video from "./Structures/Video";
import Thumbnail from "./Structures/Thumbnail";

// @ts-ignore
import YouTubeAPI from "simple-youtube-api";

const SAFE_SEARCH_COOKIE = "PREF=f2=8000000";
const conditions = new Map<string, any>();
let yt: any;

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
        
        if (!YouTube.get("api")) {
            const filter = options.type === "all" ? "" : `&sp=${Util.filter(options.type)}`;
            const url = `https://youtube.com/results?q=${encodeURI(query.trim())}&hl=en${filter}`;
            const requestOptions = options.safeSearch ? { ...options.requestOptions, headers: { cookie: SAFE_SEARCH_COOKIE } } : {};

            const html = await Util.getHTML(url, requestOptions);
            return Util.parseSearchResult(html, options);
        } else {
            if (!yt) yt = new YouTubeAPI(YouTube.get("api"));
            const result = await yt.search(query.trim(), options.limit, { type: options.type });
            if (!result || !result.length) return [];
            let data = [];

            for (const item of result) {
                switch (item.type) {
                    case "video":
                        await item.fetch().catch(() => {});
                        await item.channel.fetch().catch(() => { });

                        data.push(new Video({
                            id: item.id,
                            title: item.title,
                            url: item.url,
                            description: item.description,
                            duration: item.durationSeconds * 1000,
                            duration_raw: typeof item.duration === "object" ? Object.values(item.duration).join(":").replace(/0:/g, "") : null,
                            thumbnail: {
                                id: item.id,
                                url: item.maxRes.url,
                                width: item.maxRes.width,
                                height: item.maxRes.height
                            },
                            channel: {
                                id: item.channel.id,
                                name: item.channel.title,
                                url: item.channel.url,
                                icon: {
                                    url: item.channel.thumbnails?.default.url,
                                    width: item.channel.thumbnails?.default.width,
                                    height: item.channel.thumbnails?.default.height
                                },
                                verified: false
                            },
                            uploadedAt: item.publishedAt.toString(),
                            views: (typeof item.views === "number" ? item.views : 0) ?? 0
                        }));
                        break;
                    case "playlist":
                        await item.fetch().catch(() => {});
                        await item.channel.fetch().catch(() => { });
                        let vy = await item.getVideos();
                        await vy.channel.fetch().catch(() => { });

                        vy = vy.map((m: any) => {
                            return new Video({
                                id: m.id,
                                title: m.title,
                                url: m.url,
                                description: m.description,
                                duration: m.durationSeconds * 1000,
                                duration_raw: typeof item.duration === "object" ? Object.values(item.duration).join(":").replace(/0:/g, "") : null,
                                thumbnail: {
                                    id: m.id,
                                    url: m.maxRes.url,
                                    width: m.maxRes.width,
                                    height: m.maxRes.height
                                },
                                channel: {
                                    id: m.channel.id,
                                    name: m.channel.title,
                                    url: m.channel.url,
                                    icon: {
                                        url: m.channel.thumbnails?.default.url,
                                        width: m.channel.thumbnails?.default.width,
                                        height: m.channel.thumbnails?.default.height
                                    },
                                    verified: false
                                },
                                uploadedAt: m.publishedAt.toString(),
                                views: (typeof m.views === "number" ? item.views : 0) ?? 0
                            })
                        });

                        let pl = new Playlist({
                            id: item.id,
                            videoCount: item.length,
                            lastUpdate: item.publishedAt.toString(),
                            views: 0,
                            videos: vy,
                            url: item.url,
                            link: item.url,
                            author: {
                                id: item.channel.id,
                                name: item.channel.title,
                                url: item.channel.url,
                                icon: {
                                    url: item.channel.thumbnails?.default.url,
                                    width: item.channel.thumbnails?.default.width,
                                    height: item.channel.thumbnails?.default.height
                                },
                                verified: false
                            },
                            thumbnail: item.thumbnails.maxres.url
                        });

                        data.push(pl);
                        break;
                    case "channel":
                        await item.fetch().catch(() => { });
                        data.push(new Channel({
                            id: item.id,
                            name: item.title,
                            url: item.url,
                            icon: {
                                url: item.thumbnails?.default.url,
                                width: item.thumbnails?.default.width,
                                height: item.thumbnails?.default.height
                            },
                            verified: false
                        }));
                        break;
                }
            }

            return data;
        }
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
        
        if (!YouTube.get("api")) {
            const html = await Util.getHTML(`${url}&hl=en`, options && options.requestOptions);

            return Util.getPlaylist(html, options && options.limit);
        } else {
            if (!yt) yt = new YouTubeAPI(YouTube.get("api"));
            const item = await yt.getPlaylist(url);
            await item.fetch().catch(() => { });
            await item.channel.fetch().catch(() => { });
            let vy = await item.getVideos(options.limit);
            await vy.channel.fetch().catch(() => { });

            vy = vy.map((m: any) => {
                return new Video({
                    id: m.id,
                    title: m.title,
                    url: m.url,
                    description: m.description,
                    duration: m.durationSeconds * 1000,
                    duration_raw: typeof item.duration === "object" ? Object.values(item.duration).join(":").replace(/0:/g, "") : null,
                    thumbnail: {
                        id: m.id,
                        url: m.maxRes.url,
                        width: m.maxRes.width,
                        height: m.maxRes.height
                    },
                    channel: {
                        id: m.channel.id,
                        name: m.channel.title,
                        url: m.channel.url,
                        icon: {
                            url: m.channel.thumbnails?.default.url,
                            width: m.channel.thumbnails?.default.width,
                            height: m.channel.thumbnails?.default.height
                        },
                        verified: false
                    },
                    uploadedAt: m.publishedAt.toString(),
                    views: (typeof m.views === "number" ? item.views : 0) ?? 0
                })
            });

            let pl = new Playlist({
                title: item.title,
                id: item.id,
                videoCount: item.length,
                lastUpdate: item.publishedAt.toString(),
                views: 0,
                videos: vy,
                url: item.url,
                link: item.url,
                author: {
                    id: item.channel.id,
                    name: item.channel.title,
                    url: item.channel.url,
                    icon: {
                        url: item.channel.thumbnails?.default.url,
                        width: item.channel.thumbnails?.default.width,
                        height: item.channel.thumbnails?.default.height
                    },
                    verified: false
                },
                thumbnail: item.thumbnails.maxres.url
            });

            return pl;
        }
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

        if (!YouTube.get("api")) {
            const html = await Util.getHTML(`${url}&hl=en`, requestOptions);

            return Util.getVideo(html);
        } else {
            if (!yt) yt = new YouTubeAPI(YouTube.get("api"));
            const item = await yt.getVideo(url);
            if (!item) throw new Error("Could not parse video")
            await item.fetch().catch(() => { });
            await item.channel.fetch().catch(() => {});
            
            return new Video({
                id: item.id,
                title: item.title,
                url: item.url,
                description: item.description,
                duration: item.durationSeconds * 1000,
                duration_raw: typeof item.duration === "object" ? Object.values(item.duration).join(":").replace(/0:/g, "") : null,
                thumbnail: {
                    id: item.id,
                    url: item.maxRes.url,
                    width: item.maxRes.width,
                    height: item.maxRes.height
                },
                channel: {
                    id: item.channel.id,
                    name: item.channel.title,
                    url: item.channel.url,
                    icon: {
                        url: item.channel.thumbnails?.default.url,
                        width: item.channel.thumbnails?.default.width,
                        height: item.channel.thumbnails?.default.height
                    },
                    verified: false
                },
                uploadedAt: item.publishedAt.toString(),
                views: (typeof item.views === "number" ? item.views : 0) ?? 0
            });
        }
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

    static get Regex() {
        return {
            PLAYLIST_URL: Util.PlaylistURLRegex,
            PLAYLIST_ID: Util.PlaylistIDRegex,
            VIDEO_ID: /^[a-zA-Z0-9-_]{11}$/,
            VIDEO_URL: /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
        };
    }

    static set(rx: string, ry: any): void {
        conditions.set(rx, ry);
        if (rx === "api" && !ry) yt = undefined;
        if (ry) yt = new YouTubeAPI(ry);
    }

    static get(rx: string) {
        return conditions.get(rx);
    }

    static has(rx: string) {
        return conditions.has(rx);
    }

    static delete(rx: string) {
        yt = undefined;
        return conditions.delete(rx);
    }
}

export { Util, Thumbnail, Channel, Playlist, Video, YouTube };

export default YouTube;