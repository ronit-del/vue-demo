const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        // http: require.resolve('stream-http'),
        // https: require.resolve('https-browserify'),
        // stream: require.resolve('stream-browserify'),
        // util: require.resolve('util/'),
        // url: require.resolve('url/'),
        // assert: require.resolve('assert/'),
        // zlib: require.resolve('browserify-zlib'),
        // crypto: require.resolve('crypto-browserify'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  },
});
