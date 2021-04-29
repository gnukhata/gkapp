<template>
  <b-container style="min-width: 300px" fluid class="mt-2 px-md-3 px-2">
    <b-alert :show="isInvDateValid === false" variant="danger"
      >Date must be within the Financial Year, from <b>{{ yearStart }}</b> to
      <b>{{ yearEnd }}</b>
    </b-alert>
    <div class="mb-2">
      <b-form-radio-group
        v-model="form.type"
        button-variant="outline-secondary"
        size="sm"
        buttons
        class="mx-1"
      >
        <b-form-radio value="sale">Sale</b-form-radio>
        <b-form-radio value="purchase">Purchase</b-form-radio>
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
          @details-updated="updatePartyDetails"
          :updateCounter="updateCounter.party"
          ref="party"
        >
        </party-details>
        <!-- Delivery Note Details -->
        <delivery-note-details
          :config="config.inv"
          :saleFlag="isSale"
          @details-updated="updateDelNoteDetails"
          :updateCounter="updateCounter.delNote"
          ref="delNote"
        ></delivery-note-details>
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
        :config="billTableConfig"
        @details-updated="updateBillDetails"
        :updateCounter="updateCounter.bill"
        :parentData="form.bill"
        ref="bill"
      ></bill-table>
      <total-table
        :config="config.total"
        :gstFlag="isGst"
        :billData="form.bill"
        :updateCounter="updateCounter.totalTable"
        ref="totalTable"
      ></total-table>
      <b-card-group class="d-block d-md-flex" deck>
        <!-- Transport Details -->
        <transport-details
          ref="transport"
          :config="config.transport"
          :updateCounter="updateCounter.transport"
          :parentData="form.transport"
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
          :disabled="!isInvDateValid"
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
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

import Config from '../../components/Config.vue';
import Autocomplete from '../../components/Autocomplete.vue';

import PartyDetails from '../../components/form/transaction/PartyDetails.vue';
import ShipDetails from '../../components/form/transaction/ShipDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import DeliveryNoteDetails from '../../components/form/transaction_details/DeliveryNoteDetails.vue';

import invoiceConfig from '../../js/config/invoiceConfig';
import { numberToRupees } from '../../js/utils';

