<template>
  <b-container style="min-width: 300px" fluid class="mt-2 px-md-3 px-2 align-form-label-right">
    <b-alert :show="isInvDateValid === false" variant="danger"
      >Date must be within the Financial Year, from <b>{{ yearStart }}</b> to
      <b>{{ yearEnd }}</b>
    </b-alert>
    <div class="mb-2">
      <b-form-radio-group
        v-model="form.type"
        button-variant="outline-secondary"
        size="sm"
        buttons
        class="mx-1"
      >
        <b-form-radio value="sale">Sale</b-form-radio>
        <b-form-radio value="purchase">Purchase</b-form-radio>
      </b-form-radio-group>
      <span id="edit-invoice-list" class="d-inline-block">
        <autocomplete
          size="sm"
          id="input-8-2"
          v-model="invId"
          :options="invList"
          @input="updateInvoiceData(invId)"
          required
          placeholder="Invoice"
        >
        </autocomplete>
      </span>
    </div>
    <b-form @submit.prevent="onSubmit">
      <b-card-group class="d-block d-md-flex my-2" deck>
        <!-- Debit Credit Note Details -->
        <dc-note-details
          :config="config.dcNote"
          :saleFlag="isSale"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.dcNote"
          ref="dcNote"
        ></dc-note-details>
        <!-- Invoice Details -->
        <invoice-details
          :config="config.inv"
          :saleFlag="isSale"
          :parentData="form.invoice"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.invoice"
          ref="invoice"
        ></invoice-details>
        <!-- Buyer/Seller Details -->
        <party-details
          :mode="form.type"
          :parentData="form.party"
          :gstFlag="isGst"
          :invoiceParty="invoiceParty"
          :config="config.party"
          :saleFlag="isSale"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.party"
          ref="party"
        >
        </party-details>
      </b-card-group>
      <div class="my-2" v-if="config.taxType">
        <b-form-radio-group
          button-variant="outline-secondary"
          size="sm"
          buttons
          v-model="form.taxType"
        >
          <b-form-radio value="gst">GST</b-form-radio>
          <b-form-radio value="vat">VAT</b-form-radio>
        </b-form-radio-group>
      </div>
      <!-- Bill Table -->
      <bill-table
        :gstFlag="isGst"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :updateCounter="updateCounter.bill"
        :parentData="form.bill"
        ref="bill"
      ></bill-table>
      <total-table
        :config="config.total"
        :gstFlag="isGst"
        :billData="form.bill"
        :updateCounter="updateCounter.totalTable"
        ref="totalTable"
      ></total-table>
      <b-card-group class="d-block d-md-flex" deck>
        <!-- Invoice Comments -->
        <comments
          ref="narration"
          :config="config.comments"
          :updateCounter="updateCounter.comments"
          :parentData="form.comments"
        ></comments>
      </b-card-group>
      <b-tooltip
        target="inv-submit"
        :show="showErrorToolTip"
        placement="top"
        triggers="manual"
      >
        Date must be within the Financial Year, from <b>{{ yearStart }}</b> to
        <b>{{ yearEnd }}</b>
      </b-tooltip>
      <hr />
      <div class="float-right">
        <b-button
          class="m-1"
          size="sm"
          variant="danger"
          @click.prevent="$router.go(-1)"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle"
            icon="arrow-left"
          ></b-icon>
          <span class="align-middle"> Back</span>
        </b-button>
        <b-button
          class="m-1"
          size="sm"
          variant="warning"
          @click.prevent="resetForm"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle"
            icon="arrow-repeat"
          ></b-icon>
          <span class="align-middle"> Reset</span>
        </b-button>
        <b-button
          id="inv-submit"
          :disabled="!isInvDateValid"
          type="submit"
          size="sm"
          class="m-1"
          variant="success"
        >
          <span>
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Create</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix"></div>
    </b-form>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { reverseDate } from '../../js/utils';

// import Config from '../../components/Config.vue';

