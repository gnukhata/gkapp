<template>
    <card-component ref="wrapperCard" :title="formMode+' '+formType+' Form'" :icon="titleIcon">
      <form @submit.prevent="submitForm">
        <div class="columns"> <!-- Required fields -->
          <div class="column"> <!-- Left pane -->
            <b-field label-for="org-name-inp" label="Name">
              <b-input
                id="org-name-inp"
                :placeholder="formType + ' Name'"
                minlength="3"
                :validation-message="formType + ' name must be 3 or more characters long'"
                v-model="form.name"
                required>
              </b-input>
            </b-field>
            <b-field label="State">
              <b-autocomplete
                placeholder="Enter State"
                :open-on-focus="true"
                v-model="stateSelected"
                :data="filteredDataArray">
              </b-autocomplete>
            </b-field>
            <b-field label="PIN Code">
                <b-input v-model="form.pin" min="100000" max="999999" type="number"></b-input>
            </b-field>
          </div>
          <div class="column"> <!-- Right pane -->
            <b-field label="Address">
                <b-input v-model="form.address" maxlength="150" type="textarea"></b-input>
            </b-field>
          </div>
        </div> <!-- Required fields end -->
        <hr class="my-3">
        <div class="field"> <!-- Show optional fields switch -->
            <b-switch v-model="showOptional" size="is-small" :outlined="false">Fill Optional Fields</b-switch>
        </div>
        <div v-if="showOptional" class="columns"> <!-- Optional fields -->
          <div class="column"> <!-- Left pane -->
            <b-field label="Email">
              <b-input :placeholder="formType + '@email.com'" type="email" v-model="form.email"></b-input>
            </b-field>
            <b-field label="Contact Number">
              <b-input
                placeholder="Phone Number"
                type="number"
                min="1000000000"
                max="9999999999"
                validation-message="Contact number must be 10 digits long"
                v-model="form.contact">
              </b-input>
            </b-field>
            <b-field label="Fax">
              <b-input placeholder="Fax Number" type="number" v-model="form.fax"></b-input>
            </b-field>
          </div>
          <div class="column"> <!-- Right pane -->
            <b-field label="PAN">
              <b-input
                placeholder="AAAAA1234A"
                type="text"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                validation-message="Enter a valid PAN number e.g. AAAAA1234A"
                v-model="form.pan">
              </b-input>
            </b-field>
            <div class="field">
              <label class="label">GSTIN</label>
              <div class="field-body">
                <div class="field is-grouped">
                  <b-field class="is-w-3">
                    <b-input
                      placeholder="00"
                      type="text"
                      :title="formType+' State Code'"
                      disabled
                      v-model="form.gstin.stateCode">
                    </b-input>
                  </b-field>
                  <b-field class="is-w-8">
                    <b-input
                      placeholder="PAN"
                      type="text"
                      disabled
                      v-model="form.pan">
                    </b-input>
                  </b-field>
                  <b-field class="is-w-4">
                    <b-input
                      placeholder="1Z1"
                      pattern="[0-9]{1}[A-Z]{1}[0-9]{1}"
                      validation-message="Enter a valid GSTIN extn. e.g. 1Z1"
                      type="text"
                      v-model="form.gstin.checkSum">
                    </b-input>
                  </b-field>
                </div>
              </div>
            </div>
          </div>
        </div> <!-- Optional fields end -->
        <hr v-if="isSupplier" class="my-3">
        <div v-if="isSupplier" class="field"> <!-- Show bank details checkbox -->
          <b-checkbox v-model="showBankDetails" size="is-small">Bank Details</b-checkbox>
        </div>
        <div v-if="isSupplier && showBankDetails" class="columns"> <!-- Optional fields - Bank Details -->
          <div class="column"> <!-- Left pane -->
            <b-field label="Bank Name">
              <b-input placeholder="Bank Name" type="text" v-model="form.bank.name" required></b-input>
            </b-field>
            <b-field label="Branch Name">
              <b-input placeholder="Branch Name" type="text" v-model="form.bank.branch" required></b-input>
            </b-field>
          </div>
          <div class="column"> <!-- Right pane -->
            <b-field label="Account No.">
              <b-input placeholder="Account No" type="text" v-model="form.bank.accNo" required></b-input>
            </b-field>
            <b-field label="IFSC Code">
              <b-input placeholder="IFSC" type="text" v-model="form.bank.ifsc" required></b-input>
            </b-field>
          </div>
        </div> <!-- Optional fields end -->
        <hr class="mt-3">
        <b-field grouped position="is-right">
          <div class="control">
            <b-button aria-label="Reset Form" icon-left="cached" type="is-warning" @click.prevent="resetForm">
              Reset
            </b-button>
            <b-button native-type="submit" class="ml-2" icon-left="content-save" type="is-success" :class="{'is-loading':isLoading}">
              Save
            </b-button>
          </div>
        </b-field>
      </form>
    </card-component>
