<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-row>
      <b-col order="2" order-md="1">
        <b-container fluid class="pl-0">
          <b-col class="px-0">
            <b>Dispatch From</b>
            <p class="text-small">
              <span> {{ delnote.from.name }}</span> <br />
              <span> {{ delnote.from.addr }} </span> <br />
              <span> {{ delnote.from.state }} </span> <br />
              <span v-if="delnote.from.pin">
                <b> Pin Code: </b> {{ delnote.from.pin }}
              </span>
              <br />
            </p>
          </b-col>
          <b-col class="px-0">
            <b>Deliver To</b>
            <p class="text-small">
              <span> {{ delnote.to.name }} </span> <br />
              <span> {{ delnote.to.addr }} </span> <br />
              <span> {{ delnote.to.state }} </span> <br />
              <span v-if="delnote.to.pin || delnote.to.gstin">
                <span> <b> Pin Code: </b> {{ delnote.to.pin }} </span> <br />
                <span> <b> GSTIN: </b> {{ delnote.to.gstin }} </span> <br />
              </span>
            </p>
          </b-col>
        </b-container>
      </b-col>
      <b-col class="text-md-right" cols="12" md="6" order="1" order-md="2">
        <b>Delivery Note Details</b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="dnoteData"
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
      :items="delnote.contents"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      :responsive="true"
      small
      striped
      class="text-small table-border-dark"
      tbody-tr-class="gk-vertical-row"
    >
    </b-table-lite>
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
          fixed
          small
          class="text-small"
        ></b-table-lite>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="my-2"> </b-col>
      <b-col cols="12" md="8" class="my-2">
        <p class="text-small">
          <b> Narration: </b> <span> {{ delnote.narration }} </span> <br />
        </p>
      </b-col>
    </b-row>
    <div class="float-right d-print-none">
      <b-button
        v-if="cancelFlag"
        @click.prevent="onDelete"
        size="sm"
        variant="danger"
        class=""
      >
        Delete
      </b-button>
    </div>
    <br />
  </b-container>
</template>

<script>
import axios from 'axios';
import { numberToRupees } from '../../../js/utils.js';
export default {
  name: 'DeliveryNoteProfile',
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
      cancelFlag: false,
      no: '',
      isSale: false,
      delnote: {
        contents: [],
        date: '',
        narration: '',
        transport: {},
        supplyDate: '',
        from: {},
        to: {},
        issuer: '',
        designation: '',
      },
      party: {},
      total: {
        isIgst: true,
      },
    };
  },
  computed: {
    dnoteData: (self) => {
      let noteData = self.delnote;
      let transport = noteData.transport;
      let designation = self.delnote.designation
        ? `(${self.delnote.designation})`
        : '';
      let data = [
        { title: 'No.', value: noteData.no },
        { title: 'Date', value: noteData.date },
        { title: 'Supply Date.', value: noteData.supplyDate },
        { title: 'Package Count', value: transport.packageQty },
        { title: 'Mode of Transport', value: transport.mode },
        { title: 'Vehicle No.', value: transport.vehicleNo },
        {
          title: 'Issued By',
          value: `${self.delnote.issuer}  ${designation}`,
        },
      ];
      if (!transport.mode) {
        data.splice(5, 1);
      }
      return data;
    },
    totalDetails: (self) => {
      let total = [{ title: 'Taxable', value: self.total.taxable }];
      if (self.delnote.isGst) {
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
        { title: 'Delivery Note Value', value: self.total.amount },
        { title: 'Total In Words', value: self.total.text }
      );
      return total;
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
          label: 'Rate (₹)',
          tdClass: 'gk-currency-sm'
        },
        {key: 'discount', label: 'Discount (₹)', tdClass: 'gk-currency-sm'},
        { key: 'igst', label: 'IGST (%)' },
        { key: 'cgst', label: 'CGST (%)' },
        { key: 'sgst', label: 'SGST (%)' },
        { key: 'cess', label: 'CESS (%)' },
        { key: 'total', label: 'Total (₹)', tdClass: 'gk-currency-sm'},
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
    onDelete() {
      const self = this;
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Delete Delivery Note <b>${this.no}</b>?"`,
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
            // return;
            axios
              .delete('/delchal?type=canceldel', {
                data: {
                  dcid: this.id,
                },
              })
              .then((resp) => {
                if (resp.data.gkstatus === 0) {
                  let type = self.isSale ? 'sale' : 'purchase';
                  let log = {
                    activity: `delivery note for ${type} deleted: ${self.no}`,
                  };
                  axios.post('/log', log);

                  self.displayToast(
                    `Delivery Note Delete success!`,
                    `Delivery Note : ${self.no}, deleted successfully.`,
                    'success'
                  );
                  this.onUpdate({ type: 'delete' });
                } else {
                  self.displayToast(
                    `Delivery Note Delete failed!`,
                    `Unable to delete Delivery Note : ${self.no}`,
                    'danger'
                  );
                }
              });
          }
        });
    },
    formatDetails(details) {
      let noteData = details.delchaldata;
      this.no = noteData.dcno;
      this.cancelFlag = !noteData.cancelFlag;
      this.isSale = noteData.inoutflag === 15;
      this.total = {
        amount: noteData.delchaltotal,
        isIgst: details.taxname === 'IGST',
        cess: details.totalcessamt,
        tax: details.totaltaxamt,
        discount: details.totaldiscount,
        taxable: details.totaltaxablevalue,
        text: numberToRupees(noteData.delchaltotal),
      };
      this.delnote = {
        isGst: details.taxname !== 'VAT',
        contents: [],
        no: noteData.dcno,
        date: noteData.dcdate,
        narration: noteData.dcnarration,
        supplyDate: details.dateofsupply,
        transport: {
          mode: noteData.modeoftransport,

          packageQty: noteData.noofpackages,
          vehicleNo: noteData.vehicleno,
        },
        issuer: noteData.issuername || '',
        designation: noteData.designation || '',
      };

      let party = {
        name: details.custSupDetails.custname,
        addr: details.custSupDetails.custaddr,
        state: details.custSupDetails.custsupstate,
        pin: details.custSupDetails.pincode,
      };

      let shipData = noteData.consignee || {};
      let shipTo = {
        name: shipData.consigneename || '',
        addr: shipData.consigneeaddress || '',
        state: shipData.consigneestate || '',
        pin: shipData.consigneepincode || '',
        gstin: shipData.gstinconsignee || '',
      };

      let godown = {
        name: noteData.goname,
        addr: noteData.goaddr,
        state: noteData.gostate,
      };

      if (noteData.inoutflag === 15) {
        this.delnote.from = godown;
        this.delnote.to = shipTo.name ? shipTo : party;
      } else {
        this.delnote.from = party;
        this.delnote.to = godown;
      }

      for (const name in details.delchalContents) {
        const item = details.delchalContents[name];
        this.delnote.contents.push({
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
        .get(`/delchal?delchal=single&dcid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch Delivery Note Error!`,
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
              title: `Fetch Delivery Note Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Delivery Note Details! Please Try after sometime.`,
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
  watch: {
    id: function(id) {
      if (id && parseInt(id) > -1) {
        this.isPreloading = true;
        console.log(`Fetch id = ${id}`)
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
