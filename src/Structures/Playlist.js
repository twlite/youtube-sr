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