</template>

<script>
import CardComponent from '@/components/CardComponent'
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  name: 'CustomerSupplierProfileForm',
  components: {
    CardComponent
  },
  props: {
    type: {
      type: String,
      validator: function (value) {
        // The value must match one of these strings
        return ['customer', 'supplier'].indexOf(value) !== -1
      },
      required: true
    },
    mode: {
      type: String,
      validator: function (value) {
        return ['create', 'edit'].indexOf(value) !== -1
      },
      required: true
    }
  },
  data () {
    return {
      blankURL: 'http://localhost:1111',
      isLoading: false,
      showOptional: false,
      showBankDetails: false,
      options: {
        states: [],
        stateCodes: []
      },
      form: {
        name: null,
        state: '',
        pin: null,
        address: null,
        email: null,
        contact: null,
        fax: null,
        pan: null,
        gstin: {
          stateCode: null,
          pan: null,
          checkSum: null
        },
        bank: {
          accNo: null,
          name: null,
          branch: null,
          ifsc: null
        }
      }
    }
  },
  computed: {
    isSupplier: (self) => (self.type === 'supplier'),
    formType: (self) => (self.type === 'customer') ? 'Customer' : 'Supplier',
    formMode: (self) => (self.mode === 'create') ? 'Create' : 'Edit',
    titleIcon: (self) => (self.type === 'customer') ? 'account-group' : 'warehouse',
    stateSelected: {
      get: function () {
        return this.form.state
      },
      set: function (newValue) {
        this.form.state = newValue
        this.form.gstin.stateCode = this.options.stateCodes[this.options.states.indexOf(newValue)]
      }
    },
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl', 'authToken']),
    filteredDataArray () {
      return this.options.states.filter((option) => {
        return option
          .toString()
          .toLowerCase()
          .indexOf(this.stateSelected.toLowerCase()) >= 0
      })
    }
  },
  methods: {
    submitForm () {
      // console.log('in submit')
      this.isLoading = true
      const payload = this.initPayload()
      const config = {
        headers: {
          // gktoken: this.authToken
          gktoken: this.authToken
        }
      }
      axios.post(`${this.gkCoreUrl}/customersupplier`, payload, config)
        .then((response) => {
          // console.log(response)
          this.isLoading = false
          switch (response.data.gkstatus) {
            case 0:
              this.$buefy.toast.open({
                message: this.formType + ' created successfully',
                type: 'is-success',
                queue: false
              })
              this.resetForm()
              this.$refs.wrapperCard.$el.scrollIntoView()
              break
            case 1:
              this.$buefy.toast.open({
                message: `${this.formType} entry already exists! (Please check Name, FAX or PAN)`,
                type: 'is-warning',
                queue: false
              })
              break
            case 2:
              this.$buefy.toast.open({
                message: 'Unauthorized access, Please contact admin',
                type: 'is-warning',
                queue: false
              })
              break
            default:
              this.$buefy.toast.open({
                message: `Unable to create ${this.formType}, Please try again`,
                type: 'is-danger',
                queue: false
              })
          } // end switch
        })
        .catch((error) => {
          this.$buefy.toast.open({
            message: `Error: ${error.message}`,
            type: 'is-warning',
            queue: false
          })
        })
        .then(() => {
          this.isLoading = false
        })
    },
    initPayload () {
      const pan = this.form.pan
      const checkSum = this.form.gstin.checkSum
      const stateCode = this.form.gstin.stateCode
      const bankDetails = Object.values(this.form.bank).filter((detail) => detail !== null)
      let gstin = null
      if (stateCode !== null && pan !== null && checkSum !== null) {
        gstin = {}
        gstin[stateCode + ''] = `${stateCode}${pan}${checkSum}`
      }
      const payload = {
        custname: this.form.name,
        custaddr: this.form.address,
        state: this.form.state,
        pincode: this.form.pin,
        csflag: (this.type === 'customer') ? 3 : 19,
        custtan: null, // have to check
        custphone: null,
        custemail: null,
        custfax: null,
        custpan: null
      }

      if (this.showOptional) {
        payload.custphone = this.form.contact
        payload.custemail = this.form.email
        payload.custfax = this.form.fax
        payload.custpan = this.form.pan
        payload.csflag = (this.type === 'customer') ? 3 : 19
        if (gstin !== null) { payload.gstin = gstin }
      }

      if (this.isSupplier && this.showBankDetails && (bankDetails.length === 4)) {
        payload.bankdetails = {
          accountno: this.form.bank.accNo,
          bankname: this.form.bank.name,
          ifsc: this.form.bank.ifsc,
          branchname: this.form.bank.branch
        }
      }
      console.log(payload)
      return payload
    },
    resetForm () {
      this.form = {
        name: null,
        state: '',
        pin: null,
        address: null,
        email: null,
        contact: null,
        fax: null,
        pan: null,
        gstin: {
          stateCode: null,
          pan: null,
          checkSum: null
        },
        bank: {
          accNo: null,
          name: null,
          branch: null,
          ifsc: null
        }
      }
    }
  },
  mounted () {
    const states = [{ 35: 'Andaman and Nicobar Islands' }, { 28: 'Andhra Pradesh' }, { 37: 'Andhra Pradesh (New)' }, { 12: 'Arunachal Pradesh' }, { 18: 'Assam' }, { 10: 'Bihar' }, { 4: 'Chandigarh' }, { 22: 'Chhattisgarh' }, { 26: 'Dadra and Nagar Haveli' }, { 25: 'Daman and Diu' }, { 7: 'Delhi' }, { 30: 'Goa' }, { 24: 'Gujarat' }, { 6: 'Haryana' }, { 2: 'Himachal Pradesh' }, { 1: 'Jammu and Kashmir' }, { 20: 'Jharkhand' }, { 29: 'Karnataka' }, { 32: 'Kerala' }, { 31: 'Lakshdweep' }, { 23: 'Madhya Pradesh' }, { 27: 'Maharashtra' }, { 14: 'Manipur' }, { 17: 'Meghalaya' }, { 15: 'Mizoram' }, { 13: 'Nagaland' }, { 21: 'Odisha' }, { 34: 'Pondicherry' }, { 3: 'Punjab' }, { 8: 'Rajasthan' }, { 11: 'Sikkim' }, { 33: 'Tamil Nadu' }, { 36: 'Telangana' }, { 16: 'Tripura' }, { 5: 'Uttarakhand' }, { 9: 'Uttar Pradesh' }, { 19: 'West Bengal' }]
    this.options.states = states.map((item) => Object.values(item)[0])
    this.options.stateCodes = states.map((item) => Object.keys(item)[0])
  }
}
</script>
