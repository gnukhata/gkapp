<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-row>
      <b-col cols="12" md="6" class="my-2">
        <b>{{ flags.sale ? 'Buyer' : 'Seller' }} Details</b>
        <br />
        <p class="text-small">
          <span>{{ party.name }} </span><br />
          <span>{{ party.addr }} </span> <br />
          <span> <b>Pin Code:</b> {{ party.pincode }} </span> <br />
          <span v-if="party.gstin"><b>GSTIN:</b> {{ party.gstin }} </span>
        </p>
      </b-col>
      <b-col cols="12" md="6" class="text-md-right my-2">
        <b>{{ this.flags.credit ? 'Credit' : 'Debit' }} Note Details</b>
        <br />
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="dcNoteData"
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
      :items="dcNote.dcItems"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      class="text-small table-border-dark"
      striped
      tbody-tr-class="gk-vertical-row"
    >
      <template #cell(qty)="data">
        {{ data.value }} <small> {{ data.item.uom }} </small>
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
        <p class="text-small">
          <b> Narration: </b> <span> {{ dcNote.narration }} </span> <br />
        </p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
import { numberToRupees } from '../../../js/utils.js';
export default {
  name: 'DcNoteProfile',
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
      dcNote: {
        dcItems: [],
        date: '',
      },
      inv: {
        no: '',
        date: '',
      },
      party: {
        name: '',
        addr: '',
        pincode: '',
        gstin: '',
      },
      total: {},
      flags: {
        gst: true,
        igst: true, // igst or cgst+sgst
        credit: true, // debit or credit
        qty: false, // qty or price
        badQuality: false,
        sale: true, // sale or purchase
      },
    };
  },
  computed: {
    dcNoteData: (self) => {
      return [
        { title: 'No.', value: self.dcNote.no },
        { title: 'Date', value: self.dcNote.date },
        { title: 'Inv No.', value: self.inv.no },
        { title: 'Inv Date', value: self.inv.date },
      ];
    },
    totalDetails: (self) => {
      let total = [{ title: 'Taxable', value: self.total.taxable }];
      if (self.flags.gst) {
        if (self.flags.igst) {
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
          title: `${self.flags.credit ? 'Credit' : 'Debit'} Note Value`,
          value: self.total.reduct,
        },
        { title: 'Total In Words', value: self.total.text }
      );
      return total;
    },
    tableFields: (self) => {
      let fields = [{ key: 'name', label: 'Item' }];
      let dcType = self.flags.credit ? 'Credited' : 'Debited';
      if (self.flags.qty) {
        fields.push({ key: 'qty', label: `${dcType} Qty` });
        fields.push({ key: 'rate', label: 'Item Rate' });
      } else {
        fields.push({ key: 'dcValue', label: `${dcType} Value` });
      }

      if (self.flags.igst) {
        fields.push({ key: 'igst', label: 'IGST %' });
      } else {
        fields.push({ key: 'cgst', label: 'CGST %' });
        fields.push({ key: 'sgst', label: 'SGST %' });
      }
      fields.push({ key: 'cess', label: 'CESS %' });
      fields.push({ key: 'total', label: 'Total ₹' });
      return fields;
    },
  },
  watch: {
    id: function(id) {
      if (id && parseInt(id) > -1) {
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
  methods: {
    formatDetails(details) {
      if (details) {
        // this.output = JSON.stringify(details, null, 4);
        this.dcNote = {
          date: details.drcrdate,
          dcItems: [],
          narration: details.drcrnarration,
          no: details.drcrno,
        };
        this.flags = {
          gst: details.taxname !== 'VAT',
          igst: details.taxname === 'IGST',
          credit: details.dctypeflag === 3,
          qty: details.drcrmode === 18,
          badQuality: details.badquality === 1,
          sale: details.invdata.inoutflag === 15,
        };
        this.party = {
          name: details.custSupDetails.custname,
          addr: details.custSupDetails.custaddr,
          pincode: details.custSupDetails.pincode,
          gstin: details.custSupDetails.custgstin,
        };
        this.inv = {
          no: details.invdata.invoiceno,
          date: details.invdata.invoicedate,
        };
        this.total = {
          taxable: details.totaltaxablevalue,
          tax: details.totaltaxamt,
          cess: details.totalcessamt,
          reduct: details.totreduct,
          text: numberToRupees(details.totreduct),
        };
        if (details.drcrcontents) {
          for (const id in details.drcrcontents) {
            let item = details.drcrcontents[id];
            this.dcNote.dcItems.push({
              name: item.proddesc,
              rate: item.priceperunit,
              qty: item.qty,
              dcValue: item.reductionval,
              igst: item.taxrate,
              cgst: item.taxrate / 2,
              sgst: item.taxrate / 2,
              cess: item.cessrate,
              total: item.totalAmount,
              uom: item.uom
            });
          }
        }
      }
    },
    getDetails() {
      return axios
        .get(`/drcrnote?drcr=single&drcrid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch Debit Credit Note Error!`,
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
            this.formatDetails(response.data.gkresult);
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `Fetch Debit Credit Note Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Debit Credit Note Details! Please Try after sometime.`,
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
