const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/match_rules.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};
