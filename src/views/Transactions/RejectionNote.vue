<template>
  <b-container style="min-width: 300px" fluid class="mt-2 px-md-3 px-2 align-form-label-right">
    <div class="mb-2">
      <b-form-radio-group
        v-model="form.type"
        button-variant="outline-secondary"
        size="sm"
        buttons
        class="mx-1"
        @input="resetForm"
      >
        <b-form-radio value="sale">Rejection In</b-form-radio>
        <b-form-radio value="purchase">Rejection Out</b-form-radio>
      </b-form-radio-group>
      <span id="edit-invoice-list" class="d-inline-block">
        <autocomplete
          size="sm"
          id="input-8-2"
          v-model="invIndex"
          :options="invList"
          required
          @input="updateFormData"
          placeholder="Invoice"
        >
        </autocomplete>
      </span>
      <div class="clearfix"></div>
    </div>
    <b-form @submit.prevent="onSubmit">
      <b-card-group class="d-block d-md-flex my-2" deck>
        <!-- Rejection Note Details -->
        <rejection-note-details
          :saleFlag="isSale"
          :config="config.rnote"
          :invDate="form.invoice.date"
          ref="rnote"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.rnote"
        ></rejection-note-details>
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
      <!-- Bill Table -->
      <bill-table
        :gstFlag="isGst"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :updateCounter="updateCounter.bill"
        :parentData="form.bill"
        :onRowSelected="onRowSelected"
        ref="bill"
      ></bill-table>
      <div class="px-2">
        <!-- b-row has to be enclosed in a container tag with padding
         atleast 2, to avoid creating an offset to the right -->
        <b-row class="mt-5" v-if="config.total">
          <b-col cols="12" lg="6" order-lg="1" order="2">
            <b-card-group class="d-block d-md-flex" deck>
              <!-- Invoice Comments -->
              <comments
                ref="narration"
                :config="config.comments"
                :updateCounter="updateCounter.comments"
                :parentData="form.comments"
              ></comments>
            </b-card-group>
          </b-col>
          <b-col cols="12" lg="6" order-lg="2" order="1">
            <total-table
              :config="config.total"
              :gstFlag="isGst"
              :billData="form.bill"
              :updateCounter="updateCounter.totalTable"
              ref="totalTable"
            ></total-table>
          </b-col>
        </b-row>
      </div>
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

// import Config from '../../components/Config.vue';

import PartyDetails from '../../components/form/transaction/PartyDetails.vue';
import RejectionNoteDetails from '../../components/form/transaction_details/RejectionNoteDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
// import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import InvoiceDetails from '../../components/form/transaction_details/InvoiceDetails.vue';

import rejectionNoteConfig from '../../js/config/rejectionNote.js';

import Autocomplete from '../../components/Autocomplete.vue';

import { reverseDate } from '../../js/utils';

