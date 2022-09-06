// build youtube-sr for deno

const REGEX = /(import|export) (.+) from ("|')(.+)("|')/g;
const rimraf = require("rimraf");
const readdirp = require("readdirp");
const fs = require("fs-extra");
const path = require("path");
const getPath = (i) => `${__dirname}/../${i}`;
/**
 * @type {import("chalk").ChalkInstance}
 */
let chalk;
const getChalk = () => import("chalk").then(r => chalk = r.default);

getChalk().then(() => {
    // delete old files
    rimraf(getPath("deno"), (err) => {
        if (err) return console.log(err);
        execute();
    });
});

function importFormat(txt) {
    return txt.split(" ").map(m => {
        return ["import", "from", "as", "type", "assert", "export"].includes(m) ? chalk.cyanBright(m) : ["{", "}"].includes(m) ? chalk.yellowBright(m) : m.startsWith('"') && m.endsWith('"') ? chalk.greenBright(m) : chalk.whiteBright(m);
    }).join(" ");
}

function execute() {
    // copy node scripts to deno
    fs.copySync(getPath("src"), getPath("deno"), {
        recursive: true,
        overwrite: true
    });

    // copy readme file
    fs.copyFileSync(getPath("README.md"), getPath("deno/README.md"));

    // load copied files
    readdirp.promise(getPath("deno"), {
        fileFilter: "*.ts"
    })
        .then(entries => {
            // map files by path and content
            const files = entries.map(m => ({
                path: m.fullPath,
                data: fs.readFileSync(m.fullPath, "utf-8")
            }));

            for (const file of files) {
                // pls ignore this i suck at ts (this only happens with deno build tho)
                file.data = `// @ts-nocheck\n${file.data}`;
                // match imports
                if (file.data.match(REGEX)) {
                    // update imports for each match
                    for (const item of file.data.matchAll(REGEX)) {
                        // if import path does not end with .ts, append .ts
                        if (!item[4].endsWith(".ts") && !path.isAbsolute(item[4])) {
                            file.data = file.data.replace(item[0], item[0].replace(item[4], `${item[4]}.ts`));
                            console.log(`${chalk.yellowBright(file.path)}\n${chalk.bgRed(item[0])}\n${chalk.greenBright("+")} ${importFormat(item[0].replace(item[4], `${item[4]}.ts`))}\n`);
                        }
                    };
                }
                // finally save
                fs.writeFileSync(file.path, file.data);
            }
        });
}