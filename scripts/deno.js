// build youtube-sr for deno
const fs = require("fs-extra");
const getPath = (i) => `${__dirname}/../${i}`;

function execute() {
    // copy readme file
    fs.copyFileSync(getPath("README.md"), getPath("deno/README.md"));
}

execute();