import PartyDetails from '../../components/form/transaction/PartyDetails.vue';
// import ShipDetails from '../../components/form/transaction/ShipDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
// import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import InvoiceDetails from '../../components/form/transaction_details/InvoiceDetails.vue';
import DcNoteDetails from '../../components/form/transaction_details/DcNoteDetails.vue';

import Autocomplete from '../../components/Autocomplete.vue';

import dcNoteConfig from '../../js/config/debitCreditNote.js';

export default {
  name: 'DebitCreditNote',
  components: {
    // Config,

    PartyDetails,
    // ShipDetails,
    DcNoteDetails,
    BillTable,
    TotalTable,
    // TransportDetails,
    Comments,
    InvoiceDetails,

    Autocomplete,
  },
  data() {
    return {
      vuexNameSpace: '',
      isLoading: false,
      isInvDateValid: false,
      isCredit: false,
      updateCounter: {
        party: 0,
        invoice: 0,
        dcNote: 0,
        bill: 0,
        totalTable: 0,
        comments: 0,
      },
      form: {
        type: 'sale',
        invoice: {},
        dcNote: {},
        party: {},
        ship: {},
        taxType: 'gst', // vat
        bill: [],
        transport: {},
        narration: null,
        total: {},
      },
      invId: null,
      options: {
        drInvoices: {
          sale: [],
          purchase: [],
        },
        crInvoices: {
          sale: [],
          purchase: [],
        },
      },
    };
  },
  computed: {
    config: (self) => {
      let newConf =
        self.$store.getters[`${self.vuexNameSpace}/getCustomDCNoteConfig`];
      if (newConf) {
        if (newConf.inv.class) {
          newConf.inv.class = {
            'mr-md-1': !!newConf.party,
            'ml-md-1': !!newConf.dcNote,
          };
        }

        if (newConf.party.class) {
          newConf.party.class = {
            'ml-md-1': !!(newConf.inv || newConf.dcNote),
          };
        }

        if (newConf.dcNote.class) {
          newConf.dcNote.class = {
            'mr-md-1': !!(newConf.inv || newConf.party),
          };
        }

        if (newConf.comments.class) {
          newConf.comments.class = {
            'ml-md-1': !!(newConf.transport || newConf.payment),
          };
        }
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
          dcNote: {},
          inv: {
            class: {},
          },
          party: {
            class: {},
          },
          taxType: true,
          bill: {
            footer: {
              headingColspan: 1,
            },
          },
          comments: {
            class: {},
          },
          total: {},
        };
      }

      return newConf;
    },
    invList: (self) => {
      const noteType = self.isCredit ? 'crInvoices' : 'drInvoices';
      const invType = self.form.type;
      return self.options[noteType][invType];
    },
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    isSale: (self) => self.form.type === 'sale',
    isGst: (self) => self.form.taxType === 'gst',
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'invoiceParty']),
  },
  methods: {
    onComponentDataUpdate(payload) {
      switch (payload.name) {
        case 'dc-note-details':
          Object.assign(this.form.dcNote, payload.data);
          this.isCredit = this.form.dcNote.type === 'credit';
          // if (this.form.dcNote.invNo !== this.invId) {
          //   this.fetchInvoiceData();
          // }
          // console.log(this.form.dcNote)
          break;
        case 'party-details':
          Object.assign(this.form.party, payload.data);
          this.updateCounter.ship++;
          break;
        case 'bill-table':
          Object.assign(this.form.bill, payload.data);
          this.updateCounter.totalTable++;
          break;
      }
    },
    collectComponentData() {
      Object.assign(this.form.dcNote, this.$refs.dcNote.form);
      Object.assign(this.form.invoice, this.$refs.invoice.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData() {
      this.updateCounter.party++;
      this.updateCounter.dcNote++;
      this.updateCounter.invoice++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.comments++;
    },
    fetchInvoiceData() {
      let invId = this.form.dcNote.invNo;
      if (!invId) {
        return;
      }
      this.isPreloading = true;
      let self = this;
      axios
        .get(`/invoice?inv=single&invid=${invId}`)
        .then((resp) => {
          self.isPreloading = false;
          if (resp.data.gkstatus === 0) {
            let data = resp.data.gkresult;
            // console.log(resp.data);
            let invState =
              data.inoutflag === 15 // if sale inv state will be source else it will destination
                ? self.options.states.find(
                    (state) => state.text === data.sourcestate
                  )
                : self.options.states.find(
                    (state) => state.text === data.destinationstate
                  );
            // set invoice details
            self.form.invoice = {
              type: data.inoutflag === 15 ? 'sale' : 'purchase',
              no: data.invoiceno,
              date: data.invoicedate.split('-').reverse().join('-'),
              delNote: null, /////////////////////////
              ebn: data.ewaybillno || null,
              addr: data.address,
              pin: data.pincode,
              state: invState ? invState.value : {},
              issuer: data.issuername,
              role: data.designation,
            };

            self.form.party.type =
              data.custSupDetails.csflag === 3 ? 'customer' : 'supplier';
            self.form.taxType = data.taxflag === 7 ? 'gst' : 'vat';
            self.form.narration = data.narration;
            self.form.totalRoundFlag = !!data.roundoff;

            // debugger;
            this.$nextTick().then(() => {
              // set party details
              self.form.party.type =
                data.custSupDetails.csflag === 3 ? 'customer' : 'supplier';
              if (self.form.party.type === 'customer') {
                self.form.party.name = self.options.customers.find(
                  (cust) => cust.text === data.custSupDetails.custname
                );
              } else {
                self.form.party.name = self.options.suppliers.find(
                  (sup) => sup.text === data.custSupDetails.custname
                );
              }
              // ;
              self.form.party.name = self.form.party.name
                ? self.form.party.name.value
                : { name: '', id: null };
            });

            // set bill items
            self.form.bill = [];
            self.options.bill = [];
            self.editFlag = 0;
            for (const itemCode in data.invcontents) {
              self.editFlag++;
              // this.addBillItem();
              // continue;
              let item = data.invcontents[itemCode];
              let itemName = data.invcontents[itemCode].proddesc;
              let product = self.options.products.find(
                (prod) => prod.text === itemName
              );
              let billItem = {
                product: product ? product.value : { name: 'null', id: '' },
                discount: { amount: parseFloat(item.discount) },
                hsn: item.gscode,
                igst: {
                  amount: parseFloat(item.taxamount),
                  rate: parseFloat(item.taxrate),
                },
                cess: {
                  amount: parseFloat(item.cessrate),
                  rate: parseFloat(item.cess),
                },
                vat: {
                  amount: parseFloat(item.taxamount),
                  rate: parseFloat(item.taxrate),
                },
                qty: parseFloat(item.qty),
                fqty: item.freeqty,
                rate: parseFloat(item.priceperunit),
                isService: item.gsflag === 19,
              };
              // console.log(itemName)
              self.options.bill.push(billItem);
              // self.fetchProductDetails(product.id, self.editFlag-1);
            }
          }
          self.updateComponentData();
        })
        .catch((error) => {
          this.displayToast(
            'Fetch Invoice ${this.invid} data Error!',
            error.message,
            'warning'
          );
        });
    },
    /**
     * updateInvoiceData()
     *
     * Given an invoice id, updates the products in the bill table
     */
    updateInvoiceData(invoiceId) {
      if(!isNaN(invoiceId) && !invoiceId) {
        return;
      }
      let self = this;
      axios
        .get(`/invoice?inv=single&invid=${invoiceId}`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            const inv = resp.data.gkresult;
            self.form.taxType = inv.taxflag === 7 ? 'gst' : 'vat';

            Object.assign(self.form.invoice, {
              no: inv.invoiceno,
              date: reverseDate(inv.invoicedate),
              state: inv.inoutflag === 9
                ? { id: inv.taxstatecode, name: inv.destinationstate }
                : { id: inv.sourcestatecode, name: inv.sourcestate }
            });
            Object.assign(this.form.party, {
              name: inv.custSupDetails.custname,
              type: inv.custSupDetails.csflag === 3 ? 'customer' : 'supplier',
            });

            let item, billItem;
            self.form.bill = [];
            for (const itemCode in inv.invcontents) {
              item = inv.invcontents[itemCode];
              billItem = {
                product: item.proddesc,
                discount: { amount: parseFloat(item.discount) },
                qty: parseFloat(item.qty),
                fqty: item.freeqty,
                rate: parseFloat(item.priceperunit),
                isService: item.gsflag === 19,
              };
              if (billItem.isService) {
                billItem.qty = 1;
              }
              self.form.bill.push(billItem);
            }

            this.updateComponentData();
          }
        })
        .catch(() => {
          return false;
        });
    },
    resetForm() {
      this.form = {
        type: 'sale', // purchase
        dcNote: {
          type: 'debit',
          no: null,
          invNo: null,
          date: this.formatDateObj(new Date()),
          gstin: null,
          referenceFlag: false,
          badQuality: false,
          purpose: 'price', // 'qty'
        },
        invoice: {
          no: null,
          date: this.formatDateObj(new Date()),
          delNote: null,
          ebn: null,
          addr: null,
          pin: null,
          state: { id: null, name: null },
          issuer: null,
          role: null,
        },
        party: {
          type: 'customer', // supplier
          options: {
            states: [],
            gstin: [],
          },
          custid: null,
          name: { id: null, name: null },
          addr: null,
          state: { id: null, name: null },
          gstin: null,
          tin: null,
          pin: null,
          editFlag: false,
          loading: false,
        },
        taxType: 'gst', // vat
        bill: [
          {
            product: { name: '', id: '' },
            hsn: '',
            qty: 0,
            fqty: 0,
            rate: 0,
            discount: { rate: 0, amount: 0 },
            taxable: 0,
            igst: { rate: 0, amount: 0 },
            cess: { rate: 0, amount: 0 },
            vat: { rate: 0, amount: 0 },
            total: 0,
            isService: false, // used to make certain fields readonly
          },
        ],
        narration: null,
        totalRoundFlag: false,
      };
      this.updateComponentData();
    },
    preloadData() {
      const requests = [
        // credit note invoice list
        axios.get('/drcrnote?inv=all&type=sale&drcrflag=3').catch((error) => {
          this.displayToast(
            'Fetch Non Rejected Invoice List Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        axios
          .get('/drcrnote?inv=all&type=purchase&drcrflag=3')
          .catch((error) => {
            this.displayToast(
              'Fetch Non Rejected Invoice List Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
        // debit note invoice list
        axios.get('/drcrnote?inv=all&type=sale&drcrflag=4').catch((error) => {
          this.displayToast(
            'Fetch Non Rejected Invoice List Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        axios
          .get('/drcrnote?inv=all&type=purchase&drcrflag=4')
          .catch((error) => {
            this.displayToast(
              'Fetch Non Rejected Invoice List Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
      ];
      const self = this;
      function formatInvoice(inv) {
        return {
          text: `${inv.invoiceno},${inv.invoicedate},${inv.custname}`,
          value: inv.invid,
        };
      }
      return Promise.all([...requests]).then(([resp1, resp2, resp3, resp4]) => {
        if (resp1.data.gkstatus === 0) {
          self.options.crInvoices.sale = resp1.data.gkresult.map(formatInvoice);
        }
        if (resp2.data.gkstatus === 0) {
          self.options.crInvoices.purchase = resp2.data.gkresult.map(
            formatInvoice
          );
        }
        if (resp3.data.gkstatus === 0) {
          self.options.drInvoices.sale = resp3.data.gkresult.map(formatInvoice);
        }
        if (resp4.data.gkstatus === 0) {
          self.options.drInvoices.purchase = resp4.data.gkresult.map(
            formatInvoice
          );
        }
      });
    },
    initForm() {
      this.preloadData();
      // this.resetForm();
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
  beforeMount() {
    this.vuexNameSpace = 'dcNoteConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, dcNoteConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initDCNoteConfig`, {
      orgCode: this.orgCode,
    });
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future

    this.initForm();
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>