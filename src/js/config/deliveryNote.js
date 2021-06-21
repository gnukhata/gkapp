// default config for invoice page
export default {
  state: {
    default: {
      delNote: {
        no: true,
        date: true,
        type: true,
        state: true,
        dispatch: true,
        gstin: true,
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
          headingColspan: 1,
        },
      },
      transport: {
        packageCount: true,
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
    getDefaultDelNoteConfig: (state) => {
      return state.default
    },
    getCustomDelNoteConfig: (state) => {
      return state.custom
    }
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so 
    // config must be validated before commit
    setDelNoteConfig(state, payload) {
      state.custom = payload
    }
  },
  actions: {
    initDelNoteConfig({ state, commit }, payload) {
      let conf
      try { // if the DelNoteConfig isn't a valid JSON, catch the error and  use null to get the default config
        conf = JSON.parse(localStorage.getItem(`${payload.orgCode}-delNoteConfig`))
      } catch (error) {
        conf = null
      }
      if (conf !== null) {
        commit("setDelNoteConfig", conf)
      } else {
        commit("setDelNoteConfig", state.default)
      }
    },
    updateDelNoteConfig({ commit }, payload) {
      commit("setDelNoteConfig", payload.data)
      localStorage.setItem(`${payload.orgCode}-delNoteConfig`, JSON.stringify(payload.data))
    }
  },
  namespaced: true
}