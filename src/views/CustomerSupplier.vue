<template>
  <div class="d-inline-block mt-4 mx-2" style="min-width: 300px">
    <div class="card">
      <div class="card-header text-left">
        <h1>{{formType}} Profile</h1>
      </div>
      <div class="card-body">
        <b-form class="text-left" @submit.prevent="onSubmit">
          <b-row>
            <b-col :md="columnOneWidth">
              <b-form-group
                label="Name"
                label-for="input-1"
                label-cols="3">
                <b-form-input id="input-1" placeholder="Customer Name" v-model="form.name" trim required></b-form-input>
              </b-form-group>
              <b-form-group
                invalid-feedback="Pincode must be 6 digits long"
                label="Pin Code"
                label-for="input-3"
                label-cols="3">
                <b-form-input id="input-3"
                  v-model="form.pin"
                  type="number"
                  :state="validatePin"
                  debounce="500"
                  required>
                </b-form-input>
              </b-form-group>
              <b-form-group
                label="State"
                label-for="input-2"
                label-cols="3">
                <b-form-select id="input-2" v-model="state" :options="options.states" required></b-form-select>
              </b-form-group>
              <b-form-group
                label="Address"
                label-for="input-4"
                label-cols="3">
                <b-form-textarea
                  id="input-4"
                  v-model="form.address"
                  placeholder="Address"
                  rows="3"
                  max-rows="6"
                  required>
                </b-form-textarea>
              </b-form-group>
            </b-col>
            <b-col>
              <b-row>
                <b-col :md="columnTwoWidth">
                  <b-form-checkbox v-model="showOptional" class="mb-3" switch>
                    Optional Fields
                  </b-form-checkbox>
                  <b-collapse v-model="showOptional">
                    <b-form-group
                      label="Email"
                      label-for="input-5"
                      label-cols="3">
                      <b-form-input id="input-5" placeholder="customer@email.com" v-model="form.email" type="email" trim></b-form-input>
                    </b-form-group>
                    <b-form-group
                      label="Phone"
                      label-for="input-6"
                      label-cols="3">
                      <b-form-input id="input-6" placeholder="Phone number" type="number" v-model="form.contact" trim></b-form-input>
                    </b-form-group>
                    <b-form-group
                      label="Fax"
                      label-for="input-7"
                      label-cols="3">
                      <b-form-input id="input-7" v-model="form.fax" trim></b-form-input>
                    </b-form-group>
                    <b-form-group
                      label="PAN"
                      label-for="input-8"
                      :state="validatePan"
                      invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
                      label-cols="3">
                      <b-form-input
                        id="input-8"
                        :state="validatePan"
                        placeholder="AAAAA1234A"
                        v-model="form.pan"
                        trim
                        pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                        title="Format: A B C D E 1 2 3 4 A"
                        debounce="500">
                      </b-form-input>
                    </b-form-group>
                    <b-form-group
                      label="GSTIN"
                      label-cols="3"
                      inline>
                        <b-row style="max-width:300px;">
                          <b-col class="pr-1" cols="4" sm="3">
                            <b-form-input class="px-1" readonly placeholder="00" id="input-9" aria-label="State Code" v-model="form.gstin.stateCode" trim></b-form-input>
                          </b-col>
                          <b-col class="px-1 pb-2" cols="6" sm="6">  
                            <b-form-input class="px-1" readonly placeholder="PAN" id="input-10" aria-label="PAN" v-model="form.pan" trim></b-form-input>
                          </b-col>
                          <b-col class="px-1" cols="6" sm="3">  
                            <b-form-input
                              class="px-1"
                              :state="validateCheckSum"
                              placeholder="1Z1"
                              id="input-11"
                              aria-label="Check Sum"
                              v-model="form.gstin.checkSum"
                              trim
                              title="Format: 1Z1, Number Capital Alphabet Number"
                              pattern="[0-9]{1}[A-Z]{1}[0-9]{1}"
                              debounce="500">
                            </b-form-input>
                          </b-col>
                        </b-row>
                    </b-form-group>
                  </b-collapse>
                </b-col>
                <b-col v-if="isSupplier">
                  <b-form-checkbox v-model="showBankDetails" class="mb-3" switch>
                    Bank Details
                  </b-form-checkbox>
                  <b-collapse v-model="showBankDetails">
                    <b-form-group
                      label="Name"
                      label-for="input-12"
                      label-cols="3">
                      <b-form-input id="input-12" placeholder="Bank Name" v-model="form.bank.name" trim :required="showBankDetails"></b-form-input>
                    </b-form-group>
                    <b-form-group
                      label="Branch"
                      label-for="input-13"
                      label-cols="3">
                      <b-form-input id="input-13" placeholder="Branch Name" v-model="form.bank.branch" trim :required="showBankDetails"></b-form-input>
                    </b-form-group>
                    <b-form-group
                      label="Account No."
                      label-for="input-14"
                      label-cols="3">
                      <b-form-input id="input-14" v-model="form.bank.accNo" trim :required="showBankDetails"></b-form-input>
                    </b-form-group>
                    <b-form-group
                      label="IFSC Code"
                      label-for="input-15"
                      label-cols="3">
                      <b-form-input id="input-15" v-model="form.bank.ifsc" trim :required="showBankDetails"></b-form-input>
                    </b-form-group>
                  </b-collapse>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
          <hr>
          <div class="float-right">
            <b-button class="m-1" variant="danger" :to="{ name: 'Workflow' }">
              <b-icon aria-hidden="true" class="align-middle" icon="arrow-left"></b-icon>
              <span class="align-middle"> Back</span>
            </b-button>
            <b-button class="m-1" variant="warning" @click.prevent="resetForm">
              <b-icon aria-hidden="true" class="align-middle" icon="arrow-repeat"></b-icon>
              <span class="align-middle"> Reset</span>
            </b-button>
            <b-button type="submit" class="m-1" variant="success">
              <b-spinner v-if="isLoading" small></b-spinner>
              <b-icon aria-hidden="true" class="align-middle" icon="plus-square"></b-icon>
              <span class="align-middle"> Save</span>
            </b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  name: 'CustomerSupplier',
  components: {
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
      },
      regex: {
        checkSum: new RegExp('[0-9]{1}[A-Z]{1}[0-9]{1}'),
        pan: new RegExp('[A-Z]{5}[0-9]{4}[A-Z]{1}')
      },
      form: {
        name: null,
        state: null,
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
          name: null,
          branch: null,
          accNo: null,
          ifsc: null
        }
      }
    }
  },
  computed: {
    columnOneWidth: (self) => {
      let width = 8
      if (self.showOptional && self.showBankDetails) {
        width = 4
      } else if(self.showOptional || self.showBankDetails) {
        width = 6
      }
      return width
    },
    columnTwoWidth: (self) => (self.showOptional && self.showBankDetails) ? 6 : 12 ,
    state: {
      set: function (newValue) {
        this.form.state = newValue.name
        this.form.gstin.stateCode = newValue.code
      },
      get: function () {
        return {
          code: this.form.gstin.stateCode,
          name: this.form.state
        }
      }
    },
    isSupplier: (self) => (self.type === 'supplier'),
    formType: (self) => (self.type === 'customer') ? 'Customer' : 'Supplier',
    formMode: (self) => (self.mode === 'create') ? 'Create' : 'Edit',
    validatePin: (self) => (self.form.pin) ? (self.form.pin > 100000 && self.form.pin < 999999) : null,
    validateCheckSum: (self) => (self.form.gstin.checkSum) ? self.regex.checkSum.test(self.form.gstin.checkSum) : null,
    validatePan: (self) => (self.form.pan) ? self.regex.pan.test(self.form.pan) : null,
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl', 'authToken'])
  },
  methods: {
    onSubmit () {
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
              this.$bvToast.toast(`${this.formType} created successfully`, {
                title: 'Create Customer Success!',
                autoHideDelay: 3000,
                variant: 'success',
                appendToast: true,
                solid: true
              })
              this.resetForm()
              break
            case 1:
              this.$bvToast.toast(`${this.formType} entry already exists! (Please check Name, FAX or PAN)`, {
                title: 'Create Customer Error!',
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true
              })
              break
            case 2:
              this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
                title: 'Create Customer Error!',
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true
              })
              break
            default:
              this.$bvToast.toast(`Unable to create ${this.formType}, Please try again`, {
                title: 'Create Customer Error!',
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true
              })
          } // end switch
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: 'Create Customer Error!',
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true
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
    this.options.states = states.map((item) => {
      const name = Object.values(item)[0],
      code = Object.keys(item)[0]
      return {
        text: name,
        value: {
          name: name,
          code: code
        }
      }
    })
  }
}
</script>
