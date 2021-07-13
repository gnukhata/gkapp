<!-- ToDo
    Add free qty field
    Make the table fixed height
    Print screen
    Display transaction in print screen
    Add discount percent
    Add check conditions for the dates used in the form
 -->
<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <div class="text-center">
      <span class="d-inline-block">
        <b-form-select
          @change="initForm()"
          v-model="formMode"
          plain
          class="border-0 p-2 text-dark"
          :style="{ 'font-size': '1.5em' }"
        >
          <b-form-select-option value="create"
            >Create Invoice</b-form-select-option
          >
          <b-form-select-option value="edit">Edit Invoice</b-form-select-option>
        </b-form-select>
      </span>
    </div>
    <hr class="mb-2 mt-0" />
    <div class="mb-2">
      <b-form-radio-group
        v-model="form.type"
        v-if="config.type"
        button-variant="outline-secondary"
        size="sm"
        buttons
        class="mx-1"
      >
        <b-form-radio value="sale">Sale</b-form-radio>
        <b-form-radio value="purchase">Purchase</b-form-radio>
      </b-form-radio-group>
      <span
        id="edit-invoice-list"
        class="d-inline-block"
        v-if="formMode === 'edit'"
      >
        <b-form-select
          size="sm"
          v-model="invoiceId"
          :options="options.editableInvoices[form.type]"
          @change="initForm()"
        ></b-form-select>
      </span>
      <span class="float-right">
        <config
          title="Invoice Page Configuration"
          getDefault="getDefaultInvoiceConfig"
          setCustom="updateInvoiceConfig"
          getCustom="getCustomInvoiceConfig"
        >
        </config>
      </span>
      <div class="clearfix"></div>
    </div>
    <b-form @submit.prevent="onSubmit">
      <b-card-group class="d-block d-md-flex my-2" deck>
        <!-- Buyer/Seller Details -->
        <party-details
          :mode="form.type"
          :parentData="form.party"
          :gstFlag="isGst"
          :invoiceParty="invoiceParty"
          :config="config.party"
          :saleFlag="isSale"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.party"
          ref="party"
        >
        </party-details>
        <!-- Invoice Details -->
        <invoice-details
          :config="config.inv"
          :saleFlag="isSale"
          :parentData="form.inv"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.inv"
          ref="inv"
        ></invoice-details>
        <!-- Shipping Details -->
        <ship-details
          :states="options.states"
          :gstFlag="isGst"
          :saleFlag="isSale"
          :billingDetails="form.party"
          :organisationDetails="options.orgDetails"
          :updateCounter="updateCounter.ship"
          :config="config.ship"
          ref="ship"
        >
        </ship-details>
      </b-card-group>
      <div class="my-2" v-if="config.taxType">
        <b-form-radio-group
          button-variant="outline-secondary"
          size="sm"
          buttons
          v-model="form.taxType"
        >
          <b-form-radio value="gst">GST</b-form-radio>
          <b-form-radio value="vat">VAT</b-form-radio>
        </b-form-radio-group>
      </div>
      <!-- Bill Table -->
      <bill-table
        :gstFlag="isGst"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :updateCounter="updateCounter.bill"
        :parentData="form.bill"
        :cgstFlag="isCgst"
        ref="bill"
        :godownId="goid"
      ></bill-table>
      <div class="px-2">
        <!-- b-row has to be enclosed in a container tag with padding
         atleast 2, to avoid creating an offset to the right -->
        <b-row class="mt-5" v-if="config.total">
          <b-col cols="12" lg="6"> </b-col>
          <b-col cols="12" lg="6">
            <total-table
              :config="config.total"
              :gstFlag="isGst"
              :billData="form.bill"
              :updateCounter="updateCounter.totalTable"
              :cgstFlag="isCgst"
              ref="totalTable"
            ></total-table>
          </b-col>
        </b-row>
      </div>
      <b-card-group class="d-block d-md-flex" deck>
        <!-- Payment Details -->
        <payment-details
          ref="payment"
          :updateCounter="updateCounter.payment"
          :config="config.payment"
          :saleFlag="isSale"
          :optionsData="{
            payModes: options.payModes,
          }"
        ></payment-details>
        <!-- Transport Details -->
        <transport-details
          ref="transport"
          :config="config.transport"
          :updateCounter="updateCounter.transport"
          :parentData="form.transport"
          :invDate="form.inv.date"
          @details-updated="onComponentDataUpdate"
        ></transport-details>
        <!-- Invoice Comments -->
        <comments
          ref="narration"
          :config="config.comments"
          :updateCounter="updateCounter.comments"
          :parentData="form.comments"
        ></comments>
      </b-card-group>
      <b-tooltip
        target="inv-submit"
        :show="showErrorToolTip"
        placement="top"
        triggers="manual"
      >
        Date must be within the Financial Year, from <b>{{ yearStart }}</b> to
        <b>{{ yearEnd }}</b>
      </b-tooltip>
      <hr />
      <div class="float-right">
        <b-button
          class="m-1"
          size="sm"
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
          class="m-1"
          size="sm"
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
        <b-button
          id="inv-submit"
          :disabled="isInvDateValid === false"
          type="submit"
          size="sm"
          class="m-1"
          variant="success"
        >
          <span v-if="formMode === 'create'">
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Create</span>
          </span>

          <span v-else>
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              icon="cloud-arrow-up"
            ></b-icon>
            <span class="align-middle"> Save Changes</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix"></div>
    </b-form>
    <print-page
      :show="showPrintModal"
      name="Invoice"
      title="Invoice"
      :id="invoiceId"
      :pdata="{}"
    >
    </print-page>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

