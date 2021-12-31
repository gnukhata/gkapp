import { CONFIGS, PAGES } from '../enum.js';
import axios from 'axios';

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
          partyVoucherFlag: true, // use customer/supplier ledgers for tracking transaction
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
    getPartyVoucherFlag(state) {
      return state.customConf.transaction.default.partyVoucherFlag;
    },
    getDefaultGodown(state) {
      return state.customConf.transaction.default.godown;
    },
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so
    // config must be validated before commit
    setGlobalConfig(state, payload) {
      let conf = payload.conf;
      state.customConf.general = conf.general;
      state.customConf.transaction = conf.transaction;
      if (payload.lang && state.customConf.general) {
        if (state.customConf.general.default) {
          payload.lang.current = state.customConf.general.default.locale;
        }
      }
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
    initGlobalState: ({ state, dispatch, commit, rootGetters }, payload) => {
      if (rootGetters.getOrgCode) {
        let conf = localStorage.getItem(`${rootGetters.getOrgCode}-globalConf`);
        conf = conf ? JSON.parse(conf) : state.defConf;
        commit('setGlobalConfig', { conf, lang: payload.lang });
        return dispatch('initGlobalConfigOptions').then(() => {
          return dispatch('initDefaultGodown');
        });
      }
      return new Promise((resolve) => {
        resolve();
      });
    },
    initDefaultGodown: ({ state, dispatch, rootGetters }) => {
      let goList = state.options.transaction.godowns || [];
      let goName = 'Primary Godown';
      let pGodown = goList.find((go) => go.text === goName);

      if (!state.customConf.transaction.default.godown) {
        if (!pGodown) {
          let orgAddress = rootGetters.getOrgAddress;
          let orgState = orgAddress.orgstate || '';
          let payload = {
            goname: goName,
            goaddr: `${goName}'s address`,
            state: orgState,
            gocontact: '',
            contactname: '',
          };
          return axios.post('/godown', payload).then((resp) => {
            if (resp.data.gkstatus === 0 && resp.data.gkresult) {
              let conf = state.customConf;
              conf.transaction.default.godown = resp.data.gkresult;
              return dispatch('updateGlobalConfig', conf);
            }
          });
        } else {
          let conf = state.customConf;
          conf.transaction.default.godown = pGodown.value;
          return dispatch('updateGlobalConfig', conf);
        }
      }
      return new Promise((resolve) => {
        resolve();
      });
    },
    // must be invoked after successful login
    initGlobalConfig({ state, commit, rootGetters }, payload) {
      let url = `/config?conftype=org&pageid=${PAGES['global']}&confid=${CONFIGS['global']}`;
      return axios.get(url).then((resp) => {
        let orgCode = rootGetters.getOrgCode;
        if (resp.data.gkstatus === 0) {
          let conf = resp.data.gkresult ? resp.data.gkresult : state.defConf;
          commit('setGlobalConfig', {
            conf,
            orgCode,
            lang: payload ? payload.lang : null,
          });
        } else {
          commit('setGlobalConfig', { conf: state.defConf, orgCode });
        }
      });
    },
    initGlobalConfigOptions({ commit }) {
      return axios.get('/godown').then((resp) => {
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
    updateGlobalConfig({ commit, rootGetters }, conf) {
      const confPayload = {
        config: conf,
        path: [PAGES['global'], CONFIGS['global']],
      };
      return axios
        .put(
          '/config?conftype=org&update=path&confcategory=global',
          confPayload
        )
        .then((resp) => {
          if (resp.data.gkresult === 0) {
            commit('setGlobalConfig', {
              conf,
              orgCode: rootGetters.getOrgCode,
            });
          }
          return resp.data;
        });
    },
  },
  namespaced: true,
};
