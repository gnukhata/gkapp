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
        ><br /><br />
      </b-col>
      <b-col class="text-md-right" cols="12" md="6">
        <h5>{{ saleFlag ? 'Sale' : 'Purchase' }} Order Details</h5>
        Order Date:{{ psorder.date }} <br />
        Supply Date:
        {{ psorder.supplyDate ? psorder.supplyDate : '-' }} <br />
        Transport By : {{ transport.mode }} <br />
        <span v-if="transport.vehicleNo">
          Vehicle No : {{ transport.vehicleNo }} <br />
        </span>
        Payment Terms: {{ psorder.terms }}<br />
        Credit Period: {{ psorder.creditPeriod }}<br />
        {{ saleFlag ? 'Dispatch From' : 'Deliver At' }}: {{ psorder.godown
        }}<br />
        <br /><br />
      </b-col>
    </b-row>
    <b-table-lite
      :items="psorder.contents"
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
              <b-th>{{saleFlag? 'Sale': 'Purchase'}} Order Value</b-th>
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
      saleFlag: true,
      psorder: {
        date: '',
        terms: '',
        creditPeriod: '',
        godown: '',
        contents: [],
        narration: '',
      },
      total: {},
      party: {},
      transport: {},
    };
  },
  computed: {
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
      };
      this.psorder = {
        contents: [],
        date: details.orderdate,
        narration: details.psnarration,
        supplyDate: details.dateofsupply,
        terms: details.payterms,
        creditPeriod: details.creditperiod,
        godown: `${details.goname} (${details.goaddr})`,
      };
      this.transport = {
        mode: details.modeoftransport,
        vehicleNo: details.vehicleno,
      };

      this.party = {
        name: details.custSupDetails.custname,
        addr: details.custSupDetails.custaddr,
        state: details.custSupDetails.custsupstate,
        pin: details.custSupDetails.pincode,
        isCustomer: details.custSupDetails.csflag === 3,
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