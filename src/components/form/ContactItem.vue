<template>
  <div class="card mx-0">
    <div class="card-header text-left py-2">
      <b>Contact Person Details</b>
      <slot name="close-button"> </slot>
    </div>
    <div class="card-body pb-2">
      <b-form class="text-left" @submit.prevent="confirmOnSubmit">
        <b-row>
          <b-col :md="columnOneWidth" :lg="inOverlay ? columnOneWidth : null">
            <b-form-group label-size="sm" label-cols="3" label="Type">
              <b-form-radio-group
                button-variant="outline-primary"
                v-model="type"
                buttons
                size="sm"
              >
                <b-form-radio value="customer">Customer</b-form-radio>
                <b-form-radio value="supplier">Supplier</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Name"
              label-for="ci-input-1"
              label-cols="3"
              label-class="required"
            >
              <b-form-input
                size="sm"
                id="ci-input-1"
                :placeholder="formType + ' Name'"
                v-model="form.name"
                trim
                required
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-size="sm"
              invalid-feedback="Pincode must be 6 digits long"
              label="PIN"
              label-for="ci-input-3"
              label-cols="3"
              label-class="required"
            >
              <b-form-input
                size="sm"
                id="ci-input-3"
                v-model="form.pin"
                type="number" no-wheel
                :state="validatePin"
                debounce="500"
                required
              >
              </b-form-input>
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="State"
              label-for="ci-input-2"
              label-cols="3"
              label-class="required"
            >
              <autocomplete id="ci-input-2" v-model="state" :options="options.states" placeholder="Select a State" valueUid="code"> </autocomplete>
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Address"
              label-for="ci-input-4"
              label-cols="3"
              label-class="required"
            >
              <b-form-textarea
                id="ci-input-4"
                v-model="form.address"
                size="sm"
                rows="2"
                max-rows="3"
                required
              >
              </b-form-textarea>
            </b-form-group>
          </b-col>
          <b-col>
            <b-row>
              <b-col
                :md="columnTwoWidth"
                :lg="inOverlay ? columnTwoWidth : null"
              >
                <b-form-checkbox
                  size="sm"
                  v-model="showOptional"
                  class="mb-3"
                  switch
                >
                  Optional Details
                </b-form-checkbox>
                <b-collapse v-model="showOptional">
                  <b-form-group
                    label-size="sm"
                    label="Email"
                    label-for="ci-input-5"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-5"
                      v-model="form.email"
                      type="email"
                      trim
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="Phone"
                    label-for="ci-input-6"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-6"
                      type="number" no-wheel
                      v-model="form.contact"
                      trim
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="Fax"
                    label-for="ci-input-7"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-7"
                      v-model="form.fax"
                      trim
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="PAN"
                    label-for="ci-input-8"
                    :state="validatePan"
                    invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-8"
                      :state="validatePan"
                      v-model="form.pan"
                      trim
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      title="Format: A B C D E 1 2 3 4 A"
                      debounce="500"
                    >
                    </b-form-input>
                  </b-form-group>
                </b-collapse>
              </b-col>
              <b-col>
                <b-form-group
                  v-if="showOptional"
                  label-size="sm"
                  label="GSTIN"
                  label-cols="3"
                  inline
                >
                  <b-row style="max-width: 300px">
                    <b-col class="pr-1" cols="4" sm="3">
                      <b-form-input
                        size="sm"
                        class="px-1"
                        readonly
                        placeholder="00"
                        id="ci-input-9"
                        aria-label="State Code"
                        v-model="form.gstin.stateCode"
                        trim
                      ></b-form-input>
                    </b-col>
                    <b-col class="px-1 pb-2" cols="6" sm="6">
                      <b-form-input
                        size="sm"
                        class="px-1"
                        readonly
                        placeholder="PAN"
                        id="ci-input-10"
                        aria-label="PAN"
                        v-model="form.pan"
                        trim
                      ></b-form-input>
                    </b-col>
                    <b-col class="px-1" cols="6" sm="3">
                      <b-form-input
                        size="sm"
                        class="px-1"
                        id="ci-input-11"
                        aria-label="Check Sum"
                        v-model="form.gstin.checkSum"
                        trim
                        title="Format: [Number] [Alphabet] [Number / Alphabet]"
                        pattern="[0-9]{1}[A-Z]{1}[A-Z0-9]{1}"
                        debounce="500"
                      >
                      </b-form-input>
                    </b-col>
                  </b-row>
                </b-form-group>
                <b-form-checkbox
                  v-if="showOptional"
                  size="sm"
                  v-model="showBankDetails"
                  class="mb-3"
                  switch
                >
                  Bank Details
                </b-form-checkbox>
                <b-collapse v-model="showBankDetails">
                  <b-form-group
                    label-size="sm"
                    label="Acc. No."
                    label-for="ci-input-14"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-14"
                      v-model="form.bank.accNo"
                      trim
                      :required="showBankDetails"
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="Name"
                    label-for="ci-input-12"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-12"
                      placeholder="Bank Name"
                      v-model="form.bank.name"
                      trim
                      :required="showBankDetails"
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="IFSC"
                    label-for="ci-input-15"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-15"
                      v-model="form.bank.ifsc"
                      trim
                      :required="showBankDetails"
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="Branch"
                    label-for="ci-input-13"
                    label-cols="3"
                  >
                    <b-form-input
                      size="sm"
                      id="ci-input-13"
                      v-model="form.bank.branch"
                      trim
                      :required="showBankDetails"
                    ></b-form-input>
                  </b-form-group>
                </b-collapse>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <hr class="my-2" />
        <div class="float-right">
          <b-button
            v-if="!hideBackButton"
            size="sm"
            class="m-1"
            variant="danger"
            @click.prevent="$router.go(-1)"
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
          <b-button type="submit" size="sm" class="m-1" variant="success">
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
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import Autocomplete from "../Autocomplete";
export default {
  name: "ContactItem",
  components: { Autocomplete },
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ["create", "edit"].indexOf(value) !== -1;
      },
      required: true,
    },
    type: {
      type: String,
      validator: function (value) {
        return ["customer", "supplier"].indexOf(value) !== -1;
      },
      required: false,
      default: "customer",
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
      temp: true,
      blankURL: "http://localhost:1111",
      isLoading: false,
      isPreloading: false,
      showOptional: false,
      showBankDetails: false,
      options: {
        states: [],
      },
      regex: {
        checkSum: new RegExp("[0-9]{1}[A-Z]{1}[0-9A-Z]{1}"),
        pan: new RegExp("[A-Z]{5}[0-9]{4}[A-Z]{1}"),
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
          checkSum: null,
        },
        bank: {
          name: null,
          branch: null,
          accNo: null,
          ifsc: null,
        },
      },
      state: {}
    };
  },
  computed: {
    columnOneWidth: (self) => (self.showOptional ? 4 : 12),
    columnTwoWidth: (self) => (self.showOptional ? 6 : 12),
    isSupplier: (self) => self.type === "supplier",
    formType: (self) => (self.type === "customer" ? "Customer" : "Supplier"),
    formMode: (self) => (self.mode === "create" ? "Create" : "Edit"),
    validatePin: (self) =>
      self.form.pin ? self.form.pin > 100000 && self.form.pin < 999999 : null,
    validateCheckSum: (self) =>
      self.form.gstin.checkSum
        ? self.regex.checkSum.test(self.form.gstin.checkSum)
        : null,
    validatePan: (self) =>
      self.form.pan ? self.regex.pan.test(self.form.pan) : null,
    ...mapState(["gkCoreUrl", "gkCoreTestUrl", "authToken"]),
  },
  watch: {
    state(newValue) {
      if(newValue) {
        this.form.state = newValue.name;
        this.form.gstin.stateCode = newValue.code;
      }
    },
  },
  methods: {
    confirmOnSubmit() {
      const self = this;
      let party = (this.isSupplier)? 'Supplier' : 'Customer';
      let text = `Create ${party} <b>${this.form.name}</b>?`;
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          // bodyClass: 'p-2',
          centered: true,
        })
        .then((val) => {
          if (val) {
            self.onSubmit();
          }
        });
    },
    onSubmit() {
      // console.log('in submit')
      this.isLoading = true;
      const payload = this.initPayload();
      axios
        .post("/customersupplier", payload)
        .then((response) => {
          // console.log(response)
          this.isLoading = false;
          if (this.onSave) {
            this.onSave(response.data);
          }
          switch (response.data.gkstatus) {
            case 0:
              {
                this.$bvToast.toast(`${this.formType} created successfully`, {
                  title: "Create Customer Success!",
                  autoHideDelay: 3000,
                  variant: "success",
                  appendToast: true,
                  solid: true,
                });

                // === Server Log ===
                let logdata = { activity: "" };
                if (payload.csflag === 3) {
                  logdata.activity = payload.custname + " customer created";
                } else {
                  logdata.activity = payload.custname + " supplier created";
                }
                axios.post("/log", logdata);

                // only reset form on success, otherwise leave it as is so that user may edit their input and try again
                this.resetForm();
              }
              break;
            case 1:
              this.$bvToast.toast(
                `${this.formType} entry already exists! (Please check Name, FAX or PAN)`,
                {
                  title: "Create Customer Error!",
                  autoHideDelay: 3000,
                  variant: "warning",
                  appendToast: true,
                  solid: true,
                }
              );
              break;
            case 2:
              this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
                title: "Create Customer Error!",
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
                  title: "Create Customer Error!",
                  autoHideDelay: 3000,
                  variant: "warning",
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
            title: "Create Customer Error!",
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
      const pan = this.form.pan;
      const checkSum = this.form.gstin.checkSum;
      const stateCode = this.form.gstin.stateCode;
      const bankDetails = Object.values(this.form.bank).filter(
        (detail) => detail !== null
      );
      let gstin = null;
      if (stateCode !== null && pan !== null && checkSum !== null) {
        gstin = {};
        gstin[stateCode + ""] = `${stateCode}${pan}${checkSum}`;
      }
      const payload = {
        custname: this.form.name,
        custaddr: this.form.address,
        state: this.form.state,
        pincode: this.form.pin,
        csflag: this.type === "customer" ? 3 : 19,
        custtan: null, // have to check
        custphone: null,
        custemail: null,
        custfax: null,
        custpan: null,
      };

      if (this.showOptional) {
        payload.custphone = this.form.contact;
        payload.custemail = this.form.email;
        payload.custfax = this.form.fax;
        payload.custpan = this.form.pan;
        payload.csflag = this.type === "customer" ? 3 : 19;
        if (gstin !== null) {
          payload.gstin = gstin;
        }
      }

      if (this.isSupplier && this.showBankDetails && bankDetails.length === 4) {
        payload.bankdetails = {
          accountno: this.form.bank.accNo,
          bankname: this.form.bank.name,
          ifsc: this.form.bank.ifsc,
          branchname: this.form.bank.branch,
        };
      }
      // console.log(payload);
      return payload;
    },
    resetForm() {
      this.form = {
        name: null,
        state: "",
        pin: null,
        address: null,
        email: null,
        contact: null,
        fax: null,
        pan: null,
        gstin: {
          stateCode: null,
          pan: null,
          checkSum: null,
        },
        bank: {
          accNo: null,
          name: null,
          branch: null,
          ifsc: null,
        },
      };
    },
    preloadData() {
      this.isPreloading = true;
      axios
        .get("/state")
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            this.options.states = resp.data.gkresult.map((item) => {
              const name = Object.values(item)[0];
              let code = Object.keys(item)[0] + "";
              if (code.length < 2) {
                code = "0" + code;
              }

              return {
                text: name,
                value: {
                  name: name,
                  code: code,
                },
              };
            });
          } else {
            this.displayToast(
              "Preload Data Failed!",
              "Error fetching State List, please try again after sometime.",
              "warning"
            );
          }
        })
        .catch((error) => {
          this.displayToast("Preload Data Failed!", error.message, "warning");
          return error;
        });
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>
