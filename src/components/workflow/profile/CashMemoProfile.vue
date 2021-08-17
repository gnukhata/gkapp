<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-row>
      <b-col cols="12" md="6" class="my-2"> </b-col>
      <b-col cols="12" md="6" class="text-md-right my-2">
        <b>Cash Memo Details</b>
        <br />
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="memoData"
          small
          bordered
          thead-class="d-none"
          fixed
          class="text-small"
        ></b-table-lite>
      </b-col>
    </b-row>
    <!-- Content Table -->
    <b-table-lite
      :items="invoice.invItems"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      striped
      tbody-tr-class="content-table-row"
      class="text-small"
    >
      <template #cell(qty)="data">
        {{ data.value }} <small> {{ data.item.uom }} </small>
      </template>
      <template #cell(price)="data"> {{ data.value }} </template>
      <template #cell(discount)="data"> {{ data.value }} </template>
      <template #cell(cess)="data">
        {{ data.value.rate }} <small>%</small>
      </template>
      <template #cell(total)="data"> {{ data.value }} </template>
    </b-table-lite>
    <b-row>
      <b-col cols="12" md="6" class="my-2"> </b-col>
      <b-col cols="12" md="6" class="my-2">
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
      <b-col cols="12" md="6" class="my-2">
        <b>Payment Details</b>
        <div v-if="invoice.payment.mode > 2">
          {{ invoice.payment.mode === 3 ? 'Paid By Cash' : 'On Credit' }}
        </div>
        <div class="text-small" v-else>
          Paid By Bank Transfer
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
      </b-col>
      <b-col cols="12" md="6" class="my-2">
        <b> Narration: </b> {{ invoice.narration }}
      </b-col>
    </b-row>
    <div class="float-right my-2">
      <b-button
        class="mr-2"
        size="sm"
        variant="primary"
        v-b-toggle.voucher-container
      >
        <b-icon icon="eye"></b-icon> View Voucher</b-button
      >
    </div>
    <div class="clearfix"></div>
    <b-collapse v-model="showVouchers" id="voucher-container">
      <b>Voucher:</b>
      <b-card v-if="vouchers.length" body-class="p-1">
        <div v-for="voucher in vouchers" :key="voucher.id">
          <div class="text-center m-1 mb-2">
            <span class="float-left"> Voucher No: {{ voucher.no }} </span>
            <span> {{ voucher.type }} </span>
            <span class="float-right"> Date:{{ voucher.date }} </span>
          </div>
          <b-table-lite
            bordered
            small
            head-variant="dark"
            :items="voucher.transactions"
            :tbody-tr-class="rowClass"
            fixed
          >
          </b-table-lite>
          <div>Narration: {{ voucher.narration }}</div>
          <br />
        </div>
      </b-card>
      <div v-else>
        No vouchers were found for Cash Memo: {{ invoice.number }}
      </div>
    </b-collapse>
  </b-container>
</template>

