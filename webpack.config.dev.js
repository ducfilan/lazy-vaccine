const { merge } = require("webpack-merge");

const getCommonConfigs = require("./webpack.config.prod");

module.exports = (env, { mode }) => {
  const commonConfigs = getCommonConfigs(env, { mode })

  return merge(commonConfigs, {
    devtool: "inline-source-map",
    optimization: {
      minimize: false
    }
  });
}
