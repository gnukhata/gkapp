<template>
  <b-container fluid>
    <b-row>
      <b-col cols="8">
        <p>
          <b> {{ invoice.isSale ? "Buyer" : "Seller" }}</b>
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
    <b-row>
      <b-col cols="12">
        <b>Billed Items:</b>
      </b-col>
      <b-col cols="12">
        <b-table :items="invoice.invItems" :fields="tableFields">
          <template #cell(price)="data">
           ₹  {{data.value}}
          </template>
          <template #cell(discount)="data">
           ₹  {{data.value}}
          </template>
          <template #cell(tax)="data">
            {{data.value.rate}} %
          </template>
          <template #cell(cess)="data">
            {{data.value.rate}} %
          </template>
          <template #cell(total)="data">
           ₹  {{data.value}}
          </template>
          <template #custom-foot>
            <b-tr>
              <b-th colspan="6">Total</b-th>
              <b-th>₹ {{invoice.total.amount}}</b-th>
            </b-tr>
          </template>
        </b-table>
      </b-col>
      <b-col cols="12">
        <b>Total in words: {{invoice.total.text}}</b>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "TransactionProfile",
  components: {},
  props: {
    invid: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      invoice: {
        date: "",
        party: {
          name: "",
          state: "",
          addr: "",
          pincodce: "",
        },
        isSale: "",
        invItems: [],
        total: {
          amount: 0,
          text: "Zero Rupee"
        }
      },
      tableFields: [
        {
          key: 'name',
          label: 'Item'
        },
        'qty',
        {
          key: 'price',
          label: 'Rate'
        },
        'discount',
        'tax',
        'cess',
        'total'
      ]
    };
  },
  computed: {
    ...mapState(["authToken"]),
  },
  methods: {
    getDetails() {
      axios
        .get(`/invoice?inv=single&invid=${this.invid}`)
        .then((response) => {
          switch (response.data.gkstatus) {
            case 0:
              // this.invoice = response.data.gkresult;
              this.formatInvoiceDetails(response.data.gkresult);
              break;
            case 2:
              this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: "warning",
                appendToast: true,
                solid: true,
              });
              break;
            case 3:
              this.$bvToast.toast(`Unable to Fetch Transaction Details! Please Try after sometime.`, {
                title: `Fetch Transaction Details Error!`,
                autoHideDelay: 3000,
                variant: "warning",
                appendToast: true,
                solid: true,
              });
              break;
            default:
            // this.$bvToast.toast(
            //   `Unable to create ${this.formType}, Please try again`,
            //   {
            //     title: `${this.formMode} ${this.formType} Error!`,
            //     autoHideDelay: 3000,
            //     variant: "danger",
            //     appendToast: true,
            //     solid: true,
            //   }
            // );
          } // end switch
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `${this.formMode} ${this.formType} Error!`,
            autoHideDelay: 3000,
            variant: "warning",
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
          },
          isSale: details.inoutflag === 15,
          invItems: [],
          total: {
            amount: details.invoicetotal,
            text: details.invoicetotalword
          }
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
    invid: function () {
      this.getDetails();
    },
  },
  mounted() {
    // console.log("mounted")
    this.getDetails();
  },
};
</script>

