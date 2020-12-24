module.exports = {
  productionSourceMap: false, // Don't generate js source maps
  // filenameHashing: false, // Don't hash output file names
  publicPath: process.env.DEPLOY_ENV === 'GL_PAGES' ? '/gkapp/' : '/',
  // Remove moment.js from chart.js
  // https://www.chartjs.org/docs/latest/getting-started/integration.html#bundlers-webpack-rollup-etc
  configureWebpack: config => {
    return {
      externals: {
        moment: 'moment'
      }
    }
  }
}
