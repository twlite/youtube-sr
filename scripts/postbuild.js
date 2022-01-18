const fs = require("fs");
const path = `${__dirname}/../dist/mod.mjs`;

const contents = fs.readFileSync(path, "utf-8");
fs.writeFileSync(path, `import{createRequire as cr${Date.now()}}from"module";var require=cr${Date.now()}(import.meta.url);${contents}`);