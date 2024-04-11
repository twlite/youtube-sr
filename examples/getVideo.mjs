import { YouTube } from "../dist/mod.mjs";

const url = "https://www.youtube.com/watch?v=Sv6dMFF_yts";

YouTube.getVideo(url)
    .then(console.log) // Video info
    .catch(console.error);
