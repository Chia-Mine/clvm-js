const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html"
    }),
    new CopyPlugin({
      patterns: [
        {from: path.resolve(__dirname, "..", "..", ".dist", "npm", "browser", "blsjs.wasm")},
        {from: path.resolve(__dirname, "..", "..", ".dist", "npm", "browser", "clvm_wasm_bg.wasm")},
      ]
    }),
  ],
  target: ["web"],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, ".dist"),
    clean: true,
  },
};
