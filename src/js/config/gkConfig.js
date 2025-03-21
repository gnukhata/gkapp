export default {
  gkcore_url: import.meta.env.VITE_GKCORE_URL,
  fetch_latest_version: import.meta.env.VITE_FETCH_LATEST_VERSION === 'true',
  login_captcha: import.meta.env.VITE_LOGIN_CAPTCHA === 'true',
  login_banner: {
    show: import.meta.env.VITE_LOGIN_BANNER_SHOW === 'true',
    variant: import.meta.env.VITE_LOGIN_BANNER_VARIANT,
    content: import.meta.env.VITE_LOGIN_BANNER_CONTENT,
  },
  sidebar_banner: {
    show: import.meta.env.VITE_SIDEBAR_BANNER_SHOW === 'true',
    variant: import.meta.env.VITE_SIDEBAR_BANNER_VARIANT,
    content: import.meta.env.VITE_SIDEBAR_BANNER_CONTENT,
  },
};
