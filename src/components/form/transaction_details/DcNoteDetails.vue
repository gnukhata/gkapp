<template>
  <b-card
    v-if="config"
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
  >
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="p-2 p-md-3">
      <div>
        <b>{{ formType }} Details</b>
        <b-button
          variant="primary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            class="float-right"
          ></b-icon>
        </b-button>
      </div>
      <div class="mt-3" :class="{ 'd-md-block': true, 'd-none': !isCollapsed }">
        <b-form-group>
          <b-form-radio-group
            button-variant="outline-secondary"
            size="sm"
            buttons
            v-model="form.type"
          >
            <b-form-radio value="debit">Debit Note</b-form-radio>
            <b-form-radio value="credit">Credit Note</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-form-group
          :label="isCredit ? 'Cr Note No.' : 'Dr Note No.'"
          label-for="input-1"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="input-1"
            v-model="form.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          id="input-group-3"
          :label="isCredit ? 'Cr Note Date' : 'Dr Note Date'"
          label-cols-lg="3"
          label-cols="4"
          label-for="date-1"
          label-size="sm"
        >
          <b-input-group>
            <b-form-input
              size="sm"
              id="date-1"
              v-model="form.date"
              type="text"
              placeholder="YYYY-MM-DD"
              autocomplete="off"
              required
              :state="isInvDateValid"
              debounce="500"
            ></b-form-input>
            <b-input-group-append>
              <b-form-datepicker
                size="sm"
                v-model="form.date"
                button-only
                right
                locale="en-GB"
                aria-controls="date-1"
                :min="minDate"
                :max="maxDate"
              >
              </b-form-datepicker>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group
          label="Invoice"
          label-for="input-8-2"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <autocomplete
            size="sm"
            id="input-8-2"
            v-model="form.invNo"
            :options="invList"
            required
            @input="onUpdateDetails"
          >
          </autocomplete>
        </b-form-group>
        <b-form-group
          label="GSTIN"
          label-for="input-8-1"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="input-8-1"
            v-model="form.gstin"
            trim
            required
            readonly
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Purpose"
          label-for="input-6"
          label-size="sm"
          label-cols-lg="3"
          label-cols="4"
        >
          <b-form-select
            size="sm"
            id="input-6"
            v-model="form.purpose"
            required
            tabindex="-1"
          >
            <b-form-select-option value="price"
              >Adjust Price / Discount</b-form-select-option
            >
            <b-form-select-option value="qty"
              >Adjust Qty / Return Goods</b-form-select-option
            >
          </b-form-select>
        </b-form-group>
        <b-form-group v-if="!isCredit && isReturn && saleFlag">
          <b-form-checkbox v-model="form.badQuality" size="sm"
            >Bad Quality Goods</b-form-checkbox
          >
        </b-form-group>
        <b-form-group>
          <b-form-checkbox v-model="form.referenceFlag" size="sm"
            >Reference (If received)</b-form-checkbox
          >
        </b-form-group>
        <b-form-group
          v-if="form.referenceFlag"
          :label="isCredit ? 'Dr Note No.' : 'Cr Note No.'"
          label-for="input-1"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="input-1"
            v-model="form.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="form.referenceFlag"
          id="input-group-3"
          :label="isCredit ? 'Dr Note Date' : 'Cr Note Date'"
          label-cols-lg="3"
          label-cols="4"
          label-for="date-1"
          label-size="sm"
        >
          <b-input-group>
            <b-form-input
              size="sm"
              id="date-1"
              v-model="form.date"
              type="text"
              placeholder="YYYY-MM-DD"
              autocomplete="off"
              required
              :state="isInvDateValid"
              debounce="500"
            ></b-form-input>
            <b-input-group-append>
              <b-form-datepicker
                size="sm"
                v-model="form.date"
                button-only
                right
                locale="en-GB"
                aria-controls="date-1"
                :min="minDate"
                :max="maxDate"
              >
              </b-form-datepicker>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Autocomplete from '../../Autocomplete.vue';
