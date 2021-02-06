import Thumbnail from "./Thumbnail";
import Video from "./Video";
import Channel from "./Channel";

class Playlist {
    id?: string;
    title?: string;
    videoCount: number;
    lastUpdate?: string;
    views?: number;
    url?: string;
    link?: string;
    channel?: Channel;
    thumbnail?: Thumbnail;
    videos: Video[];

    constructor(data = {}, searchResult = false) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        if (!!searchResult) this._patchSearch(data);
        else this._patch(data);
    }

    private _patch(data: any) {
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

    private _patchSearch(data: any) {
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

    get type(): "playlist" {
        return "playlist";
    }

    *[Symbol.iterator](): IterableIterator<Video> {
        yield* this.videos;
    }

}

export default Playlist;