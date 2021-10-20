// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

<<<<<<< HEAD
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const app = "chat";

module.exports = {
  mode: "development",
  entry: ["./src/index.js"],
  devtool: "inline-source-map",
=======
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const app = 'chat';

module.exports = {
  mode: 'development',
  entry: ['./src/index.js'],
  devtool: 'inline-source-map',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  module: {
    rules: [
      {
        test: /\.tsx?$/,
<<<<<<< HEAD
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".jsx", ".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      tls: false,
    },
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: `${app}-bundle.js`,
    publicPath: "/",
    libraryTarget: "var",
    library: `app_${app}`,
  },
  plugins: [
    new HtmlWebpackPlugin({
      inlineSource: ".(js|css)$",
      template: __dirname + `/app/${app}.html`,
      filename: __dirname + `/dist/${app}.html`,
      inject: "head",
=======
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      tls: false,
    }
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `${app}-bundle.js`,
    publicPath: '/',
    libraryTarget: 'var',
    library: `app_${app}`
  },
  plugins: [
    new HtmlWebpackPlugin({
      inlineSource: '.(js|css)$',
      template: __dirname + `/app/${app}.html`,
      filename: __dirname + `/dist/${app}.html`,
      inject: 'head'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }),
  ],
  devServer: {
    proxy: {
<<<<<<< HEAD
      "/": {
        target: "http://localhost:8080",
        bypass: function (req, _res, _proxyOptions) {
          if (req.headers.accept.indexOf("html") !== -1) {
            console.log("Skipping proxy for browser request.");
            return `/${app}.html`;
          }
        },
      },
    },
    contentBase: path.join(__dirname, "dist"),
=======
      '/': {
        target: 'http://localhost:8080',
        bypass: function(req, _res, _proxyOptions) {
          if (req.headers.accept.indexOf('html') !== -1) {
            console.log('Skipping proxy for browser request.');
            return `/${app}.html`;
          }
        }
      }
    },
    contentBase: path.join(__dirname, 'dist'),
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    index: `${app}.html`,
    compress: true,
    liveReload: true,
    hot: false,
<<<<<<< HEAD
    host: "0.0.0.0",
    port: 9000,
    https: true,
    historyApiFallback: true,
    writeToDisk: true,
  },
=======
    host: '0.0.0.0',
    port: 9000,
    https: true,
    historyApiFallback: true,
    writeToDisk: true
  }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
};
