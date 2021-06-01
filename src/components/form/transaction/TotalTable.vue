<template>
  <b-table-simple responsive>
    <b-thead>
      <b-tr>
        <b-th>Total</b-th>
        <b-th :style="{ minWidth: '70px' }" class="text-right text-truncate"
          >₹</b-th
        >
      </b-tr>
    </b-thead>
    <b-tbody>
      <b-tr v-if="config.taxable">
        <b-td>Taxable Amount</b-td>
        <b-td class="text-right">₹ {{ form.taxable }}</b-td>
      </b-tr>
      <b-tr v-if="gstFlag && config.igst">
        <b-td>IGST</b-td>
        <b-td class="text-right">₹ {{ form.igst }}</b-td>
      </b-tr>
      <b-tr v-if="gstFlag && config.cess">
        <b-td>CESS</b-td>
        <b-td class="text-right">₹ {{ form.cess }}</b-td>
      </b-tr>
      <b-tr v-if="!gstFlag && config.vat">
        <b-td>VAT</b-td>
        <b-td class="text-right">₹ {{ form.vat }}</b-td>
      </b-tr>
      <b-tr v-if="config.discount">
        <b-td>Discount</b-td>
        <b-td class="text-right">₹ {{ form.discount }}</b-td>
      </b-tr>
      <b-tr v-if="config.value">
        <b-td>
          <span class="float-left">Invoice Value</span>
          <b-form-checkbox
            inline
            size="sm"
            v-model="form.roundFlag"
            v-if="config.roundOff"
            v-b-tooltip.hover
            title="Roundoff Total Value?"
            class="ml-2 float-left"
          ></b-form-checkbox>
        </b-td>
        <b-td class="text-right">₹ {{ form.amount }}</b-td>
      </b-tr>
      <b-tr v-if="form.roundFlag && config.roundOff">
        <b-td>Invoice Value (Rounded Off)</b-td>
        <b-td class="text-right">₹ {{ form.rounded }}</b-td>
      </b-tr>
      <b-tr v-if="config.valueText">
        <b-td>Invoice Value (in words)</b-td>
        <b-td class="text-right"> {{ form.text }}</b-td>
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