// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const config = require('./webpack.config.js');

module.exports = Object.assign(config, { 
  mode: 'development', 
  devtool: 'inline-source-map', 
  module: {
    rules:  [
      ... config.module.rules,
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        include: /amazon-chime-sdk-component-library-react/
      },
    ]
  }
});