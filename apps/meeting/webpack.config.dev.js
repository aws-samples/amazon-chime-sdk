const config = require('./webpack.config.js');

module.exports = Object.assign(config, { mode: 'development', devtool: 'inline-source-map' });
