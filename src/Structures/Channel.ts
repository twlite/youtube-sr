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

export interface ChannelIconInterface {
    url?: string;
    width: number;
    height: number;
}

export class Channel {
    name?: string;
    verified: boolean;
    id?: string;
    url?: string;
    icon: ChannelIconInterface;
    subscribers?: string;

    constructor(data: any) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        this._patch(data);
    }

    /**
     * Patch raw data
     * @private
     * @ignore
     */
    private _patch(data: any): void {
        if (!data) data = {};

        this.name = data.name || null;
        this.verified = !!data.verified || false;
        this.id = data.id || null;
        this.url = data.url || null;
        this.icon = data.icon || { url: null, width: 0, height: 0 };
        this.subscribers = data.subscribers || null;

        if (this.icon.url?.startsWith("//")) this.icon.url = `https:${this.icon.url}`;
    }

    /**
     * Returns channel icon url
     * @param {object} options Icon options
     * @param {number} [options.size=0] Icon size. **Default is 0**
     */
    iconURL(options = { size: 0 }): string {
        if (typeof options.size !== "number" || options.size < 0) throw new Error("invalid icon size");
        if (!this.icon.url) return null;
        const def = this.icon.url.split("=s")[1].split("-c")[0];
        return this.icon.url.replace(`=s${def}-c`, `=s${options.size}-c`);
    }

    get type(): "channel" {
        return "channel";
    }

    toString(): string {
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
