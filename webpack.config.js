const path = require("path"),
	{ CleanWebpackPlugin } = require("clean-webpack-plugin");

const src = path.resolve(__dirname, "src", "tsc"),
	build = path.resolve(__dirname, "build", "js");

module.exports = {
	devtool: "inline-cheap-module-source-map",
	entry: {
		index: path.resolve(src, "index.ts"),
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: "ts-loader"
			}
		]
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	output: {
		filename: "[name].js",
		path: path.resolve(build)
	},
	plugins: [
		new CleanWebpackPlugin()
	]
};