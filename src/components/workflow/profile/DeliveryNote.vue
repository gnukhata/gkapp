<template>
  <div>
    {{ output }}
  </div>
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
      output: {}
    }
  },
  methods: {
    getDetails() {
      return axios
        .get(`/delchal?delchal=single&dcid=${this.id}`)
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
            this.output = response.data.gkresult;
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
  mounted() {},
};
</script>