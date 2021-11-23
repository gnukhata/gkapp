<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <b-form @submit.prevent="confirmOnSubmit">
      <div class="text-center pt-2">
        <h4>Create Cash Memo</h4>
      </div>
      <hr />
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
        <!-- Delivery Note Details -->
        <cash-memo-details
          ref="memo"
          :config="config.memo"
          :parentData="form.memo"
          :updateCounter="updateCounter.memo"
          @details-updated="onComponentDataUpdate"
          :saleFlag="isSale"
        ></cash-memo-details>
        <!-- Payment Details -->
        <payment-details
          ref="payment"
          :updateCounter="updateCounter.payment"
          :config="config.payment"
          :saleFlag="isSale"
          :parentData="form.payment"
          :optionsData="{
            payModes: [
              { text: '-- Payment Mode --', value: null },
              { text: 'Cash', value: 3 },
              { text: 'Bank', value: 2 },
            ],
          }"
        ></payment-details>
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
        :config="config.bill"
        :gstFlag="isGst"
        @details-updated="onComponentDataUpdate"
        :updateCounter="updateCounter.bill"
        :parentData="form.bill"
        ref="bill"
      ></bill-table>
      <div class="px-2">
        <!-- b-row has to be enclosed in a container tag with padding
        atleast 2, to avoid creating an offset to the right -->
        <b-row class="mt-5" v-if="config.total">
          <b-col cols="12" lg="6"> </b-col>
          <b-col cols="12" lg="6">
            <total-table
              ref="totalTable"
              :config="config.total"
              :billData="form.bill"
              :gstFlag="isGst"
              :updateCounter="updateCounter.totalTable"
            ></total-table>
          </b-col>
        </b-row>
      </div>
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
          <span>
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Create</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix"></div>
    </b-form>
    <print-page
      :show="showPrintModal"
      name="CashMemo"
      title="Cash Memo"
      :id="memoId"
      :pdata="{}"
    >
    </print-page>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

import Config from '../../components/Config.vue';
import CashMemoDetails from '../../components/form/transaction_details/CashMemoDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import PaymentDetails from '../../components/form/transaction/PaymentDetails.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';

import cashMemoConfig from '../../js/config/transaction/cashMemo';

