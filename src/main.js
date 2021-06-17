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

Vue.config.productionTip = false
Vue.prototype.$workbox = wb

store.commit('initStore') // initialize the required vuex states from local storage

Vue.mixin({
  methods: {
    dateReverse(date){
      let d = date.split('-').reverse();
      return `${d[0]}-${d[1]}-${d[2]}`;
    }
  }
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
