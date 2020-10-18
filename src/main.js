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
     * @param {"video"|"all"} [options.type="video"] Type
     * @param {RequestInit} [options.requestOptions] Request options
     */
    static async search(query, options = { limit: 20, type: "video", requestOptions: {} }) {
        const url = `https://youtube.com/results?q=${query.split(" ").join("+")}`;
        const html = await Util.getHTML(url);
        return Util.parseSearchResult(html, options);
    }

    /**
     * Returns package version
     */
    static get version() {
        return require("../package.json").version;
    }

}

module.exports = YouTube;