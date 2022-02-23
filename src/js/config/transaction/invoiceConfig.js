import { CONFIGS, PAGES } from '../../enum';
import axios from 'axios';
// default config for invoice page
export default {
  state: {
    default: {
      type: true,
      inv: {
        no: true, // { counter: {sale: 0, purchase: 0} }
        date: true,
        delNote: {
          no: {
            format: {
              code: {
                in: 'DIN',
                out: 'DOUT',
              },
            },
          },
        },
        ebn: true,
        addr: true,
        pin: true,
        state: true,
        issuer: true,
        role: true,
        class: {},
      },
      party: {
        type: true,
        options: {
          states: true,
          gstin: true,
        },
        custid: true,
        name: true,
        addr: true,
        state: true,
        gstin: true,
        tin: true,
        pin: true,
        class: {},
      },
      ship: {
        copyFlag: true,
        name: true,
        addr: true,
        state: true,
        gstin: true,
        tin: true,
        pin: true,
        class: {},
      },
      taxType: true,
      bill: {
        index: true,
        product: { mobileMode: { disabled: true }, addBtn: true },
        hsn: true,
        qty: { mobileMode: { disabled: true }, checkStock: true },
        fqty: true,
        rate: true,
        discount: true,
        taxable: true,
        cgst: true,
        sgst: true,
        igst: true,
        cess: true,
        vat: true,
        total: { mobileMode: true },
        addBtn: { mobileMode: true },
        editBtn: { mobileMode: true },
        footer: {
          discount: true,
          taxable: true,
          igst: true,
          cess: true,
          vat: true,
          total: true,
        },
      },
      payment: {
        mode: true,
        bank: {
          no: true,
          name: true,
          branch: true,
          ifsc: true,
        },
        class: {},
      },
      transport: {
        packageCount: true,
        mode: true,
        vno: true,
        date: true,
        reverseCharge: true,
        class: {},
      },
      comments: {
        class: {},
      },
      total: {
        taxable: true,
        discount: true,
        vat: true,
        igst: true,
        cess: true,
        roundOff: true,
        value: true,
        valueText: true,
      },
    },
    custom: {},
  },
  getters: {
    getDefaultInvoiceConfig: (state) => {
      return state.default;
    },
    getCustomInvoiceConfig: (state) => {
      return state.custom;
    },
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so
    // config must be validated before commit
    setInvoiceConfig(state, payload) {
      state.custom = payload;
    },
  },
  actions: {
    initInvoiceConfig({ state, commit }) {
      let url = `/config?conftype=org&pageid=${PAGES['create-invoice']}&confid=${CONFIGS['page-layout']}`;
      return axios.get(url).then((resp) => {
        if (resp.data.gkstatus === 0) {
          let invoiceConf = resp.data.gkresult;
          if (invoiceConf) {
            commit('setInvoiceConfig', invoiceConf);
          } else {
            commit('setInvoiceConfig', state.default);
          }
        } else {
          commit('setInvoiceConfig', state.default);
        }
      });
    },
    updateInvoiceConfig({ commit }, payload) {
      commit('setInvoiceConfig', payload);
      const confPayload = {
        config: payload,
        path: [PAGES['create-invoice'], CONFIGS['page-layout']],
      };
      return axios
        .put(
          '/config?conftype=org&update=path&confcategory=transaction',
          confPayload
        )
        .then((resp) => {
          return resp.data;
        });
    },
  },
  namespaced: true,
};
