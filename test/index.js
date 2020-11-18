const YouTube = require("../index");

YouTube.getPlaylist("https://youtube.com/playlist?list=PLwBAMTaOF-yjCsmJl6ketVbi8Kucvd9Bi", { limit: 1 })
    .then(x => console.log(x))
    .catch(console.error);

// console.log(YouTube.validate("PLwBAMTaOF-yjCsmJl6ketVbi8Kucvd9Bi", "PLAYLIST_ID"))