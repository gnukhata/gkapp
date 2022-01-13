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
import axios from 'axios';
import sha512 from 'crypto-js/sha512';
import GetTextPlugin from 'vue-gettext';
import translations from './locales/translations.json';

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
  silent: true
});

Vue.mixin({
  data() {
    return {
      sidebarToggle: false,
      user_role: Number,
    };
  },
  computed: {
    // https://cli.vuejs.org/guide/mode-and-env.html#modes
    gkConfig() {
      return {
        mode: process.env.NODE_ENV || 'production',
        notice: process.env.VUE_APP_GKAPP_NOTICE || true,
      };
    },
  },
  methods: {
    // https://cli.vuejs.org/guide/mode-and-env.html#modes
    // gkMode() {
    //   return process.env.NODE_ENV
    // },
    get_org_address() {
      axios.get('/organisation?osg=true').then((r) => {
        if (r.status === 200 && r.data.gkstatus == 0) {
          this.$store.commit('setOrgAddress', r.data.gkdata);
        }
      });
    },
    hashedPassword(text) {
      let hash = sha512(text).toString();
      return hash;
    },
    currentDate() {
      const dt = new Date();
      const dd = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
      const actualMonth = dt.getMonth() + 1;
      const mm = actualMonth < 10 ? `0${actualMonth}` : actualMonth;
      const yy = dt.getFullYear();
      return `${yy}-${mm}-${dd}`;
    },
    dateReverse(date) {
      const d = date.split('-').reverse();
      return `${d[0]}-${d[1]}-${d[2]}`;
    },
    /**
     * Get the company's users role
     * to decide which items to show in user menu
     */
    get_user_role() {
      axios
        .get(`/user?type=role`)
        .then((res) => {
          this.user_role = res.data.gkresult;
        })
        .catch((e) => {
          console.log('admin fetch', e.message);
        });
    },
    /* Get org image from server */
    getOrgImage() {
      axios
        .get('/organisation?attach=image')
        .then((r) => {
          if (r.status == 200 && r.data.logo !== null) {
            const payload = `data:image/jpg;base64,${r.data.logo}`;
            this.$store.commit('updateOrgImg', payload);
          }
        })
        .catch((e) => {
          console.log(e.message);
        });
    },

    /*
     * Logout the user, But preserve the gkcore url
     */
    logOut() {
      // reset orgname
      this.$store.commit('resetOrg');

      // change auth status
      this.$store.commit('setAuthStatus');

      // delete items from localStorage
      let deleteList = ['authToken', 'orgCode', 'orgName', 'userName'];
      for (let i in deleteList) {
        localStorage.removeItem(deleteList[i]);
      }

      // set gkCore url
      this.$store.commit('setGkCoreUrl', { gkCoreUrl: this.gkCoreUrl });

      // redirect to login page
      this.$router.push('/');

      // alert the user on logout
      this.$bvToast.toast(`Logged out succesfully`, {
        title: 'Logout',
        solid: true,
        variant: 'success',
      });
    },
    switchServer() {
      this.$store.commit('setGkCoreUrl', {
        gkCoreUrl: null,
      });
      this.$router.push('/server-setup');
    },
  },
});

Vue.prototype.$reload = () => location.reload();
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
