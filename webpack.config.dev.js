const { merge } = require("webpack-merge");

const getCommonConfigs = require("./webpack.config.prod");

module.exports = ({ heapId }, { mode }) => {
  const commonConfigs = getCommonConfigs({ heapId }, { mode })

  return merge(commonConfigs, {
    devtool: "inline-source-map",
    optimization: {
      minimize: false
    }
  });
}
