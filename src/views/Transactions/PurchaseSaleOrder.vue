<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <b-form @submit.prevent="confirmOnSubmit">
      <div class="text-center pt-2">
        <h4 v-if="isSale" v-translate>Create Sale Order</h4>
        <h4 v-else v-translate>Create Purchase Order</h4>
      </div>
      <hr />
      <div class="mb-2">
        <b-form-radio-group
          v-model="form.type"
          button-variant="outline-secondary"
          size="sm"
          buttons
          class="mx-1"
          @input="updateConfig"
        >
          <b-form-radio value="sale">
            <translate> Sale </translate>
          </b-form-radio>
          <b-form-radio value="purchase">
            <translate> Purchase </translate>
          </b-form-radio>
        </b-form-radio-group>
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
        <!-- Purchase Sale Order Details -->
        <ps-order-details
          :config="config.psOrder"
          :saleFlag="isSale"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.psOrder"
          ref="psOrder"
        ></ps-order-details>
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
        :invDate="form.psOrder.date"
        :saleFlag="isSale"
        :blockEmptyStock="isSale"
        :gstFlag="isGst"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :updateCounter="updateCounter.bill"
        :parentData="form.bill"
        :cgstFlag="isCgst"
        :godownId="goid"
        :vatFlag="!!form.taxType"
        ref="bill"
      ></bill-table>
      <div class="px-2">
        <!-- b-row has to be enclosed in a container tag with padding
         atleast 2, to avoid creating an offset to the right -->
        <b-row class="mt-5" v-if="config.total">
          <b-col cols="12" lg="6" order-lg="1" order="2"> </b-col>
          <b-col cols="12" lg="6" order-lg="2" order="1">
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
          :parentData="form.payment"
          :config="config.payment"
          :saleFlag="isSale"
          :optionsData="{
            payModes: [
              { text: '-- Payment Mode --', value: null },
              { text: 'Cash', value: 3 },
              { text: 'Bank', value: 2 },
            ],
          }"
        ></payment-details>
        <!-- Transport Details -->
        <transport-details
          ref="transport"
          :config="config.transport"
          :updateCounter="updateCounter.transport"
          :parentData="form.transport"
          :invDate="form.psOrder.date"
          @details-updated="onComponentDataUpdate"
        ></transport-details>
        <!-- Invoice Comments -->
        <comments
          :name="`PurchaseSalesOrder`"
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
        <translate
          translate-comment="%{start} and %{end} are a variables, translation is not required for them. Enter them, as they are while translation."
          :translate-params="{ start: yearStart, end: yearEnd }"
        >
          Date must be within the Financial Year, from %{start} to %{end}
        </translate>
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
            class="align-middle mr-1"
            icon="arrow-left"
          ></b-icon>
          <span class="align-middle" v-translate>Back</span>
        </b-button>
        <b-button
          class="m-1"
          size="sm"
          variant="warning"
          @click.prevent="resetForm"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle mr-1"
            icon="arrow-repeat"
          ></b-icon>
          <span class="align-middle" v-translate>Reset</span>
        </b-button>
        <b-button
          id="inv-submit"
          :disabled="!isInvDateValid"
          type="submit"
          size="sm"
          class="m-1"
          variant="success"
        >
          <span>
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle mr-1"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle" v-translate>Create</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix"></div>
    </b-form>
    <print-page
      :show="showPrintModal"
      name="PurchaseSalesOrder"
      :title="isSale ? 'Sale Order' : 'Purchase Order'"
      :id="orderId"
      :pdata="{}"
      @hidden="showPrintModal = false"
    >
    </print-page>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

import Config from '../../components/Config.vue';

import PartyDetails from '../../components/form/transaction/PartyDetails.vue';
import ShipDetails from '../../components/form/transaction/ShipDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import PsOrderDetails from '../../components/form/transaction_details/PsOrderDetails.vue';
import PaymentDetails from '../../components/form/transaction/PaymentDetails.vue';

