import { YouTube } from "../dist/mod.mjs";

const url = "https://www.youtube.com/playlist?list=PLCQ8if9L7f_3qJlHkXtQjNWFfOYJBMVCG";

YouTube.getPlaylist(url)
    .then(console.log) // max 100 items
    .catch(console.error);
