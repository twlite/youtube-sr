import { YouTube } from "../dist/mod.mjs";

const url = "https://www.youtube.com/watch?v=KAca7KQ9p-A";

YouTube.getVideo(url)
    .then(console.log) // Video info
    .catch(console.error);
