import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/axios'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import wb from './registerServiceWorker'
import store from './store'
import '@/scss/main.scss'
import axios from 'axios'

Vue.config.productionTip = false
Vue.prototype.$workbox = wb

store.commit('initStore') // initialize the required vuex states from local storage

Vue.mixin({
  data() {
    return {
      orgImg: String,
      userRole: Number
    }
  },
  methods: {
    dateReverse(date){
      let d = date.split('-').reverse();
      return `${d[0]}-${d[1]}-${d[2]}`;
    },
    /**
     * Get the company's users role
     * to decide which items to show in user menu
     */
    getUserRole() {
      axios
        .get(`/user?type=role`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.userRole = res.data.gkresult;
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
            this.orgImg = `data:image/png;base64,${r.data.logo}`;
          } else {
            this.orgImg = 'img/gk.png';
          }
        })
        .catch((e) => {
          console.log(e.message);
          this.orgImg = 'img/gk.png';
        });
    },
  }
})

Vue.prototype.$reload = () => location.reload();
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
