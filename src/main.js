/* Styles */
import '@/scss/main.scss'

/* Core */
import Vue from 'vue'
import Buefy from 'buefy'

/* Router & Store */
import router from './router'
import store from './store'

/* Service Worker */
import './registerServiceWorker'

/* Vue. Main component */
import App from './App.vue'

import gkutils from './js/utilities'

window.gkutils = gkutils

/* Default title tag */
const defaultDocumentTitle = 'GNUKhata'

/* Collapse mobile aside menu on route change & set document title from route meta */
router.afterEach(to => {
  if (to.path === '/login') {
    store.commit('setAsideVisibility', false)
  } else {
    store.commit('setAsideVisibility', true)
  }

  store.commit('asideMobileStateToggle', false)

  if (to.meta.title) {
    document.title = `${to.meta.title} — ${defaultDocumentTitle}`
  } else {
    document.title = defaultDocumentTitle
  }
})

Vue.config.productionTip = false

Vue.use(Buefy)

store.commit('initStore') // initialize the required vuex states from local storage

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