import PrintPage from '../../components/workflow/PrintPage.vue';
export default {
  name: 'CashMemo',
  components: {
    BillTable,
    CashMemoDetails,
    Config,
    PaymentDetails,
    TotalTable,
    PrintPage,
  },
  data() {
    return {
      showPrintModal: false,
      memoId: 0,
      isInvDateValid: false,
      vuexNameSpace: '',
      isLoading: false,
      form: {
        payment: {},
        total: {},
        type: 'sale',
        taxType: 'gst',
        memo: {},
        bill: [],
      },
      updateCounter: {
        memo: 0,
        bill: 0,
        totalTable: 0,
        payment: 0,
      },
    };
  },
  computed: {
    isGst: (self) => self.form.taxType === 'gst',
    isSale: (self) => self.form.type === 'sale',
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    // config : Gets the custom config from the invoiceConfig Vuex module and
    //          prepares it for use by adding some custom additions to it (that should not be user editable)
    config: (self) => {
      let newConf =
        self.$store.getters[`${self.vuexNameSpace}/getCustomCashMemoConfig`];
      if (newConf) {
        newConf.bill.footer.headingColspan =
          !!newConf.bill.index +
            !!newConf.bill.product +
            !!newConf.bill.hsn +
            !!newConf.bill.qty +
            !!newConf.bill.rate || 1;
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
          memo: {
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
    defaultPaymentMode: (self) =>
      self.$store.getters['global/getDefaultPaymentMode'],
    ...mapState(['yearStart', 'yearEnd', 'orgCode']),
  },
  methods: {
    collectComponentData() {
      Object.assign(this.form.memo, this.$refs.memo.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      Object.assign(this.form.payment, this.$refs.payment.form);
    },
    updateComponentData() {
      this.updateCounter.memo++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.payment++;
    },
    onComponentDataUpdate(payload) {
      switch (payload.name) {
        case 'cash-memo-details':
          Object.assign(this.form.memo, payload.data);
          this.isInvDateValid = payload.options.isDateValid;
          this.$forceUpdate();
          break;
        case 'party-details':
          Object.assign(this.form.party, payload.data);
          this.updateCounter.ship++;
          break;
        case 'bill-table':
          Object.assign(this.form.bill, payload.data);
          this.updateCounter.totalTable++;
          break;
      }
    },
    initPayload() {
      this.collectComponentData();
      let invoice = {
        // dcid: null, // Has to be filled when Delivery Note is implemented. If no Deliver Note is available skip this property
        invoiceno: this.form.memo.no,
        invoicedate: this.form.memo.date,
        orgstategstin: this.form.memo.gstin || null,

        roundoffflag: this.form.total.roundFlag ? 1 : 0,

        paymentmode: this.form.payment.mode,

        // === Total Invoice price data ===
        invoicetotal: this.form.total.amount,
        invoicetotalword: this.form.total.text,

        // === Sale / Purchase related data ===
        sourcestate: this.form.memo.state.name || null,
        taxstate: this.form.memo.state.name || null,

        // === GST/ VAT related data ===
        inoutflag: this.isSale ? 15 : 9,
        taxflag: this.isGst ? 7 : 22,

        discflag: 1,
        icflag: 3,
      };

      // === Bill data ===
      let contents = {};
      let stock = { items: {}, inout: invoice.inoutflag };
      // let pricedetails = [];
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
          av.avtax = { GSTName: 'IGST', CESSName: 'CESS' };
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
          av.taxpayment += taxable;
        }

        freeqty[item.product.id] = parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.amount).toFixed(2);

        av.product[item.product.name] = parseFloat(taxable).toFixed(2);
        av.prodData[item.product.id] = parseFloat(taxable).toFixed(2);
        av.totaltaxable += taxable;

        // pricedetails.push({
        //   custid: this.form.party.name.id || '',
        //   productcode: item.product.id,
        //   inoutflag: invoice.inoutflag,
        //   lastprice: item.rate,
        // });
      });

      av.taxpayment = parseFloat(av.taxpayment).toFixed(2);
      av.totaltaxable = parseFloat(av.totaltaxable).toFixed(2);

      Object.assign(invoice, {
        contents,
        // pricedetails,
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

      // console.log({ invoice, stock });
      return { invoice, stock };
    },
    confirmOnSubmit() {
      Object.assign(this.form.memo, this.$refs.memo.form);
      const self = this;
      let text = `Create Cash Memo (${this.form.memo.no}) for ${
        this.isSale ? 'Sale' : 'Purchase'
      }?`;
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
      this.isLoading = true;
      const payload = this.initPayload();
      const self = this;
      console.log(payload);
      axios
        .post('/invoice', payload)
        .then((resp) => {
          self.isLoading = false;

          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
              case 0:
                {
                  // success

                  this.displayToast(
                    `Create Cash Memo Successfull!`,
                    `Cash Memo saved with entry no. ${
                      resp.data.invoiceid ||
                      resp.data.gkresult ||
                      resp.data.vchData.vchno
                    }`,
                    'success'
                  );

                  let log = {
                    activity: `cash memo created: ${self.form.memo.no}`,
                  };
                  axios.post('/log', log);

                  this.showPrintModal = true;
                  this.memoId = resp.data.gkresult;
                  this.resetForm();
                }
                break;
              case 1:
                // Duplicate entry
                this.displayToast(
                  `Create Cash Memo Failed!`,
                  'Duplicate Entry, Check Cash Memo Id',
                  'warning'
                );
                break;
              case 2:
                // Unauthorized access
                this.displayToast(
                  `Create Cash Memo Failed!`,
                  'Unauthorized Access, Contact Admin',
                  'warning'
                );
                break;
              case 3:
                // Connection failed, Check inputs and try again
                this.displayToast(
                  `Create Cash Memo Failed!`,
                  'Please check your input and try again later',
                  'danger'
                );
            }
          }
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    resetForm() {
      let paymentMode;
      switch (this.defaultPaymentMode) {
        case 'bank':
          {
            paymentMode = 2;
          }
          break;
        case 'cash':
        default:
          {
            paymentMode = 3;
          }
      }
      this.form = {
        type: 'sale',
        memo: {
          no: null,
          date: this.formatDateObj(new Date()),
          state: {},
          gstin: null,
          options: {
            gstin: {},
          },
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
        payment: {
          mode: paymentMode,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        },
      };
      this.updateComponentData();
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
    this.vuexNameSpace = 'cashMemoConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, cashMemoConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initCashMemoConfig`, {
      orgCode: this.orgCode,
    });
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future
    // this.formMode = this.mode;
    // this.invoiceId = this.invid;
    // this.initForm();
    this.resetForm();
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>