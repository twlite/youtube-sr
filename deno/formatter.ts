// @ts-nocheck
import { Playlist, Video, Channel } from "./Structures/exports.ts";
import Util from "./Util.ts";

export class Formatter extends null {
    private constructor() {}

    public static formatSearchResult(
        details: any[],
        options: { limit?: number; type?: "film" | "video" | "channel" | "playlist" | "all" } = {
            limit: 100,
            type: "all"
        }
    ) {
        const results: Array<Video | Channel | Playlist> = [];

        for (let i = 0; i < details.length; i++) {
            if (typeof options.limit === "number" && options.limit > 0 && results.length >= options.limit) break;
            let data = details[i];
            let res: Video | Channel | Playlist;
            if (options.type === "all") {
                if (!!data.videoRenderer) options.type = "video";
                else if (!!data.channelRenderer) options.type = "channel";
                else if (!!data.playlistRenderer) options.type = "playlist";
                else continue;
            }

            if (options.type === "video" || options.type === "film") {
                const parsed = Util.parseVideo(data);
                if (!parsed) continue;
                res = parsed;
            } else if (options.type === "channel") {
                const parsed = Util.parseChannel(data);
                if (!parsed) continue;
                res = parsed;
            } else if (options.type === "playlist") {
                const parsed = Util.parsePlaylist(data);
                if (!parsed) continue;
                res = parsed;
            }

            results.push(res);
        }

        return results;
    }
}
