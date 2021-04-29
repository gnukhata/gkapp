<template>
  <b-card
    v-if="config"
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
  >
    <b-overlay
      :show="isPreloading || form.loading"
      variant="secondary"
      no-wrap
      blur
    >
    </b-overlay>
    <div class="p-2 p-md-3">
      <div>
        <b v-if="saleFlag"> Buyer Details</b>
        <b v-else> Seller Details</b>
        <b-button
          variant="primary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            class="float-right"
          ></b-icon>
        </b-button>
      </div>
      <div class="mt-3" :class="{ 'd-md-block': true, 'd-none': !isCollapsed }">
        <b-row>
          <b-col v-if="config.type" cols="12">
            <b-form-group>
              <b-form-radio-group
                button-variant="outline-secondary"
                size="sm"
                buttons
                v-model="form.type"
                @input="resetPartyDetails()"
              >
                <b-form-radio value="customer">Customer</b-form-radio>
                <b-form-radio value="supplier">Supplier</b-form-radio>
              </b-form-radio-group>
              <b-button
                @click.prevent="showContactForm = true"
                class="py-0 ml-3"
                variant="success"
                size="sm"
                title="Add Contact"
                >+</b-button
              >
              <b-button
                v-if="form.name"
                class="py-0 ml-2"
                variant="warning"
                size="sm"
                @click.prevent="initPartyEdit"
                :disabled="editFlag"
                title="Edit Contact"
                ><b-icon font-scale="0.95" icon="pencil"></b-icon
              ></b-button>
            </b-form-group>
          </b-col>

          <b-col cols="12" v-if="config.name">
            <b-form-group
              label="Name"
              label-for="input-9"
              label-cols="3"
              label-size="sm"
            >
              <autocomplete
                size="sm"
                id="input-9"
                v-model="form.name"
                :options="
                  form.type === 'customer'
                    ? options.customers
                    : options.suppliers
                "
                @input="onPartyNameSelect(form.name)"
                required
                valueUid="id"
                :readonly="editFlag"
              >
              </autocomplete>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.addr">
            <b-form-group
              label-cols="3"
              label="Address"
              label-for="input-10"
              label-size="sm"
            >
              <b-form-textarea
                size="sm"
                id="input-10"
                v-model="form.addr"
                rows="2"
                trim
                :readonly="!editFlag"
                tabindex="-1"
              ></b-form-textarea>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.pin">
            <b-form-group
              label-cols="3"
              label="PIN"
              label-for="input-11"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-11"
                v-model="form.pin"
                trim
                :readonly="!editFlag"
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="editFlag">
            <b-form-group
              label="PAN"
              label-for="input-12-1"
              label-size="sm"
              label-cols="3"
            >
              <b-form-input
                size="sm"
                id="input-12-1"
                v-model="form.pan"
                trim
                :disabled="!editFlag"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.state">
            <b-form-group
              label="State"
              label-for="input-12"
              label-size="sm"
              label-cols="3"
            >
              <b-form-select
                size="sm"
                id="input-12"
                v-model="form.state"
                :options="!editFlag ? form.options.states : options.states"
                @input="setPartyGst()"
                trim
                :disabled="!editFlag"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col v-if="gstFlag && config.gstin" cols="12">
            <b-form-group
              label-cols="3"
              label="GSTIN"
              label-for="input-13"
              label-size="sm"
            >
              <b-form-input
                v-if="!editFlag"
                size="sm"
                id="input-13"
                v-model="form.gstin"
                trim
                :readonly="!editFlag"
                tabindex="-1"
              ></b-form-input>
              <div v-else class="d-flex">
                <b-form-input
                  v-model="form.state.id"
                  type="text"
                  disabled
                  style="max-width: 2.5em"
                  class="px-1 text-center"
                ></b-form-input>
                <b-form-input
                  v-model="form.pan"
                  type="text"
                  class="ml-1 mr-1 px-1 text-center"
                  disabled
                ></b-form-input>
                <b-form-input
                  type="text"
                  title="Format: [Number] [Alphabet] [Number / Alphabet]"
                  v-model="form.checksum"
                  style="max-width: 3em"
                  class="px-1 text-center"
                ></b-form-input>
              </div>
            </b-form-group>
          </b-col>
          <b-col v-else-if="config.tin" cols="12">
            <b-form-group
              label-cols="3"
              label="TIN"
              label-for="input-13"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-13"
                v-model="form.tin"
                trim
                :readonly="!editFlag"
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="editFlag">
            <b-button
              @click.prevent="onPartyEdit(false)"
              variant="danger"
              size="sm"
              class="mr-1"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle"
                icon="x-circle"
              ></b-icon
              ><span class="align-middle"> Cancel</span></b-button
            >
            <b-button
              @click.prevent="onPartyEdit(true)"
              variant="success"
              size="sm"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle"
                icon="cloud-arrow-up"
              ></b-icon>
              <span class="align-middle"> Save Changes</span>
            </b-button>
          </b-col>
        </b-row>
      </div>
    </div>

    <!-- Create Contact Item -->
    <b-modal
      size="lg"
      v-model="showContactForm"
      v-if="config"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <contact-item
        :hideBackButton="true"
        :onSave="onContactSave"
        mode="create"
        :type="form.type"
        :inOverlay="true"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click.prevent="
              () => {
                showContactForm = false;
              }
            "
            >x</b-button
          >
        </template>
      </contact-item>
    </b-modal>
  </b-card>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../../Autocomplete.vue';
