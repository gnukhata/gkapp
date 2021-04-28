<template>
  <b-table-simple responsive>
    <b-tbody>
      <b-tr v-if="config.taxable">
        <b-th></b-th>
        <b-th colspan="3">Taxable Amount</b-th>
        <b-th class="text-right">₹ {{ form.taxable }}</b-th>
      </b-tr>
      <b-tr v-if="gstFlag && config.igst">
        <b-th></b-th>
        <b-th colspan="3">Total IGST</b-th>
        <b-th class="text-right">₹ {{ form.igst }}</b-th>
      </b-tr>
      <b-tr v-if="gstFlag && config.cess">
        <b-th></b-th>
        <b-th colspan="3">Total CESS</b-th>
        <b-th class="text-right">₹ {{ form.cess }}</b-th>
      </b-tr>
      <b-tr v-if="!gstFlag && config.vat">
        <b-th></b-th>
        <b-th colspan="3">Total VAT</b-th>
        <b-th class="text-right">₹ {{ form.vat }}</b-th>
      </b-tr>
      <b-tr v-if="config.discount">
        <b-th></b-th>
        <b-th colspan="3">Total Discount</b-th>
        <b-th class="text-right">₹ {{ form.discount }}</b-th>
      </b-tr>
      <b-tr v-if="config.value">
        <b-th :style="{ width: '30px' }">
          <b-form-checkbox
            inline
            size="sm"
            v-model="form.roundFlag"
            v-if="config.roundOff"
            v-b-tooltip.hover
            title="Roundoff Total Value?"
          ></b-form-checkbox>
        </b-th>
        <b-th colspan="3"> Total Invoice Value </b-th>
        <b-th class="text-right">₹ {{ form.amount }}</b-th>
      </b-tr>
      <b-tr v-if="form.roundFlag && config.roundOff">
        <b-th></b-th>
        <b-th colspan="3">Total Invoice Value (Rounded Off)</b-th>
        <b-th class="text-right">₹ {{ form.rounded }}</b-th>
      </b-tr>
      <b-tr v-if="config.valueText">
        <b-th></b-th>
        <b-th colspan="3">Total Invoice Value (in words)</b-th>
        <b-th class="text-right"> {{ form.text }}</b-th>
      </b-tr>
    </b-tbody>
  </b-table-simple>
</template>

<script>
import { numberToRupees } from '../../../js/utils';

export default {
  name: 'TotalTable',
  props: {
    config: {
      type: Object,
      required: true,
    },
    billData: {
      type: Array,
      required: true,
    },
    gstFlag: {
      type: Boolean,
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
      form: {
        taxable: this.getTotal('taxable'),
        igst: this.getTotal('igst', 'amount'),
        cess: this.getTotal('cess', 'amount'),
        vat: this.getTotal('vat', 'amount'),
        discount: this.getTotal('discount', 'amount'),
        amount: this.getTotal('total'),
        rounded: Math.round(this.getTotal('total')),
        text: this.invoiceTotalText,
        roundFlag: false,
      },
    };
  },
  watch: {
    updateCounter() {
      this.form = {
        taxable: this.getTotal('taxable'),
        igst: this.getTotal('igst', 'amount'),
        cess: this.getTotal('cess', 'amount'),
        vat: this.getTotal('vat', 'amount'),
        discount: this.getTotal('discount', 'amount'),
        amount: this.getTotal('total'),
        rounded: Math.round(this.getTotal('total')),
        text: this.invoiceTotalText,
        roundFlag: this.form.roundFlag,
      };
    },
  },
  computed: {
    invoiceTotalText: (self) => {
      let total = self.getTotal('total');
      let text = '';
      if (total > 0) {
        if (self.form.roundFlag) {
          total = Math.round(total);
        }
        text = numberToRupees(total);
      }
      return text;
    },
  },
  methods: {
    /**
     * getTotal(key)
     *
     * returns the total sum of the given key for all items in bill
     */
    getTotal(key, subKey) {
      let total = 0;
      if (subKey) {
        total = this.billData.reduce(
          (acc, curr) => parseFloat(acc) + parseFloat(curr[key][subKey]),
          0
        );
      } else {
        total = this.billData.reduce(
          (acc, curr) => parseFloat(acc) + parseFloat(curr[key]),
          0
        );
      }
      return total.toFixed(2);
    },
  },
};
</script>