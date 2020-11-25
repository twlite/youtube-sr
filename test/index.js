const YouTube = require("../index");
const url = "https://www.youtube.com/watch?v=astISOttCQ0&list=PLwBAMTaOF-yjCsmJl6ketVbi8Kucvd9Bi";

YouTube.getPlaylist(url, { limit: 1 })
    .then(x => console.log(x))
    .catch(console.error);

// console.log(YouTube.validate("PLwBAMTaOF-yjCsmJl6ketVbi8Kucvd9Bi", "PLAYLIST_ID"))