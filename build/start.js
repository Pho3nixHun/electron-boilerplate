const childProcess = require("child_process");
const electron = require("electron");
const webpack = require("webpack");
const config = require("./webpack.app.config");

const env = "development";
const compiler = webpack(config(env));
let watcher;
if (process.argv[2] === "-w") {
    watcher = compiler.watch({});
} else {
    compiler.run((err, stats) => {
        process.exit(err ? 255 : 0)
    });
}

