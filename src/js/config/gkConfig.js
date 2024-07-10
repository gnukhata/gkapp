export default {
  gkcore_url: process.env.VUE_APP_GKCORE_URL,
  fetch_latest_version: process.env.VUE_APP_FETCH_LATEST_VERSION,
  login_captcha: process.env.VUE_APP_LOGIN_CAPTCHA,
  login_banner: {
    show: process.env.VUE_APP_LOGIN_BANNER_SHOW,
    variant: process.env.VUE_APP_LOGIN_BANNER_VARIANT,
    content: process.env.VUE_APP_LOGIN_BANNER_CONTENT,
  },
  sidebar_banner: {
    show: process.env.VUE_APP_SIDEBAR_BANNER_SHOW,
    variant: process.env.VUE_APP_SIDEBAR_BANNER_VARIANT,
    content: process.env.VUE_APP_SIDEBAR_BANNER_CONTENT,
  },
};
