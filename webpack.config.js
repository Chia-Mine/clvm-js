const path = require("path");
// const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const isProd = false;

module.exports = {
  mode: isProd ? "production" : "development",
  context: __dirname, // to automatically find tsconfig.json
  plugins: isProd ? [/*new CleanWebpackPlugin()*/] : [
    // new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}' // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
      }
    }),
  ],
  devtool: isProd ? undefined : "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {loader: "ts-loader", options: {transpileOnly: true, configFile: "tsconfig.json"}},
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  target: isProd ? ["es5"] : undefined,
  optimization: isProd ? {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            properties: {
              regex: /^_.+/,
            }
          },
        }
      }),
    ]
  } : undefined,
  entry: "./src/index.ts",
  output: {
    path: isProd ? path.resolve(__dirname, "dist", "browser") : path.resolve(__dirname, "build", "browser"),
    filename: "[name].js",
    library: ["clvm"],
    libraryTarget: "umd",
    globalObject: "this",
  },
};