import PartyDetails from '../../components/form/transaction/PartyDetails.vue';
import ShipDetails from '../../components/form/transaction/ShipDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import PaymentDetails from '../../components/form/transaction/PaymentDetails.vue';
import InvoiceDetails from '../../components/form/transaction_details/InvoiceDetails.vue';

import PrintPage from '../../components/workflow/PrintPage.vue';

import Config from '../../components/Config.vue';

import invoiceConfig from '../../js/config/transaction/invoiceConfig';

export default {
  name: 'Invoice',
  components: {
    Config,

    PartyDetails,
    InvoiceDetails,
    ShipDetails,
    BillTable,
    TotalTable,
    PaymentDetails,
    TransportDetails,
    Comments,

    PrintPage,
  },
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
    invid: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      // config: {},
      showPrintModal: false,
      vuexNameSpace: '',
      formMode: '',
      invoiceId: 0,
      goid: -1,
      updateCounter: {
        party: 0,
        ship: 0,
        bill: 0,
        totalTable: 0,
        payment: 0,
        transport: 0,
        comments: 0,
        inv: 0,
      },
      form: {
        type: 'sale', // purchase
        inv: {},
        party: {},
        ship: {},
        taxType: 'gst', // vat
        bill: [],
        payment: {},
        transport: {},
        total: {},
        narration: null,
        totalRoundFlag: false,
      },
      isLoading: false,
      isPreloading: false,
      showContactForm: false,
      showBusinessForm: false,
      temp: null,
      options: {
        customers: [],
        suppliers: [],
        products: [],
        services: [],
        states: [],
        payModes: [
          { text: '-- Payment Mode --', value: null },
          { text: 'Cash', value: 3 },
          { text: 'Bank', value: 2 },
          { text: 'On Credit', value: 15 },
        ],
        transportModes: [
          { text: '-- Transport Mode --', value: null },
          'Road',
          'Rail',
          'Air',
          'Ship',
          'Other',
        ],
        orgDetails: {},
        bill: [],
        editableInvoices: {
          purchase: [],
          sale: [],
        },
      },
      isCollapsed: {
        billedTo: false,
        invoice: false,
        shipping: false,
        payment: false,
        transport: false,
        comments: false,
      },
      editFlag: null, // A flag used to skip fetchProductDetails() method call,
      // when the bill table is populated when the page loads in edit mode
    };
  },
  computed: {
    // config : Gets the custom config from the invoiceConfig Vuex module and
    //          prepares it for use by adding some custom additions to it (that should not be user editable)
    config: (self) => {
      let newConf =
        self.$store.getters[`${self.vuexNameSpace}/getCustomInvoiceConfig`];
      if (newConf) {
        newConf.bill.footer.headingColspan =
          !!newConf.bill.index +
            !!newConf.bill.product +
            !!newConf.bill.hsn +
            !!newConf.bill.qty +
            !!newConf.bill.rate || 1;

        if (newConf.inv.class) {
          newConf.inv.class = {
            'mr-md-1': !!newConf.ship,
            'ml-md-1': !!newConf.party,
          };
        }
        if (newConf.ship.class) {
          newConf.ship.class = {
            'ml-md-1': !!(newConf.inv || newConf.party),
          };
        }
        if (newConf.party.class) {
          newConf.party.class = {
            'mr-md-1': !!(newConf.inv || newConf.ship),
          };
        }

        if (newConf.payment.class) {
          newConf.payment.class = {
            'mr-md-1': !!(newConf.transport || newConf.comments),
          };
        }

        if (newConf.transport.class) {
          newConf.transport.class = {
            'mr-md-1': !!newConf.comments,
            'ml-md-1': !!newConf.payment,
          };
        }

        if (newConf.comments.class) {
          newConf.comments.class = {
            'ml-md-1': !!(newConf.transport || newConf.payment),
          };
        }
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
          inv: {
            class: {},
          },
          party: {
            class: {},
          },
          ship: {
            class: {},
          },
          taxType: true,
          bill: {
            footer: {
              headingColspan: 1,
            },
          },
          payment: {
            bank: {},
            class: {},
          },
          transport: {
            class: {},
          },
          comments: {
            class: {},
          },
          total: {},
        };
      }

      return newConf;
    },
    defaultConfig: (self) =>
      self.$store.getters[`${self.vuexNameSpace}/getDefaultInvoiceConfig`],
    billLength: (self) => self.form.bill.length,
    height: () =>
      window.innerHeight -
      document.getElementById('app-header').offsetHeight -
      30,
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    isSale: (self) => self.form.type === 'sale',
    isGst: (self) => self.form.taxType === 'gst',
    isCgst: (self) => {
      if (self.form.inv.state && self.form.party.state) {
        if (self.form.inv.state.name === self.form.party.state.name) {
          return true;
        }
      }
      return false;
    },
    useBillAddress: {
      get: function () {
        return this.form.ship.copyFlag;
      },
      set: function (flag) {
        this.form.ship.copyFlag = !!flag;
        this.setShippingDetails();
      },
    },
    minDate: (self) => new Date(self.yearStart),
    maxDate: (self) => new Date(self.yearEnd),
    isInvDateValid: (self) => {
      let currDate = new Date(self.form.inv.date).getTime(),
        minDate = self.minDate.getTime(),
        maxDate = self.maxDate.getTime();
      return !isNaN(currDate)
        ? currDate >= minDate && currDate <= maxDate
        : null;
    },
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'invoiceParty']),
  },
  methods: {
    collectComponentData() {
      Object.assign(this.form.inv, this.$refs.inv.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.ship, this.$refs.ship.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.payment, this.$refs.payment.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      Object.assign(this.form.transport, this.$refs.transport.form);
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData() {
      this.updateCounter.party++;
      this.updateCounter.inv++;
      this.updateCounter.ship++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.payment++;
      this.updateCounter.transport++;
      this.updateCounter.comments++;
    },
    onComponentDataUpdate(payload) {
      switch (payload.name) {
        case 'invoice-details':
          {
            if (payload.data.delNote !== this.form.inv.delNote) {
              this.fetchDelNoteData(payload.data.delNote);
            }
            Object.assign(this.form.inv, payload.data);
            this.form.transport.date = this.form.inv.date;
            const self = this;
            setTimeout(function () {
              self.updateCounter.transport++;
            });
          }
          break;
        case 'party-details':
          Object.assign(this.form.party, payload.data);
          this.updateCounter.ship++;
          break;
        case 'bill-table':
          Object.assign(this.form.bill, payload.data);
          this.updateCounter.totalTable++;
          break;
        case 'transport-details':
          Object.assign(this.form.transport, payload.data);
          break;
      }
    },
    fetchDelNoteData(dcid) {
      if (!dcid) return;
      this.isPreloading = true;
      let self = this;
      axios
        .get(`/delchal?delchal=single&dcid=${dcid}`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            const data = resp.data.gkresult,
              dcdata = resp.data.gkresult.delchaldata;
            // console.log(resp.data);
            let invState =
              dcdata.inoutflag === 15 // if sale inv state will be source else it will destination
                ? self.options.states.find(
                    (state) => state.text === data.sourcestate
                  )
                : self.options.states.find(
                    (state) => state.text === data.destinationstate
                  );
            // set invoice details
            self.form.type = dcdata.inoutflag === 15 ? 'sale' : 'purchase';
            Object.assign(self.form.inv, {
              state: invState ? invState.value : {},
              issuer: dcdata.issuername,
              role: dcdata.designation,
            });

            self.goid = dcdata.goid;
            self.form.ship.copyFlag =
              dcdata.consignee.consigneename === data.custSupDetails.custname &&
              dcdata.consignee.consigneeaddress ===
                data.custSupDetails.custaddr;

            self.form.taxType = dcdata.taxflag === 7 ? 'gst' : 'vat';
            self.form.transport = {
              mode: dcdata.modeoftransport,
              vno: dcdata.vehicleno,
              date: data.dateofsupply,
            };
            self.form.total.roundFlag = !!dcdata.roundoffflag;

            self.form.party.type =
              data.custSupDetails.csflag === 3 ? 'customer' : 'supplier';
            self.$nextTick().then(() => {
              self.form.party.name = data.custSupDetails.custname;

              // set shipping details
              if (!self.form.ship.copyFlag) {
                let ship = dcdata.consignee;
                if (ship) {
                  Object.assign(self.form.ship, {
                    name: ship.consigneename,
                    addr: ship.consigneeaddress,
                    state: {
                      name: ship.consigneestate,
                      id: ship.consigneestatecode,
                    },
                    gstin: ship.gstinconsignee,
                    tin: ship.tinconsignee,
                    pin: ship.consigneepincode,
                  });
                }
              }
              self.updateComponentData();
              self.isPreloading = false;
            });

            // set bill items
            self.form.bill = [];
            for (const itemCode in data.delchalContents) {
              let item = data.delchalContents[itemCode];
              let billItem = {
                product: item.proddesc,
                discount: { amount: parseFloat(item.discount) },
                qty: parseFloat(item.qty),
                fqty: item.freeqty,
                rate: parseFloat(item.priceperunit),
                isService: false,
                igst: { rate: 0 },
                cgst: { rate: 0 },
                sgst: { rate: 0 },
                cess: { rate: 0 },
                vat: { rate: 0 },
              };
              self.form.bill.push(billItem);
            }

            self.updateComponentData();
          }
        })
        .catch((error) => {
          this.displayToast(
            `Fetch Delivery Note data Error!`,
            error.message,
            'warning'
          );
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
        axios.get(`/organisation`).catch((error) => {
          this.displayToast(
            'Fetch Organisation Profile Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      const self = this;
      return Promise.all([...requests]).then(([resp1, resp6]) => {
        self.isPreloading = false;
        let preloadErrorList = ''; // To handle the unloaded data, at once than individually

        /**
         * The data obtained are updated, to be comptaible with the
         * component they are used with (<b-form-select>)
         * and based on requirement
         */

        // === State List ===
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
        } else {
          preloadErrorList += ' States,';
        }

        if (resp6.data.gkstatus === 0) {
          let orgState = resp6.data.gkdata.orgstate;
          let state = self.options.states.find(
            (state) => state.text === orgState
          );
          let stateCode = state ? state.value.id : null;
          self.options.orgDetails = {
            name: resp6.data.gkdata.orgname,
            addr: resp6.data.gkdata.orgaddr,
            state: state.value,
            gstin: stateCode !== null ? resp6.data.gkdata.gstin[stateCode] : '',
            tin: '',
            pin: resp6.data.gkdata.orgpincode,
          };
          setTimeout(() => {
            self.setOrgDetails();
          }, 1);
        }

        if (preloadErrorList !== '') {
          this.displayToast(
            'Error: Unable to Preload Data',
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            'danger'
          );
        }
      });
    },
    fetchUserData() {
      let self = this;
      return axios
        .get(`/users?user=single`)
        .then((resp) => {
          // === User name and role ===
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              self.form.inv.issuer = resp.data.gkresult.username;
              self.form.inv.role = resp.data.gkresult.userroleName;
            } else {
              // User data not available, check again
            }
          } else {
            // User data not available, check again
          }
        })
        .catch((error) => {
          this.displayToast('Fetch User Data Failed!', error.message, 'danger');
          return error;
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
            self.form.type =
              self.invoiceParty.type === 'customer' ? 'sale' : 'purchase';
            Object.assign(self.form.party, {
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

    fetchInvoiceData() {
      this.isPreloading = true;
      let self = this;
      axios
        .get(`/invoice?inv=single&invid=${this.invoiceId}`)
        .then((resp) => {
          self.isPreloading = false;
          if (resp.data.gkstatus === 0) {
            let data = resp.data.gkresult;
            // console.log(resp.data);
            let invState =
              data.inoutflag === 15 // if sale inv state will be source else it will destination
                ? self.options.states.find(
                    (state) => state.text === data.sourcestate
                  )
                : self.options.states.find(
                    (state) => state.text === data.destinationstate
                  );
            // set invoice details
            self.form.type = data.inoutflag === 15 ? 'sale' : 'purchase';
            self.form.inv = {
              no: data.invoiceno,
              date: data.invoicedate.split('-').reverse().join('-'),
              delNote: null, /////////////////////////
              ebn: data.ewaybillno || null,
              addr: data.address,
              pin: data.pincode,
              state: invState ? invState.value : {},
              issuer: data.issuername,
              role: data.designation,
            };

            self.form.ship.copyFlag =
              data.consignee.consigneename === data.custSupDetails.custname &&
              data.consignee.consigneeaddress === data.custSupDetails.custaddr;

            self.form.taxType = data.taxflag === 7 ? 'gst' : 'vat';
            self.form.payment.mode = data.paymentmode;
            self.form.transport = {
              mode: data.transportationmode,
              vno: data.vehicleno,
              date: data.dateofsupply,
              reverseCharge: data.reversecharge,
            };
            self.form.narration = data.narration;
            self.form.total.roundFlag = !!data.roundoff;

            if (data.bankdetails) {
              self.form.payment.bank = {
                no: data.bankdetails.accountno,
                name: data.bankdetails.bankname,
                branch: data.bankdetails.branch,
                ifsc: data.bankdetails.ifsc,
              };
            }

            self.form.party.type =
              data.custSupDetails.csflag === 3 ? 'customer' : 'supplier';
            self.$nextTick().then(() => {
              self.form.party.name = data.custSupDetails.custname;

              // set shipping details
              if (!self.form.ship.copyFlag) {
                let ship = data.consignee;
                Object.assign(self.form.ship, {
                  name: ship.consigneename,
                  addr: ship.consigneeaddress,
                  state: {
                    name: ship.consigneestate,
                    id: ship.consigneestatecode,
                  },
                  gstin: ship.gstinconsignee,
                  tin: ship.tinconsignee,
                  pin: ship.consigneepincode,
                });
              }
              self.updateComponentData();
            });

            // debugger;
            this.$nextTick().then(() => {});

            // set bill items
            self.form.bill = [];
            for (const itemCode in data.invcontents) {
              let item = data.invcontents[itemCode];
              let billItem = {
                product: item.proddesc,
                discount: { amount: parseFloat(item.discount) },
                qty: parseFloat(item.qty),
                fqty: item.freeqty,
                rate: parseFloat(item.priceperunit),
                isService: item.gsflag === 19,
                igst: { rate: 0 },
                cgst: { rate: 0 },
                sgst: { rate: 0 },
                cess: { rate: 0 },
                vat: { rate: 0 },
              };
              if (billItem.isService) {
                billItem.qty = 1;
              }
              self.form.bill.push(billItem);
            }

            self.updateComponentData();
          }
        })
        .catch((error) => {
          this.displayToast(
            'Fetch Invoice ${this.invid} data Error!',
            error.message,
            'warning'
          );
        });
    },
    onSubmit() {
      let self = this;
      this.isLoading = true;

      const payload = this.initPayload();
      console.log(payload);
      const method = this.formMode === 'create' ? 'post' : 'put';
      const actionText = this.formMode === 'create' ? 'Create' : 'Edit';
      axios({ method: method, url: '/invoice', data: payload })
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
              case 0:
                // success
                this.invoiceId = resp.data.gkresult;
                this.showPrintModal = true;
                this.displayToast(
                  `${actionText} Invoice Successfull!`,
                  `Invoice saved with entry no. ${
                    resp.data.invoiceid ||
                    resp.data.gkresult ||
                    resp.data.vchData.vchno
                  }`,
                  'success'
                );
                if (this.formMode === 'create') {
                  this.resetForm();
                }
                break;
              case 1:
                // Duplicate entry
                this.displayToast(
                  `${actionText} Invoice Failed!`,
                  'Duplicate Entry, Check Invoice Id',
                  'warning'
                );
                break;
              case 2:
                // Unauthorized access
                this.displayToast(
                  `${actionText} Invoice Failed!`,
                  'Unauthorized Access, Contact Admin',
                  'warning'
                );
                break;
              case 3:
                // Connection failed, Check inputs and try again
                this.displayToast(
                  `${actionText} Invoice Failed!`,
                  'Please check your input and try again later',
                  'danger'
                );
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            `${actionText} Invoice Error!`,
            error.message,
            'warning'
          );
        });
    },
    initPayload() {
      this.collectComponentData();
      let invoice = {
        invoiceno: this.form.inv.no,
        ewaybillno: this.form.inv.ebn,
        invoicedate: this.form.inv.date,
        sourcestate: this.form.inv.state.name || null,
        orgstategstin: null,
        issuername: this.form.inv.issuer,
        designation: this.form.inv.role,
        address: this.form.inv.addr,
        pincode: this.form.inv.pin,

        custid: this.form.party.name.id || '',
        consignee: {},

        roundoffflag: this.form.total.roundFlag ? 1 : 0,
        // invtotal: this.getTotal('total'),
        // invtotalword: null,

        taxflag: null,
        taxstate: null,

        pricedetails: [],

        paymentmode: this.form.payment.mode,

        transportationmode: this.form.transport.mode,
        reversecharge: this.form.transport.reverseCharge ? 1 : 0,

        discflag: 1,
        invnarration: this.form.narration,
      };

      // === Delivery Note ===
      if (this.form.inv.delNote) {
        invoice.dcid = this.form.inv.delNote;
      }

      // === Sale / Purchase related data ===
      if (this.isSale) {
        invoice.sourcestate = this.form.inv.state.name || null;
        invoice.taxstate = this.form.party.state.name || null;
        invoice.inoutflag = 15; // sale
      } else {
        invoice.sourcestate = this.form.party.state.name || null;
        invoice.taxstate = this.form.inv.state.name || null;
        invoice.inoutflag = 9; // purchase
        delete invoice.ewaybillno;
      }

      // === GST/ VAT related data ===
      if (this.isGst) {
        invoice.taxflag = 7;
      } else {
        invoice.taxflag = 22;
      }

      // === Total Invoice price data ===
      invoice.invoicetotal = this.form.total.amount;
      invoice.invoicetotalword = this.form.total.text;

      // === Consignee data ===
      if (this.form.ship.name) {
        invoice.consignee = {
          consigneename: this.form.ship.name || '',
          tinconsignee: this.form.ship.tin || '',
          gstinconsignee: this.form.ship.gstin || '',
          consigneeaddress: this.form.ship.addr || '',
          consigneestate: this.form.ship.state.name || null,
          consigneestatecode: this.form.ship.state.id || null,
          consigneepincode: this.form.ship.pin || '',
        };
      }

      // === Bill data ===
      let contents = {};
      let stock = { items: {}, inout: invoice.inoutflag };
      let pricedetails = [];
      let tax = {};
      let cess = {};
      let av = {
        product: {},
        prodData: {},
        taxpayment: 0,
        totaltaxable: 0,
      };
      let freeqty = {};
      let discount = {};
      this.form.bill.forEach((item) => {
        let taxable = item.total * item.qty - item.discount.amount;

        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][item.rate] = parseFloat(item.qty).toFixed(2);
        stock.items[item.product.id] = parseFloat(item.qty).toFixed(2);

        if (this.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
          av.avtax = {
            GSTName: this.isCgst ? 'CGST' : 'IGST',
            CESSName: 'CESS',
          };
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
          av.taxpayment += taxable;
        }

        freeqty[item.product.id] = parseFloat(item.fqty).toFixed(2) || 0;
        discount[item.product.id] = parseFloat(item.discount.amount).toFixed(2);

        av.product[item.product.name] = parseFloat(taxable).toFixed(2);
        av.prodData[item.product.id] = parseFloat(taxable).toFixed(2);
        av.totaltaxable += taxable;

        pricedetails.push({
          custid: this.form.party.name.id || '',
          productcode: item.product.id,
          inoutflag: invoice.inoutflag,
          lastprice: item.rate,
        });
      });

      av.taxpayment = parseFloat(av.taxpayment).toFixed(2);
      av.totaltaxable = parseFloat(av.totaltaxable).toFixed(2);

      Object.assign(invoice, {
        contents,
        pricedetails,
        tax,
        cess,
        av,
        freeqty,
        discount,
      });

      // === payment details, mode = 2 ===
      if (this.form.payment.mode === 2) {
        invoice.bankdetails = {
          accountno: this.form.payment.bank.no,
          bankname: this.form.payment.bank.name,
          ifsc: this.form.payment.bank.ifsc,
          branch: this.form.payment.bank.branch,
        };
      }

      if (this.form.transport.mode === 'Road') {
        invoice.vehicleno = this.form.transport.vno;
      }

      if (this.form.transport.date) {
        invoice.dateofsupply = this.form.transport.date;
      }

      if (this.formMode === 'edit') {
        const av = Object.assign({}, invoice.av);
        invoice.invid = parseInt(this.invoiceId);

        delete invoice.av;
        delete invoice.pincode;
        delete invoice.discflag;

        return { invoice, stock, av };
      }

      // console.log({ invoice, stock });
      return { invoice, stock };
    },
    resetForm() {
      this.form = {
        type: 'sale', // purchase
        inv: {},
        party: {
          name: false,
        },
        ship: {},
        taxType: 'gst', // vat
        bill: [
          {
            product: { name: '', id: '' },
          },
        ],
        payment: {
          mode: 3,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        },
        transport: {
          mode: 'Road',
          vno: null,
          date: null,
          reverseCharge: false,
        },
        narration: null,
        total: {},
      };

      this.setOrgDetails();
      this.updateComponentData();
    },
    setOrgDetails() {
      if (this.options.orgDetails !== null) {
        if (this.options.orgDetails.orgname) {
          Object.assign(this.form.inv, {
            addr: this.options.orgDetails.addr,
            pin: this.options.orgDetails.pin,
            state: this.options.orgDetails.state
              ? this.options.orgDetails.state.value
              : null,
          });
        }
      }
    },

    initPartyEdit() {
      this.form.party.editFlag = true;
      this.form.party.editMode = {
        addr: this.form.party.addr,
        state: this.form.party.state,
        gstin: this.form.party.gstin,
        pin: this.form.party.pin,
      };
    },
    fetchEditableInvoices() {
      const self = this;
      const requests = [
        axios.get(`/invoice?type=rectifyinvlist&invtype=15`),
        axios.get(`/invoice?type=rectifyinvlist&invtype=9`),
      ];

      Promise.all([...requests]).then(([resp1, resp2]) => {
        if (resp1.data.gkstatus === 0) {
          self.options.editableInvoices['sale'] = resp1.data.invoices.map(
            (inv) => {
              return {
                text: `${inv.invoiceno}, ${inv.invoicedate}, ${inv.custname}`,
                value: inv.invid,
              };
            }
          );
        }

        if (resp2.data.gkstatus === 0) {
          self.options.editableInvoices['purchase'] = resp2.data.invoices.map(
            (inv) => {
              return {
                text: `${inv.invoiceno}, ${inv.invoicedate}, ${inv.custname}`,
                value: inv.invid,
              };
            }
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
    initForm() {
      let self = this;
      this.resetForm();
      this.preloadData().then(() => {
        self.fetchEditableInvoices();
        self.$nextTick().then(() => {
          if (self.formMode === 'edit') {
            self.fetchInvoiceData();
          }
        });
      });
    },
  },
  beforeMount() {
    this.vuexNameSpace = 'invoiceConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, invoiceConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initInvoiceConfig`);
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future
    this.formMode = this.mode;
    this.invoiceId = parseInt(this.invid);
    this.initForm();
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>

<style scoped>
@media only screen and (max-width: 450px) {
  #edit-invoice-list {
    max-width: 150px;
  }
}
</style>