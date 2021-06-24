export default {
  state: {
    format: {
      date: 'dd-mm-yyyy',
      transaction: {
        no: {
          prefix: false,
          separator: "/",
          suffix: {
            pattern: [
              {
                type: 'string',
              },
              {
                type: 'date',
                format: 'yy'
              }
            ],
            separator: '-',
          },
        }
      }
    }
  },
  getters: {
    getDateFormat: (state) => {
      return state.format.date;
    },
    getTrnNoFormat: (state) => {
      return state.format.transaction.no;
    },
  },
  mutations: {

  },
  actions: {

  },
  namespaced: true
}