import ContactItem from '../ContactItem.vue';
export default {
  name: 'PartyDetails',
  components: {
    Autocomplete,
    ContactItem,
  },
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ['sale', 'purchase'].indexOf(value) !== -1;
      },
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    config: {
      type: Object,
      required: false,
    },
    gstFlag: {
      type: Boolean,
      required: true,
    },
    saleFlag: {
      type: Boolean,
      required: true,
    },
    invoiceParty: {
      type: Object,
      required: false,
      default: {},
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
    parentData: {
      type: Object,
      required: false,
      default: {
        loading: false,
        options: {
          states: [],
          gstin: [],
        },
        type: 'customer', // supplier
        custid: null,
        name: {},
        addr: null,
        state: {},
        gstin: null,
        tin: null,
        pin: null,
        pan: '',
        checksum: '',
      },
    },
  },
  data() {
    return {
      form: {
        loading: false,
        options: {
          states: [],
          gstin: [],
        },
        type: 'customer', // supplier
        custid: null,
        name: {},
        addr: null,
        state: {},
        gstin: null,
        tin: null,
        pin: null,
        pan: '',
        checksum: '',
      },
      options: {
        customers: [],
        suppliers: [],
      },
      editFlag: false,
      loading: false,
      editMode: {
        addr: null,
        state: {},
        gstin: null,
        pin: null,
      },
      isCollapsed: false,
      showContactForm: false,
      isPreloading: false,
    };
  },
  computed: {},
  watch: {
    saleFlag(isSale) {
      this.form.type = isSale ? 'customer' : 'supplier';
    },
    updateCounter() {
      Object.assign(this.form, this.parentData);
    },
  },
  methods: {
    resetPartyDetails() {
      Object.assign(this.form, {
        name: '',
        addr: null,
        options: {
          states: [],
          gstin: null,
        },
        state: {},
        pin: '',
        gstin: '',
        checksum: '',
        editFlag: false,
      });
      // this.setShippingDetails();
    },
    /**
     * setPartyGst()
     *
     * Description: Sets the party GSTIN field, based on the state chosen
     */
    setPartyGst() {
      /**
       * form.party.options = {'stateid': 'gstin', 'stateid2': 'gstin2}
       */
      if (this.form.options.gstin && this.form.state) {
        this.form.gstin = this.form.options.gstin[this.form.state.id] || null;
        if (this.form.gstin) {
          this.form.checksum = this.form.gstin.substr(12, 3);
        }
      }
    },
    /**
     * fetchCustomerData(id)
     *
     * Description: Fetch customer/supplier data, for 'Billed To/By' section
     */
    fetchCustomerData(id) {
      if (id !== null) {
        let self = this;
        axios
          .get(`/customersupplier?qty=single&custid=${id}`)
          .then((resp) => {
            switch (resp.data.gkstatus) {
              case 0:
                // convert [{id: name}, {id2: name}] to {id: name, id2: name}, to remove duplicates
                var stateList =
                  resp.data.gkresult.statelist.reduce((acc, item) => {
                    acc[Object.keys(item)[0]] = Object.values(item)[0];
                    return acc;
                  }, {}) || {};
                // convert it back to array format for <b-form-select> options
                var states = Object.keys(stateList).map((key) => {
                  return {
                    text: stateList[key],
                    value: { id: key, name: stateList[key] },
                  };
                });
                Object.assign(self.form, {
                  addr: resp.data.gkresult.custaddr,
                  options: {
                    states,
                    gstin: resp.data.gkresult.gstin,
                  },
                  state: states[0].value,
                  pan: resp.data.gkresult.custpan,
                  checksum: '',
                  pin: resp.data.gkresult.pincode,
                  gstin: '',
                  tin: resp.data.gkresult.custtan || null,
                });
                setTimeout(() => {
                  self.setPartyGst(); // set gstin based on state
                });

                break;
              case 2:
                self.resetPartyDetails(); // if there no data, then reset the fields
                this.displayToast(
                  'Fetch Customer/Supplier Data Error!',
                  'Unauthorized Access, Please contact Admin',
                  'warning'
                );
                break;
              case 3:
              default:
                self.resetPartyDetails(); // if there no data, then reset the fields
                this.displayToast(
                  'Fetch Customer/Supplier Data Error!',
                  'Unable to Fetch Customer/Supplier Data, Please try again',
                  'danger'
                );
            }
            // debugger;
            // self.setShippingDetails(); // updates shipping details as well if flag is set
            setTimeout(() => this.$emit('details-updated', this.form));
          })
          .catch((error) => {
            this.displayToast(
              'Fetch Customer/Supplier Data Error!',
              error.message,
              'warning'
            );
          });
      }
    },
    /**
     * onPartyNameSelect(name)
     *
     * Description -> Updates the BilledTo and Shipping Details based on the Customer/Supplier chosen.
     * Here party is the Customer/Supplier
     *
     * argument -> name: {id , name}
     */
    onPartyNameSelect(name) {
      if (name) {
        if (name.id) {
          this.fetchCustomerData(name.id);
          return;
        }
      }

      // if the name is invalid, empty the BilledTo & Shipping Details if it exists
      if (this.form.addr || this.form.options.states.length) {
        Object.assign(this.form, {
          options: {
            states: [],
            gstin: [],
          },
          addr: null,
          state: {},
          gstin: null,
          tin: null,
          pin: null,
        });
        // this.setShippingDetails();
        setTimeout(() => this.$emit('details-updated', this.form));
      }
    },
    resetForm() {
      this.form = {
        name: null,
        address: null,
        state: '',
        contactNumber: null,
        contactPerson: null,
      };
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
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get('/state').catch((error) => {
          this.displayToast(
            'Fetch State Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        this.fetchContactList(),
      ];

      const self = this;
      return Promise.all([...requests]).then(([resp1, resp2]) => {
        self.isPreloading = false;
        if (resp1.data.gkstatus === 0) {
          self.options.states = resp1.data.gkresult.map((item) => {
            return {
              text: Object.values(item)[0],
              value: {
                id: Object.keys(item)[0],
                name: Object.values(item)[0],
              },
            };
          });
        }
      });
    },
    fetchContactList() {
      const requests = [
        axios.get('/customersupplier?qty=custall').catch((error) => {
          this.displayToast(
            'Fetch Customer Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get('/customersupplier?qty=supall').catch((error) => {
          this.displayToast(
            'Fetch Supplier Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      let self = this;
      return Promise.all([...requests])
        .then(([resp1, resp2]) => {
          // debugger;
          // === Customer List ===
          if (resp1.status === 200) {
            if (resp1.data.gkstatus === 0) {
              resp1.data.gkresult.sort((a, b) => a.custid - b.custid); // sorting items based on custid, to display in the order of creation
              self.options.customers = resp1.data.gkresult.map((item) => {
                return {
                  text: item.custname,
                  value: {
                    id: item.custid,
                    name: item.custname,
                  },
                };
              });
            } else {
              // Customer List not loaded
            }
          }

          // === Supplier List ===
          if (resp2.status === 200) {
            if (resp2.data.gkstatus === 0) {
              resp2.data.gkresult.sort((a, b) => a.custid - b.custid); // sorting items based on custid, to display in the order of creation
              self.options.suppliers = resp2.data.gkresult.map((item) => {
                return {
                  text: item.custname,
                  value: {
                    id: item.custid,
                    name: item.custname,
                  },
                };
              });
            } else {
              // Supplier list not loaded
            }
          }

          // If coming from Contact's page, autofill invoice party details from store
          if (self.invoiceParty.id !== null) {
            // self.form.inv.type =
            //   self.invoiceParty.type === 'customer' ? 'sale' : 'purchase';
            Object.assign(self.form, {
              type: self.invoiceParty.type,
              name: {
                id: self.invoiceParty.id,
                name: self.invoiceParty.name,
              },
            });
          }
        })
        .catch((error) => {
          this.displayToast(
            'Fetch Customer/Supplier Data Failed!',
            error.message,
            'danger'
          );
          return error;
        });
    },
    onContactSave() {
      this.showContactForm = false;
      this.fetchContactList().then(() => {
        if (this.options.customers.length) {
          this.form.name =
            this.form.type === 'customer'
              ? this.options.customers[this.options.customers.length - 1].value
              : this.options.suppliers[this.options.suppliers.length - 1].value;
        }
      });
    },
    initPartyEdit() {
      // debugger;
      this.editFlag = true;
      this.editMode = {
        addr: this.form.addr,
        state: this.form.state,
        gstin: this.form.gstin,
        pin: this.form.pin,
      };
    },
    onPartyEdit(edited) {
      if (edited) {
        this.form.loading = true;
        let payload = {
          csflag: this.form.type === 'customer' ? 3 : 19,
          custaddr: this.form.addr,
          custid: this.form.name.id,
          custname: this.form.name.name,
          pincode: this.form.pin,
          state: this.form.state.name,
          custpan: this.form.pan,
        };
        if (this.form.pan.length === 10 && this.form.checksum.length === 3) {
          payload.gstin = {};
          payload.gstin[
            this.form.state.id
          ] = `${this.form.state.id}${this.form.pan}${this.form.checksum}`;
        }
        axios.put('customersupplier', payload).then(() => {
          this.form.loading = false;
          this.onPartyNameSelect(this.form.name);
        });
      } else {
        this.form.addr = this.editMode.addr;
        this.form.state = this.editMode.state;
        this.form.gstin = this.editMode.gstin;
        this.form.pin = this.editMode.pin;
      }
      this.editFlag = false;
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>

