<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-row>
      <b-col cols="12" md="6" class="my-2">
        <b key="dcp-1" v-if="flags.sale" v-translate> Buyer Details </b>
        <b key="dcp-2" v-else v-translate> Seller Details </b>
        <br />
        <p class="text-small">
          <span>{{ party.name }} </span><br />
          <span>{{ party.addr }} </span> <br />
          <span> <b v-translate> Pin Code: </b> {{ party.pincode }} </span>
          <br />
          <span v-if="party.gstin"><b> GSTIN: </b> {{ party.gstin }} </span>
        </p>
      </b-col>
      <b-col cols="12" md="6" class="text-md-right my-2">
        <b v-if="this.flags.credit" v-translate>Credit Note Details</b>
        <b v-else v-translate>Debit Note Details</b>
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
          <b v-translate> Narration: </b> <span> {{ dcNote.narration }} </span>
          <br />
        </p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
import { numberToRupees } from '../../../js/utils.js';
import { DR_CR_MODE } from '@/js/enum.js';
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
      let modeNameMap = {};
      modeNameMap[DR_CR_MODE['discount']] = self.$gettext(
        'Adjust Price / Discount'
      );
      modeNameMap[DR_CR_MODE['returns']] = self.$gettext(
        'Adjust Qty / Return Goods'
      );
      modeNameMap[DR_CR_MODE['service_deficiency']] = self.$gettext(
        'Deficiency in services'
      );
      modeNameMap[DR_CR_MODE['inv_correction']] = self.$gettext(
        'Correction in Invoice'
      );
      modeNameMap[DR_CR_MODE['pos_change']] = self.$gettext('Change in POS');
      modeNameMap[DR_CR_MODE['prov_assessment']] = self.$gettext(
        'Finalization of Provisional assessment'
      );
      modeNameMap[DR_CR_MODE['others']] = self.$gettext('Others');
      let purpose = modeNameMap[self.dcNote.drcrmode];

      return [
        { title: self.$gettext('No.'), value: self.dcNote.no },
        { title: self.$gettext('Date'), value: self.dcNote.date },
        { title: self.$gettext('Inv No.'), value: self.inv.no },
        { title: self.$gettext('Inv Date'), value: self.inv.date },
        { title: self.$gettext('Purpose'), value: purpose },
      ];
    },
    totalDetails: (self) => {
      let total = [
        { title: self.$gettext('Taxable'), value: self.total.taxable },
      ];
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
          title: self.flags.credit
            ? self.$gettext('Credit Note Value')
            : self.$gettext('Debit Note Value'),
          value: self.total.reduct,
        },
        { title: self.$gettext('Total In Words'), value: self.total.text }
      );
      return total;
    },
    tableFields: (self) => {
      let fields = [{ key: 'name', label: self.$gettext('Item') }];
      if (self.flags.qty) {
        fields.push({
          key: 'qty',
          label: self.flags.credited
            ? self.$gettext('Qty Credited')
            : self.$gettext('Qty Debited'),
        });
        fields.push({
          key: 'rate',
          label: 'Item Rate',
          tdClass: 'gk-currency-sm',
        });
      } else {
        fields.push({
          key: 'dcValue',
          label: self.flags.credited
            ? self.$gettext('Credited Value (₹)')
            : self.$gettext('Debited Value (₹)'),
          tdClass: 'gk-currency-sm',
        });
      }
      if (self.flags.gst) {
        if (self.flags.igst) {
          fields.push({
            key: 'igst',
            label: 'IGST (%)',
            tdClass: 'gk-currency-sm',
          });
        } else {
          fields.push({
            key: 'cgst',
            label: 'CGST (%)',
            tdClass: 'gk-currency-sm',
          });
          fields.push({
            key: 'sgst',
            label: 'SGST (%)',
            tdClass: 'gk-currency-sm',
          });
        }
        fields.push({
          key: 'cess',
          label: 'CESS (%)',
          tdClass: 'gk-currency-sm',
        });
      } else {
        fields.push({
          key: 'vat',
          label: 'VAT (%)',
          tdClass: 'gk-currency-sm',
        });
      }
      fields.push({
        key: 'total',
        label: self.$gettext('Total (₹)'),
        tdClass: 'gk-currency-sm',
      });
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
          drcrmode: details.drcrmode,
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
          // let taxState = details.invdata.taxstate;
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
              vat: item.taxrate,
              total: item.totalAmount,
              uom: item.uom,
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
            title: this.$gettext(`Fetch Debit Credit Note Error!`),
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
            this.$bvToast.toast(
              this.$gettext(`Unauthorized access, Please contact admin`),
              {
                title: this.$gettext(`Fetch Debit Credit Note Error!`),
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
            break;
          default:
            this.$bvToast.toast(
              this.$gettext(
                `Unable to Fetch Debit Credit Note Details! Please Try after sometime.`
              ),
              {
                title: this.$gettext(`Fetch Transaction Details Error!`),
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
