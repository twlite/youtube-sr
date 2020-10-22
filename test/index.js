const YouTube = require("../index");

YouTube.search("indila", { type: "all", limit: 3 })
    .then(x => console.log(x))
    .catch(console.error);