export default {
  name: 'DeliveryNote',
  components: {
    Config,
    Autocomplete,

    PartyDetails,
    ShipDetails,
    BillTable,
    TotalTable,
    TransportDetails,
    Comments,
    DeliveryNoteDetails,
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
      updateCounter: {
        party: 0,
        delNote: 0,
        ship: 0,
        bill: 0,
        totalTable: 0,
        transport: 0,
        comments: 0,
      },
      formMode: '',
      invoiceId: '',
      // check resetForm() for the fully defined form{} object
      form: {
        type: 'sale',
        delNote: {},
        party: {},
        ship: {},
        taxType: 'gst', // vat
        bill: [],
        transport: {},
        narration: null,
        total: {},
      },
      isLoading: false,
      isPreloading: false,
      temp: null,
      options: {
        states: [],
        editableInvoices: {
          purchase: [],
          sale: [],
        },
        orgDetails: {}
      },
      editFlag: null, // A flag used to skip fetchProductDetails() method call,
      // when the bill table is populated when the page loads in edit mode
    };
  },
  computed: {
    // config : Gets the custom config from the invoiceConfig Vuex module and
    //          prepares it for use by adding some custom additions to it (that should not be user editable)
    config: (self) => {
      let newConf = self.$store.getters.getCustomInvoiceConfig;
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
            // 'ml-md-1': !!newConf.payment,
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
    billTableConfig: (self) => {
      if (self.config) {
        return {
          bill: self.config.bill || {},
          taxType: self.config.taxType || {},
          total: self.config.total || {},
        };
      }
    },
    defaultConfig: (self) => self.$store.getters.getDefaultInvoiceConfig,
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    isSale: (self) => self.form.type === 'sale',
    isGst: (self) => self.form.taxType === 'gst',
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
      let currDate = new Date(self.form.delNote.date).getTime(),
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
      Object.assign(this.form.delNote, this.$refs.delNote.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.ship, this.$refs.ship.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      Object.assign(this.form.transport, this.$refs.transport.form);
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData() {
      this.updateCounter.party++;
      this.updateCounter.delNote++;
      this.updateCounter.ship++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.transport++;
      this.updateCounter.comments++;
    },
    updateDelNoteDetails(delNoteDetails) {
      // debugger;
      Object.assign(this.form.delNote, delNoteDetails);
      // this.updateCounter.delNote++;
    },
    updateBillDetails(billDetails) {
      Object.assign(this.form.bill, billDetails);
      this.updateCounter.totalTable++;
    },
    updatePartyDetails(partyDetails) {
      Object.assign(this.form.party, partyDetails);
      this.updateCounter.ship++;
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
        })
      ];

      const self = this;
      return Promise.all([...requests]).then(([resp1, resp2]) => {
        self.isPreloading = false;

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
        }
        if (resp2.data.gkstatus === 0) {
          let state = self.options.states.find((state) => state.text === resp2.data.gkdata.orgstate)
          let stateCode = (state)? state.value.id : null
          self.options.orgDetails = {
            name: resp2.data.gkdata.orgname,
            addr: resp2.data.gkdata.orgaddr,
            state: state.value,
            gstin: (stateCode !== null) ? resp2.data.gkdata.gstin[stateCode] : "" ,
            tin: '',
            pin: resp2.data.gkdata.orgpincode,
            }
        }
      });
    },
    /**
     * formatDateObj(date)
     *
     * Description: Converts a js Date object, into yyyy-mm-dd string
     */
    formatDateObj(date) {
      let month = date.getMonth() + 1;
      month = month > 9 ? month : '0' + month;
      let day = date.getDate();
      day = day > 9 ? day : '0' + day;
      return `${date.getFullYear()}-${month}-${day}`;
    },
    onSubmit() {
      let self = this;
      this.isLoading = true;

      const payload = this.initPayload();
      console.log(payload);
      // return;
      // const method = this.formMode === 'create' ? 'post' : 'put';
      const actionText = this.formMode === 'create' ? 'Create' : 'Edit';
      axios
        .post('/delchal', payload)
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
              case 0:
                // success
                console.log(resp.data);
                this.displayToast(
                  `${actionText} Delivery Note Successfull!`,
                  `Delivery Note ${payload.delchaldata.dcno} was successfully ${actionText}`,
                  'success'
                );
                if (this.formMode === 'create') {
                  this.resetForm();
                }
                break;
              case 1:
                // Duplicate entry
                this.displayToast(
                  `${actionText} Delivery Note Failed!`,
                  'Duplicate Entry, Check Delivery Note Id',
                  'warning'
                );
                break;
              case 2:
                // Unauthorized access
                this.displayToast(
                  `${actionText} Delivery Note Failed!`,
                  'Unauthorized Access, Contact Admin',
                  'warning'
                );
                break;
              case 3:
                // Connection failed, Check inputs and try again
                this.displayToast(
                  `${actionText} Delivery Note Failed!`,
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

      let delchal = {
        custid: parseInt(this.form.party.name.id) || '',
        dcno: this.form.delNote.no,
        dcdate: this.form.delNote.date,
        dcflag: this.form.delNote.type,
        taxstate: this.form.party.state.name,
        orgstategstin: this.form.delNote.gstin || '',
        discflag: 1,
        dcnarration: this.form.narration,
        roundoffflag: this.form.total.roundFlag ? 1 : 0,
        consignee: {},

        issuername: this.form.delNote.issuer,
        designation: this.form.delNote.role,

        vehicleno: this.form.transport.vehicleno || '',
        modeoftransport: this.form.transport.mode,
        noofpackages: this.form.transport.packageCount,
      };

      // === Sale / Purchase related data ===
      if (this.isSale) {
        delchal.sourcestate = this.form.delNote.state.name || null;
        delchal.taxstate = this.form.party.state.name || null;
        delchal.inoutflag = 15; // sale
      } else {
        delchal.sourcestate = this.form.party.state.name || null;
        delchal.taxstate = this.form.delNote.state.name || null;
        delchal.inoutflag = 9; // purchase
        delete delchal.ewaybillno;
      }

      // === GST/ VAT related data ===
      if (this.isGst) {
        delchal.taxflag = 7;
      } else {
        delchal.taxflag = 22;
      }

      // === Total Invoice price data ===
      delchal.delchaltotal = this.form.total.amount;
      delchal.totalinword = this.form.total.text;

      // === Consignee data ===
      if (this.form.ship.name) {
        delchal.consignee = {
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
      let stock = {
        // items: {},
        inout: delchal.inoutflag,
        goid: this.form.delNote.godown,
      };
      let pricedetails = [];
      let tax = {};
      let cess = {};
      // let av = {
      //   product: {},
      //   prodData: {},
      //   taxpayment: 0,
      //   totaltaxable: 0,
      // };
      let freeqty = {};
      let discount = {};
      this.form.bill.forEach((item) => {
        // let taxable = item.total * item.qty - item.discount.amount;

        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][item.rate] = parseFloat(item.qty).toFixed(2);
        // stock.items[item.product.id] = parseFloat(item.qty).toFixed(2);

        if (this.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
          // // av.avtax = { GSTName: 'IGST', CESSName: 'CESS' };
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
          // av.taxpayment += taxable;
        }

        freeqty[item.product.id] = parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.amount).toFixed(2);

        // av.product[item.product.name] = parseFloat(taxable).toFixed(2);
        // av.prodData[item.product.id] = parseFloat(taxable).toFixed(2);
        // av.totaltaxable += taxable;

        pricedetails.push({
          custid: this.form.party.name.id || '',
          productcode: item.product.id,
          inoutflag: delchal.inoutflag,
          lastprice: item.rate,
        });
      });

      // // av.taxpayment = parseFloat(av.taxpayment).toFixed(2);
      // // av.totaltaxable = parseFloat(av.totaltaxable).toFixed(2);

      Object.assign(delchal, {
        contents,
        // pricedetails,
        tax,
        cess,
        // av,
        freeqty,
        discount,
      });

      // // === payment details, mode = 2 ===
      // if (this.form.payment.mode === 2) {
      //   delchal.bankdetails = {
      //     accountno: this.form.payment.bank.no,
      //     bankname: this.form.payment.bank.name,
      //     ifsc: this.form.payment.bank.ifsc,
      //     branch: this.form.payment.bank.branch,
      //   };
      // }

      if (this.form.transport.mode === 'Road') {
        delchal.vehicleno = this.form.transport.vno;
      }

      if (this.form.transport.date) {
        delchal.dateofsupply = this.form.transport.date;
      }

      // if (this.formMode === 'edit') {
      //   const av = Object.assign({}, invoice.av);
      //   invoice.invid = parseInt(this.invoiceId);

      //   delete invoice.av;
      //   delete invoice.pincode;
      //   delete invoice.discflag;

      //   return { invoice, stock, av };
      // }

      // console.log({ invoice, stock });
      return { delchaldata: delchal, stockdata: stock };
    },
    resetForm() {
      let delNote = this.form.delNote;
      this.form = {
        type: 'sale',
        delNote: {
          no: delNote.no + 1,
          date: delNote.date,
          state: delNote.state,
          godown: delNote.godown,
          type: delNote.type,
          gstin: delNote.gstin,
          issuer: delNote.issuer,
          role: delNote.role,
          options: delNote.options,
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
        total: {
          taxable: 0,
          igst: 0,
          cess: 0,
          vat: 0,
          discount: 0,
          amount: 0,
          rounded: 0,
          text: '',
        },
        transport: {
          mode: 'Road',
          vno: null,
          date: null,
          reverseCharge: false,
          packageCount: 0,
        },
        narration: null,
      };
      this.updateComponentData();
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
        self.$nextTick().then(() => {
          if (!self.isInvDateValid) {
            self.form.delNote.date = self.yearStart;
          }
        });
      });
    },
  },
  beforeMount() {
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule('invoiceConfig', invoiceConfig);
    this.$store.dispatch('initInvoiceConfig');
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future
    this.formMode = this.mode;
    this.invoiceId = this.invid;
    this.initForm();
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule('invoiceConfig');
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