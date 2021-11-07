<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-row>
      <b-col order="2" order-md="1">
        <b>{{ party.isCustomer ? 'Customer' : 'Supplier' }} Details</b>
        <p class="text-small">
          <span> {{ party.name }} </span><br />
          <span> {{ party.addr }} </span><br />
          <span> {{ party.state }} </span><br />
        </p>
        <br class="d-none d-md-block" />
      </b-col>
      <b-col class="text-md-right" cols="12" md="6" order="1" order-md="2">
        <b>Rejection Note Details</b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="rnoteData"
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
      :items="rnote.contents"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      striped
      tbody-tr-class="gk-vertical-row"
      class="text-small table-border-dark"
    >
      <template #cell(qty)="data">
        {{data.value}} <small> {{data.item.uom}} </small>
      </template>
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
        <b> Narration: </b> {{ rnote.narration }}
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
export default {
  name: 'RejectionNoteProfile',
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
      rnote: {
        date: '',
        contents: [],
        narration: '',
        inv: {},
        isGst: true,
      },
      total: {},
      party: {},
    };
  },
  computed: {
    rnoteData: (self) => {
      return [
        { title: 'No.', value: self.rnote.no },
        { title: 'Date', value: self.rnote.date },
        { title: 'Inv No.', value: self.rnote.inv.no },
        { title: 'Inv Date', value: self.rnote.inv.date },
      ];
    },
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: 'Item',
        },
        { key: 'qty', label: 'Rejected Qty' },
        {
          key: 'rate',
          label: 'Rate (₹)',
          tdClass: 'gk-currency-sm'
        },
        { key: 'igst', label: 'IGST (%)' },
        { key: 'cgst', label: 'CGST (%)' },
        { key: 'sgst', label: 'SGST (%)' },
        { key: 'cess', label: 'CESS (%)' },
        {key: 'total', label: 'Total (₹)', tdClass: 'gk-currency-sm'},
      ];
      if (self.total.isIgst) {
        fields.splice(4, 2);
      } else {
        fields.splice(3, 1);
      }

      return fields;
    },
    totalDetails: (self) => {
      let total = [{ title: 'Taxable', value: self.total.taxable }];
      if (self.rnote.isGst) {
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
        { title: 'Rejected Value', value: self.total.amount },
        // { title: 'Total In Words', value: self.total.text }
      );
      return total;
    },
  },
  methods: {
    formatDetails(details) {
      this.saleFlag = details.psflag === 19;

      this.total = {
        amount: details.rejectedtotal,
        isIgst: details.taxname === 'IGST',
        cess: details.totalcessamt,
        tax: details.totaltaxamt,
        taxable: details.totaltaxablevalue,
      };
      this.rnote = {
        contents: [],
        date: details.rndate,
        narration: details.rejnarration,
        inv: {
          no: details.rejinvdata.invno,
          date: details.rejinvdata.invdate,
        },
        isGst: details.taxname !== 'VAT',
        no: details.rnno,
      };
      let party = details.rejinvdata.custSupDetails;
      this.party = {
        name: party.custname,
        addr: party.custaddr,
        state: party.custsupstate,
        gstin: party.custgstin,
        isCustomer: party.csflag === 3,
      };

      for (const name in details.rejcontents) {
        const item = details.rejcontents[name];
        this.rnote.contents.push({
          name: item.proddesc,
          qty: item.qty,
          uom: item.uom,
          rate: item.priceperunit,
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
        .get(`/rejectionnote?type=single&rnid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch Rejection Note Error!`,
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
              title: `Fetch Rejection Note Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Rejection Note Details! Please Try after sometime.`,
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