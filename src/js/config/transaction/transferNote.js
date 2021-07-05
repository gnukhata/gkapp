// default config for invoice page
export default {
  state: {
    default: {
      transferNote: {
        no: { format: { code: "TN" } },
        date: true,
        dispatchFrom: true,
        dispatchTo: true,
        issuer: true,
        role: true,
        receiptDate: true,
        gracePeriod: true,
        class: {},
      },
      bill: {
        index: false,
        product: {mobileMode: true},
        hsn: false,
        qty: { checkStock: true, mobileMode: true },
        fqty: false,
        rate: false,
        discount: false,
        taxable: false,
        igst: false,
        cess: false,
        vat: false,
        total: false,
        addBtn: true,
        attr: {
          responsive: false
        },
        footer: {
          headingColspan: 2,
        },
      },
      transport: {
        mode: true,
        vno: false,
        date: false,
        reverseCharge: false,
        receiptDate: true,
        gracePeriod: true,
        packageCount: true,
        class: {}
      },
    },
    custom: {}
  },
  getters: {
    getDefaultTransferNoteConfig: (state) => {
      return state.default
    },
    getCustomTransferNoteConfig: (state) => {
      return state.custom
    }
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so 
    // config must be validated before commit
    setTransferNoteConfig(state, payload) {
      state.custom = payload
    }
  },
  actions: {
    initTransferNoteConfig({ state, commit }, payload) {
      let conf
      try { // if the TransferNoteConfig isn't a valid JSON, catch the error and  use null to get the default config
        conf = JSON.parse(localStorage.getItem(`${payload.orgCode}-transferNoteConfig`))
      } catch (error) {
        conf = null
      }
      if (conf !== null) {
        commit("setTransferNoteConfig", conf)
      } else {
        commit("setTransferNoteConfig", state.default)
      }
    },
    updateTransferNoteConfig({ commit }, payload) {
      commit("setTransferNoteConfig", payload.data)
      localStorage.setItem(`${payload.orgCode}-transferNoteConfig`, JSON.stringify(payload.data))
    }
  },
  namespaced: true
}