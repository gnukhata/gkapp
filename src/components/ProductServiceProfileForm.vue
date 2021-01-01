<template>
    <card-component ref="wrapperCard" :title="formMode+' '+formType+' Form'" :icon="titleIcon">
      <form @submit.prevent="submitForm">
        <div class="columns">
          <div class="column is-6">
            <b-field label-for="prod-name-inp" :label="formType + ' Name'" custom-class="required">
              <b-input
                id="prod-name-inp"
                :placeholder="formType + ' Name'"
                minlength="3"
                :validation-message="formType + ' name must be 3 or more characters long'"
                v-model="form.name"
                required>
              </b-input>
            </b-field>
          </div>
        </div>
        <div class="columns">
          <div class="column" v-if="!isService">
            <card-component title="Stock">
              <b-field label="Unit of Measurement" custom-class="required">
                <b-autocomplete
                  placeholder="Select Unit"
                  :open-on-focus="true"
                  v-model="uomTyped"
                  :data="filteredDataArray"
                  @select="option => (uomSelected = option)"
                  @blur="() => { uomTyped = (uomSelected === null) ? '' : uomSelected }"
                  expanded
                  required>
                  <template slot="empty">No results for {{uomTyped}}</template>
                </b-autocomplete>
              </b-field>
              <b-field label-for="op-stock-inp" label="Opening Stock">
                <b-input
                  id="op-stock-inp"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  min="0"
                  v-model="form.stock"
                  expanded>
                </b-input>
                <p class="control">
                  <span class="button is-static">{{uomCode}}</span>
                </p>
              </b-field>
            </card-component>
          </div>
          <div class="column is-6">
              <card-component title="Price">
                <div class="field">
                  <div class="field-body">
                    <b-field label-for="mrp-inp" label="MRP">
                      <b-input
                        id="mrp-inp"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        type="number"
                        v-model="form.mrp">
                      </b-input>
                    </b-field>
                    <b-field label-for="sale-prc-inp" label="Sale Price">
                      <b-input
                        id="sale-prc-inp"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        type="number"
                        v-model="form.sellingPrice">
                      </b-input>
                    </b-field>
                  </div>
                </div>
                <div class="field">
                  <div class="field-body">
                    <b-field label-for="discount-amnt-inp" label="Discount Amount">
                      <b-input
                        id="discount-amnt-inp"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        type="number"
                        v-model="form.amountDiscount">
                      </b-input>
                    </b-field>
                    <b-field label-for="discount-prc-inp" label="Discount %">
                      <b-input
                        id="discount-prc-inp"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        type="number"
                        v-model="form.percentDiscount">
                      </b-input>
                    </b-field>
                  </div>
                </div>
              </card-component>
          </div>
        </div>
        <card-component title="Tax">
          <div class="columns">
            <div class="column is-4">
              <b-field label="GST %">
                <b-select :value="options.gstRates[0]" expanded v-model="form.tax.gst">
                  <option
                      v-for="option in options.gstRates"
                      :value="option"
                      :key="option"
                      >
                      {{ option }}
                  </option>
                </b-select>
              </b-field>
              <b-field label="CESS %">
                <b-input
                  id="discount-prc-inp"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="100"
                  type="number"
                  v-model="form.tax.cess">
                </b-input>
              </b-field>
              <b-field label="CVAT %">
                <b-input
                  id="discount-prc-inp"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="100"
                  type="number"
                  v-model="form.tax.cvat">
                </b-input>
              </b-field>
            </div>
            <div class="column">
              <b-field label-for="hsn-inp" :label="isService ? 'Services Accounting Code' : 'HSN Code'" :custom-class="isHsnRequired ? 'required' : ''">
                <b-input
                  id="hsn-inp"
                  placeholder="e.g. 012345"
                  type="text"
                  pattern="^\d{6}$"
                  validation-message="6 digit number required"
                  v-model="form.hsn"
                  :required="isHsnRequired">
                </b-input>
              </b-field>
              <card-component title="VAT" class="mt-5">
                <div class="is-max-h-180">
                  <b-field
                    grouped
                    v-for="(vat, index) in form.tax.vat"
                    :id="`vat-inp-${index}`"
                    :key="index">
                    <b-field class="is-w-7">
                      <b-select v-model="vat.state" placeholder="State" expanded>
                        <option
                          v-for="option in options.states"
                          :value="option.id"
                          :key="option.id">
                          {{ option.state }}
                        </option>
                      </b-select>
                    </b-field>
                    <b-field class="is-w-6">
                      <b-input
                        id="discount-prc-inp"
                        placeholder="VAT %"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        v-model="vat.rate">
                      </b-input>
                    </b-field>
                    <b-field class="my-1">
                      <b-button
                      type="is-dark"
                      @click.prevent="addVat"
                      title="Add entry"
                      size="is-small"
                      v-if="index === (vatLength - 1)">
                        +
                      </b-button>
                      <b-button
                      @click.prevent="deleteVat(index)"
                      type="is-dark"
                      title="Remove entry"
                      size="is-small"
                      v-else>
                        x
                      </b-button>
                    </b-field>
                  </b-field>
                </div>
              </card-component>
            </div>
          </div>
        </card-component>
        <hr>
        <b-field grouped position="is-right">
          <div class="control">
            <b-button aria-label="Go back to previous page" icon-left="arrow-left" type="is-danger" tag="router-link"
            :to="{name: 'Workflow'}">
              Back
            </b-button>
            <b-button aria-label="Reset Form" class="ml-2" icon-left="cached" type="is-warning" @click.prevent="resetForm">
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
  name: 'ProductServiceProfileForm',
  components: {
    CardComponent
  },
  props: {
    type: {
      type: String,
      validator: function (value) {
        // The value must match one of these strings
        return ['product', 'service'].indexOf(value) !== -1
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
        sellingPrice: null,
        amountDiscount: null,
        percentDiscount: null,
        tax: {
          cess: null,
          gst: 0,
          cvat: null,
          vat: [{ state: null, rate: null }]
        },
        hsn: null
      }
    }
  },
  computed: {
    isHsnRequired: (self) => (self.form.tax.gst > 0 || self.form.tax.cess > 0),
    uomCode: (self) => (self.uomSelected !== null) ? self.uomSelected.split(' ')[0] : null,
    isService: (self) => (self.type === 'service'),
    formType: (self) => (self.type === 'product') ? 'Product' : 'Service',
    formMode: (self) => (self.mode === 'create') ? 'Create' : 'Edit',
    titleIcon: (self) => (self.type === 'product') ? 'cart-variant' : 'face-agent',
    vatLength: (self) => self.form.tax.vat.length,
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl', 'authToken']),
    filteredDataArray () {
      return this.options.uom.filter((option) => {
        return option
          .toString()
          .toLowerCase()
          .indexOf(this.uomTyped.toLowerCase()) >= 0
      })
    }
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
              this.options.uom = response.data.gkresult.map((uom) => `${uom.unitname} (${uom.description})`)
              this.options.uomIds = response.data.gkresult.map((uom) => uom.uomid)
              // console.log(response.data.gkresult)
              break
            default:
              this.$buefy.toast.open({
                message: 'Error: Problem with fetching Dashboard data',
                type: 'is-warning',
                queue: false
              })
          }
        })
    },
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

      axios.post(`${this.gkCoreUrl}/products`, payload.product, config)
        .then((response) => {
          // console.log(response)
          this.isLoading = false
          let productCode, taxPayload, taxRequests
          switch (response.data.gkstatus) {
            case 0:
              this.$buefy.toast.open({
                message: this.formType + ' created successfully',
                type: 'is-success',
                queue: false
              })
              this.resetForm()
              this.$refs.wrapperCard.$el.scrollIntoView()

              // store the tax when the product has been created successfully
              productCode = response.data.gkresult
              taxPayload = {}
              taxRequests = payload.tax.map((item) => {
                taxPayload = { taxname: item.taxname, taxrate: item.taxrate, productcode: productCode }
                return axios.post(`${this.gkCoreUrl}/tax`, taxPayload, config)
              })
              Promise.all(taxRequests).then((responses) => {
                console.log(responses)
              })
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
      const product = {
        productdetails: {
          gsflag: (this.isService) ? 19 : 7,
          productdesc: this.form.name,
          prodmrp: parseFloat(this.form.mrp) || 0,
          prodsp: parseFloat(this.form.sellingPrice) || 0,
          amountdiscount: parseFloat(this.form.amountDiscount) || 0,
          percentdiscount: parseFloat(this.form.percentDiscount) || 0,
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
          taxrate: this.form.tax.gst
        })
      }

      if (this.form.tax.cess > 0) {
        tax.push({
          taxname: 'CESS',
          state: '',
          taxrate: this.form.tax.cess
        })
      }

      if (this.form.tax.cvat > 0) {
        tax.push({
          taxname: 'CVAT',
          state: '',
          taxrate: this.form.tax.cvat
        })
      }

      if (this.form.tax.vat[0].rate > 0) {
        tax.push(...(this.form.tax.vat.map((vat) => {
          return {
            taxname: 'VAT',
            state: vat.state,
            taxrate: vat.rate
          }
        })))
      }

      // console.log(tax)
      // console.log(payload)

      return { product, tax }
    },
    resetForm () {
      this.form = {
        name: null,
        uom: null,
        stock: null,
        mrp: null,
        sellingPrice: null,
        amountDiscount: null,
        percentDiscount: null,
        tax: {
          cess: null,
          gst: 0,
          cvat: null,
          vat: [{ state: null, rate: null }]
        },
        hsn: null
      }
    }
  },
  mounted () {
    const states = [{ 35: 'Andaman and Nicobar Islands' }, { 28: 'Andhra Pradesh' }, { 37: 'Andhra Pradesh (New)' }, { 12: 'Arunachal Pradesh' }, { 18: 'Assam' }, { 10: 'Bihar' }, { 4: 'Chandigarh' }, { 22: 'Chhattisgarh' }, { 26: 'Dadra and Nagar Haveli' }, { 25: 'Daman and Diu' }, { 7: 'Delhi' }, { 30: 'Goa' }, { 24: 'Gujarat' }, { 6: 'Haryana' }, { 2: 'Himachal Pradesh' }, { 1: 'Jammu and Kashmir' }, { 20: 'Jharkhand' }, { 29: 'Karnataka' }, { 32: 'Kerala' }, { 31: 'Lakshdweep' }, { 23: 'Madhya Pradesh' }, { 27: 'Maharashtra' }, { 14: 'Manipur' }, { 17: 'Meghalaya' }, { 15: 'Mizoram' }, { 13: 'Nagaland' }, { 21: 'Odisha' }, { 34: 'Pondicherry' }, { 3: 'Punjab' }, { 8: 'Rajasthan' }, { 11: 'Sikkim' }, { 33: 'Tamil Nadu' }, { 36: 'Telangana' }, { 16: 'Tripura' }, { 5: 'Uttarakhand' }, { 9: 'Uttar Pradesh' }, { 19: 'West Bengal' }]
    this.options.states = states.map((item) => { return { state: Object.values(item)[0], id: Object.keys(item)[0] } })
    // this.options.stateCodes = states.map((item) => Object.keys(item)[0])

    this.getUOM()
  }
}
</script>