export default {
  name: '',
  components: {
    // Config,

    PartyDetails,
    RejectionNoteDetails,
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
      updateCounter: {
        invoice: 0,
        party: 0,
        rnote: 0,
        bill: 0,
        totalTable: 0,
        comments: 0,
      },
      saleInvIndex: 1,
      purchaseInvIndex: 1,
      form: {
        type: 'sale',
        rnote: {},
        invoice: {
          date: '',
        },
        party: {},
        taxType: 'gst', // vat
        bill: [],
        narration: null,
        total: {},
      },
      options: {
        invData: {
          sale: [],
          purchase: [],
        },
        invoices: {
          sale: [],
          purchase: [],
        },
      },
    };
  },
  computed: {
    invIndex: {
      set: function (newValue) {
        if (this.isSale) {
          this.saleInvIndex = newValue;
        } else {
          this.purchaseInvIndex = newValue;
        }
      },
      get: function () {
        return this.isSale ? this.saleInvIndex : this.purchaseInvIndex;
      },
    },
    invSelected: (self) =>
      self.isSale
        ? self.options.invData.sale[self.invIndex]
        : self.options.invData.purchase[self.invIndex],
    invList: (self) =>
      self.isSale ? self.options.invoices.sale : self.options.invoices.purchase,
    config: (self) => {
      let newConf =
        self.$store.getters[
          `${self.vuexNameSpace}/getCustomRejectionNoteConfig`
        ];
      if (newConf) {
        newConf.bill.footer.headingColspan =
          !!newConf.bill.index +
            !!newConf.bill.product +
            !!newConf.bill.hsn +
            !!newConf.bill.qty +
            !!newConf.bill.rejectedQty +
            !!newConf.bill.rate || 1;

        if (newConf.inv.class) {
          newConf.inv.class = {
            'mr-md-1': !!newConf.party,
            'ml-md-1': !!newConf.rnote,
          };
        }
        // if (newConf.ship.class) {
        //   newConf.ship.class = {
        //     'ml-md-1': !!(newConf.inv || newConf.party),
        //   };
        // }
        if (newConf.party.class) {
          newConf.party.class = {
            'ml-md-1': !!(newConf.inv || newConf.rnote),
          };
        }

        if (newConf.rnote.class) {
          newConf.rnote.class = {
            'mr-md-1': !!(newConf.inv || newConf.party),
          };
        }

        // if (newConf.comments.class) {
        //   newConf.comments.class = {
        //     'ml-md-1': !!(newConf.transport || newConf.payment),
        //   };
        // }
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
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
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    isSale: (self) => self.form.type === 'sale',
    isGst: (self) => self.form.taxType === 'gst',
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'invoiceParty', 'orgCode']),
  },
  methods: {
    onComponentDataUpdate(payload) {
      switch (payload.name) {
        case 'rejection-note-details':
          Object.assign(this.form.rnote, payload.data);
          this.isInvDateValid = payload.options.isDateValid;
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
      Object.assign(this.form.invoice, this.$refs.invoice.form);
      Object.assign(this.form.rnote, this.$refs.rnote.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData() {
      this.updateCounter.invoice++;
      this.updateCounter.party++;
      this.updateCounter.rnote++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.comments++;
    },
    initPayload() {
      this.collectComponentData();

      let rndata = {
        rnno: this.form.rnote.no,
        rndate: this.form.rnote.date,
        inout: this.isSale ? 9 : 15,
        rejprods: {},
        rejectedtotal: this.form.total.amount,
        invid: this.invSelected.invid,
      };

      let stock = {
        inout: this.isSale ? 9 : 15, // for rejection note 9 is used for IN and 15 for OUT
        items: {},
      };

      let products = {};

      this.form.bill.forEach((item) => {
        products[item.pid] = {};
        products[item.pid][item.rate] = item.rejectedQty || 0;
      });

      rndata.rejprods = stock.items = products;

      if (this.form.narration) {
        rndata.rejnarration = this.form.narration;
      }

      return {
        rejectionnotedata: rndata,
        stockdata: stock,
      };
    },
    onSubmit() {
      const self = this;
      this.isLoading = true;

      const payload = this.initPayload();
      // console.log(payload);
      // const method = this.formMode === 'create' ? 'post' : 'put';
      axios
        .post('/rejectionnote', payload)
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
              case 0:
                // success
                console.log(resp.data);
                this.displayToast(
                  `Create Rejection Note Successfull!`,
                  `Rejection Note #${self.form.rnote.no} was successfully created`,
                  'success'
                );
                this.resetForm();
                break;
              case 1:
                // Duplicate entry
                this.displayToast(
                  `Create Rejection Note Failed!`,
                  'Duplicate Entry, Check No.',
                  'warning'
                );
                break;
              case 2:
                // Unauthorized access
                this.displayToast(
                  `Create Rejection Note Failed!`,
                  'Unauthorized Access, Contact Admin',
                  'warning'
                );
                break;
              case 3:
                // Connection failed, Check inputs and try again
                this.displayToast(
                  `Create Rejection Note Failed!`,
                  'Please check your input and try again later',
                  'danger'
                );
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            `Create Rejection Note Error!`,
            error.message,
            'warning'
          );
        });
    },
    preloadData() {
      const requests = [
        axios
          .get('/invoice?type=nonrejected', {
            data: { inputdate: this.yearEnd },
          })
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
      return Promise.all([...requests]).then(([resp1]) => {
        if (resp1.data.gkstatus === 0) {
          let saleData = [],
            purchaseData = [],
            sale = [],
            purchase = [];
          resp1.data.gkresult.forEach((inv) => {
            if (inv.inoutflag === 15) {
              saleData.push(inv);
              sale.push({
                text: `${inv.invoiceno},${inv.invoicedate},${inv.custsupdetail.custname}`,
                value: saleData.length - 1,
              });
            } else {
              purchaseData.push(inv);
              purchase.push({
                text: `${inv.invoiceno},${inv.invoicedate},${inv.custsupdetail.custname}`,
                value: purchaseData.length - 1,
              });
            }
          });
          self.options.invData = {
            sale: saleData,
            purchase: purchaseData,
          };
          self.options.invoices = {
            sale,
            purchase,
          };
        }
      });
    },
    /**
     * updateBillTable()
     *
     * Given an invoice id, updates the products in the bill table
     */
    updateBillTable(invoiceId, prodCount) {
      let self = this;
      axios
        .get(`/invoice?inv=single&invid=${invoiceId}`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let data = resp.data.gkresult;
            self.form.party.type =
              data.custSupDetails.csflag === 3 ? 'customer' : 'supplier';
            self.form.taxType = data.taxflag === 7 ? 'gst' : 'vat';
            self.form.invoice.state =
              data.inoutflag === 9
                ? { id: data.taxstatecode, name: data.destintationstate }
                : { id: data.sourcestatecode, name: data.sourcestate };

            let item, itemName, billItem;
            self.form.bill = [];
            for (const itemCode in data.invcontents) {
              let qty = prodCount[itemCode];
              if (!qty) {
                continue;
              }
              item = data.invcontents[itemCode];
              itemName = data.invcontents[itemCode].proddesc;
              billItem = {
                product: itemName,
                discount: { amount: parseFloat(item.discount) },
                qty: parseFloat(qty),
                fqty: item.freeqty,
                rate: parseFloat(item.priceperunit),
                isService: item.gsflag === 19,
              };
              if (billItem.isService) {
                billItem.qty = 1;
              }
              self.form.bill.push(billItem);
            }

            self.updateCounter.bill++;
          }
        })
        .catch(() => {
          return false;
        });
    },
    /**
     * updateFormData()
     *
     * Update the form's data based on the invoice selected
     */
    updateFormData() {
      if (!this.invIndex && this.invIndex !== 0) {
        return;
      }
      const inv = this.invSelected;
      Object.assign(this.form.invoice, {
        no: inv.invoiceno,
        date: reverseDate(inv.invoicedate),
      });
      Object.assign(this.form.party, {
        name: inv.custsupdetail.custname,
        type: inv.custsupdetail.csflag === 3 ? 'customer' : 'supplier',
      });
      this.updateComponentData();
      this.updateBillTable(inv.invid, inv.rejcontent);
    },
    /**
     * onRowSelected
     * 
     * When a row is selected, that rejected quantity for that product is made equal
     * to qty available
     */
    onRowSelected(index, billArr) {
      if(billArr[index].rowSelected) {
        billArr[index].rejectedQty = billArr[index].qty;
      } else {
        billArr[index].rejectedQty = 0;
      }
    },
    resetForm() {
      Object.assign(this.form, {
        rnote: {
          no: "",
          date: ""
        },
        invoice: {
          no: null,
          date: '',
          addr: null,
          gstin: null,
          state: {},
        },
        party: {
          name: null,
        },
        bill: [],
        narration: null,
        total: {},
      });
      this.updateComponentData();
      // this.invIndex = 0;
    },
    initForm() {
      this.preloadData();
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
    this.vuexNameSpace = 'rejectionNoteConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, rejectionNoteConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initRejectionNoteConfig`, {
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