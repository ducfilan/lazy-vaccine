const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const webpack = require("webpack");

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (_, { mode }) => {
  const isDevelopment = mode === "development";

  return {
    entry: {
      popup: {
        import: "./src/pages/popup/index.tsx",
        filename: "pages/[name].js"
      },
      content: path.join(__dirname, "src/content.ts"),
      background: path.join(__dirname, "src/background.ts"),
    },
    output: { path: path.join(__dirname, "dist"), filename: "[name].js" },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: {
                plugins: [
                  isDevelopment && require.resolve("react-refresh/babel"),
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          type: "asset/resource",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx", ".tsx", ".ts"],
    },
    devServer: {
      contentBase: "./dist",
      hot: true,
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: "public", to: "." }],
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
    ],
  };
}
