module.exports = {
  publicPath: process.env.GKAPP_URL !== undefined ? process.env.GKAPP_URL : '/',
  // use strict lint
  lintOnSave: 'error',

  // Disable js source maps for production build
  productionSourceMap: false,

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true,
      enableBridge: false,
    },
  },
};
