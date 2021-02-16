import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'

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

    yearStart: null,
    yearEnd: null,

    gkTestUrl: 'http://localhost:6543',
    gkCoreUrl: null,

    invoiceParty: {
      id: null,
      name: null,
      type: null
    }
  },
  mutations: {
    /* A fit-them-all commit */
    basic(state, payload) {
      state[payload.key] = payload.value
    },
    resetOrg(state) {
      state.orgName = null
      console.log('orgname cleared')
    },
    // Init the required vuex store states from session storage
    initStore(state) {
      const authStatus = localStorage.getItem('userAuthenticated')
      const orgCode = localStorage.getItem('orgCode')
      const orgName = localStorage.getItem('orgName')
      const authToken = localStorage.getItem('authToken')
      const userName = localStorage.getItem('userName')
      const orgYears = JSON.parse(localStorage.getItem('orgYears'))
      const gkCoreUrl = localStorage.getItem('gkCoreUrl')

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

      if (orgYears) {
        state.yearStart = orgYears.yearStart
        state.yearEnd = orgYears.yearEnd
      }
      if (gkCoreUrl) {
        state.gkCoreUrl = gkCoreUrl

        // set axios default every time store inits, as its lost on page refresh
        axios.defaults.baseURL = gkCoreUrl
        axios.defaults.headers = { gktoken: authToken }
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

    setOrgYears(state, payload) {
      state.yearStart = payload.yearStart
      state.yearEnd = payload.yearEnd
      localStorage.setItem('orgYears', JSON.stringify({ yearStart: state.yearStart, yearEnd: state.yearEnd }))
    },
    setGkCoreUrl(state, payload) {
      state.gkCoreUrl = payload.gkCoreUrl
      localStorage.setItem('gkCoreUrl', state.gkCoreUrl)
    },

    setInvoiceParty(state, payload) {
      if (payload) {
        state.invoiceParty = { id: payload.id, name: payload.name, type: payload.type }
      }
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
      if (payload.orgYears !== undefined) {
        commit('setOrgYears', payload.orgYears)
      }
      if (payload.gkCoreUrl !== undefined) {
        commit('setGkCoreUrl', payload)
      }
    }
  },
  getters: {
    isUserAuthenticated: state => state.userAuthenticated
  }
})
