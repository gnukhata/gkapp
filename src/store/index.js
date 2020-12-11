import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    indianStates: null,
    /* User */
    userName: null,
    userEmail: null,
    userAvatar: null,
    userAuthenticated: null,

    /* NavBar */
    isNavBarVisible: true,

    /* FooterBar */
    isFooterBarVisible: true,

    /* Aside */
    isAsideVisible: true,
    isAsideMobileExpanded: false,

    /* Dark mode */
    isDarkModeActive: false
  },
  mutations: {
    /* A fit-them-all commit */
    basic (state, payload) {
      state[payload.key] = payload.value
    },

    // Init the required vuex store states from session storage
    initStore (state) {
      if (sessionStorage.getItem('userAuthenticated') === 'true') {
        state.userAuthenticated = true
      }
    },

    /* User Login */

    setAuthStatus (state, payload) {
      state.userAuthenticated = !!payload.auth
      sessionStorage.setItem('userAuthenticated', state.userAuthenticated)
    },

    /* User */
    user (state, payload) {
      if (payload.username) {
        state.userName = payload.username
      }
      if (payload.email) {
        state.userEmail = payload.email
      }
      if (payload.avatar) {
        state.userAvatar = payload.avatar
      }
    },

    initIndianStates (state) {
      state.indianStates = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Pondicherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
    },

    /* Aside Mobile */
    asideMobileStateToggle (state, payload = null) {
      const htmlClassName = 'has-aside-mobile-expanded'

      let isShow

      if (payload !== null) {
        isShow = payload
      } else {
        isShow = !state.isAsideMobileExpanded
      }

      if (isShow) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }

      state.isAsideMobileExpanded = isShow
    },

    /* Aside Login */
    setAsideVisibility (state, payload = false) {
      const htmlClassNames = [
        'has-aside-mobile-expanded',
        'has-aside-left',
        'has-aside-mobile-transition',
        'has-aside-expanded'
      ]

      const isShow = !!payload

      if (isShow) {
        document.documentElement.classList.add(...htmlClassNames)
      } else {
        document.documentElement.classList.remove(...htmlClassNames)
      }

      state.isAsideVisible = isShow
    },

    /* Dark Mode */
    darkModeToggle (state, payload = null) {
      const htmlClassName = 'is-dark-mode-active'

      state.isDarkModeActive = !state.isDarkModeActive

      if (state.isDarkModeActive) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }
    }
  },
  actions: {

  },
  getters: {
    isUserAuthenticated: state => state.userAuthenticated,
    getIndianStates: state => state.indianStates
  }
})
