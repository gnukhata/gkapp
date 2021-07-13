<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" md="6" class="my-2">
        <h5>{{ this.flags.credit ? 'Cr' : 'Dr' }} Note Details</h5>
        <span> <b> Date:</b> {{ dcNote.date }} </span> <br />
        <span><b>Inv No:</b> {{ inv.no }} </span><br />
        <span><b>Inv Date:</b> {{ inv.date }} </span> <br />
      </b-col>
      <b-col cols="12" md="6" class="text-md-right my-2">
        <h5>{{ flags.sale ? 'Buyer' : 'Seller' }} Details</h5>
        <span>{{ party.name }} </span><br />
        <span>{{ party.addr }} </span> <br />
        <span>{{ party.pincode }} </span> <br />
        <span v-if="party.gstin"><b>GSTIN:</b> {{ party.gstin }} </span>
      </b-col>
    </b-row>
    <b-table-lite
      :items="dcNote.dcItems"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
    ></b-table-lite>
    <b-row>
      <b-col cols="12" md="6" class="my-2"> </b-col>
      <b-col cols="12" md="6" class="my-2">
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
            <b-tr v-if="!flags.igst">
              <b-th>CGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr v-if="!flags.igst">
              <b-th>SGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr v-if="flags.igst">
              <b-th>IGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr>
              <b-th>CESS</b-th>
              <b-td class="text-right">{{ total.cess }}</b-td>
            </b-tr>
            <b-tr>
              <b-th
                >{{ this.flags.credit ? 'Credit' : 'Debit' }} Note Value:</b-th
              >
              <b-td class="text-right">{{ total.reduct }}</b-td>
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
        igst: true, // igst or cgst+sgst
        credit: true, // debit or credit
        qty: false, // qty or price
        badQuality: false,
        sale: true, // sale or purchase
      },
    };
  },
  computed: {
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
    id: function (id) {
      if (id) this.fetchAndUpdateData();
    },
  },
  methods: {
    formatDetails(details) {
      if (details) {
        // this.output = JSON.stringify(details, null, 4);
        this.dcNote = {
          date: details.drcrdate,
          dcItems: [],
        };
        this.flags = {
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
      this.getDetails().then((response) => {
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
    if (this.id) {
      this.fetchAndUpdateData();
    }
  },
};
</script>