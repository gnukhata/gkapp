<template>
  <div class="card" :style="{ minWidth: '300px' }">
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="card-header text-left py-2">
      <b>Business Item Details</b>
      <slot name="close-button"> </slot>
    </div>
    <div class="card-body pb-2">
      <b-form class="text-left" @submit.prevent="onSubmit">
        <b-row>
          <b-col class="mb-3">
            <b-row>
              <b-col cols="5" class="mb-3">
                <b-form-radio-group
                  button-variant="outline-primary"
                  v-model="type"
                  buttons
                  size="sm"
                  name="filter-form-sort"
                >
                  <b-form-radio value="product">Product</b-form-radio>
                  <b-form-radio value="service">Service</b-form-radio>
                </b-form-radio-group>
              </b-col>
              <b-col cols="12" sm="7">
                <b-form-group
                  label-size="sm"
                  label="Name"
                  label-for="bi-input-1"
                  label-cols="auto"
                  label-class="required"
                >
                  <b-form-input
                    size="sm"
                    id="bi-input-1"
                    placeholder=""
                    v-model="form.name"
                    trim
                    required
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>
            <b-card
              border-variant="primary"
              class="mb-3"
              v-if="!isService"
              no-body
            >
              <b-card-body class="p-2">
                <b>Stock</b>
                <b-form-group
                  label-size="sm"
                  label="Unit of Measure"
                  label-for="bi-input-2"
                  label-cols="3"
                  label-class="required"
                >
                  <b-form-select
                    size="sm"
                    id="bi-input-2"
                    v-model="uom"
                    :options="options.uom"
                    required
                  ></b-form-select>
                </b-form-group>
                <b-form-group
                  label-size="sm"
                  label="Opening Stock"
                  label-for="bi-input-3"
                  label-cols="3"
                >
                  <b-input-group :append="form.uomCode" size="sm">
                    <b-form-input
                      size="sm"
                      id="bi-input-3"
                      placeholder=""
                      v-model="form.stock"
                      type="number"
                      step="0.01"
                    ></b-form-input>
                  </b-input-group>
                </b-form-group>
              </b-card-body>
            </b-card>
            <b-card border-variant="primary" no-body>
              <b-card-body class="p-2">
                <b>Price</b>
                <b-form-group
                  label-size="sm"
                  label="MRP"
                  label-for="bi-input-4"
                  label-cols="3"
                >
                  <b-input-group size="sm" append="₹">
                    <b-form-input
                      id="bi-input-4"
                      placeholder=""
                      v-model="form.mrp"
                      type="number"
                      step="0.01"
                    ></b-form-input>
                  </b-input-group>
                </b-form-group>
                <b-form-group
                  label-size="sm"
                  label="Sale Price"
                  label-for="bi-input-5"
                  label-cols="3"
                >
                  <b-input-group append="₹" size="sm">
                    <b-form-input
                      size="sm"
                      id="bi-input-5"
                      placeholder=""
                      v-model="form.salePrice"
                      type="number"
                      step="0.01"
                    ></b-form-input>
                  </b-input-group>
                </b-form-group>
                <b-form-group
                  label-size="sm"
                  label="Discount"
                  label-for="bi-input-6"
                  label-cols="3"
                >
                  <b-row>
                    <b-col class="pr-1">
                      <b-input-group append="₹" size="sm">
                        <b-form-input
                          size="sm"
                          id="bi-input-6"
                          placeholder=""
                          v-model="form.discountAmount"
                          type="number"
                          step="0.01"
                        ></b-form-input>
                      </b-input-group>
                    </b-col>
                    <b-col class="pl-1">
                      <b-input-group append="%" size="sm">
                        <b-form-input
                          size="sm"
                          id="bi-input-11"
                          placeholder=""
                          v-model="form.discountPercent"
                          type="number"
                          step="0.01"
                        ></b-form-input>
                      </b-input-group>
                    </b-col>
                  </b-row>
                </b-form-group>
              </b-card-body>
            </b-card>
          </b-col>
          <b-col cols="12" :md="inOverlay ? 12 : 6" lg="6" class="mb-3">
            <b-card no-body border-variant="primary">
              <b-card-body class="p-2">
                <b>Tax</b>
                <b-row>
                  <b-col cols="12" xl="5">
                    <b-form-group
                      label-size="sm"
                      :label="isService ? 'SAC' : 'HSN'"
                      label-for="bi-input-10"
                      label-cols="3"
                      :label-class="isHsnRequired ? 'required' : ''"
                    >
                      <b-form-input
                        size="sm"
                        id="bi-input-10"
                        placeholder=""
                        v-model="form.hsn"
                        trim
                        :required="isHsnRequired"
                      ></b-form-input>
                    </b-form-group>
                    <b-form-group
                      label-size="sm"
                      label="GST"
                      label-for="bi-input-7"
                      label-cols="3"
                    >
                      <b-input-group append="%" size="sm">
                        <b-form-select
                          size="sm"
                          id="bi-input-7"
                          v-model="form.tax.gst"
                          :options="options.gstRates"
                        ></b-form-select>
                      </b-input-group>
                    </b-form-group>
                    <b-form-group
                      label-size="sm"
                      label="CESS"
                      label-for="bi-input-8"
                      label-cols="3"
                    >
                      <b-input-group append="%" size="sm">
                        <b-form-input
                          size="sm"
                          id="bi-input-8"
                          placeholder=""
                          v-model="form.tax.cess"
                          type="number"
                          step="0.01"
                        ></b-form-input>
                      </b-input-group>
                    </b-form-group>
                    <b-form-group
                      label-size="sm"
                      label="CVAT"
                      label-for="bi-input-9"
                      label-cols="3"
                    >
                      <b-input-group append="%" size="sm">
                        <b-form-input
                          size="sm"
                          id="bi-input-9"
                          placeholder=""
                          v-model="form.tax.cvat"
                          type="number"
                          step="0.01"
                        ></b-form-input>
                      </b-input-group>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-card no-body>
                      <b-card-body
                        class="p-2"
                        style="
                          min-height: 100px;
                          max-height: 150px;
                          overflow-y: auto;
                        "
                      >
                        <b>VAT</b>
                        <b-input-group
                          v-for="(vat, index) in form.tax.vat"
                          :key="index"
                          class="mb-2"
                          :id="'vat-inp-' + index"
                        >
                          <b-input-group-prepend>
                            <b-form-select
                              size="sm"
                              style="max-width: 150px"
                              v-model="vat.state"
                              :options="options.states"
                              :required="!!vat.rate"
                            ></b-form-select>
                          </b-input-group-prepend>
                          <b-form-input
                            size="sm"
                            v-model="vat.rate"
                            type="number"
                            step="0.01"
                          ></b-form-input>
                          <b-input-group-append>
                            <b-button
                              size="sm"
                              @click.prevent="addVat"
                              v-if="index === vatLength - 1"
                            >
                              +
                            </b-button>
                            <b-button
                              size="sm"
                              @click.prevent="deleteVat"
                              v-else
                            >
                              -
                            </b-button>
                          </b-input-group-append>
                        </b-input-group>
                      </b-card-body>
                    </b-card>
                  </b-col>
                </b-row>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
        <hr class="my-2" />
        <div class="float-right">
          <b-button
            v-if="!hideBackButton"
            size="sm"
            class="m-1"
            variant="danger"
            :to="{ name: 'Workflow' }"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-left"
            ></b-icon>
            <span class="align-middle"> Back</span>
          </b-button>
          <b-button
            size="sm"
            class="m-1"
            variant="warning"
            @click.prevent="resetForm"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-repeat"
            ></b-icon>
            <span class="align-middle"> Reset</span>
          </b-button>
          <b-button size="sm" type="submit" class="m-1" variant="success">
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Save</span>
          </b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "BusinessItem",
  components: {},
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ["create", "edit"].indexOf(value) !== -1;
      },
      required: true,
    },
    onSave: {
      type: Function,
      required: false,
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      type: "product", // product, service
      blankURL: "http://localhost:1111",
      isLoading: false,
      isPreloading: false,
      showOptional: false,
      uomCode: "UOM",
      options: {
        states: [],
        stateCodes: [],
        uom: [],
        uomIds: [],
        gstRates: [0, 5, 12, 18, 28],
      },
      uomTyped: "",
      uomSelected: "",
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
          vat: [{ state: null, rate: null }],
        },
        hsn: null,
      },
    };
  },
  computed: {
    isHsnRequired: (self) => self.form.tax.gst > 0 || self.form.tax.cess > 0,
    // uomCode: (self) => (self.uomSelected !== null) ? self.uomSelected.split(' ')[0] : null,
    isService: (self) => self.type === "service",
    formType: (self) => (self.type === "product" ? "Product" : "Service"),
    formMode: (self) => (self.mode === "create" ? "Create" : "Edit"),
    titleIcon: (self) =>
      self.type === "product" ? "cart-variant" : "face-agent",
    vatLength: (self) => self.form.tax.vat.length,
    uom: {
      set: function (newValue) {
        if (newValue) {
          this.form.uom = newValue.id;
          this.form.uomCode = newValue.name;
        }
      },
      get: function () {
        return {
          name: this.form.uomCode,
          id: this.form.uom,
        };
      },
    },
    ...mapState(["gkCoreUrl", "gkCoreTestUrl", "authToken"]),
  },
  methods: {
    addVat() {
      this.form.tax.vat.push({ state: null, rate: null });
      setTimeout(() => {
        document
          .getElementById(`vat-inp-${this.vatLength - 1}`)
          .scrollIntoView();
      }, 200);
    },
    deleteVat(index) {
      this.form.tax.vat.splice(index, 1);
    },
    onSubmit() {
      // console.log('in submit')
      this.isLoading = true;
      const payload = this.initPayload();
      console.log(payload)
      axios
        .post("/products", payload.product)
        .then((response) => {
          // console.log(response)
          this.isLoading = false;
          let productCode, taxPayload, taxRequests;
          switch (response.data.gkstatus) {
            case 0:
              this.$bvToast.toast(`${this.formType} created successfully`, {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: "success",
                appendToast: true,
                solid: true,
              });

              // store the tax when the product has been created successfully
              productCode = response.data.gkresult;
              taxPayload = {};
              taxRequests = payload.tax.map((item) => {
                taxPayload = {
                  taxname: item.taxname,
                  taxrate: item.taxrate,
                  productcode: productCode,
                };
                return axios.post("/tax", taxPayload);
              });
              Promise.all(taxRequests).then((responses) => {
                // console.log(responses)
              });

              // === Server Log ===
              let logdata = { activity: "" };
              if (payload.product.godownflag === true) {
                logdata.activity =
                  payload.product.productdetails.productdesc +
                  " product created in " +
                  payload.product.godetails.name +
                  " godowns";
              } else {
                logdata.activity = payload.product.productdetails.productdesc + " product created";
              }
              axios.post("/log", logdata);

              // only reset form on success, otherwise leave it as is so that user may edit their input and try again
              this.resetForm();
              break;
            case 1:
              this.$bvToast.toast(
                `${this.formType} entry already exists! (Please check Name, FAX or PAN)`,
                {
                  title: `${this.formMode} ${this.formType} Error!`,
                  autoHideDelay: 3000,
                  variant: "warning",
                  appendToast: true,
                  solid: true,
                }
              );
              break;
            case 2:
              this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: "warning",
                appendToast: true,
                solid: true,
              });
              break;
            default:
              this.$bvToast.toast(
                `Unable to create ${this.formType}, Please try again`,
                {
                  title: `${this.formMode} ${this.formType} Error!`,
                  autoHideDelay: 3000,
                  variant: "danger",
                  appendToast: true,
                  solid: true,
                }
              );
          } // end switch
          if (this.onSave) {
            this.onSave(response.data);
          }
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `${this.formMode} ${this.formType} Error!`,
            autoHideDelay: 3000,
            variant: "warning",
            appendToast: true,
            solid: true,
          });
        })
        .then(() => {
          this.isLoading = false;
        });
    },
    initPayload() {
      const product = {
        productdetails: {
          gsflag: this.isService ? 19 : 7,
          productdesc: this.form.name,
          prodmrp: parseFloat(this.form.mrp) || 0,
          prodsp: parseFloat(this.form.salePrice) || 0,
          amountdiscount: parseFloat(this.form.discountAmount) || 0,
          percentdiscount: parseFloat(this.form.discountPercent) || 0,
          gscode: this.form.hsn,
          specs: {},
        },
        godetails: {},
        godownflag: false,
      };

      if (!this.isService) {
        product.productdetails.openingstock = parseFloat(this.form.stock) || 0;
        product.productdetails.uomid = this.form.uom;
        product.productdetails.categorycode = null;
      }

      if (this.uomSelected !== "") {
        const uomIndex = this.options.uom.indexOf(this.uomSelected);
        product.productdetails.uomid = this.options.uomIds[uomIndex];
      }

      const tax = [];

      if (this.form.tax.gst > 0) {
        tax.push({
          taxname: "IGST",
          state: "",
          taxrate: parseFloat(this.form.tax.gst) || 0,
        });
      }

      if (this.form.tax.cess > 0) {
        tax.push({
          taxname: "CESS",
          state: "",
          taxrate: parseFloat(this.form.tax.cess) || 0,
        });
      }

      if (this.form.tax.cvat > 0) {
        tax.push({
          taxname: "CVAT",
          state: "",
          taxrate: parseFloat(this.form.tax.cvat) || 0,
        });
      }

      if (this.form.tax.vat[0].rate > 0) {
        tax.push(
          ...this.form.tax.vat.map((vat) => {
            return {
              taxname: "VAT",
              state: vat.state,
              taxrate: parseFloat(vat.rate) || 0,
            };
          })
        );
      }

      // console.log(tax);
      // console.log(product);

      return { product, tax };
    },
    resetForm() {
      let uom = this.uom;
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
          vat: [{ state: null, rate: null }],
        },
        hsn: null,
      };
      this.uom = uom;
    },
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get("/unitofmeasurement?qty=all").catch((error) => {
          this.displayToast(
            "Fetch Unit of Measurement Failed!",
            error.message,
            "danger"
          );
          return error;
        }),
        axios.get("/state").catch((error) => {
          this.displayToast(
            "Fetch State Data Failed!",
            error.message,
            "danger"
          );
          return error;
        }),
      ];

      const self = this;
      return Promise.all([...requests]).then(([resp1, resp2]) => {
        self.isPreloading = false;
        let preloadErrorList = ""; // To handle the unloaded data, at once than individually
        /**
         * The data obtained are updated, to be comptaible with the
         * component they are used with (<b-form-select>)
         * and based on requirement
         */

        // === UOM List ===
        if (resp1.status === 200) {
          if (resp1.data.gkstatus === 0) {
            self.options.uom = resp1.data.gkresult.map((uom) => {
              return {
                text: `${uom.unitname} (${uom.description})`,
                value: { id: uom.uomid, name: uom.unitname },
              };
            });
            self.uom = self.options.uom.filter(
              (uom) => uom.value.name === "UNT"
            )[0].value;
            // console.log(resp1.data.gkresult)
          } else {
            preloadErrorList += " Unit of Measurement List, ";
          }
        }

        // === State List ===
        if (resp2.status === 200) {
          if (resp2.data.gkstatus === 0) {
            self.options.states = resp2.data.gkresult.map(
              (item) => Object.values(item)[0]
            );
            self.options.states.unshift({
              text: "State",
              value: null,
              disabled: true,
            });
          } else {
            preloadErrorList += " States,";
          }
        }

        if (preloadErrorList !== "") {
          this.displayToast(
            "Error: Unable to Preload Data",
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            "danger"
          );
        }
      });
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>

