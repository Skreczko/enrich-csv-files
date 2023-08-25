const path = require('path');
const common = require('./webpack.config.js');

module.exports = {
  ...common,

  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.resolve('./static/bundles/'),
    filename: "[name]-[contenthash].js",
    publicPath: "/frontend/static/"
  }
}
