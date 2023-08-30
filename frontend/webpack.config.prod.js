/* eslint-disable */
const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: "source-map",
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

  entry: {
    'main': './static/js/index.js',
    'base-style': './static/scss/main.scss',
  },

  output: {
    path: path.resolve(__dirname, './static/bundles/'),
    filename: "[name].[contenthash].js",
    publicPath: '/frontend/static/'
  },

  plugins: [
    new BundleTracker({
        filename: "webpack-stats.json",
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            'presets': ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              }
            }
          ]
      },
      {
        test: /\.(svg|jpg|png|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: '/frontend/static/'
            },
          },
        ],
      },
    ]
  },

  resolve: {
    extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.svg',
        '.scss',
        '.css',
        '.eot',
        '.ttf',
        '.woff',
        '.woff2',
    ]
  },

  cache: {
    type: 'filesystem',
  },
}
