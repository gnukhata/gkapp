// default config for invoice page
export default {
  state: {
    default: {
      inv: {
        no: { disabled: true },
        date: { disabled: true, validate: false },
        delNote: false,
        ebn: false,
        addr: true,
        pin: false,
        state: { disabled: true },
        issuer: false,
        role: false,
        gstin: true,
        class: {},
      },
      party: {
        type: false,
        options: {
          states: true,
          gstin: true,
        },
        custid: true,
        name: {
          disabled: true
        },
        addr: true,
        state: true,
        gstin: true,
        tin: true,
        pin: false,
        class: {},
      },
      rnote: {
        class: {},
      },
      taxType: true,
      bill: {
        index: false,
        product: { disabled: true, mobileMode: true },
        hsn: true,
        qty: { disabled: true, mobileMode: true },
        rejectedQty: { mobileMode: { disabled: true } },
        fqty: { disabled: true },
        rate: { disabled: true },
        discount: { disabled: true },
        taxable: true,
        igst: true,
        cess: true,
        vat: true,
        total: { mobileMode: true },
        footer: {
          discount: true,
          taxable: true,
          igst: true,
          cess: true,
          vat: true,
          total: true,
          headingColspan: 1,
        },
        addBtn: false,
        rowSelected: true,
        editBtn: { mobileMode: true },
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
        discount: false,
        vat: true,
        igst: true,
        cess: true,
        roundOff: false,
        value: true,
        valueText: false,
      },
    },
    custom: {}
  },
  getters: {
    getDefaultRejectionNoteConfig: (state) => {
      return state.default
    },
    getCustomRejectionNoteConfig: (state) => {
      return state.custom
    }
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so 
    // config must be validated before commit
    setRejectionNoteConfig(state, payload) {
      state.custom = payload
    }
  },
  actions: {
    initRejectionNoteConfig({ state, commit }, payload) {
      let conf
      try { // if the RejectionNoteConfig isn't a valid JSON, catch the error and  use null to get the default config
        conf = JSON.parse(localStorage.getItem(`${payload.orgCode}-RejectionNoteConfig`))
      } catch (error) {
        conf = null
      }
      if (conf !== null) {
        commit("setRejectionNoteConfig", conf)
      } else {
        commit("setRejectionNoteConfig", state.default)
      }
    },
    updateRejectionNoteConfig({ commit }, payload) {
      commit("setRejectionNoteConfig", payload.data)
      localStorage.setItem(`${payload.orgCode}-RejectionNoteConfig`, JSON.stringify(payload.data))
    }
  },
  namespaced: true
}