export default {
  namespaced: true,
  state: {
    // page 1
    orgname: null,
    orgtype: null,
    yearstart: null,
    yearend: null,
    billflag: null,
    invflag: null,
    invsflag: null,
    modeflag: null,
    avflag: null,
    maflag: null,
    avnoflag: null,
    ainvnoflag: null,

    // page 2
    logo: null,
    orgaddr: null,
    orgcity: null,
    orgstate: null,
    orgcountry: null,
    orgpincode: null,
    orgtelno: null,
    orgwebsite: null,
    orgemail: null,
    orgfax: null,
    orgpan: null,
    orgmvat: null,
    orgstax: null,
    gstin: null,
    bankdetails: {
      accountno: null,
      bankname: null,
      branchname: null,
      ifsc: null
    },
    // for non-profit
    orgregno: null,
    orgregdate: null,
    orgfcrano: null,
    orgfcradate: null,

    // page 3
    username: null,
    password: null,
    securityquestion: null,
    securityanswer: null
  },
  getters: {
    getPage1States (state, getters, rootState) {
      return {
        orgname: state.orgname,
        orgtype: state.orgtype,
        yearstart: state.yearstart,
        yearend: state.yearend,
        billflag: state.billflag,
        invflag: state.invflag,
        invsflag: state.invsflag,
        modeflag: state.modeflag,
        avflag: state.avflag,
        maflag: state.maflag,
        avnoflag: state.avnoflag,
        ainvnoflag: state.ainvnoflag
      }
    }
  },
  mutations: {
    setPage1States (state, payload) {
      // console.log('Setting page 1 states')
      state.orgname = payload.orgname
      state.orgtype = payload.orgtype
      state.yearstart = payload.yearstart
      state.yearend = payload.yearend
      state.billflag = payload.billflag
      state.invflag = payload.invflag
      state.invsflag = payload.invsflag
      state.modeflag = payload.modeflag
      state.avflag = payload.avflag
      state.maflag = payload.maflag
      state.avnoflag = payload.avnoflag
      state.ainvnoflag = payload.ainvnoflag
      // console.log(state.orgname)
    }
  },
  actions: {

  }
}
