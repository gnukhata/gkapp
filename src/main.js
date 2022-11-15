import '@babel/polyfill';
import 'mutationobserver-shim';
import Vue from 'vue';
import './plugins/axios';
import './plugins/bootstrap-vue';
import App from './App.vue';
import router from './router';
import wb from './registerServiceWorker';
import store from './store';
import '@/scss/main.scss';
import GetTextPlugin from 'vue-gettext';
import translations from './locales/translations.json';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import globalMixins from '@/mixins/global.js';
import defaultConfig from '../public/gkapp-config.json';

Vue.config.productionTip = false;
Vue.prototype.$workbox = wb;

Vue.use(GetTextPlugin, {
  availableLanguages: {
    en: 'English',
    hi: 'हिन्दी',
    ml: 'മലയാളം',
    mr: 'मराठी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
  },
  defaultLanguage: 'en',
  translations: translations,
  autoAddKeyAttributes: true,
  silent: true,
});

Vue.component('v-select', vSelect);
// Vue.mixin(globalMixins);

Vue.prototype.$reload = () => location.reload();

function get_gk_config() {
  console.log('init call');
  let configFilePath = 'gkapp-config.json';
  // if the webapp is not hosted on web path instead of root domain, Eg: Gitlab pages,
  // set file url accordingly
  if (window.location.pathname != '/') {
    configFilePath =
      window.location.origin + window.location.pathname + configFilePath;
  } else {
    configFilePath = '/' + configFilePath;
  }
  return fetch(configFilePath)
    .then((r) => r.json())
    .then((r) => {
      console.log('init perform');
      return r;
    })
    .catch(() => {
      console.log('Using default gkconfig');
      return defaultConfig;
    });
}

get_gk_config().then((gkConfig) => {
  globalMixins.data = function() {
    return {
      sidebarToggle: false,
      user_role: Number,
      gkConfig: {
        // https://cli.vuejs.org/guide/mode-and-env.html#modes
        mode: process.env.NODE_ENV || 'production',
        notice: process.env.VUE_APP_GKAPP_NOTICE || true,
        conf: gkConfig,
      },
    };
  };
  Vue.mixin(globalMixins);
  // console.log(gkConfMixin);
  window.gkVue = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app');
});
