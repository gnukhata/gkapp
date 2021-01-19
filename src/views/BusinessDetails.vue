<template>
   <div class="d-flex justify-content-center">
    <div class="d-inline-block mt-4 mx-2" style="min-width: 300px">
      <div class="card">
        <div class="card-header text-left">
          <h1>Business Item Details</h1>
        </div>
        <div class="card-body">
          <b-form class="text-left" @submit.prevent="onSubmit">
            <b-row>
              <b-col class="mb-3">
                <b-form-group
                  class="pl-3"
                  label-cols="3"
                  label-class="required"
                  aria-describedby="Sort by Ascending or Descending"
                  label="Type">
                  <b-form-radio-group
                    button-variant="outline-primary"
                    v-model="type"
                    buttons
                    name="filter-form-sort">
                    <b-form-radio value="product">Product</b-form-radio>
                    <b-form-radio value="service">Service</b-form-radio>
                  </b-form-radio-group>
                </b-form-group>
                <b-form-group
                  class="pl-3"
                  label="Name"
                  label-for="input-1"
                  label-cols="3"
                  label-class="required">
                  <b-form-input id="input-1" placeholder="" v-model="form.name" trim required></b-form-input>
                </b-form-group>
                <b-card header-bg-variant="primary" header-text-variant="white" border-variant="primary" header="Stock" class="mb-3" v-if="!isService">
                  <b-form-group
                    label="Unit of Measure"
                    label-for="input-2"
                    label-cols="3"
                    label-class="required">
                    <b-form-select id="input-2" v-model="uom" :options="options.uom" required></b-form-select>
                  </b-form-group>
                  <b-form-group
                    label="Opening Stock"
                    label-for="input-3"
                    label-cols="3">
                    <b-input-group
                      :append="form.uomCode">
                      <b-form-input id="input-3" placeholder="" v-model="form.stock" type="number" step="0.01"></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-card>
                <b-card header-bg-variant="primary" header-text-variant="white" border-variant="primary" header="Price">
                  <b-form-group
                    label="MRP"
                    label-for="input-4"
                    label-cols="3">
                    <b-input-group append="₹">
                      <b-form-input id="input-4" placeholder="" v-model="form.mrp" type="number" step="0.01"></b-form-input>
                    </b-input-group>
                  </b-form-group>
                  <b-form-group
                    label="Sale Price"
                    label-for="input-5"
                    label-cols="3">
                    <b-input-group append="₹">
                      <b-form-input id="input-5" placeholder="" v-model="form.salePrice" type="number" step="0.01"></b-form-input>
                    </b-input-group>
                  </b-form-group>
                  <b-form-group
                    label="Discount"
                    label-for="input-6"
                    label-cols="3">
                    <b-row>
                      <b-col class="pr-1">
                        <b-input-group append="₹">
                          <b-form-input id="input-6" placeholder="" v-model="form.discountAmount" type="number" step="0.01"></b-form-input>
                        </b-input-group>
                      </b-col>
                      <b-col class="pl-1">
                        <b-input-group append="%">
                          <b-form-input id="input-1" placeholder="" v-model="form.discountPercent" type="number" step="0.01"></b-form-input>
                        </b-input-group>
                      </b-col>
                    </b-row>
                  </b-form-group>
                </b-card>
              </b-col>
              <b-col cols="12" md="6" class="mb-3">
                <b-card header-bg-variant="primary" header-text-variant="white" border-variant="primary" header="Tax">
                  <b-row>
                    <b-col cols="12" xl="5">
                      <b-form-group
                        :label="(isService) ? 'SAC Code' : 'HSN Code'"
                        label-for="input-10"
                        label-cols="3"
                        :label-class="(isHsnRequired) ? 'required' : ''">
                        <b-form-input id="input-10" placeholder="" v-model="form.hsn" trim :required="isHsnRequired"></b-form-input>
                      </b-form-group>
                      <b-form-group
                        label="GST"
                        label-for="input-7"
                        label-cols="3">
                        <b-input-group append="%">
                          <b-form-select id="input-7" v-model="form.tax.gst" :options="options.gstRates"></b-form-select>
                        </b-input-group>
                      </b-form-group>
                      <b-form-group
                        label="CESS"
                        label-for="input-8"
                        label-cols="3">
                        <b-input-group append="%">
                          <b-form-input id="input-8" placeholder="" v-model="form.tax.cess" type="number" step="0.01"></b-form-input>
                        </b-input-group>
                      </b-form-group>
                      <b-form-group
                        label="CVAT"
                        label-for="input-9"
                        label-cols="3">
                        <b-input-group append="%">
                          <b-form-input id="input-9" placeholder="" v-model="form.tax.cvat" type="number" step="0.01"></b-form-input>
                        </b-input-group>
                      </b-form-group>
                    </b-col>
                    <b-col>
                      <b-card header="VAT" no-body>
                        <b-card-body class="p-3" style="min-height:100px; max-height:150px; overflow-y: auto">
                          <b-input-group v-for="(vat, index) in form.tax.vat" :key="index" class="mb-2" :id="'vat-inp-'+index">
                            <b-input-group-prepend>
                              <b-form-select style="max-width:150px" v-model="vat.state" :options="options.states" :required="!!(vat.rate)"></b-form-select>
                            </b-input-group-prepend>
                            <b-form-input v-model="vat.rate" type="number" step="0.01"></b-form-input>
                            <b-input-group-append>
                              <b-button @click.prevent="addVat" v-if="(index === (vatLength-1))">
                                +
                              </b-button>
                              <b-button @click.prevent="deleteVat" v-else>
                                -
                              </b-button>
                            </b-input-group-append>
                          </b-input-group>
                        </b-card-body>
                      </b-card>
                    </b-col>
                  </b-row>
                </b-card>
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
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  name: 'BusinessDetails',
  components: {
  },
  props: {
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
      type: 'product', // product, service
      blankURL: 'http://localhost:1111',
      isLoading: false,
      showOptional: false,
      uomCode: "UOM",
      options: {
        states: [],
        stateCodes: [],
        uom: [],
        uomIds: [],
        gstRates: [0, 5, 12, 18, 28]
      },
      uomTyped: '',
      uomSelected: '',
      form: {
        name: null,
        uom: null,
        stock: null,
        mrp: null,
        salePrice: null,
        discountAmount: null,
        discountPercent: null,
        tax: {
          cess: null,
          gst: null,
          cvat: null,
          vat: [{ state: null, rate: null }]
        },
        hsn: null
      }
    }
  },
  computed: {
    isHsnRequired: (self) => (self.form.tax.gst > 0 || self.form.tax.cess > 0),
    // uomCode: (self) => (self.uomSelected !== null) ? self.uomSelected.split(' ')[0] : null,
    isService: (self) => (self.type === 'service'),
    formType: (self) => (self.type === 'product') ? 'Product' : 'Service',
    formMode: (self) => (self.mode === 'create') ? 'Create' : 'Edit',
    titleIcon: (self) => (self.type === 'product') ? 'cart-variant' : 'face-agent',
    vatLength: (self) => self.form.tax.vat.length,
    uom: {
      set: function (newValue) {
        if(newValue) {
          this.form.uom = newValue.id
          this.form.uomCode = newValue.name
        }
      },
      get: function () {
        return {
          name: this.form.uomCode,
          id: this.form.uom
        }
      }
    },
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl', 'authToken'])
  },
  methods: {
    addVat () {
      this.form.tax.vat.push({ state: null, rate: null })
      setTimeout(() => {
        document.getElementById(`vat-inp-${this.vatLength - 1}`).scrollIntoView()
      }, 200)
    },
    deleteVat (index) {
      this.form.tax.vat.splice(index, 1)
    },
    getUOM () {
      const config = {
        headers: {
          // gktoken: this.authToken
          gktoken: this.authToken
        }
      }
      axios.get(`${this.gkCoreUrl}/unitofmeasurement?qty=all`, config)
        .then((response) => {
          switch (response.data.gkstatus) {
            case 0:
              this.options.uom = response.data.gkresult.map((uom) => {
                return { text: `${uom.unitname} (${uom.description})`, value: { id: uom.uomid, name: uom.unitname } }
              })
              this.uom = this.options.uom.filter((uom) => (uom.value.name === 'UNT'))[0].value
              // console.log(response.data.gkresult)
              break
            default:
              this.$bvToast.toast(`Please try after sometime`, {
                title: `Error: Fetching Unit of Measurement`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true
              })
          }
        })
        .catch(() => {
          
        })
    },
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

      axios.post(`${this.gkCoreUrl}/products`, payload.product, config)
        .then((response) => {
          // console.log(response)
          this.isLoading = false
          let productCode, taxPayload, taxRequests
          switch (response.data.gkstatus) {
            case 0:
              this.$bvToast.toast(`${this.formType} created successfully`, {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: 'success',
                appendToast: true,
                solid: true
              })
              this.resetForm()

              // store the tax when the product has been created successfully
              productCode = response.data.gkresult
              taxPayload = {}
              taxRequests = payload.tax.map((item) => {
                taxPayload = { taxname: item.taxname, taxrate: item.taxrate, productcode: productCode }
                return axios.post(`${this.gkCoreUrl}/tax`, taxPayload, config)
              })
              Promise.all(taxRequests).then((responses) => {
                // console.log(responses)
              })
              break
            case 1:
              this.$bvToast.toast(`${this.formType} entry already exists! (Please check Name, FAX or PAN)`, {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true
              })
              break
            case 2:
              this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true
              })
              break
            default:
              this.$bvToast.toast(`Unable to create ${this.formType}, Please try again`, {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: 'danger',
                appendToast: true,
                solid: true
              })
          } // end switch
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `${this.formMode} ${this.formType} Error!`,
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
      const product = {
        productdetails: {
          gsflag: (this.isService) ? 19 : 7,
          productdesc: this.form.name,
          prodmrp: parseFloat(this.form.mrp) || 0,
          prodsp: parseFloat(this.form.salePrice) || 0,
          discountAmount: parseFloat(this.form.discountAmount) || 0,
          discountPercent: parseFloat(this.form.discountPercent) || 0,
          gscode: this.form.hsn,
          specs: {}
        },
        godetails: {},
        godownflag: false
      }

      if (!this.isService) {
        product.productdetails.openingstock = parseFloat(this.form.stock) || 0
        product.productdetails.uomid = this.form.uom
        product.productdetails.categorycode = null
      }

      if (this.uomSelected !== '') {
        const uomIndex = this.options.uom.indexOf(this.uomSelected)
        product.productdetails.uomid = this.options.uomIds[uomIndex]
      }

      const tax = []

      if (this.form.tax.gst > 0) {
        tax.push({
          taxname: 'IGST',
          state: '',
          taxrate: parseFloat(this.form.tax.gst) || 0
        })
      }

      if (this.form.tax.cess > 0) {
        tax.push({
          taxname: 'CESS',
          state: '',
          taxrate: parseFloat(this.form.tax.cess) || 0
        })
      }

      if (this.form.tax.cvat > 0) {
        tax.push({
          taxname: 'CVAT',
          state: '',
          taxrate: parseFloat(this.form.tax.cvat) || 0
        })
      }

      if (this.form.tax.vat[0].rate > 0) {
        tax.push(...(this.form.tax.vat.map((vat) => {
          return {
            taxname: 'VAT',
            state: vat.state,
            taxrate: parseFloat(vat.rate) || 0
          }
        })))
      }

      console.log(tax)
      console.log(product)

      return { product, tax }
    },
    resetForm () {
      this.form = {
        name: null,
        uom: null,
        stock: null,
        mrp: null,
        salePrice: null,
        discountAmount: null,
        discountPercent: null,
        tax: {
          cess: null,
          gst: null,
          cvat: null,
          vat: [{ state: null, rate: null }]
        },
        hsn: null
      }
    }
  },
  mounted () {
    const states = [{ 35: 'Andaman and Nicobar Islands' }, { 28: 'Andhra Pradesh' }, { 37: 'Andhra Pradesh (New)' }, { 12: 'Arunachal Pradesh' }, { 18: 'Assam' }, { 10: 'Bihar' }, { 4: 'Chandigarh' }, { 22: 'Chhattisgarh' }, { 26: 'Dadra and Nagar Haveli' }, { 25: 'Daman and Diu' }, { 7: 'Delhi' }, { 30: 'Goa' }, { 24: 'Gujarat' }, { 6: 'Haryana' }, { 2: 'Himachal Pradesh' }, { 1: 'Jammu and Kashmir' }, { 20: 'Jharkhand' }, { 29: 'Karnataka' }, { 32: 'Kerala' }, { 31: 'Lakshdweep' }, { 23: 'Madhya Pradesh' }, { 27: 'Maharashtra' }, { 14: 'Manipur' }, { 17: 'Meghalaya' }, { 15: 'Mizoram' }, { 13: 'Nagaland' }, { 21: 'Odisha' }, { 34: 'Pondicherry' }, { 3: 'Punjab' }, { 8: 'Rajasthan' }, { 11: 'Sikkim' }, { 33: 'Tamil Nadu' }, { 36: 'Telangana' }, { 16: 'Tripura' }, { 5: 'Uttarakhand' }, { 9: 'Uttar Pradesh' }, { 19: 'West Bengal' }]
    this.options.states = states.map((item) =>  Object.values(item)[0])
    // this.options.stateCodes = states.map((item) => Object.keys(item)[0])
    this.options.states.unshift({ text: 'State' , value: null, disabled: true})
    this.getUOM()
  }
}
</script>

