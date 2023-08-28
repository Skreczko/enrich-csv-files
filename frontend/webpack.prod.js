const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./webpack.config.js');

module.exports = {
  ...common, // Importowanie wspólnej konfiguracji

  mode: 'production',
  devtool: 'source-map',  // Możesz tutaj ustawić 'source-map' lub usunąć tę linię, jeśli nie chcesz map źródłowych w produkcji
  watch: false,

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
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },

  plugins: [
    ...common.plugins, // Importowanie pluginów z konfiguracji podstawowej

    // Plugin do minifikacji CSS
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),

    // Plugin do kompresji zasobów
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
};

