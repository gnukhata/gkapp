module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? `${process.env.GKAPP_URL}` : '/',
    lintOnSave: 'warning',
    // Disable js source maps for production build
    productionSourceMap: false
}
