<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-row>
      <b-col order="2" order-md="1">
        <b-container fluid class="pl-0">
          <b-col class="px-0">
            <b>{{ party.isCustomer ? 'Customer' : 'Supplier' }} Details</b>
            <p class="text-small">
              <span> {{ party.name }} </span> <br />
              <span> {{ party.addr }} </span> <br />
              <span> {{ party.state }} </span> <br />
              <span> <b> Pin Code: </b> {{ party.pin }} </span> <br />
              <span> <b> GSTIN: </b> {{ party.gstin }} </span> <br />
            </p>
          </b-col>
          <b-col class="px-0">
            <b>Delivery Details</b>
            <p class="text-small">
              <span> {{ shipping.name }} </span> <br />
              <span> {{ shipping.addr }} </span> <br />
              <span> {{ shipping.state }} </span> <br />
              <span> <b> Pin Code: </b> {{ shipping.pin }} </span> <br />
              <span> <b> GSTIN: </b> {{ shipping.gstin }} </span> <br />
            </p>
          </b-col>
          <br class="d-none d-md-block" />
        </b-container>
      </b-col>
      <b-col class="text-md-right" cols="12" md="6" order="1" order-md="2">
        <b>{{ saleFlag ? 'Sale' : 'Purchase' }} Order Details</b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="psorderData"
          small
          bordered
          thead-class="d-none"
          fixed
          class="text-small table-border-dark"
        ></b-table-lite>
      </b-col>
    </b-row>
    <!-- Content Table -->
    <b-table-lite
      :items="psorder.contents"
      :fields="tableFields"
      tbody-tr-class="gk-vertical-row"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      striped
      class="text-small table-border-dark"
    ></b-table-lite>
    <b-row>
      <b-col class="my-2" order="2" order-md="1"> </b-col>
      <b-col cols="12" md="8" class="my-2" order="1" order-md="2">
        <!-- Total Table -->
        <b-table-lite
          :items="totalDetails"
          :fields="[
            { key: 'title', label: 'Total', tdClass: '' },
            { key: 'value', label: '₹', class: 'text-right' },
          ]"
          small
          fixed
          class="text-small"
        ></b-table-lite>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="my-2">
      </b-col>
      <b-col cols="12" md="8" class="my-2">
        <div>
          <b>Payment Details</b>
          <div v-if="payment.mode > 2" class="mb-3">
            {{ payment.mode === 3 ? 'Paid By Cash' : 'On Credit' }}
          </div>
          <div class="text-small" v-else>
            To Be Paid By Bank Transfer
            <b-table-lite
              :items="bankDetails"
              :fields="['title', 'value']"
              small
              bordered
              fixed
              thead-class="d-none"
            >
            </b-table-lite>
          </div>
        </div>
        <b> Narration: </b> {{ psorder.narration }}
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
import { numberToRupees } from '../../../js/utils.js';
export default {
  name: 'PsOrderProfile',
  props: {
    id: {
      type: Number,
      required: true,
    },
    pdata: {
      type: Object,
      required: true,
    },
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of Invoice, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  data() {
    return {
      isPreloading: false,
      saleFlag: true,
      psorder: {
        date: '',
        terms: '',
        creditPeriod: '',
        godown: '',
        contents: [],
        narration: '',
      },
      payment: {
        mode: 2,
        bankDetails: {},
      },
      total: {},
      party: {},
      shipping: {},
      transport: {},
    };
  },
  computed: {
    psorderData: (self) => {
      let dispatchTitle = self.saleFlag ? 'Dispatch From' : 'Deliver At';
      let res = [
        { title: 'No.', value: self.psorder.no },
        { title: 'Date', value: self.psorder.date },
        { title: 'Supply Date', value: self.psorder.supplyDate },
        { title: 'Credit Period', value: self.psorder.creditPeriod },
        { title: 'Payment Terms', value: self.psorder.terms },
        { title: dispatchTitle, value: self.psorder.godown },
        { title: 'Mode of Transport', value: self.transport.mode },
        { title: 'Vehicle No.', value: self.transport.vehicleNo },
      ];
      if (self.transport.mode !== 'Road') {
        res.pop();
      }
      return res;
    },
    totalDetails: (self) => {
      let total = [{ title: 'Taxable', value: self.total.taxable }];
      if (self.psorder.isGst) {
        if (self.total.isIgst) {
          total.push({ title: 'IGST', value: self.total.tax });
        } else {
          total.push(
            { title: 'CGST', value: self.total.tax },
            { title: 'SGST', value: self.total.tax }
          );
        }
        total.push({ title: 'CESS', value: self.total.cess });
      } else {
        total.push({ title: 'VAT', value: self.total.tax });
      }
      total.push(
        {
          title: `${self.saleFlag ? 'Sale' : 'Purchase'} Order Value`,
          value: self.total.amount,
        },
        { title: 'Total In Words', value: self.total.text }
      );
      return total;
    },
    bankDetails: (self) => {
      let details = self.payment.bankDetails;
      return [
        { title: 'Acc No', value: details.accountno || '' },
        { title: 'Bank', value: details.bankname || '' },
        { title: 'Branch', value: details.branch || '' },
        { title: 'IFSC', value: details.ifsc || '' },
      ];
    },
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: 'Item',
        },
        'qty',
        {
          key: 'rate',
          label: 'Rate',
        },
        'discount',
        { key: 'igst', label: 'IGST %' },
        { key: 'cgst', label: 'CGST %' },
        { key: 'sgst', label: 'SGST %' },
        { key: 'cess', label: 'CESS %' },
        'total',
      ];
      if (self.total.isIgst) {
        fields.splice(5, 2);
      } else {
        fields.splice(4, 1);
      }

      return fields;
    },
  },
  methods: {
    formatDetails(details) {
      this.saleFlag = details.psflag === 19;

      this.total = {
        amount: details.purchaseordertotal,
        isIgst: details.taxname === 'IGST',
        cess: details.totalcessamt,
        tax: details.totaltaxamt,
        discount: details.totaldiscount,
        taxable: details.totaltaxablevalue,
        text: details.pototalwords || numberToRupees(details.totaltaxablevalue),
      };

      this.payment = {
        mode: details.paymentmode,
        bankDetails: details.bankdetails,
      };

      let godown =
        details.goname && details.goaddr
          ? `${details.goname} (${details.goaddr})`
          : '';
      this.psorder = {
        isGst: details.taxname !== 'VAT',
        contents: [],
        date: details.orderdate,
        no: details.orderno,
        narration: details.psnarration,
        supplyDate: details.dateofsupply,
        terms: details.payterms,
        creditPeriod: details.creditperiod,
        godown: godown,
      };
      this.transport = {
        mode: details.modeoftransport,
        vehicleNo: details.vehicleno,
      };

      let cust = details.custSupDetails;
      this.party = {
        name: cust.custname,
        addr: cust.custaddr,
        state: cust.custsupstate,
        pin: cust.pincode,
        isCustomer: cust.csflag === 3,
        gstin: cust.custgstin,
      };

      let shipping = details.consignee;
      this.shipping = {
        name: shipping.consigneename,
        addr: shipping.consigneeaddress,
        state: shipping.consigneestate,
        pin: shipping.consigneepincode,
        gstin: shipping.gstinconsignee,
      };

      for (const name in details.schedule) {
        const item = details.schedule[name];
        this.psorder.contents.push({
          name: item.proddesc,
          qty: item.qty,
          rate: item.priceperunit,
          discount: item.discount,
          igst: item.taxrate,
          cgst: item.taxrate / 2,
          sgst: item.taxrate / 2,
          cess: item.cessrate,
          total: item.totalAmount,
        });
      }
    },
    getDetails() {
      return axios
        .get(`/purchaseorder?poso=single&orderid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch ${this.saleFlag ? 'Sale' : 'Purchase'} order Error!`,
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    fetchAndUpdateData() {
      return this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
          case 0:
            // this.invoice = response.data.gkresult;
            // this.formatInvoiceDetails(response.data.gkresult);
            // this.output = response.data.gkresult;
            this.formatDetails(response.data.gkresult);
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `Fetch ${
                this.saleFlag ? 'Sale' : 'Purchase'
              } order Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Purchase Sales Order Details! Please Try after sometime.`,
              {
                title: `Fetch Transaction Details Error!`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
        } // end switch
      });
    },
  },
  watch: {
    id: function(id) {
      if (id && parseInt(id) > -1) {
        console.log(`Fetch id = ${id}`)
        this.isPreloading = true;
        this.fetchAndUpdateData()
          .then(() => {
            this.isPreloading = false;
          })
          .catch(() => {
            this.isPreloading = false;
          });
      }
    },
  },
  mounted() {
    if (this.id && parseInt(this.id) > -1) {
      this.isPreloading = true;
      this.fetchAndUpdateData()
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    }
  },
};
</script>
