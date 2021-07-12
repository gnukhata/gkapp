<template>
  <b-container fluid>
    <div class="text-right mb-3">
      <b>{{ voucher.date }}</b>
    </div>
    <b-table-lite
      :items="voucher.content"
      :fields="tableFields"
      bordered
      head-variant="dark"
      foot-clone
    >
      <template #foot(account)="">
        <span>Total</span>
      </template>
      <template #foot(dr)="">
        <span>₹ {{ totalDr }}</span>
      </template>
      <template #foot(cr)="">
        <span>₹ {{ totalCr }}</span>
      </template>
    </b-table-lite>
    <p>
      <b>Comments:</b>
    </p>
    {{voucher.narration}}
  </b-container>
</template>

<script>
import axios from 'axios';
export default {
  name: 'VoucherProfile',
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
    totalCr: (self) =>
      self.voucher.content
        .reduce((acc, item) => acc + (parseFloat(item.cr) || 0), 0)
        .toFixed(2),
    totalDr: (self) =>
      self.voucher.content
        .reduce((acc, item) => acc + (parseFloat(item.dr) || 0), 0)
        .toFixed(2),
  },
  data() {
    return {
      tableFields: ['account', 'dr', 'cr'],
      voucher: {
        content: [],
        date: '',
        narration: '',
      },
    };
  },
  methods: {
    /**
     * formatInvoiceDetails()
     *
     * Description: Format the invoice details from gkcore to an
     * internal format for ease of use
     */
    formatVoucherDetails(details) {
      if (details) {
        // console.log(details);
        this.voucher.narration = details.narration;
        this.voucher.date = details.voucherdate;
        this.voucher.content = [];
        for (const dr in details.drs) {
          this.voucher.content.push({
            account: dr,
            dr: details.drs[dr],
            cr: '',
          });
        }
        for (const cr in details.crs) {
          this.voucher.content.push({
            account: cr,
            dr: '',
            cr: details.crs[cr],
          });
        }
      }
    },
    getDetails() {
      return axios.get(`/transaction?code=${this.id}`).catch((error) => {
        this.$bvToast.toast(`Error: ${error.message}`, {
          title: `Fetch Voucher Error!`,
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
            this.formatVoucherDetails(response.data.gkresult);
            // this.output = response.data.gkresult;
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `Fetch Voucher Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Voucher Details! Please Try after sometime.`,
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
    id: function (id) {
      if (id) this.fetchAndUpdateData();
    },
  },
  mounted() {
    if (this.id) {
      this.fetchAndUpdateData();
    }
  },
};
</script>