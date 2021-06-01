// default config for invoice page
export default {
  state: {
    default: {
      inv: {
        type: false,
        no: { disabled: true },
        date: { disabled: true, validate: false },
        delNote: false,
        ebn: false,
        addr: true,
        gstin: true,
        pin: false,
        state: {disabled: true},
        issuer: true,
        role: true,
        class: {},
      },
      dcNote: {
        type: true,
        invNo: true,
        no: true,
        date: true,
        gstin: true,
        referenceFlag: true,
        badQuality: true,
        purpose: true,
        class: {}
      },
      party: {
        type: false,
        options: {
          states: true,
          gstin: true,
        },
        custid: true,
        name: { disabled: true },
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
        product: { disabled: true, addBtn: false },
        hsn: true,
        qty: { disabled: true },
        fqty: { disabled: true },
        rate: { disabled: true },
        discount: { disabled: true },
        taxable: true,
        igst: true,
        cess: true,
        vat: true,
        total: true,
        addBtn: false,
        dcValue: true,
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
    getDefaultDCNoteConfig: (state) => {
      return state.default
    },
    getCustomDCNoteConfig: (state) => {
      return state.custom
    }
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so 
    // config must be validated before commit
    setDCNoteConfig(state, payload) {
      state.custom = payload
    }
  },
  actions: {
    initDCNoteConfig({ state, commit }, payload) {
      let conf 
      try { // if the DCNoteConfig isn't a valid JSON, catch the error and  use null to get the default config
        conf = JSON.parse(localStorage.getItem(`${payload.orgCode}-dcNoteConfig`))
      } catch(error) {
        conf = null
      }
      if (conf !== null) {
        commit("setDCNoteConfig", conf)
      } else {
        commit("setDCNoteConfig", state.default)
      }
    },
    updateDCNoteConfig({ commit }, payload) {
      commit("setDCNoteConfig", payload.data)
      localStorage.setItem(`${payload.orgCode}-dcNoteConfig`, JSON.stringify(payload.data))
    }
  },
  namespaced: true
}