<script>
import axios from 'axios';
export default {
  name: 'CashMemoProfile',
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
  computed: {
    memoData: (self) => {
      return [
        { title: 'No.', value: self.invoice.number },
        { title: 'Date', value: self.invoice.date },
        { title: 'GSTIN', value: self.invoice.gstin },
      ];
    },
    totalDetails: (self) => {
      let total = self.invoice.total;
      let details = [{ title: 'Taxable', value: total.taxable }];
      if (self.invoice.isGst) {
        if (total.isIgst) {
          details.push({ title: 'IGST', value: total.tax });
        } else {
          details.push(
            { title: 'CGST', value: total.tax },
            { title: 'SGST', value: total.tax }
          );
        }
        details.push({ title: 'CESS', value: total.cess });
      } else {
        details.push({ title: 'VAT', value: total.tax });
      }
      details.push(
        {
          title: `Cash Memo Value`,
          value: total.amount,
        },
        { title: 'Total In Words', value: total.text }
      );
      return details;
    },
    bankDetails: (self) => {
      let details = self.invoice.payment.bankDetails;
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
          key: 'price',
          label: 'Rate (₹)',
        },
        { key: 'discount', label: 'Discount (₹)' },
        { key: 'igst', label: 'IGST %' },
        { key: 'cgst', label: 'CGST %' },
        { key: 'sgst', label: 'SGST %' },
        { key: 'cess', label: 'CESS %' },
        { key: 'total', label: 'Total (₹)' },
      ];
      if (self.invoice.total.isIgst) {
        fields.splice(5, 2);
      } else {
        fields.splice(4, 1);
      }

      return fields;
    },
  },
  data() {
    return {
      isPreloading: false,
      vouchers: [],
      showVouchers: false,
      invoice: {
        payment: {
          mode: 2,
          bankDetails: {},
        },
        date: '',
        party: {
          csflag: '3', // 3 -> customer, 19 -> supplier
          name: ' ',
          state: '',
          addr: '',
          pincodce: '',
        },
        isSale: '',
        invItems: [],
        total: {
          amount: 0,
          text: 'Zero Rupee',
        },
        number: '',
      },
    };
  },
  methods: {
    rowClass(item, type) {
      if (!item || type !== 'row') return;
      let rowClass = 'table-secondary';
      if (item.cr === '') {
        rowClass = 'table-success';
      } else if (item.dr === '') {
        rowClass = 'table-warning';
      }
      return rowClass;
    },
    getVouchers() {
      return axios
        .get(`/transaction?searchby=invoice&invid=${this.id}`)
        .then((resp) => {
          // TODO: Add Project support
          if (resp.data.gkstatus === 0) {
            this.vouchers = resp.data.gkresult.map((voucher) => {
              let data = {
                id: voucher.vouchercode,
                no: voucher.vouchernumber,
                date: voucher.voucherdate,
                type: voucher.vouchertype,
                transactions: [],
                narration: voucher.narration,
                fields: [],
              };
              let total = {
                dr: 0,
                cr: 0,
              };
              for (const drAcc in voucher.drs) {
                data.transactions.push({
                  account: drAcc,
                  dr: voucher.drs[drAcc],
                  cr: '',
                });
                total.dr += parseFloat(voucher.drs[drAcc]);
              }
              for (const crAcc in voucher.crs) {
                data.transactions.push({
                  account: crAcc,
                  cr: voucher.crs[crAcc],
                  dr: '',
                });
                total.cr += parseFloat(voucher.crs[crAcc]);
              }

              data.transactions.push({
                account: 'Total',
                dr: total.dr.toFixed(2),
                cr: total.cr.toFixed(2),
              });

              return data;
            });
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    /**
     * formatInvoiceDetails()
     *
     * Description: Format the invoice details from gkcore to an
     * internal format for ease of use
     */
    formatInvoiceDetails(details) {
      if (details) {
        let party = details.custSupDetails || {};
        this.invoice = {
          date: details.invoicedate,
          party: {
            name: party.custname,
            state: party.custsupstate,
            addr: party.custaddr,
            pincodce: party.pincode,
            csflag: party.csflag,
          },
          isSale: details.inoutflag === 15,
          invItems: [],
          total: {
            amount: details.invoicetotal,
            text: details.invoicetotalword,
            taxable: details.totaltaxablevalue,
            cess: details.totalcessamt,
            tax: details.totaltaxamt,
            isIgst: details.taxname === 'IGST',
          },
          number: details.invoiceno,
          isGst: details.taxname !== 'VAT',
          gstin: details.orgstategstin,
          payment: {
            mode: details.paymentmode,
            bankDetails: details.bankdetails,
          },
          narration: details.narration,
        };
        if (details.invcontents) {
          let product = {};
          this.invoice.invItems = Object.keys(details.invcontents).map(
            (key) => {
              product = {
                id: key,
                name: details.invcontents[key].proddesc,
                uom: details.invcontents[key].uom,
                qty: details.invcontents[key].qty,
                freeQty: details.invcontents[key].freeQty,
                price: details.invcontents[key].priceperunit,
                discount: details.invcontents[key].discount,
                taxable: details.invcontents[key].taxableamount,
                total: details.invcontents[key].totalAmount,
                igst: details.invcontents[key].taxrate,
                cgst: details.invcontents[key].taxrate / 2,
                sgst: details.invcontents[key].taxrate / 2,
                cess: {
                  rate: details.invcontents[key].cess,
                  amount: details.invcontents[key].cessrate,
                },
              };
              return product;
            }
          );
        }
        // console.log(this.invoice.invItems);
      }
    },
    getDetails() {
      return axios
        .get(`/invoice?inv=single&invid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch Cash Memo Error!`,
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
            this.formatInvoiceDetails(response.data.gkresult);
            // this.output = response.data.gkresult;
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `Fetch Cash Memo Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Cash Memo Details! Please Try after sometime.`,
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
      if (id) {
        this.showVouchers = false;
        this.vouchers = [];
        this.isPreloading = true;
        Promise.all([this.fetchAndUpdateData(), this.getVouchers()])
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
    if (this.id) {
      this.isPreloading = true;
      Promise.all([this.fetchAndUpdateData(), this.getVouchers()])
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
