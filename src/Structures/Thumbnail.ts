/*
 * MIT License
 *
 * Copyright (c) 2020 DevAndromeda
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

type ThumbnailType = "default" | "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault" | "ultrares";
export class Thumbnail {
    id?: string;
    width: number;
    height: number;
    url?: string;

    /**
     * Thumbnail constructor
     * @param data Thumbnail constructor params
     */
    constructor(data: any) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        this._patch(data);
    }

    /**
     * Patch raw data
     * @param data Raw Data
     * @private
     * @ignore
     */
    private _patch(data: any) {
        if (!data) data = {};

        this.id = data.id || null;
        this.width = data.width || 0;
        this.height = data.height || 0;
        this.url = data.url || null;
    }

    /**
     * Returns thumbnail url
     * @param {"default"|"hqdefault"|"mqdefault"|"sddefault"|"maxresdefault"|"ultrares"} thumbnailType Thumbnail type
     */
    displayThumbnailURL(thumbnailType: ThumbnailType = "ultrares"): string {
        if (!["default", "hqdefault", "mqdefault", "sddefault", "maxresdefault", "ultrares"].includes(thumbnailType)) throw new Error(`Invalid thumbnail type "${thumbnailType}"!`);
        if (thumbnailType === "ultrares") return this.url;
        return `https://i3.ytimg.com/vi/${this.id}/${thumbnailType}.jpg`;
    }

    /**
     * Returns default thumbnail
     * @param {"0"|"1"|"2"|"3"|"4"} id Thumbnail id. **4 returns thumbnail placeholder.**
     */
    defaultThumbnailURL(id: "0" | "1" | "2" | "3" | "4"): string {
        if (!id) id = "0";
        if (!["0", "1", "2", "3", "4"].includes(id)) throw new Error(`Invalid thumbnail id "${id}"!`);
        return `https://i3.ytimg.com/vi/${this.id}/${id}.jpg`;
    }

    toString(): string {
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
