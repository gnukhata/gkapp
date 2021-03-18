<template>
  <div class="card" :style="{ minWidth: '300px' }">
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="card-header text-left py-2">
      <b>Business Item Details</b>
      <slot name="close-button"> </slot>
    </div>
    <div class="card-body pb-2 px-1 px-md-3">
      <b-form class="text-left px-2" @submit.prevent="onSubmit">
        <b-row>
          <b-col class="mb-3 px-3">
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
                  <autocomplete
                    size="sm"
                    id="bi-input-2"
                    v-model="uom"
                    :options="options.uom"
                    valueUid="id"
                    required
                  ></autocomplete>
                </b-form-group>
                <b-form-group
                  label-size="sm"
                  label="Opening Stock"
                  label-for="bi-input-3"
                  label-cols="3"
                  v-if="!form.stock.godownFlag"
                >
                  <b-input-group :append="form.uomCode" size="sm">
                    <b-form-input
                      size="sm"
                      id="bi-input-3"
                      placeholder=""
                      v-model="form.stock.value"
                      type="number" no-wheel
                      step="0.01"
                    ></b-form-input>
                  </b-input-group>
                </b-form-group>
                <b-card no-body>
                  <div class="p-2">
                    <div class="mb-2">
                      <b-form-checkbox
                        size="sm"
                        v-model="form.stock.godownFlag"
                        class="d-inline-block"
                        switch
                      >
                        Godownwise Opening Stock
                      </b-form-checkbox>
                      <b-button
                        class="mx-2 py-0 px-1"
                        size="sm"
                        variant="success"
                        @click.prevent="showGodownForm = true"
                      >
                        + Godown
                      </b-button>
                    </div>
                    <div v-if="form.stock.godownFlag">
                      <b-input-group
                        v-for="(godown, index) in form.stock.godowns"
                        :key="index"
                        class="mb-2"
                        :id="'vat-inp-' + index"
                      >
                        <b-input-group-prepend>
                          <autocomplete
                            size="sm"
                            style="max-width: 150px"
                            v-model="godown.id"
                            :options="options.godowns"
                            :required="!!godown.value"
                            :isOptionsShared="true"
                            emptyValue=""
                          ></autocomplete>
                        </b-input-group-prepend>
                        <b-form-input
                          size="sm"
                          v-model="godown.value"
                          type="number" no-wheel
                          step="0.01"
                          placeholder="Stock qty"
                        ></b-form-input>
                        <b-input-group-append>
                          <b-button
                            size="sm"
                            @click.prevent="addGodown"
                            v-if="index === godownLength - 1"
                          >
                            +
                          </b-button>
                          <b-button
                            size="sm"
                            @click.prevent="deleteGodown(index)"
                            v-else
                          >
                            -
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </div>
                  </div>
                </b-card>
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
                      type="number" no-wheel
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
                      type="number" no-wheel
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
                          type="number" no-wheel
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
                          type="number" no-wheel
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
                          type="number" no-wheel
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
                          type="number" no-wheel
                          step="0.01"
                        ></b-form-input>
                      </b-input-group>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-card no-body>
                      <b-card-body class="p-2" style="min-height: 100px">
                        <b>VAT</b>
                        <b-input-group
                          v-for="(vat, index) in form.tax.vat"
                          :key="index"
                          class="mb-2"
                          :id="'vat-inp-' + index"
                        >
                          <b-input-group-prepend>
                            <autocomplete
                              size="sm"
                              style="max-width: 150px"
                              v-model="vat.state"
                              :options="options.states"
                              :required="!!vat.rate"
                              :isOptionsShared="true"
                              emptyValue=""
                            ></autocomplete>
                          </b-input-group-prepend>
                          <b-form-input
                            size="sm"
                            v-model="vat.rate"
                            type="number" no-wheel
                            step="0.01"
                            placeholder="VAT %"
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
                              @click.prevent="deleteVat(index)"
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
        <div>
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
                v-else
                aria-hidden="true"
                class="align-middle"
                icon="plus-square"
              ></b-icon>
              <span class="align-middle"> Save</span>
            </b-button>
          </div>
        </div>
      </b-form>
    </div>
    <b-modal
      size="lg"
      v-model="showGodownForm"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <godown
        :hideBackButton="true"
        mode="create"
        :inOverlay="true"
        :onSave="onGodownSave"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click.prevent="
              () => {
                showGodownForm = false;
              }
            "
            >x</b-button
          >
        </template>
      </godown>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import Godown from "./Godown";
