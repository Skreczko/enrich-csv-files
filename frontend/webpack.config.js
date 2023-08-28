/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'development',
  devtool: "source-map",
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
    new webpack.HotModuleReplacementPlugin(),
    new BundleTracker({
        filename: "webpack-stats.json",
    }),
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
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
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
            {
              loader: 'css-loader'
            },
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
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            publicPath: '/frontend/static/'
          },
        }],
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
}
