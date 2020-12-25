import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* User */
    userName: null,
    userEmail: null,
    userAvatar: null,

    /* Session auth states */
    userAuthenticated: null,
    orgCode: null,
    authToken: null,

    /* NavBar */
    isNavBarVisible: true,

    /* FooterBar */
    isFooterBarVisible: true,

    /* Aside */
    isAsideVisible: true,
    isAsideMobileExpanded: false,

    /* Dark mode */
    isDarkModeActive: false,

    /* used for aria label id's */
    ariaIterator: 0,

    gkCoreUrl: 'https://satheerthan.site:6543',
    gkCoreTestUrl: 'http://localhost:6543'
  },
  mutations: {
    /* A fit-them-all commit */
    basic (state, payload) {
      state[payload.key] = payload.value
    },

    // Init the required vuex store states from session storage
    initStore (state) {
      const authStatus = sessionStorage.getItem('userAuthenticated')
      const orgCode = sessionStorage.getItem('orgCode')
      const authToken = sessionStorage.getItem('authToken')
      if (authStatus === 'true') {
        state.userAuthenticated = true
      }

      if (orgCode) {
        state.orgCode = parseInt(orgCode)
      }

      if (authToken) {
        state.authToken = authToken
      }
    },

    /* Session Auth States */
    setAuthStatus (state, payload) {
      state.userAuthenticated = !!payload
      sessionStorage.setItem('userAuthenticated', state.userAuthenticated)
    },

    setOrgCode (state, payload) {
      state.orgCode = payload
      sessionStorage.setItem('orgCode', state.orgCode)
    },

    setAuthToken (state, payload) {
      state.authToken = payload
      sessionStorage.setItem('authToken', state.authToken)
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
    },

    incrementAriaIterator (state) {
      state.ariaIterator++
    }
  },
  actions: {
    setSessionStates ({ commit }, payload) {
      if (payload.auth !== undefined) {
        commit('setAuthStatus', payload.auth)
      }
      if (payload.orgCode !== undefined) {
        commit('setOrgCode', payload.orgCode)
      }
      if (payload.authToken !== undefined) {
        commit('setAuthToken', payload.authToken)
      }
      if (payload.user !== undefined) {
        commit('user', payload.user)
      }
    }
  },
  getters: {
    isUserAuthenticated: state => state.userAuthenticated
  }
})