import PrintPage from '../../components/workflow/PrintPage.vue';
import psOrderConfig from '../../js/config/transaction/purchaseSalesOrder';

export default {
  name: '',
  components: {
    Config,

    PartyDetails,
    ShipDetails,
    BillTable,
    TotalTable,
    TransportDetails,
    Comments,
    PsOrderDetails,
    PaymentDetails,
    PrintPage,
  },
  data() {
    return {
      config: {
        psOrder: {
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
          footer: { total: true },
          qty: {},
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
      },
      showPrintModal: false,
      orderId: 0,
      goid: -1,
      vuexNameSpace: '',
      isLoading: false,
      isInvDateValid: false,
      updateCounter: {
        party: 0,
        psOrder: 0,
        ship: 0,
        bill: 0,
        totalTable: 0,
        transport: 0,
        comments: 0,
        payment: 0,
      },
      form: {
        type: 'sale',
        psOrder: {},
        party: {},
        ship: {},
        taxType: 'gst', // vat
        bill: [],
        transport: {},
        narration: null,
        total: {},
        payment: {},
      },
      options: {
        states: [],
        orgDetails: {},
      },
    };
  },
  computed: {
    // taxState: (self) =>
    //   self.form.inv.taxState ? self.form.inv.taxState.name : '',
    defaultPaymentMode: (self) =>
      self.$store.getters['global/getDefaultPaymentMode'],
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    isSale: (self) => self.form.type === 'sale',
    isGst: (self) => self.form.taxType === 'gst',
    isCgst: (self) => {
      if (self.form.psOrder.state && self.form.party.state) {
        if (self.form.psOrder.state.name === self.form.party.state.name) {
          return true;
        }
      }
      return false;
    },
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'invoiceParty']),
  },
  methods: {
    onComponentDataUpdate(payload) {
      switch (payload.name) {
        case 'ps-order-details':
          {
            Object.assign(this.form.psOrder, payload.data);
            this.isInvDateValid = payload.options.isDateValid;
            this.form.transport.date = this.form.psOrder.date;

            this.goid = payload.data.godown || -1;

            const self = this;
            setTimeout(function() {
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
    collectComponentData() {
      this.updateCounter.totalTable++;
      Object.assign(this.form.psOrder, this.$refs.psOrder.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.ship, this.$refs.ship.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      Object.assign(this.form.transport, this.$refs.transport.form);
      Object.assign(this.form.payment, this.$refs.payment.form);
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData() {
      this.updateCounter.party++;
      this.updateCounter.psOrder++;
      this.updateCounter.ship++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.transport++;
      this.updateCounter.comments++;
      this.updateCounter.payment++;
    },
    initPayload() {
      this.collectComponentData();
      let orderData = {
        // dcid: null, // Has to be filled when Delivery Note is implemented. If no Deliver Note is available skip this property
        orderno: this.form.psOrder.no,
        orderdate: this.form.psOrder.date,
        creditperiod: this.form.psOrder.creditPeriod,
        payterms: this.form.psOrder.terms,

        sourcestate: this.form.psOrder.state.name || null,
        orgstategstin: this.form.psOrder.gstin || null,

        csid: this.form.party.name.id || '',
        consignee: {},

        roundoffflag: this.form.total.roundFlag ? 1 : 0,

        pricedetails: [],

        paymentmode: this.form.payment.mode,

        modeoftransport: this.form.transport.mode,
        reversecharge: this.form.transport.reverseCharge ? 1 : 0,

        // === GST/ VAT related data ===
        taxflag: this.isGst ? 7 : 22,

        // === Total orderData price data ===
        purchaseordertotal: this.form.total.amount,
        pototalword: this.form.total.text,

        discflag: 1,
      };

      if (this.form.narration) orderData.psnarration = this.form.narration;
      if (this.form.psOrder.godown)
        orderData.togodown = this.form.psOrder.godown;
      if (this.form.transport.date)
        orderData.dateofsupply = this.form.transport.date;

      // === Sale / Purchase related data ===
      if (this.isSale) {
        orderData.sourcestate = this.form.psOrder.state.name || null;
        orderData.taxstate = this.form.party.state.name || null;
        orderData.psflag = 19; // sale

        orderData.issuername = this.form.psOrder.issuer;
        orderData.designation = this.form.psOrder.role;
        orderData.address = this.form.psOrder.addr;
        orderData.pincode = this.form.psOrder.pin;
      } else {
        orderData.sourcestate = this.form.party.state.name || null;
        orderData.taxstate = this.form.psOrder.state.name || null;
        orderData.psflag = 16; // purchase
      }

      // === Consignee data ===
      if (this.form.ship.name) {
        orderData.consignee = {
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
      let schedule = {};
      let tax = {};
      let cess = {};
      let freeqty = {};
      let discount = {};
      this.form.bill.forEach((item) => {
        // let taxable = item.total * item.qty - item.discount.amount;

        schedule[item.product.id] = {};
        schedule[item.product.id]['quantity'] = parseFloat(item.qty).toFixed(2);
        schedule[item.product.id]['packages'] = parseFloat(
          item.packageCount
        ).toFixed(2);
        schedule[item.product.id]['rateperunit'] = parseFloat(
          item.rate
        ).toFixed(2);

        if (this.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
        }

        freeqty[item.product.id] = isNaN(parseFloat(item.fqty))
          ? 0
          : parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.amount).toFixed(2);
      });

      Object.assign(orderData, {
        schedule,
        tax,
        cess,
        freeqty,
        discount,
      });

      // === payment details, mode = 2 ===
      if (this.form.payment.mode === 2) {
        orderData.bankdetails = {
          accountno: this.form.payment.bank.no,
          bankname: this.form.payment.bank.name,
          ifsc: this.form.payment.bank.ifsc,
          branch: this.form.payment.bank.branch,
        };
      }

      if (this.form.transport.mode === 'Road') {
        orderData.vehicleno = this.form.transport.vno;
      }

      // console.log({ invoice, stock });
      return orderData;
    },
    confirmOnSubmit() {
      Object.assign(this.form.psOrder, this.$refs.psOrder.form);
      const self = this;
      let text = `Create ${this.isSale ? 'Sale' : 'Purchase'} Order (${
        this.form.psOrder.no
      })?`;
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
      let self = this;
      this.isLoading = true;

      const payload = this.initPayload();
      // return;
      // const method = this.formMode === 'create' ? 'post' : 'put';
      const orderType = this.isSale ? 'Sale Order' : 'Purchase Order';
      axios
        .post('/purchaseorder', payload)
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
              case 0:
                {
                  // success
                  this.displayToast(
                    `Create ${orderType} Successfull!`,
                    `${orderType} was successfully created`,
                    'success'
                  );

                  let log = {
                    activity: `${orderType.toLowerCase()} created: ${
                      self.form.psOrder.no
                    }`,
                  };
                  axios.post('/log', log);
                  this.resetForm();
                  this.showPrintModal = true;
                  this.orderId = resp.data.gkresult;
                }
                break;
              case 1:
                // Duplicate entry
                this.displayToast(
                  `Create ${orderType} Failed!`,
                  this.$gettext('Duplicate Entry, Check Id'),
                  'warning'
                );
                break;
              case 2:
                // Unauthorized access
                this.displayToast(
                  `Create ${orderType} Failed!`,
                  this.$gettext('Unauthorized Access, Contact Admin'),
                  'warning'
                );
                break;
              case 3:
                // Connection failed, Check inputs and try again
                this.displayToast(
                  `Create ${orderType} Failed!`,
                  this.$gettext('Please check your input and try again later'),
                  'danger'
                );
                break;
              default:
                // Connection failed, Check inputs and try again
                this.displayToast(
                  `Create ${orderType} Failed!`,
                  this.$gettext('Please check your input and try again later'),
                  'danger'
                );
                break;
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            `Create ${orderType} Error!`,
            error.message,
            'warning'
          );
        });
    },
    resetForm() {
      this.showPrintModal = false;
      let paymentMode;
      switch (this.defaultPaymentMode) {
        case 'credit':
          {
            paymentMode = 15;
          }
          break;
        case 'bank':
          {
            paymentMode = 2;
          }
          break;
        case 'cash':
        default: {
          paymentMode = 3;
        }
      }
      let type = this.form.type;
      this.form = {
        type: type, // purchase
        total: {},
        psOrder: {
          no: null,
          date: null,
          addr: null,
          pin: null,
          state: { id: null, name: null },
          issuer: null,
          role: null,
          terms: null,
          creditPeriod: null,
          godown: null,
        },
        party: {
          type: 'customer', // supplier
          options: {
            states: [],
            gstin: [],
          },
          custid: null,
          name: { id: null, name: null },
          addr: null,
          state: { id: null, name: null },
          gstin: null,
          tin: null,
          pin: null,
          editFlag: false,
          loading: false,
        },
        ship: {
          copyFlag: true,
          name: null,
          addr: null,
          state: {},
          gstin: null,
          tin: null,
          pin: null,
        },
        taxType: 'gst', // vat
        bill: [
          {
            product: { name: '', id: '' },
            hsn: '',
            qty: 0,
            fqty: 0,
            packageCount: 0,
            rate: 0,
            discount: { rate: 0, amount: 0 },
            taxable: 0,
            igst: { rate: 0, amount: 0 },
            cess: { rate: 0, amount: 0 },
            vat: { rate: 0, amount: 0 },
            total: 0,
            isService: false, // used to make certain fields readonly
          },
        ],
        payment: {
          mode: paymentMode,
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
      };
      this.updateComponentData();
    },
    initForm() {
      this.resetForm();
    },
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get('/state').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch State Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/organisation`).catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Organisation Profile Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      const self = this;
      return Promise.all(requests).then(([resp1, resp6]) => {
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
          let gstin = resp6.data.gkdata.gstin;
          self.options.orgDetails = {
            name: resp6.data.gkdata.orgname,
            addr: resp6.data.gkdata.orgaddr,
            state: state ? state.value : null,
            gstin: stateCode && gstin ? gstin[stateCode] : '',
            tin: '',
            pin: resp6.data.gkdata.orgpincode,
            bankDetails: resp6.data.gkdata.bankdetails,
          };
          // setTimeout(() => {
          //   self.setOrgDetails();
          // }, 1);
        }

        if (preloadErrorList !== '') {
          this.displayToast(
            this.$gettext('Error: Unable to Preload Data'),
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            'danger'
          );
        }
      });
    },
    updateConfig() {
      let newConf = this.$store.getters[
        `${this.vuexNameSpace}/getCustomPSOrderConfig`
      ];
      if (newConf) {
        newConf.total.value = {
          text: this.isSale
            ? this.$gettext('Sale Order Value')
            : this.$gettext('Purchase Order Value'),
        };
        if (newConf.psOrder.class) {
          newConf.psOrder.class = {
            'mr-md-1': !!newConf.ship,
            'ml-md-1': !!newConf.party,
          };
        }
        if (newConf.ship.class) {
          newConf.ship.class = {
            'ml-md-1': !!(newConf.psOrder || newConf.party),
          };
        }
        if (newConf.party.class) {
          newConf.party.class = {
            'mr-md-1': !!(newConf.psOrder || newConf.ship),
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
            qty: {},
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

      this.config = newConf;
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
  beforeMount() {
    this.vuexNameSpace = 'psOrderConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, psOrderConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initPSOrderConfig`);
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future
    this.updateConfig();
    this.initForm();
    this.preloadData();
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>
