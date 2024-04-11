import { YouTube } from "../dist/mod.mjs";

const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

YouTube.getVideo(url)
    .then(console.log) // Video info
    .catch(console.error);
