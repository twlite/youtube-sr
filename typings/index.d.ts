declare module "youtube-sr" {
    export type SearchType = "video" | "channel" | "playlist" | "all";

    export interface SearchOptions {
        limit?: number;
        type?: SearchType;
        requestOptions?: RequestInit;
    }

    export interface SearchOptionsOne {
        type?: SearchType;
        requestOptions?: RequestInit;
    }

    export interface ChannelIconDefault {
        url: string | null;
        width: number;
        height: number;
    }

    export interface iconURLOptions {
        size?: number;
    }

    export interface ChannelInterfaceJSON {
        name: string | null;
        verified: boolean;
        id: string | null;
        url: string | null;
        iconURL: string | null;
        type: "channel";
        subscribers: string | null;
    }

    export interface PlaylistAuthor {
        name: string;
        id: string;
        url: string;
        icon: string;
    }

    export interface YouTubeRegexList {
        PLAYLIST_URL: RegExp;
        PLAYLIST_ID: RegExp;
        VIDEO_ID: RegExp;
        VIDEO_URL: RegExp;
    }

    export type ThumbnailType = "default" | "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault" | "ultrares";
    export type YTSRValidationType = "PLAYLIST" | "PLAYLIST_ID" | "VIDEO" | "VIDEO_ID";

    export default class YouTube {
        public static search(query: string, options?: SearchOptions): Promise<(Video|Channel|Playlist)[]>;
        public static searchOne(query: string, options?: SearchOptionsOne): Promise<Video|Channel|Playlist>;
        public static getPlaylist(url: string, options?: PlaylistFetchOptions): Promise<Playlist>;
        public static validate(src: string, type?: YTSRValidationType): boolean;
        public static get Regex(): YouTubeRegexList;
        public static get version(): string;
    }

    export interface PlaylistFetchOptions {
        limit?: number;
        requestOptions?: RequestInit;
    }

    export interface ThumbnailInterfaceJSON {
        id: string | null;
        width: number;
        height: number;
        url: string | null;
    }

    export interface embedHTMLInterface {
        id?: string;
        width?: number;
        height?: number;
    }

    export interface VideoInterfaceJSON {
        id: string | null;
        url: string | null;
        title: string | null;
        description: string | null;
        duration: number;
        duration_formatted: string;
        uploadedAt: string | null;
        thumbnail: ThumbnailInterfaceJSON;
        channel: ChannelInterfaceJSON;
        views: string;
        type: "video";
    }

    export interface UtilParseOptions {
        type?: SearchType;
        limit?: number;
    }

    export class Thumbnail {
        id: string | null;
        width: number;
        height: number;
        url: string | null;

        public constructor(data?: object);
        private _patch(data?: object): void;
        public displayThumbnailURL(thumbnailType?: ThumbnailType): string;
        public defaultThumbnailURL(defaultThumbnailID?: "0" | "1" | "2" | "3" | "4"): string;
        public toString(): string;
        public toJSON(): ThumbnailInterfaceJSON;
    }

    export class Channel {
        name: string | null;
        verified: boolean;
        id: string | null;
        url: string | null;
        icon: ChannelIconDefault;
        subscribers: string | null;

        public constructor(data?: object);
        private _patch(data?: object): void;
        public iconURL(options?: iconURLOptions): string | null;
        public get type(): "channel";
        public toString(): string;
        public toJSON(): ChannelInterfaceJSON;
    }

    export class Video {
        id: string | null;
        title: string | null;
        description: string | null;
        durationFormatted: string;
        uploadedAt: string | null;
        views: string;
        thumbnail: Thumbnail;
        channel: Channel;

        public constructor(data?: object);
        private _patch(data?: object): void;
        public get url(): string | null;
        public embedHTML(options?: embedHTMLInterface): string | null;
        public get embedURL(): string | null;
        public get duration(): number;
        public get type(): "video";
        public toString(): string;
        public toJSON(): VideoInterfaceJSON;
    }

    export class Util {
        public static getHTML(url, requestOptions?: RequestInit): Promise<string>;
        public static parseDuration(duration: string): number;
        public static parseSearchResult(html: string, options?: UtilParseOptions): (Video | Channel)[];
        public static parseChannel(data: object): Channel;
        public static parseVideo(data: object): Video;
        public static parsePlaylist(data: object): Playlist;
        public static getPlaylist(html: string, limit: number): Playlist;
        public static getPlaylistURL(url: string): string | null;
        public static validatePlaylist(url: string): void;
    }

    export class Playlist {
        id: string | null;
        title: string | null;
        videoCount: number;
        lastUpdate:  string | null;
        views: number;
        url:  string | null;
        link:  string | null;
        channel: PlaylistAuthor | null;
        thumbnail:  string | null;
        videos: Video[] | [];
    }
}