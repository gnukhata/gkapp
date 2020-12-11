<!-- Todo
     Map the input fields with the Vuex state
 -->
<!-- Page 1/3 0f Organisation Creation Wizard -->
<template>
    <div>
      <div class="columns">
          <div class="column">
              <b-field label="Organisation Name">
                  <b-input icon="office-building" v-model="orgname" v-bind:custom-class="orgCaseClass" placeholder="ABC Organisation" required></b-input>
              </b-field>
              <b-field label="Case">
                  <b-select v-model="orgcase">
                      <option
                          v-for="(option, index) in options.orgCase"
                          :value="index"
                          :key="index">
                          {{ option }}
                      </option>
                  </b-select>
              </b-field>
              <b-field label="Company Type">
                  <b-radio type="is-info"
                      v-model="orgtype"
                      v-for="(option, index) in options.orgType"
                      :native-value="index"
                      :key="index">
                      {{option}}
                  </b-radio>
              </b-field>
              <div class="field">
                  <label class="label">Financial Year</label>
                  <div class="columns mt-2">
                    <b-datepicker
                            v-model="yearstart"
                            placeholder="start date"
                            icon="calendar-today"
                            editable
                            required>
                    </b-datepicker>
                    <label class="label ml-2 mr-2 my-2">to</label>
                    <b-datepicker
                            v-model="yearend"
                            placeholder="end date"
                            icon="calendar-today"
                            editable
                            required>
                    </b-datepicker>
                  </div>
              </div>
          </div>
          <div class="column">
              <div class="field">
                  <label class="label">How would you like to use GNUKhata?</label>
                  <b-radio v-model="accountingMode" :native-value="0" type="is-info">Accounting only</b-radio><br>
                  <b-radio v-model="accountingMode" :native-value="1" type="is-info">Invoice with billing</b-radio><br>
                  <b-radio v-model="accountingMode" :native-value="2" type="is-info">Iventory with Invoicing and Billing Accounting</b-radio>
              </div>
              <div class="field">
                <b-checkbox v-model="modeflag">Use Simple Mode for Receipt and Payment Vouchers.</b-checkbox>
              </div>
              <div class="field" v-if="isBillFlagEnabled">
                <b-checkbox v-model="avflag">Generate Accounting Entries for Documents.</b-checkbox>
                <div class="field ml-5">
                  <b-radio type="is-info" v-model="maflag" :native-value="0" :disabled="!isEntriesFlagEnabled">
                        Single Sales/Purchase Ledger Account.
                  </b-radio>
                  <b-radio type="is-info" v-model="maflag" :native-value="1" :disabled="!isEntriesFlagEnabled">
                        Single Sales/Purchase Ledger Account.
                  </b-radio>
                </div>
              </div>
              <div class="field">
                <b-checkbox v-model="avnoflag">Use System Generated Voucher Numbering.</b-checkbox>
              </div>
              <div class="field">
                <b-checkbox v-model="ainvnoflag">Use System Generated Invoice Numbering.</b-checkbox>
              </div>
          </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'CreateOrganisationForm',
  components: {
  },
  data () {
    return {
      isLoading: false,
      options: {
        orgCase: ['As-is', 'Upper Case', 'Lower Case', 'Title Case'],
        caseClasses: ['', 'is-uppercase', 'is-lowercase', 'is-capitalized'],
        orgType: ['Profit making', 'Not For Profit']
      },

      accountingMode: 0,
      billflag: 1,
      invflag: 0,
      invsflag: 1,

      orgname: '',
      orgcase: 0,
      orgtype: 0,
      yearstart: new Date(),
      yearend: new Date(),
      modeflag: true,
      avflag: true, // generate accounting entries
      maflag: true, // ledger type, per sale/purchase (single) or per product sale/purchase (multiple)
      avnoflag: false,
      ainvnoflag: false
    }
  },
  computed: {
    orgCaseClass () {
      return this.options.caseClasses[this.orgCase]
    },
    isBillFlagEnabled () {
      return (this.accountingMode !== 0)
    },
    isEntriesFlagEnabled () {
      return this.avflag
    }
  },
  methods: {
    updateFlags () {
      // GNUKhata accounting feature mode flags
      switch (parseInt(this.accountingMode)) {
        case 0:
          this.invflag = 0
          this.invsflag = 0
          this.billflag = 0
          break
        case 1:
          this.invflag = 0
          this.invsflag = 1
          this.billflag = 1
          break
        case 2:
          this.invflag = 1
          this.invsflag = 1
          this.billflag = 1
          break
      }

      this.modeflag = (this.modeflag) ? 1 : 0
      this.avflag = (this.avflag) ? 1 : 0
      this.avnoflag = (this.avnoflag) ? 1 : 0
      this.ainvnoflag = (this.ainvnoflag) ? 1 : 0
    },
    commitStates () {
      // console.log('states are being committed')
      this.updateFlags()
      const payload = {
        orgname: this.orgname,
        orgtype: this.options.orgType[this.orgtype],
        yearstart: window.gkutils.dateToString(this.yearstart),
        yearend: window.gkutils.dateToString(this.yearend),
        billflag: this.billflag,
        invflag: this.invflag,
        invsflag: this.invsflag,
        modeflag: this.modeflag,
        avflag: this.avflag,
        maflag: this.maflag,
        avnoflag: this.avnoflag,
        ainvnoflag: this.ainvnoflag
      }
      // console.log(payload)
      this.$store.commit('orgWiz/setPage1States', payload)
    },
    initFlags (payload) {
      // init payload with default values when its null
      payload.modeflag = (payload.modeflag === null) ? 1 : payload.modeflag
      payload.avflag = (payload.avflag === null) ? 1 : payload.avflag
      payload.avnoflag = (payload.avnoflag === null) ? 0 : payload.avnoflag
      payload.ainvnoflag = (payload.ainvnoflag === null) ? 0 : payload.ainvnoflag
      payload.invsflag = (payload.invsflag === null) ? 1 : payload.invsflag
      payload.invflag = (payload.invflag === null) ? 0 : payload.invflag
      payload.maflag = (payload.maflag === null) ? 1 : payload.maflag

      if (payload.invsflag) {
        if (payload.invflag) {
          this.accountingMode = 2
        } else {
          this.accountingMode = 1
        }
      } else {
        this.accountingMode = 0
      }

      this.maflag = payload.maflag
      this.modeflag = !!(payload.modeflag)
      this.avflag = !!(payload.avflag)
      this.avnoflag = !!(payload.avnoflag)
      this.ainvnoflag = !!(payload.ainvnoflag)
    },
    initState (payload) {
      if (payload) {
        // console.log(payload)
        this.orgname = payload.orgname || ''
        this.orgtype = (payload.orgtype) ? (payload.orgtype.includes('Not') ? 1 : 0) : 0
        this.yearstart = (payload.yearstart) ? window.gkutils.stringToDate(payload.yearstart) : new Date()
        this.yearend = (payload.yearend) ? window.gkutils.stringToDate(payload.yearend) : new Date()
        this.billflag = payload.billflag
        this.invflag = payload.invflag
        this.invsflag = payload.invsflag
        this.modeflag = payload.modeflag
        this.avflag = payload.avflag
        this.maflag = payload.maflag
        this.avnoflag = payload.avnoflag
        this.ainvnoflag = payload.ainvnoflag

        this.initFlags(payload)
      }
    }
  },
  created () {
    const states = this.$store.getters['orgWiz/getPage1States']
    this.initState(states)
    // this.$parent.$on('next-page', this.commitStates)
    // console.log(this.$parent)
  },
  beforeDestroy () {
    this.commitStates()
  }
}
</script>
