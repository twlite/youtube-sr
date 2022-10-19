import { YouTube } from "../dist/mod.mjs";

const videos = await YouTube.search("playing with fire");
console.log(videos.map((m, i) => `[${++i}] ${m.title} (${m.url})`).join("\n"));
