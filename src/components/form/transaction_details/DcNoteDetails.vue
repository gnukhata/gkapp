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
            @input="onUpdateDetails"
          >
            <b-form-radio value="debit">Debit Note</b-form-radio>
            <b-form-radio value="credit">Credit Note</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-form-group
          :label="isCredit ? 'Cr Note No.' : 'Dr Note No.'"
          label-for="dcd-input-10"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dcd-input-10"
            v-model="form.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <gk-form-date
          id="dcd-input-group-1"
          :label="isCredit ? 'Cr Note Date' : 'Dr Note Date'"
          label-cols-lg="3"
          label-cols="4"
          label-for="dcd-date-1"
          label-size="sm"
          v-model="form.date"
          format="dd-mm-yyyy"
          :min="minDate"
          :max="maxDate"
          dateId="dcd-date-1"
          @validity="setDateValidity"
          :required="true"
        ></gk-form-date>
        <!-- <b-form-group
          label="GSTIN"
          label-for="dcd-input-20"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dcd-input-20"
            v-model="form.gstin"
            trim
            required
            readonly
          ></b-form-input>
        </b-form-group> -->
        <b-form-group
          label="Purpose"
          label-for="dcd-input-20"
          label-size="sm"
          label-cols-lg="3"
          label-cols="4"
        >
          <b-form-select
            size="sm"
            id="dcd-input-20"
            v-model="form.purpose"
            required
            tabindex="-1"
            @input="onUpdateDetails"
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
          label-for="dcd-input-50"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dcd-input-50"
            v-model="form.ref.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <gk-form-date
          v-if="form.referenceFlag"
          id="dcd-input-group-2"
          :label="isCredit ? 'Dr Note Date' : 'Cr Note Date'"
          label-cols-lg="3"
          label-cols="4"
          label-for="dcd-date-2"
          label-size="sm"
          v-model="form.ref.date"
          format="dd-mm-yyyy"
          :min="minDate"
          :max="maxDate"
          dateId="dcd-date-2"
          @validity="setDateValidity"
          :required="true"
        ></gk-form-date>
      </div>
    </div>
  </b-card>
</template>
<script>
// import axios from 'axios';
import { mapState } from 'vuex';
// import Autocomplete from '../../Autocomplete.vue';
import GkFormDate from '../../GkFormDate.vue';
export default {
  name: 'DcNoteDetails',
  components: {
    // Autocomplete,
    GkFormDate,
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
    invDate: {
      type: String,
      required: false,
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
      date: {
        valid: null,
        format: 'dd-mm-yyyy',
      },
      form: {
        type: 'debit',
        no: null,
        date: this.formatDateObj(new Date()),
        gstin: null,
        referenceFlag: false,
        badQuality: false,
        purpose: 'price', // 'qty'
        ref: {
          date: '',
          number: '',
        },
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
    isReturn: (self) => self.form.purpose === 'qty',
    isCredit: (self) => self.form.type === 'credit',
    formType: (self) =>
      self.form.type === 'credit' ? 'Credit Note' : 'Debit Note',
    minDate: (self) => {
      let date = self.toDMYDate(self.yearStart);
      let ref = self.form.ref.date ? new Date(self.form.ref.date).getTime : '';
      let inv = self.invDate ? new Date(self.invDate).getTime : '';
      let invDate = inv ? self.toDMYDate(self.invDate) : '';
      if (ref) {
        let refDate = self.toDMYDate(self.form.ref.date);
        if (inv) {
          date = ref < inv ? refDate : invDate;
        } else {
          date = refDate;
        }
      } else if (inv) {
        date = invDate;
      }
      return date;
    },
    maxDate: (self) => self.toDMYDate(self.yearEnd),
    ...mapState(['yearStart', 'yearEnd']),
  },
  watch: {
    updateCounter() {
      this.resetForm();
    },
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    toDMYDate(date) {
      return date.split('-').reverse().join('-');
    },
    onUpdateDetails() {
      const self = this;
      setTimeout(() =>
        self.$emit('details-updated', {
          data: self.form,
          name: 'dc-note-details',
          options: {
            isDateValid: self.date.valid,
          },
        })
      );
    },
    updateDate() {
      let today = new Date().getTime(),
        min = new Date(this.yearStart).getTime(),
        max = new Date(this.yearEnd).getTime();

      if (today >= min && today <= max) {
        this.form.date = this.formatDateObj(new Date());
      } else {
        this.form.date = this.yearEnd;
      }
    },
    resetForm() {
      this.updateDate();
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
    this.resetForm();
  },
};
</script>