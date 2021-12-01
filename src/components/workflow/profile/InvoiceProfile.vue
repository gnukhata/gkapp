<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div v-if="deletedFlag">
      <span class="float-right h5 p-2 bg-danger text-white">Cancelled</span>
      <div class="clearfix"></div>
      <br />
    </div>
    <b-row>
      <b-col cols="12" md="6" order="2" order-md="1">
        <b> {{ invoice.isSale ? 'Buyer' : 'Seller' }} Details</b>
        <br />
        <p class="text-small">
          <span>{{ invoice.party.name }} </span><br />
          <span>{{ invoice.party.addr }} </span> <br />
          <span>{{ invoice.party.state }} </span> <br />
          <span>{{ invoice.party.pincode }} </span>
          <span> <b> GSTIN: </b> {{ invoice.party.gstin || '' }} </span>
        </p>
      </b-col>
      <b-col class="text-md-right" cols="12" md="6" order="1" order-md="2">
        <b>{{ invoice.isSale ? 'Sale' : 'Purchase' }} Invoice Details</b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="invoiceData"
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
      :items="invoice.invItems"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      striped
      small
      class="text-small table-border-dark"
      tbody-tr-class="gk-vertical-row"
    >
      <template #cell(qty)="data">
        {{ data.value }} <small> {{ data.item.uom }} </small>
      </template>
      <template #cell(price)="data"> {{ data.value }} </template>
      <template #cell(discount)="data"> {{ data.value }} </template>
      <template #cell(tax)="data">
        {{ data.value.rate }} <small> % </small>
      </template>
      <template #cell(cgst)="data">
        {{ data.value }} <small> % </small>
      </template>
      <template #cell(sgst)="data">
        {{ data.value }} <small> % </small>
      </template>
      <template #cell(igst)="data">
        {{ data.value }} <small> % </small>
      </template>
      <template #cell(cess)="data">
        {{ data.value.rate }} <small> % </small>
      </template>
      <template #cell(vat)="data">
        {{ data.value.rate }} <small> % </small>
      </template>
      <template #cell(total)="data"> {{ data.value }} </template>
      <template #custom-foot>
        <b-tr>
          <b-th :colspan="invoice.isGst ? (invoice.total.isIgst ? 6 : 7) : 5"
            >Total</b-th
          >
          <b-th> {{ invoice.total.amount }}</b-th>
        </b-tr>
      </template>
    </b-table-lite>
    <b-row>
      <b-col class="my-2"> </b-col>
      <b-col cols="12" md="8" class="my-2">
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
      <b-col class="my-2"> </b-col>
      <b-col cols="12" md="8" class="my-2">
        <div>
          <b>Payment Details</b>
          <div v-if="bankMode" class="mb-3">
            {{ paymentMode }}
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
          <div class="text-small" v-else>
            {{ paymentMode }}
          </div>
        </div>
        <b> Narration: </b> {{ invoice.narration }}
      </b-col>
    </b-row>
    <div class="float-right my-2 d-print-none">
      <span v-if="!deletedFlag">
        <b-button
          class="mr-1"
          size="sm"
          variant="primary"
          v-b-toggle.voucher-container
        >
          <b-icon icon="eye"></b-icon> View Vouchers</b-button
        >
        <b-button
          v-if="onCreditFlag"
          class="mr-1"
          size="sm"
          variant="success"
          :to="{
            name: 'Billwise',
            params: {
              custType: invoice.party.csflag,
              custName: invoice.party.name,
            },
          }"
        >
          <b-icon icon="clipboard-check"></b-icon> Adjust</b-button
        >
        <b-button
          v-if="rectifyFlag"
          class=""
          size="sm"
          variant="warning"
          :to="{ name: 'Invoice', params: { mode: 'edit', invid: id } }"
        >
          <b-icon icon="pencil"></b-icon> Rectify</b-button
        >
        <b-button
          v-if="cancelFlag"
          size="sm"
          variant="danger"
          @click="confirmOnCancel"
        >
          <b-icon icon="x-octagon"></b-icon> Cancel</b-button
        >
      </span>
    </div>
    <div class="clearfix"></div>
    <br />
    <b-collapse v-model="showVouchers" id="voucher-container">
      <b>Vouchers:</b>
      <div v-if="vouchers.length">
        <b-card
          class="mb-2"
          v-for="voucher in vouchers"
          :key="voucher.id"
          body-class="p-1"
        >
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
        </b-card>
      </div>
      <div v-else>No vouchers were found for Invoice: {{ invoice.number }}</div>
    </b-collapse>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

