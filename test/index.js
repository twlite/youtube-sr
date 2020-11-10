const YouTube = require("../index");

YouTube.getPlaylist("PLwBAMTaOF-yjCsmJl6ketVbi8Kucvd9Bi", { limit: 5 })
    .then(x => console.log(x))
    .catch(console.error);