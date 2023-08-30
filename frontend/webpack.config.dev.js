/* eslint-disable */
const common = require('./webpack.config.prod.js');
const webpack = require('webpack');

module.exports = {
  ...common,

  mode: 'development',
  devtool: 'source-map',
  watch: true,
  devServer: {
    compress: true,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimize: false,
  },

  plugins: [
    ...common.plugins,
    new webpack.HotModuleReplacementPlugin(),
  ],
};

