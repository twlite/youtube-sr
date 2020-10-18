const YouTube = require("../index");

YouTube.search("indila last dance", { limit: 1 })
    .then(x => console.log(x[0]))
    .catch(console.error);