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