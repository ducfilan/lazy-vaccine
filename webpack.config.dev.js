const { merge } = require("webpack-merge");
const common = require("./webpack.config.prod");

module.exports = (_, { mode }) => {
  const isDevelopment = mode === "development";

  return merge(common(_, isDevelopment), {
    devtool: "inline-source-map",
  });
}