const path = require("path")

module.exports = {
    mode: "development",
    entry: "./src",
    target: "node",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                loader: "file-loader"
            }
        ]
    }
}