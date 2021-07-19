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
    {{ voucher.narration }}
    <br /><br />
    <div class="float-right">
      <b-button
        @click.prevent="onDelete"
        size="sm"
        variant="danger"
        class="mx-1"
        >Delete</b-button
      >
      <b-button
        size="sm"
        variant="warning"
        :to="{ name: 'Edit_Voucher', params: { vid: id } }"
      >
        Edit
      </b-button>
    </div>
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
      type: '',
      no: '',
    };
  },
  methods: {
    onDelete() {
      const self = this;
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Delete ${this.type} Voucher <b>${this.no}</b>?"`,
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
              .delete('/transaction', {
                data: {
                  vouchercode: this.id,
                },
              })
              .then((resp) => {
                if (resp.data.gkstatus === 0) {
                  self.displayToast(
                    `Voucher Delete success!`,
                    `${self.type} Voucher : ${self.no}, deleted successfully.`,
                    'success'
                  );
                  this.onUpdate({ type: 'delete' });
                } else {
                  self.displayToast(
                    `Voucher Delete failed!`,
                    `Unable to delete ${self.type} Voucher : ${self.no}`,
                    'danger'
                  );
                }
              });
          }
        });
    },
    /**
     * formatInvoiceDetails()
     *
     * Description: Format the invoice details from gkcore to an
     * internal format for ease of use
     */
    formatVoucherDetails(details) {
      if (details) {
        // console.log(details);
        this.no = details.vouchernumber;
        this.type = details.vouchertype;
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
