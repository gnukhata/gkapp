// default config for invoice page
export default {
  state: {
    default: {
      type: true,
      psOrder: {
        no: { format: { code: { sale: 'SO', purchase: 'PO' } } },
        date: true,
        addr: true,
        pin: true,
        state: true,
        gstin: true,
        terms: true,
        creditPeriod: true,
        godown: true,
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
        index: false,
        product: { mobileMode: { disabled: true }, addBtn: true },
        hsn: false,
        qty: { mobileMode: { disabled: true }, checkStock: true },
        fqty: true,
        packageCount: { mobileMode: { disabled: true } },
        rate: true,
        discount: true,
        taxable: true,
        igst: true,
        cgst: true,
        sgst: true,
        cess: true,
        vat: true,
        total: { mobileMode: true },
        addBtn: true,
        editBtn: { mobileMode: true },
        footer: {
          discount: true,
          taxable: true,
          igst: true,
          cess: true,
          vat: true,
          total: true,
          headingColspan: 1,
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
        class: {}
      },
      transport: {
        mode: true,
        vno: true,
        date: true,
        reverseCharge: true,
        class: {}
      },
      comments: {
        class: {}
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
    custom: {}
  },
  getters: {
    getDefaultPSOrderConfig: (state) => {
      return state.default
    },
    getCustomPSOrderConfig: (state) => {
      return state.custom
    }
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so 
    // config must be validated before commit
    setPSOrderConfig(state, payload) {
      state.custom = payload
    }
  },
  actions: {
    initPSOrderConfig({ state, commit }, payload) {
      let conf
      try { // if the PSOrderConfig isn't a valid JSON, catch the error and  use null to get the default config
        conf = JSON.parse(localStorage.getItem(`${payload.orgCode}-psOrderConfig`))
      } catch (error) {
        conf = null
      }
      if (conf !== null) {
        commit("setPSOrderConfig", conf)
      } else {
        commit("setPSOrderConfig", state.default)
      }
    },
    updatePSOrderConfig({ commit }, payload) {
      commit("setPSOrderConfig", payload.data)
      localStorage.setItem(`${payload.orgCode}-psOrderConfig`, JSON.stringify(payload.data))
    }
  },
  namespaced: true
}