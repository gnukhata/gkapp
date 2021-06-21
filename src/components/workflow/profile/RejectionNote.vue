<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <h5>{{ party.isCustomer ? 'Customer' : 'Supplier' }} Details</h5>
        <b>{{ party.name }}</b
        ><br />
        <span>{{ party.addr }}</span
        ><br />
        <span>{{ party.state }}</span
        ><br />
        <br />
      </b-col>
      <b-col class="text-md-right" cols="12" md="6">
        <h5>Rejection Note Details</h5>
        Date: {{ rnote.date }} <br />
        Invoice No: {{ rnote.inv.no }} <br />
        Invoice Date: {{ rnote.inv.date }} <br />
        <br /><br />
      </b-col>
    </b-row>
    <b-table-lite
      :items="rnote.contents"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
    ></b-table-lite>
    <b-row>
      <b-col cols="12" md="6" class="my-2" order="2" order-md="1"> </b-col>
      <b-col cols="12" md="6" class="my-2" order="1" order-md="2">
        <b-table-simple small>
          <b-thead>
            <b-tr>
              <b-th>Total</b-th>
              <b-th class="text-right">₹</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr>
              <b-th>Taxable</b-th>
              <b-td class="text-right">{{ total.taxable }}</b-td>
            </b-tr>
            <b-tr v-if="!total.isIgst">
              <b-th>CGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr v-if="!total.isIgst">
              <b-th>SGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr v-if="total.isIgst">
              <b-th>IGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr>
              <b-th>CESS</b-th>
              <b-td class="text-right">{{ total.cess }}</b-td>
            </b-tr>
            <b-tr>
              <b-th>Rejected Value</b-th>
              <b-td class="text-right">{{ total.amount }}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
export default {
  name: '',
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
      rnote: {
        date: '',
        contents: [],
        narration: '',
        inv: {},
      },
      total: {},
      party: {},
    };
  },
  computed: {
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: 'Item',
        },
        { key: 'qty', label: 'Rejected Qty' },
        {
          key: 'rate',
          label: 'Rate',
        },
        { key: 'igst', label: 'IGST %' },
        { key: 'cgst', label: 'CGST %' },
        { key: 'sgst', label: 'SGST %' },
        { key: 'cess', label: 'CESS %' },
        'total',
      ];
      if (self.total.isIgst) {
        fields.splice(4, 2);
      } else {
        fields.splice(3, 1);
      }

      return fields;
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
            title: `Fetch Cash Memo Error!`,
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    fetchAndUpdateData() {
      this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
          case 0:
            // this.invoice = response.data.gkresult;
            // this.formatInvoiceDetails(response.data.gkresult);
            // this.output = response.data.gkresult;
            this.formatDetails(response.data.gkresult);
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
              `Unable to Fetch Transaction Details! Please Try after sometime.`,
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
    id: function () {
      this.fetchAndUpdateData();
    },
  },
  mounted() {
    if (this.id) {
      this.fetchAndUpdateData();
    }
  },
};
</script>