import { YouTube } from "../dist/mod.mjs";

YouTube.homepage()
    .then(console.log) // videos from youtube homepage
    .catch(console.error);
