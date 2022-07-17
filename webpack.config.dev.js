const { merge } = require("webpack-merge");

const getCommonConfigs = require("./webpack.config.prod");

module.exports = (_, { mode }) => {
  const commonConfigs = getCommonConfigs(_, { mode })

  return merge(commonConfigs, {
    devtool: "inline-source-map",
    optimization: {
      minimize: false
    }
  });
}
