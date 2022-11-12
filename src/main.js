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
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { mapState } from 'vuex';

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

Vue.mixin({
  data() {
    return {
      sidebarToggle: false,
      user_role: Number,
      gkConfig: {
        // https://cli.vuejs.org/guide/mode-and-env.html#modes
        mode: process.env.NODE_ENV || 'production',
        notice: process.env.VUE_APP_GKAPP_NOTICE || true,
        conf: {},
      },
    };
  },
  computed: {
    ...mapState(['userAuthenticated']),
  },
  // Naming convention for methods is: snake_casing
  methods: {
    /**
     * Get gkapp config from json file
     */
    get_gk_config() {
			let configFilePath = 'gkapp-config.json'
			// if the webapp is not hosted on web path instead of root domain, Eg: Gitlab pages,
			// set file url accordingly
			if (window.location.pathname != '/') {
				configFilePath = window.location.origin + window.location.pathname + configFilePath
			} else {
				configFilePath = '/' + configFilePath
			}
      fetch(configFilePath)
        .then((r) => r.json())
        .then((r) => {
          this.gkConfig['conf'] = r;
        })
        .catch((e) => {
          this.$gettext('failed to load gkapp config file'),
            {
              title: this.$gettext('Error'),
              variant: 'danger',
              solid: true,
            };
          console.log(e);
        });
    },
    is_mobile() {
      return window.innerWidth <= 768 ? true : false;
    },
    /**
     * check for latest news from the gst portal
     */
    check_gst_news() {
      axios.get('/gst-news').then((r) => {
        if (localStorage.getItem('gstNewsCount') && this.userAuthenticated) {
          if (
            r.data.gkresult.length >
            parseInt(localStorage.getItem('gstNewsCount'))
          ) {
            const link = this.$createElement;
            const $url = link(
              'router-link',
              {
                props: {
                  to: '/gst/news',
                },
              },
              'Check out!'
            );
            this.$bvToast.toast(['You have unread news, ', $url], {
              title: 'GST News',
              variant: 'info',
              solid: true,
              toaster: 'b-toaster-top-center',
            });
            this.$store.commit('gstNews', true);
          }
        }
      });
    },
    // https://cli.vuejs.org/guide/mode-and-env.html#modes
    gk_env() {
      return {
        node_env: process.env.NODE_ENV,
        gkcore_url: process.env.VUE_APP_GKCORE_URL || null,
        gkapp_url: process.env.GKAPP_URL || null,
      };
    },
    /**
     * Return language specific number representation of given `value`
     * @param {} value
     * @param {} format
     * @returns {}
     * TODO handle multiple currencies
     */
    gk_currency(value, format = 'en-IN', symbol = '₹ ') {
      let formattedValue = null;
      const decimalExists = value.toString().includes('.');
      // handle decimal places
      if (decimalExists) {
        const num = value.toString().split('.');
        // if only one decimal place exist, append 0 after decimal place
        if (num[1].length == 1) {
          // formattedValue = parseFloat(`${num[0]}.${num[1]}`).toFixed(2);
          formattedValue = parseFloat(value).toFixed(2);
          // handle more than two decimal places
        } else if (num[1].length > 2) {
          formattedValue = parseFloat(`${num[0]}.${num[1].slice(0, 2)}`);
        } // keep the same value if it has two decimal places
        else {
          formattedValue = value;
        }
      } else {
        // append two decimal palces at the end of the value, if no decimal place exist
        formattedValue = parseFloat(value).toFixed(2);
      }
      return symbol + formattedValue.toLocaleString(format);
    },
    /**
     * @param {} file
     * @returns {Promise} Promise object represents base64 string
     */
    get_base64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },
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
      const gkcoreUrl = this.$store.getters['getGkCoreUrl'];

      // reset orgname
      this.$store.commit('resetOrg');

      // change auth status
      this.$store.commit('setUserOrgAuthStatus');

      // remove custom states in localhost
      localStorage.removeItem('orgChoice');
      localStorage.removeItem('orgArray');
      localStorage.removeItem('orgCodeChoice');

      // delete items from localStorage
      const deleteList = ['authToken', 'orgCode', 'orgName', 'orgyears', 'orgGstin'];
      for (const i in deleteList) {
        localStorage.removeItem(deleteList[i]);
      }

      // set gkCore url
      this.$store.commit('setGkCoreUrl', { gkCoreUrl: gkcoreUrl });

      // redirect to login page
      this.$router.push('/user-login');
      // reset the org image to default
      this.$store.commit('updateOrgImg', 'img/gk.png');
      // alert the user on logout
      /* this.$bvToast.toast(this.$gettext(`Logged out succesfully`), {
        title: 'Logout',
        solid: true,
        variant: 'success',
      }); */
    },
    //This method runs when switch server button is clicked
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
