const path = require("path"),
    { CleanWebpackPlugin } = require("clean-webpack-plugin");

const src = path.resolve(__dirname, "src", "ts"),
    build = path.resolve(__dirname, "build", "js");

module.exports = {
    devtool: "inline-cheap-module-source-map",
    entry: {
        index: path.resolve(src, "index.js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(build, "js")
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
};