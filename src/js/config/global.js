export default {
  state: {
    format: {
      date: 'dd-mm-yyyy',
      transaction: {
        no: {
          prefix: false,
          separator: '/',
          suffix: {
            pattern: [
              {
                type: 'string',
              },
              {
                type: 'date',
                format: 'yy',
              },
            ],
            separator: '-',
          },
        },
      },
    },
    default: {
      transaction: {
        paymentMode: 'bank', // bank, cash, credit
        taxMode: 'GST', // GST, VAT
      },
    },
    constant: {
      gstRates: [0, 0.1, 0.25, 1, 1.5, 3, 5, 7.5, 12, 18, 28],
    },
  },
  getters: {
    getDateFormat: (state) => {
      return state.format.date;
    },
    getTrnNoFormat: (state) => {
      return state.format.transaction.no;
    },
    getDefaultPaymentMode(state) {
      return state.default.transaction.paymentMode;
    },
    getDefaultTaxMode(state) {
      return state.default.transaction.taxMode;
    },
    getGstRates(state) {
      return state.constant.gstRates;
    },
  },
  mutations: {},
  actions: {},
  namespaced: true,
};
