const fs = require("fs");
const path = `${__dirname}/../dist/mod.mjs`;

const contents = fs.readFileSync(path, "utf-8");
const prefix = `cr${Date.now()}`;
fs.writeFileSync(path, `import{createRequire as ${prefix}}from"module";var require=${prefix}(import.meta.url);${contents}`);
