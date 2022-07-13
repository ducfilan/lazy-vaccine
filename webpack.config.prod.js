const webpack = require("webpack");

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyPlugin = require("copy-webpack-plugin");
const DotenvPlugin = require("dotenv-webpack");
const TerserPlugin = require("terser-webpack-plugin");


const path = require("path");

module.exports = (_, { mode }) => {
  const isDevelopment = mode === "development";

  return {
    entry: {
      popup: {
        import: "./src/pages/popup/index.tsx",
        filename: "pages/[name].js"
      },
      app: {
        import: "./src/pages/app/index.tsx",
        filename: "pages/[name].js"
      },
      content: path.join(__dirname, "src/content.tsx"),
      background: path.join(__dirname, "src/background.ts"),
    },
    output: { path: path.join(__dirname, "dist"), filename: "[name].js", publicPath: '/' },
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
          test: /\.s[ac]ss|css$/i,
          use: ["style-loader", "css-loader", "resolve-url-loader", "sass-loader"],
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          type: "asset/resource",
          generator: {
            filename: 'static/[hash][ext][query]'
          },
          exclude: [
            path.join(__dirname, "src/images/ui/fa"),
            path.join(__dirname, "src/images/ui/fa/brands"),
            path.join(__dirname, "src/images/ui/flags")
          ]
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
          generator: {
            filename: 'static/[hash][ext][query]'
          },
          include: [
            path.join(__dirname, "src/images/ui/flags"),
            path.join(__dirname, "src/images/ui/fa"),
          ]
        },
        {
          test: /\.less$/,
          use: [{
            loader: "style-loader",
          }, {
            loader: "css-loader",
          }, {
            loader: "less-loader",
            options: {
              lessOptions: {
                modifyVars: {
                  "primary-color": "#12b886",
                  "border-radius-base": "5px",
                  "btn-border-radius-base": "6px",
                  "font-family": "'Source Sans Pro', 'Noto Sans JP', BlinkMacSystemFont, -apple-system, 'Segoe UI', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol','Noto Color Emoji'",
                },
                javascriptEnabled: true,
              },
            },
          }],
        }
      ],
    },
    resolve: {
      extensions: [".js", ".jsx", ".tsx", ".ts"],
      alias: {
        "@": path.join(__dirname, "src"),
        "@img": path.join(__dirname, "src/images"),
        "@hooks": path.join(__dirname, "src/common/hooks"),
        "@consts": path.join(__dirname, "src/common/consts"),
        "@facades": path.join(__dirname, "src/common/facades"),
        "@bg": path.join(__dirname, "src/background"),
      },
      fallback: {
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "crypto": require.resolve("crypto-browserify"),
        "assert": false
      },
    },
    devServer: {
      contentBase: "./dist",
      hot: true,
    },
    plugins: [
      new DotenvPlugin({
        path: isDevelopment ? "./.env" : "./prod.env"
      }),
      new CopyPlugin({
        patterns: [{ from: "public", to: "." }],
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
      //new BundleAnalyzerPlugin(),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        extractComments: false,
        parallel: true,
        terserOptions: {
          ecma: 6,
          output: {
            ascii_only: true
          },
        },
      })],
    },
  };
}