import Autocomplete from "../Autocomplete";
export default {
  name: "BusinessItem",
  components: { Godown, Autocomplete },
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
      showGodownForm: false,
      type: "product", // product, service
      blankURL: "http://localhost:1111",
      isLoading: false,
      isPreloading: false,
      showOptional: false,
      uomCode: "UOM",
      options: {
        godowns: [],
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
        stock: {
          godownFlag: false,
          godowns: [
            {
              id: "",
              value: null,
            },
          ], // opening stock based on godown
          value: 0, // opening stock
        },
        mrp: null,
        salePrice: null,
        discountAmount: null,
        discountPercent: null,
        tax: {
          cess: null,
          gst: null,
          cvat: null,
          vat: [{ state: "", rate: null }],
        },
        hsn: null,
      },
      uom: {},
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
    godownLength: (self) => self.form.stock.godowns.length,
    ...mapState(["gkCoreUrl", "gkCoreTestUrl", "authToken"]),
  },
  watch: {
    uom(newValue) {
      if (newValue) {
        this.form.uom = newValue.id;
        this.form.uomCode = newValue.name;
      }
    },
  },
  methods: {
    addVat() {
      this.form.tax.vat.push({ state: "", rate: null });
      setTimeout(() => {
        document
          .getElementById(`vat-inp-${this.vatLength - 1}`)
          .scrollIntoView();
      }, 200);
    },
    deleteVat(index) {
      this.form.tax.vat.splice(index, 1);
    },
    addGodown() {
      this.form.stock.godowns.push({ id: "", value: "" });
    },
    deleteGodown(index) {
      this.form.stock.godowns.splice(index, 1);
    },
    onSubmit() {
      // console.log('in submit')
      this.isLoading = true;
      const payload = this.initPayload();
      console.log(payload);
      axios
        .post("/products", payload.product)
        .then((response) => {
          // console.log(response)
          this.isLoading = false;
          let productCode, taxPayload, taxRequests;
          switch (response.data.gkstatus) {
            case 0:
              {
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
                Promise.all(taxRequests).then(() => {
                  // console.log(responses)
                });

                // === Server Log ===
                let logdata = { activity: "" };
                let name = "";
                if (payload.product.godownflag === true) {
                  let godownIds = Object.keys(payload.product.godetails);
                  // comma separated godown names
                  this.options.godowns.forEach((gdn) => {
                    if (godownIds.includes(gdn.value + "")) {
                      name += " " + gdn.text + ",";
                    }
                  });

                  logdata.activity =
                    payload.product.productdetails.productdesc +
                    " product created in " +
                    name +
                    " godowns";
                } else {
                  logdata.activity =
                    payload.product.productdetails.productdesc +
                    " product created";
                }
                axios.post("/log", logdata);

                let message = `${this.formType} created successfully`;

                if (name) {
                  message += " in " + name + " Godowns.";
                }

                this.$bvToast.toast(message, {
                  title: `${this.formMode} ${this.formType} Success!`,
                  autoHideDelay: 3000,
                  variant: "success",
                  appendToast: true,
                  solid: true,
                });

                // only reset form on success, otherwise leave it as is so that user may edit their input and try again
                this.resetForm();
              }
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

      // === Product specific fields ===
      if (!this.isService) {
        product.productdetails.openingstock =
          parseFloat(this.form.stock.value) || 0;
        product.productdetails.uomid = this.form.uom;
        product.productdetails.categorycode = null;

        // === Godown Stock Data ===
        if (this.form.stock.godownFlag) {
          // openingstock becomes 0, when godownflag is true
          product.productdetails.openingstock = 0;

          // format and store godetails, format -> {godownId : stockCount}
          product.godetails = this.form.stock.godowns.reduce((acc, godown) => {
            if (godown.value && godown.id) {
              acc[godown.id] = godown.value;
            }
            return acc;
          }, {});

          // set godownflag true if length > 0, else remains false
          if (Object.keys(product.godetails).length) {
            product.godownflag = true;
          }
        }
      }

      if (this.uomSelected !== "") {
        const uomIndex = this.options.uom.indexOf(this.uomSelected);
        product.productdetails.uomid = this.options.uomIds[uomIndex];
      }

      const tax = [];

      // GST
      if (this.form.tax.gst > 0) {
        tax.push({
          taxname: "IGST",
          state: "",
          taxrate: parseFloat(this.form.tax.gst) || 0,
        });
      }

      // CESS
      if (this.form.tax.cess > 0) {
        tax.push({
          taxname: "CESS",
          state: "",
          taxrate: parseFloat(this.form.tax.cess) || 0,
        });
      }

      // CVAT
      if (this.form.tax.cvat > 0) {
        tax.push({
          taxname: "CVAT",
          state: "",
          taxrate: parseFloat(this.form.tax.cvat) || 0,
        });
      }

      // VAT []
      if (this.form.tax.vat[0].rate > 0) {
        tax.push(
          ...this.form.tax.vat.reduce((acc, vat) => {
            if (vat.state && vat.rate >= 0) {
              acc.push({
                taxname: "VAT",
                state: vat.state,
                taxrate: parseFloat(vat.rate) || 0,
              });
            }
            return acc;
          }, [])
        );
      }

      // console.log(tax);
      // console.log(product);
      // product and tax details will be used by separate API's
      return { product, tax };
    },
    onGodownSave() {
      this.showGodownForm = false;
      this.fetchGodownList().then(() => {
        if (this.form.stock.godownFlag) {
          let stockGdnCount = this.form.stock.godowns.length;
          let godownCount = this.options.godowns.length;
          if (this.form.stock.godowns[stockGdnCount - 1].id !== null) {
            this.addGodown();
            stockGdnCount++;
          }
          this.form.stock.godowns[stockGdnCount - 1].id = this.options.godowns[
            godownCount - 1
          ].value;
        }

        this.form.showGodownForm = false;
      });
    },
    resetForm() {
      let uom = this.uom;
      this.form = {
        name: null,
        uom: null,
        stock: {
          godownFlag: false,
          godowns: [{ id: null, value: null }],
          value: 0,
        },
        mrp: null,
        salePrice: null,
        discountAmount: null,
        discountPercent: null,
        tax: {
          cess: null,
          gst: null,
          cvat: null,
          vat: [{ state: "", rate: null }],
        },
        hsn: null,
      };
      this.uom = uom;
    },
    fetchGodownList() {
      let self = this;
      return axios
        .get("/godown")
        .then((resp) => {
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              // console.log(resp.data.gkresult);
              resp.data.gkresult.sort((a, b) => a.goid - b.goid); // sorting the godown list based on goid, to order it in creation order
              self.options.godowns = resp.data.gkresult.map((item) => {
                return {
                  text: `${item.goname} (${item.goaddr})`,
                  value: item.goid,
                };
              });
            } else {
              this.displayToast(
                "Fetch Product Data Failed!",
                "Please try again later, if problem persists, contact admin",
                "danger"
              );
            }
          }
        })
        .catch((error) => {
          this.displayToast("Fetch Godowns Failed!", error.message, "danger");
          return error;
        });
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
        this.fetchGodownList(),
      ];

      const self = this;
      return Promise.all([...requests]).then(([resp1, resp2, resp3]) => {
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
            self.options.states = resp2.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: Object.values(item)[0],
              };
            });
          } else {
            preloadErrorList += " States,";
          }
        }

        // === Godown List ===
        if (resp3 !== undefined) {
          preloadErrorList += " Godowns,";
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

