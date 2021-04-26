// @ts-nocheck

/**
 * Benchmark
 * @author Zyrouge
 */

const util = require("util");

const sleep = util.promisify(setTimeout);
const benchmark = async (fn) => {
    const started = Date.now();
    const res = await fn();
    return {
        time: Date.now() - started,
        data: res
    };
}

const query = {
    videoURL: "https://www.youtube.com/watch?v=Sn1rJbZ8nI4",
    search: "faded",
    playlistID: "PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq"
};

const result = {
    "ytsr": {},
    "ytpl": {},
    "youtube-sr": {},
    "ytdl-core": {},
    "youtube-ext": {}
};

function ytext() {
    return new Promise(async (resolve) => {
        const dl = require("youtube-ext");

        const searchbm = await benchmark(dl.search.bind(null, query.search));
        result["youtube-ext"].search = searchbm.time;

        const infobm = await benchmark(dl.videoInfo.bind(null, query.videoURL));
        result["youtube-ext"].information = infobm.time;

        const playlistbm = await benchmark(dl.playlistInfo.bind(null, query.playlistID));
        result["youtube-ext"].playlist = playlistbm.time;

        const formats = await dl.getFormats(infobm.data.streams);
        const format = formats.find(x => x.itag === 18);

        const streamStart = Date.now();
        const vStream = await dl.getReadableStream(format);

        vStream.on("data", () => { });

        vStream.on("end", () => {
            result["youtube-ext"].download = Date.now() - streamStart;
            resolve();
        });
    });
}

function ytdl() {
    return new Promise(async (resolve) => {
        const dl = require("ytdl-core");

        const infobm = await benchmark(dl.getBasicInfo.bind(null, query.videoURL));
        result["ytdl-core"].information = infobm.time;

        const streamStart = Date.now();
        const vStream = dl(query.videoURL, {
            quality: 18
        });

        vStream.on("data", () => { });

        vStream.on("end", () => {
            result["ytdl-core"].download = Date.now() - streamStart;
            resolve();
        });
    });
}

function ytsr() {
    return new Promise(async (resolve) => {
        const dl = require("ytsr");

        const searchbm = await benchmark(dl.bind(null, query.search));
        result["ytsr"].search = searchbm.time;

        resolve();
    });
}

function youtubesr() {
    return new Promise(async (resolve) => {
        const dl = require("../build/main").default;

        const searchbm = await benchmark(dl.search.bind(null, query.search));
        result["youtube-sr"].search = searchbm.time;

        const infobm = await benchmark(dl.getVideo.bind(null, query.videoURL));
        result["youtube-sr"].information = infobm.time;

        const playlistbm = await benchmark(dl.getPlaylist.bind(null, query.playlistID));
        result["youtube-sr"].playlist = playlistbm.time;

        resolve();
    });
}

function ytpl() {
    return new Promise(async (resolve) => {
        const dl = require("ytpl");

        const playlistbm = await benchmark(dl.bind(null, query.playlistID));
        result["ytpl"].playlist = playlistbm.time;

        resolve();
    });
}

const start = async () => {
    const pause = sleep.bind(null, 1000);

    console.log("Benchmarking youtube-ext...");
    result["youtube-ext"].overall = (await benchmark(ytext)).time;
    await pause();

    console.log("Benchmarking ytsr...");
    result["ytsr"].overall = (await benchmark(ytsr)).time;
    await pause();

    console.log("Benchmarking ytpl...");
    result["ytpl"].overall = (await benchmark(ytpl)).time;
    await pause();

    console.log("Benchmarking youtube-sr...");
    result["youtube-sr"].overall = (await benchmark(youtubesr)).time;
    await pause();

    console.log("Benchmarking ytdl-core...");
    result["ytdl-core"].overall = (await benchmark(ytdl)).time;
    await pause();

    const winners = {};

    for (const key in result) {
        const bms = result[key];
        Object.entries(bms).forEach(([k, v]) => {
            if (!winners[k]) winners[k] = [];
            winners[k].push({
                module: key,
                time: v
            });
        });
    }

    let final = "\n\nResults\n";
    for (const key in winners) {
        if (key === "overall") continue;
        const ele = winners[key];
        final += ` * ${key}: ${ele.sort((a, b) => a.time - b.time).map(x => `${x.module} (${x.time}ms)`).join(" << ")}\n`;
    }
    console.log(final);

}

start();