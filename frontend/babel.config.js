module.exports = function (api) {
  api.cache(true);

  return {
    plugins: [
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-proposal-class-properties",
      [
        "@babel/plugin-transform-runtime",
        {
          regenerator: true,
          corejs: 3,
        },
      ],
    ],
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript",
    ],
  };
};
