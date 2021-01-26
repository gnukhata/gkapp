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
    orgName: null,
    authToken: null,

    gkCoreUrl: 'https://satheerthan.site:6543',
    gkCoreTestUrl: 'http://localhost:6543'
  },
  mutations: {
    /* A fit-them-all commit */
    basic(state, payload) {
      state[payload.key] = payload.value
    },

    // Init the required vuex store states from session storage
    initStore(state) {
      const authStatus = localStorage.getItem('userAuthenticated')
      const orgCode = localStorage.getItem('orgCode')
      const orgName = localStorage.getItem('orgName')
      const authToken = localStorage.getItem('authToken')
      const userName = localStorage.getItem('userName')

      if (authStatus === 'true') {
        state.userAuthenticated = true
      }

      if (orgCode) {
        state.orgCode = parseInt(orgCode)
      }

      if (orgName) {
        state.orgName = orgName
      }

      if (authToken) {
        state.authToken = authToken
      }

      if (userName) {
        state.userName = userName
      }
    },

    /* Session Auth States */
    setAuthStatus(state, payload) {
      state.userAuthenticated = !!payload
      localStorage.setItem('userAuthenticated', state.userAuthenticated)
    },

    setOrgCode(state, payload) {
      state.orgCode = payload
      localStorage.setItem('orgCode', state.orgCode)
    },

    setOrgName(state, payload) {
      state.orgName = payload
      localStorage.setItem('orgName', state.orgName)
    },

    setAuthToken(state, payload) {
      state.authToken = payload
      localStorage.setItem('authToken', state.authToken)
    },

    /* User */
    user(state, payload) {
      if (payload.username) {
        state.userName = payload.username
        localStorage.setItem('userName', state.userName)
      }
      if (payload.email) {
        state.userEmail = payload.email
        localStorage.setItem('userEmail', state.userEmail)
      }
      if (payload.avatar) {
        state.userAvatar = payload.avatar
        localStorage.setItem('userAvatar', state.userAvatar)
      }
    },

    incrementAriaIterator(state) {
      state.ariaIterator++
    }
  },
  actions: {
    setSessionStates({ commit }, payload) {
      if (payload.auth !== undefined) {
        commit('setAuthStatus', payload.auth)
      }
      if (payload.orgCode !== undefined) {
        commit('setOrgCode', payload.orgCode)
      }
      if (payload.orgName !== undefined) {
        commit('setOrgName', payload.orgName)
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
