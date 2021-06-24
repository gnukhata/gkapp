module.exports = {
    publicPath: process.env.GKAPP_URL !== undefined ? process.env.GKAPP_URL : '/',
    lintOnSave: 'warning',
    // Disable js source maps for production build
    productionSourceMap: false
}
