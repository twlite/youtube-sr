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
     * @param {"video"|"channel"|"all"} [options.type="video"] Type
     * @param {RequestInit} [options.requestOptions] Request options
     */
    static async search(query, options = { limit: 20, type: "video", requestOptions: {} }) {
        if (!query || typeof query !== "string") throw new Error(`Invalid search query "${query}"!`);
        const url = `https://youtube.com/results?q=${query.trim().split(" ").join("+")}`;
        const html = await Util.getHTML(url);
        return Util.parseSearchResult(html, options);
    }

    /**
     * Search one
     * @param {string} query Search query
     * @param {"video"|"channel"|"all"} type Search type
     * @param {RequestInit} requestOptions Request options
     */
    static searchOne(query, type = "all", requestOptions = {}) {
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
     * Returns package version
     */
    static get version() {
        return require("../package.json").version;
    }

}

module.exports = YouTube;