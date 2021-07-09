<template>
  <b-container fluid>
    <b-row>
      <b-col cols="8">
        <p>
          <b> {{ invoice.isSale ? 'Buyer' : 'Seller' }}</b>
          <br />
          <span>{{ invoice.party.name }} </span><br />
          <span>{{ invoice.party.state }} </span> <br />
          <span>{{ invoice.party.pincode }} </span>
        </p>
      </b-col>
      <b-col cols="4" class="text-right">
        <b>{{ invoice.date }}</b>
      </b-col>
    </b-row>
    <b-table
      :items="invoice.invItems"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
    >
      <template #cell(price)="data"> ₹ {{ data.value }} </template>
      <template #cell(discount)="data"> ₹ {{ data.value }} </template>
      <template #cell(tax)="data"> {{ data.value.rate }} % </template>
      <template #cell(cess)="data"> {{ data.value.rate }} % </template>
      <template #cell(total)="data"> ₹ {{ data.value }} </template>
      <template #custom-foot>
        <b-tr>
          <b-th colspan="6">Total</b-th>
          <b-th>₹ {{ invoice.total.amount }}</b-th>
        </b-tr>
      </template>
    </b-table>
    <div>
      <b>Total in words: {{ invoice.total.text }}</b>
    </div>
    <div class="float-right my-2">
      <b-button
        v-if="onCreditFlag"
        class="mr-2"
        size="sm"
        variant="success"
        :to="{
          name: 'Billwise',
          params: {
            custType: invoice.party.csflag,
            custName: invoice.party.name,
          },
        }"
      >
        <b-icon icon="clipboard-check"></b-icon> Adjust</b-button
      >
      <b-button
        v-if="rectifyFlag"
        class="mr-2"
        size="sm"
        variant="warning"
        :to="{ name: 'Invoice', params: { mode: 'edit', invid: id } }"
      >
        <b-icon icon="pencil"></b-icon> Rectify</b-button
      >
      <b-button
        v-if="cancelFlag"
        size="sm"
        variant="danger"
        @click="confirmOnCancel"
      >
        <b-icon icon="x-octagon"></b-icon> Cancel</b-button
      >
    </div>
    <div class="clearfix"></div>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

export default {
  name: 'InvoiceProfile',
  components: {},
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
      invoice: {
        date: '',
        party: {
          csflag: '3', // 3 -> customer, 19 -> supplier
          name: ' ',
          state: '',
          addr: '',
          pincodce: '',
        },
        isSale: '',
        invItems: [],
        total: {
          amount: 0,
          text: 'Zero Rupee',
        },
        number: '',
      },
      tableFields: [
        {
          key: 'name',
          label: 'Item',
        },
        'qty',
        {
          key: 'price',
          label: 'Rate',
        },
        'discount',
        'tax',
        'cess',
        'total',
      ],
    };
  },
  computed: {
    onCreditFlag: (self) => !!self.pdata.onCreditFlag,
    rectifyFlag: (self) => !!self.pdata.rectifyFlag,
    cancelFlag: (self) => !!self.pdata.cancelFlag,
    ...mapState(['authToken']),
  },
  methods: {
    getDetails() {
      return axios
        .get(`/invoice?inv=single&invid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `${this.formMode} ${this.formType} Error!`,
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    /**
     * formatInvoiceDetails()
     *
     * Description: Format the invoice details from gkcore to an
     * internal format for ease of use
     */
    formatInvoiceDetails(details) {
      if (details) {
        let party = details.custSupDetails || {};
        this.invoice = {
          date: details.invoicedate,
          party: {
            name: party.custname,
            state: party.custsupstate,
            addr: party.custaddr,
            pincodce: party.pincode,
            csflag: party.csflag,
          },
          isSale: details.inoutflag === 15,
          invItems: [],
          total: {
            amount: details.invoicetotal,
            text: details.invoicetotalword,
          },
          number: details.invoiceno,
        };
        if (details.invcontents) {
          let product = {};
          this.invoice.invItems = Object.keys(details.invcontents).map(
            (key) => {
              product = {
                id: key,
                name: details.invcontents[key].proddesc,
                uom: details.invcontents[key].uom,
                qty: details.invcontents[key].qty,
                freeQty: details.invcontents[key].freeQty,
                price: details.invcontents[key].priceperunit,
                discount: details.invcontents[key].discount,
                taxable: details.invcontents[key].taxableamount,
                total: details.invcontents[key].totalAmount,
                tax: {
                  name: details.invcontents[key].taxname,
                  rate: details.invcontents[key].taxrate,
                  amount: details.invcontents[key].taxamount,
                },
                cess: {
                  rate: details.invcontents[key].cess,
                  amount: details.invcontents[key].cessrate,
                },
              };
              return product;
            }
          );
        }
        // console.log(this.invoice.invItems);
      }
    },
    cancelInvoice() {
      const payload = {
        data: {
          invid: this.id,
        },
      };
      axios
        .delete('/invoice?type=cancel', payload)
        .then((response) => {
          switch (response.data.gkstatus) {
            case 0:
              this.displayToast(
                'Cancel Invoice Success!',
                `Successfully cancelled Invoice ${this.invoice.number}`,
                'success'
              );
              this.getDetails().then((response) => {
                if (typeof this.onUpdate === 'function') {
                  this.onUpdate(response.data);
                }
              });
              break;
            case 3:
              this.displayToast(
                'Cancel Invoice Failure!',
                `Could not cancel Invoice ${this.invoice.number}. Try again later or Contact admin`,
                'danger'
              );
              break;
            default:
              this.displayToast(
                'Cancel Invoice Failure!',
                `Could not cancel Invoice ${this.invoice.number}. Try again later or Contact admin`,
                'danger'
              );
          }
        })
        .catch((error) => {
          this.displayToast('Cancel Invoice Failure!', error.message, 'danger');
        });
    },
    confirmOnCancel() {
      let invType = this.invoice.isSale ? 'Sale to' : 'Purchase from';
      let text = this.$createElement('div', {
        domProps: {
          innerHTML: `About to cancel Invoice: <b>${this.invoice.number}</b>, of ${this.invoice.total.text} <b>(₹ ${this.invoice.total.amount})</b> for ${invType}  ${this.invoice.party.name}. Are you sure?`,
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
            this.cancelInvoice();
          }
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
    fetchAndUpdateData() {
      this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
          case 0:
            // this.invoice = response.data.gkresult;
            this.formatInvoiceDetails(response.data.gkresult);
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `${this.formMode} ${this.formType} Error!`,
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
    // console.log("mounted")
    this.fetchAndUpdateData();
  },
};
</script>
