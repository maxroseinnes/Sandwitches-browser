const path = require("path")

const config = {
    mode: "development",
    entry: "./src/index.js",
    target: "node",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                loader: "node-loader"
            }
        ]
    }
}

module.exports = config