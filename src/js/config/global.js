import { CONFIGS, PAGES } from '../enum.js';
import axios from 'axios';
import Vue from 'vue';

export default {
  state: {
    defConf: {
      general: {
        format: {
          date: 'dd-mm-yyyy',
        },
        default: {
          locale: 'en', //
        },
      },
      transaction: {
        format: {
          no: {
            prefix: false,
            separator: '/',
            suffix: {
              pattern: [
                {
                  type: 'string', // SL,PU
                },
                {
                  type: 'date',
                  format: 'yy', // yy, yyyy, yy-yy, yyyy-yyyy
                },
              ],
              separator: '-',
            },
          },
        },
        default: {
          payment: 'bank', // bank, cash, credit
          tax: 'GST', // GST, VAT
          godown: '',
        },
      },
    },
    customConf: {},
    constant: {
      gstRates: [0, 0.1, 0.25, 1, 1.5, 3, 5, 7.5, 12, 18, 28],
    },
    options: {
      general: {
        dateFormat: ['dd-mm-yyyy', 'yyyy-mm-dd', 'mm-dd-yyyy'],
        locale: [
          { text: 'English', value: 'en' },
          { text: 'हिन्दी', value: 'hi' },
          { text: 'മലയാളം', value: 'ml' },
          { text: 'मराठी', value: 'mr' },
          { text: 'தமிழ்', value: 'ta' },
          { text: 'తెలుగు', value: 'te' },
        ],
      },
      transaction: {
        paymentMode: ['bank', 'cash', 'credit'],
        taxMode: ['None', 'GST', 'VAT', 'GST & VAT'],
        godowns: [],
      },
    },
  },
  getters: {
    getGlobalConfig: (state) => {
      return state.customConf;
    },
    getGlobalConfigOptions: (state) => {
      return state.options;
    },
    getDateFormat: (state) => {
      return state.customConf.general.format.date;
    },
    getTrnNoFormat: (state) => {
      return state.customConf.transaction.format.no;
    },
    getDefaultPaymentMode(state) {
      return state.customConf.transaction.default.payment;
    },
    getDefaultTaxMode(state) {
      return state.customConf.transaction.default.tax;
    },
    getGstRates(state) {
      return state.constant.gstRates;
    },
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so
    // config must be validated before commit
    setGlobalConfig(state, payload) {
      state.customConf.general = payload.general;
      state.customConf.transaction = payload.transaction;
      if (payload.orgCode) {
        localStorage.setItem(
          `${payload.orgCode}-globalConf`,
          JSON.stringify(state.customConf)
        );
      }
    },

    setGodownList(state, payload) {
      state.options.transaction.godowns = payload;
    },
  },
  actions: {
    initGlobalState: ({ commit, rootGetters }) => {
      if (rootGetters.getOrgCode) {
        let conf = localStorage.getItem(
          `${rootGetters.getOrgCode}-globalConf`
        );
        if (conf) {
          conf = JSON.parse(conf);
          commit('setGlobalConfig', conf);
        }
      }
    },
    // must be invoked after successful login
    initGlobalConfig({ state, commit, rootGetters }) {
      let url = `/config?conftype=org&pageid=${PAGES['global']}&confid=${CONFIGS['global']}`;
      axios.get(url).then((resp) => {
        if (resp.data.gkstatus === 0) {
          let orgCode = rootGetters.getOrgCode;
          let conf = resp.data.gkresult ? resp.data.gkresult : state.defConf;
          conf.orgCode = orgCode;
          commit('setGlobalConfig', conf);
        } else {
          commit('setGlobalConfig', state.defConf);
        }
      });
    },
    initGlobalConfigOptions({ commit }) {
      axios.get('/godown').then((resp) => {
        if (resp.data.gkstatus === 0) {
          let godowns = resp.data.gkresult.map((godown) => {
            return {
              text: godown.goname,
              value: godown.goid,
            };
          });
          commit('setGodownList', godowns);
        }
      });
    },
    updateGlobalConfig({ commit, rootGetters }, payload) {
      const confPayload = {
        config: payload,
        path: [PAGES['global'], CONFIGS['global']],
      };
      return axios
        .put(
          '/config?conftype=org&update=path&confcategory=global',
          confPayload
        )
        .then((resp) => {
          if (resp.data.gkresult === 0) {
            payload.orgCode = rootGetters.getOrgCode;
            commit('setGlobalConfig', payload);
          }
          return resp.data;
        });
    },
  },
  namespaced: true,
};