export default {
  name: 'DcNoteDetails',
  components: {
    Autocomplete,
  },
  props: {
    saleFlag: {
      type: Boolean,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      isCollapsed: false,
      isPreloading: false,
      form: {
        type: 'debit',
        no: null,
        invNo: null,
        date: this.formatDateObj(new Date()),
        gstin: null,
        referenceFlag: false,
        badQuality: false,
        purpose: 'price', // 'qty'
      },
      options: {
        invoices: {
          dr: { sale: [], purchase: [] },
          cr: { sale: [], purchase: [] },
        },
      },
    };
  },
  computed: {
    invList: (self) => {
      let note = self.isCredit ? 'cr' : 'dr';
      let inv = self.saleFlag ? 'sale' : 'purchase';
      return self.options.invoices[note][inv];
    },
    isReturn: (self) => self.form.purpose === 'qty',
    isCredit: (self) => self.form.type === 'credit',
    formType: (self) =>
      self.form.type === 'credit' ? 'Credit Note' : 'Debit Note',
    minDate: (self) => new Date(self.yearStart),
    maxDate: (self) => new Date(self.yearEnd),
    isInvDateValid: (self) => {
      let currDate = new Date(self.form.date).getTime(),
        minDate = self.minDate.getTime(),
        maxDate = self.maxDate.getTime();
      return !isNaN(currDate)
        ? currDate >= minDate && currDate <= maxDate
        : null;
    },
    ...mapState(['yearStart', 'yearEnd']),
  },
  watch: {
    updateCounter() {
      this.resetForm();
    },
  },
  methods: {
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'dc-note-details',
        })
      );
    },
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get('/drcrnote?inv=all&type=sale&drcrflag=3').catch((error) => {
          this.displayToast(
            'Fetch Sale Invoice Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/drcrnote?inv=all&type=sale&drcrflag=4`).catch((error) => {
          this.displayToast(
            'Fetch Sale Invoice Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        axios
          .get(`/drcrnote?inv=all&type=purchase&drcrflag=3`)
          .catch((error) => {
            this.displayToast(
              'Fetch Purchase Invoice Data Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
        axios
          .get(`/drcrnote?inv=all&type=purchase&drcrflag=4`)
          .catch((error) => {
            this.displayToast(
              'Fetch Purchase Invoice Data Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
      ];
      const self = this;
      return Promise.all([...requests])
        .then(([resp1, resp2, resp3, resp4]) => {
          this.isPreloading = false;
          let formatInv = function (inv) {
            return {
              text: `${inv.invoiceno},${inv.invoicedate},${inv.custname}`,
              value: inv.invid,
            };
          };
          if (resp1.data.gkstatus === 0) {
            self.options.invoices.cr.sale = resp1.data.gkresult.map(formatInv);
          }
          if (resp2.data.gkstatus === 0) {
            self.options.invoices.dr.sale = resp2.data.gkresult.map(formatInv);
          }
          if (resp3.data.gkstatus === 0) {
            self.options.invoices.cr.purchase = resp3.data.gkresult.map(formatInv);
          }
          if (resp4.data.gkstatus === 0) {
            self.options.invoices.dr.purchase = resp4.data.gkresult.map(formatInv);
          }
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    getInvoiceData() {},
    resetForm() {
      if (!this.isInvDateValid) {
        this.form.date = this.yearStart;
      }
      this.onUpdateDetails();
    },
    /**
     * formatDateObj(date)
     *
     * Description: Converts a js Date object, into yyyy-mm-dd string
     */
    formatDateObj(date) {
      let month = date.getMonth() + 1;
      month = month > 9 ? month : '0' + month;
      let day = date.getDate();
      day = day > 9 ? day : '0' + day;
      return `${date.getFullYear()}-${month}-${day}`;
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
  mounted() {
    const self = this;
    this.preloadData().then(() => {
      self.resetForm();
    });
  },
};
</script>