export default {
  name: 'InvoiceProfile',
  components: {},
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
      invoice: {
        taxState: '',
        issuer: '',
        designation: '',
        date: '',
        payment: {
          mode: 2,
          bankDetails: {},
        },
        party: {
          csflag: '3', // 3 -> customer, 19 -> supplier
          name: ' ',
          state: '',
          addr: '',
          pincodce: '',
        },
        isSale: '',
        isGst: true,
        invItems: [],
        total: {
          amount: 0,
          text: 'Zero Rupee',
        },
        number: '',
      },
      vouchers: [],
      showVouchers: false,
      states: {},
    };
  },
  computed: {
    tableFields: (self) => {
      let designation = self.invoice.designation
        ? `(${self.invoice.designation})`
        : '';
      let fields = [
        {
          key: 'name',
          label: 'Item',
        },
        'qty',
        {
          key: 'price',
          label: 'Rate (₹)',
          tdClass: 'gk-currency-sm',
        },
        { key: 'discount', label: 'Discount (₹)', tdClass: 'gk-currency-sm' },
      ];

      if (self.invoice.isGst) {
        if (self.invoice.total.isIgst) {
          fields.push({ key: 'igst', label: 'IGST' });
        } else {
          fields.push(
            { key: 'cgst', label: 'CGST' },
            { key: 'sgst', label: 'SGST' }
          );
        }
        fields.push({ key: 'cess', label: 'CESS' });
      } else {
        fields.push({ key: 'vat', label: 'VAT' });
      }
      fields.push({
        key: 'total',
        label: 'Total (₹)',
        tdClass: 'gk-currency-sm',
      });
      fields.push({
        title: 'Issued By',
        value: `${self.invoice.issuer}  ${designation}`,
      });
      return fields;
    },
    invoiceData: (self) => {
      let details = self.invoice;
      let designation = details.designation ? `(${details.designation})` : '';
      let res = [
        { title: 'No', value: details.number },
        { title: 'Date', value: details.date },
        { title: 'Eway Bill No.', value: details.eway || '' },
        { title: 'Delivery Note No.', value: details.delno || '' },
        { title: 'Place of Supply', value: details.taxState || '' },
        {
          title: 'Issued By',
          value: `${details.issuer}  ${designation}`,
        },
      ];
      if (!details.delno) res.splice(3, 1);
      return res;
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
    totalDetails: (self) => {
      let total = [{ title: 'Taxable', value: self.invoice.total.taxable }];
      if (self.invoice.isGst) {
        if (self.invoice.total.isIgst) {
          total.push({ title: 'IGST', value: self.invoice.total.tax });
        } else {
          total.push(
            { title: 'CGST', value: self.invoice.total.tax },
            { title: 'SGST', value: self.invoice.total.tax }
          );
        }
        total.push({ title: 'CESS', value: self.invoice.total.cess });
      } else {
        total.push({ title: 'VAT', value: self.invoice.total.tax });
      }
      total.push(
        { title: 'Invoice Value', value: self.invoice.total.amount },
        { title: 'Total In Words', value: self.invoice.total.text }
      );
      return total;
    },
    paymentMode: (self) => {
      let mode = '';
      switch (parseInt(self.invoice.payment.mode)) {
        case 2:
        case 4:
          mode = 'Paid By Bank Transfer';
          break;
        case 3:
        case 5:
          mode = 'Paid By Cash';
          break;
        case 15:
          mode = 'On Credit';
      }
      return mode;
    },
    bankMode: (self) => {
      let mode = parseInt(self.invoice.payment.mode);
      return mode === 2 || mode === 4;
    },
    deletedFlag: (self) => !!self.pdata.deletedFlag,
    onCreditFlag: (self) => !!self.pdata.onCreditFlag,
    rectifyFlag: (self) => !!self.pdata.rectifyFlag,
    cancelFlag: (self) => !!self.pdata.cancelFlag,
    ...mapState(['authToken']),
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
    getDetails() {
      let type = this.deletedFlag ? 'deletedsingle' : 'single';
      return axios
        .get(`/invoice?inv=${type}&invid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `${this.formMode} ${this.formType} Error!`,
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
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
        let gstinList =
          party.custgstinlist && typeof party.custgstinlist === 'object'
            ? Object.values(party.custgstinlist)
            : [];
        let gstin = gstinList.length ? gstinList[0] : '';
        this.invoice = {
          issuer: details.issuername,
          designation: details.designation,
          number: details.invoiceno,
          date: details.invoicedate,
          dcno: details.dcno,
          taxState: this.states[details.taxstatecode],
          eway:
            details.ewaybillno !== 'undefined' && !!details.ewaybillno
              ? details.ewaybillno
              : '',
          payment: {
            mode: details.paymentmode,
            bankDetails: details.bankdetails,
          },
          party: {
            name: party.custname,
            state: party.custsupstate,
            addr: party.custaddr,
            pincodce: party.pincode,
            csflag: party.csflag,
            gstin: gstin,
          },
          isSale: details.inoutflag === 15,
          isGst: details.taxname !== 'VAT',
          invItems: [],
          total: {
            amount: details.invoicetotal,
            text: details.invoicetotalword,
            taxable: details.totaltaxablevalue,
            cess: details.totalcessamt,
            tax: details.totaltaxamt,
            isIgst: details.taxname === 'IGST',
          },
          narration: details.narration,
        };
        if (details.invcontents) {
          let product = {};
          this.invoice.invItems = Object.keys(details.invcontents).map(
            (key) => {
              let taxrate = parseFloat(details.invcontents[key].taxrate) || 0;
              let cgst = taxrate.toFixed(2);
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
                tax: {
                  name: details.invcontents[key].taxname,
                  rate: details.invcontents[key].taxrate,
                  amount: details.invcontents[key].taxamount,
                },
                igst: taxrate,
                cgst: cgst,
                sgst: cgst,
                vat: taxrate,
                cess: {
                  rate: details.invcontents[key].cessrate,
                  amount: details.invcontents[key].cess,
                },
              };
              return product;
            }
          );
        }
        // console.log(this.invoice.invItems);
      }
    },
    cancelInvoice() {
      const payload = {
        data: {
          invid: this.id,
        },
      };
      axios
        .delete('/invoice?type=cancel', payload)
        .then((response) => {
          switch (response.data.gkstatus) {
            case 0:
              this.displayToast(
                'Cancel Invoice Success!',
                `Successfully cancelled Invoice ${this.invoice.number}`,
                'success'
              );
              this.getDetails().then((response) => {
                if (typeof this.onUpdate === 'function') {
                  this.onUpdate(response.data);
                }
              });
              break;
            case 3:
              this.displayToast(
                'Cancel Invoice Failure!',
                `Could not cancel Invoice ${this.invoice.number}. Try again later or Contact admin`,
                'danger'
              );
              break;
            default:
              this.displayToast(
                'Cancel Invoice Failure!',
                `Could not cancel Invoice ${this.invoice.number}. Try again later or Contact admin`,
                'danger'
              );
          }
        })
        .catch((error) => {
          this.displayToast('Cancel Invoice Failure!', error.message, 'danger');
        });
    },
    confirmOnCancel() {
      let invType = this.invoice.isSale ? 'Sale to' : 'Purchase from';
      let text = this.$createElement('div', {
        domProps: {
          innerHTML: `About to cancel Invoice: <b>${this.invoice.number}</b>, of ${this.invoice.total.text} <b>(₹ ${this.invoice.total.amount})</b> for ${invType}  ${this.invoice.party.name}. Are you sure?`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
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
            this.cancelInvoice();
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
    fetchAndUpdateData() {
      return this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
          case 0:
            // this.invoice = response.data.gkresult;
            this.formatInvoiceDetails(response.data.gkresult);
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `${this.formMode} ${this.formType} Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Invoice Details! Please Try after sometime.`,
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
    fetchState() {
      return axios.get('/state').then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.states = {};
          resp.data.gkresult.forEach((state) => {
            let code = Object.keys(state)[0];
            let name = Object.values(state)[0];
            this.states[code] = name;
          });
        }
      });
    },
  },
  watch: {
    id(newId) {
      if (newId && parseInt(newId) > -1) {
        this.isPreloading = true;
        this.showVouchers = false;
        this.vouchers = [];
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
    // console.log("mounted")
    if (this.id && parseInt(this.id) > -1) {
      this.isPreloading = true;
      Promise.all([
        this.fetchState(),
        this.fetchAndUpdateData(),
        this.getVouchers(),
      ])
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

<style>
.carousel-control-prev-icon,
.carousel-control-next-icon {
  filter: invert(1);
}
.carousel-indicators > li {
  background-color: #000;
}
</style>
