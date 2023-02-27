import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';

import global from '../js/config/global.js';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    global,
  },
  state: {
    /* User */
    userName: null,
    userEmail: null,
    userAvatar: null,
    userOrgAuthenticated: null,
    userAuthenticated: null,
    authToken: null,
    userAuthToken: null,

    /* Org */
    orgCode: null,
    orgName: null,
    orgAddress: null,
    orgGstin: null,
    orgType: null,
    orgImg: 'img/gk.png',
    yearStart: null,
    yearEnd: null,
    newGstNews: false,
    finYears: [],

    gkTestUrl: 'http://localhost:6543',
    gkCoreUrl: null,
    searchMenu: false,

    invoiceParty: {
      id: null,
      name: null,
      type: null,
    },

    locale: 'en',

    // constants
    gstRates: [0, 0.1, 0.25, 1, 1.5, 3, 5, 7.5, 12, 18, 28],
    locales: [
      { text: 'En - En', value: 'en' },
      { text: 'हि - Hi', value: 'hi' },
      { text: 'മ - Ml', value: 'ml' },
      { text: 'म - Mr', value: 'mr' },
      { text: 'த - Ta', value: 'ta' },
      { text: 'తె - Te', value: 'te' },
    ],
  },
  mutations: {
    /* A fit-them-all commit */
    basic(state, payload) {
      state[payload.key] = payload.value;
    },
    gstNews(state, payload) {
      state.newGstNews = payload;
    },
    resetOrg(state) {
      state.orgName = null;
    },
    updateOrgImg(state, payload) {
      state.orgImg = payload;
    },
    toggleSearchMenu(state, payload) {
      state.searchMenu = payload;
    },
    setOrgAddress(state, payload) {
      state.orgAddress = payload;
      if (state.orgAddress.orgname) state.orgName = state.orgAddress.orgname;
    },

    // Init the required vuex store states from session storage
    initStore(state) {
      const userAuthStatus = localStorage.getItem('userAuthenticated');
      const authStatus = localStorage.getItem('userOrgAuthenticated');
      const gkCoreUrl = localStorage.getItem('gkCoreUrl');
      const authToken = localStorage.getItem('authToken');
      const userAuthToken = localStorage.getItem('userAuthToken');

      if (userAuthStatus === 'true') {
        state.userAuthenticated = true;
        const userName = localStorage.getItem('userName');
        if (userAuthToken) {
          state.userAuthToken = userAuthToken;
        }

        if (userName) {
          state.userName = userName;
        }
      }

      if (authStatus === 'true') {
        state.userOrgAuthenticated = true;

        const orgCode = localStorage.getItem('orgCode');
        const orgName = localStorage.getItem('orgName');
        const orgYears = JSON.parse(localStorage.getItem('orgYears'));
        const orgType = JSON.parse(localStorage.getItem('orgArray'));
        const finYears = JSON.parse(localStorage.getItem('finYears'));
        const orgGstin = localStorage.getItem('orgGstin');

        if (orgCode) {
          state.orgCode = parseInt(orgCode);
        }

        if (orgName) {
          state.orgName = orgName;
        }

        if (authToken) {
          state.authToken = authToken;
        }

        if (orgYears) {
          state.yearStart = orgYears.yearStart;
          state.yearEnd = orgYears.yearEnd;
        }
        if (orgType) {
          state.orgType = orgType[1];
        }
        if (finYears) {
          state.finYears = finYears;
        }

        if (orgGstin) {
          if(orgGstin === "null" || orgGstin === "undefined") {
            state.orgGstin = null;  
          } else {
            state.orgGstin = orgGstin;
          }
        }
      }

      if (gkCoreUrl) {
        state.gkCoreUrl = gkCoreUrl;

        // set axios default every time store inits, as its lost on page refresh
        axios.defaults.baseURL = gkCoreUrl;
        let headers = {};

        if (authToken) {
          headers.gktoken = authToken;
        }
        if (userAuthToken) {
          headers.gkusertoken = userAuthToken;
        }
        axios.defaults.headers = headers;
      }
    },

    /* Session Auth States */
    setUserAuthStatus(state, payload) {
      state.userAuthenticated = !!payload;
      localStorage.setItem('userAuthenticated', state.userAuthenticated);
    },

    setUserOrgAuthStatus(state, payload) {
      state.userOrgAuthenticated = !!payload;
      localStorage.setItem('userOrgAuthenticated', state.userOrgAuthenticated);
    },

    setOrgCode(state, payload) {
      state.orgCode = payload;
      localStorage.setItem('orgCode', state.orgCode);
    },

    setOrgName(state, payload) {
      state.orgName = payload;
      localStorage.setItem('orgName', state.orgName);
    },

    setOrgGstin(state, payload) {
      state.orgGstin = payload;
      localStorage.setItem('orgGstin', state.orgGstin);
    },

    setAuthToken(state, payload) {
      state.authToken = payload;
      localStorage.setItem('authToken', state.authToken);
      axios.defaults.headers = { gktoken: state.authToken };
    },

    setUserAuthToken(state, payload) {
      state.userAuthToken = payload;
      localStorage.setItem('userAuthToken', state.userAuthToken);
      axios.defaults.headers = { gkusertoken: state.userAuthToken };
    },

    setOrgYears(state, payload) {
      state.yearStart = payload.yearStart;
      state.yearEnd = payload.yearEnd;
      localStorage.setItem(
        'orgYears',
        JSON.stringify({ yearStart: state.yearStart, yearEnd: state.yearEnd })
      );
    },
    setGkCoreUrl(state, payload) {
      state.gkCoreUrl = payload.gkCoreUrl;
      localStorage.setItem('gkCoreUrl', state.gkCoreUrl);
      axios.defaults.baseURL = payload.gkCoreUrl; // update axios config when the url is set to use it when continuing without page refresh.
    },

    setInvoiceParty(state, payload) {
      if (payload) {
        state.invoiceParty = {
          id: payload.id,
          name: payload.name,
          type: payload.type,
        };
      }
    },

    setFinYears(state, payload) {
      if (payload) {
        state.finYears = payload;
        localStorage.setItem('finYears', JSON.stringify(state.finYears));
      }
    },

    /* User */
    user(state, payload) {
      if (payload.username) {
        state.userName = payload.username;
        localStorage.setItem('userName', state.userName);
      }
      if (payload.email) {
        state.userEmail = payload.email;
        localStorage.setItem('userEmail', state.userEmail);
      }
      if (payload.avatar) {
        state.userAvatar = payload.avatar;
        localStorage.setItem('userAvatar', state.userAvatar);
      }
    },

    incrementAriaIterator(state) {
      state.ariaIterator++;
    },

    setLocale(state, payload) {
      let locale = state.locales.find((locale) => locale.value === payload);

      if (locale) {
        state.locale = payload;
        localStorage.setItem('locale', state.locale);
      }
    },
  },
  actions: {
    initGstin({ commit }) {
      return axios.get('/organisation/gstin').then((resp) => {
        if (resp.data.gkstatus === 0) {
          let result = resp.data.gkresult;
          let gstin =
            result.gstin && typeof result.gstin === 'object'
              ? result.gstin[result.stateCode]
              : null;
            if(!gstin && result.stateCode < 10) {
              gstin = result.gstin[`0${result.stateCode}`];
            }
          commit('setOrgGstin', gstin || null);
        }
      });
    },
    initLocalStates({ commit, dispatch }) {
      commit('initStore');
      return Promise.all([dispatch('initOrgAddress'), dispatch('initOrgImg')]);
    },
    initOrgAddress({ state, commit }) {
      if (state.userAuthenticated) {
        return axios.get('/organisation').then((r) => {
          if (r.status === 200 && r.data.gkstatus == 0) {
            commit('setOrgAddress', r.data.gkdata);
          }
        });
      }
    },
    initOrgImg({ state, commit }) {
      if (state.userAuthenticated) {
        return axios.get('/organisation/attachment').then((r) => {
          if (r.data.logo !== null) {
            const payload = `data:image/jpg;base64,${r.data.logo}`;
            commit('updateOrgImg', payload);
          }
        });
      }
    },
    setSessionStates({ commit }, payload) {
      if (payload.auth !== undefined) {
        commit('setUserOrgAuthStatus', payload.auth);
      }
      if (payload.userAuth !== undefined) {
        commit('setUserAuthStatus', payload.userAuth);
      }
      if (payload.orgCode !== undefined) {
        commit('setOrgCode', payload.orgCode);
      }
      if (payload.orgName !== undefined) {
        commit('setOrgName', payload.orgName);
      }
      if (payload.finYears !== undefined) {
        commit('setFinYears', payload.finYears);
      }
      if (payload.authToken !== undefined) {
        commit('setAuthToken', payload.authToken);
      }
      if (payload.userAuthToken !== undefined) {
        commit('setUserAuthToken', payload.userAuthToken);
      }
      if (payload.user !== undefined) {
        commit('user', payload.user);
      }
      if (payload.orgYears !== undefined) {
        commit('setOrgYears', payload.orgYears);
      }
      if (payload.gkCoreUrl !== undefined) {
        commit('setGkCoreUrl', payload);
      }
    },
  },
  getters: {
    getGkCoreUrl: (state) => state.gkCoreUrl,
    isUserAuthenticated: (state) => state.userAuthenticated,
    isUserOrgAuthenticated: (state) => state.userOrgAuthenticated,
    getOrgCode: (state) => state.orgCode,
    getOrgAddress: (state) => state.orgAddress,
    // currentFinYear: (state) => {
    //   let res = null;
    //   if (state.yearStart && state.yearEnd) {
    //     let ystart = state.yearStart
    //       .split('-')
    //       .reverse()
    //       .join('-');
    //     let yend = state.yearEnd
    //       .split('-')
    //       .reverse()
    //       .join('-');
    //     let currentYear = state.finYears.find(
    //       (ydata) => ydata.ystart === ystart && ydata.yend === yend
    //     );
    //     res = currentYear;
    //   }
    //   return res;
    // },
    // getFinYears: (state) => state.finYears,
  },
});
