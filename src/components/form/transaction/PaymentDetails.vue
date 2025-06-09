<template>
  <b-card
    class="mb-2 mb-md-0"
    :class="config.class"
    no-body
    v-if="config"
  >
    <div class="p-2 p-md-3">
      <div>
        <b
          class="mr-1"
          v-translate
        > Payment Details </b>
        <gk-tooltip
          help-title="Mode of Payment"
          help-body="Multiple and partial payments are supported. Balance amount, if any, can be paid later from invoice details page or from dashboard."
        />
        <b-button
          variant="secondary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'dash' : 'arrows-fullscreen'"
            class="float-right"
          />
        </b-button>
      </div>
      <div
        class="mt-3"
        :class="{'d-md-block': true, 'd-none': !isCollapsed}"
      >
        <p><b>Balance: </b>{{ due }}</p>
        <!-- payment details -->
        <b-form-group
          label-size="sm"
          label="Cash Transfer Amount"
          label-for="ci-input-10"
          label-cols="3"
        >
          <template #label>
            <translate> Cash Transfer Amount </translate>
          </template>

          <b-form-input
            size="sm"
            id="ci-input-10"
            type="number"
            step="0.1"
            class="gk-currency"
            no-wheel
            v-model="cash"
            min="0"
          />
        </b-form-group>
        <b-form-group
          v-for="bankAccount in bankAccounts"
          :key="bankAccount.id"
          label-size="sm"
          :label="`${bankAccount.account_name}`"
          :label-for="`bank-input-${bankAccount.id}`"
          label-cols="3"
        >
          <b-form-input
            size="sm"
            :id="`bank-input-${bankAccount.id}`"
            type="number"
            class="gk-currency"
            no-wheel
            min="0"
            step="0.01"
            v-model="bankAccount.amount"
          />
        </b-form-group>
        <div>
          <b
            v-translate
            class="mb-2"
          >
            Transaction Details
          </b>
          <b-form-group>
            <b-form-textarea
              size="sm"
              id="pmd-input-50"
              v-model="form.bank.transaction_details"
              rows="4"
              max-rows="5"
              trim
              placeholder="Add transaction details like bank account, IFSC, UPI ID or phone number."
            />
          </b-form-group>
        </div>
        <b
          v-if="form.mode === 15"
          v-translate
        >ON CREDIT</b>
      </div>
    </div>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex';
import GkTooltip from '@/components/GkTooltip.vue';
export default {
  components: { GkTooltip },
  name: 'PaymentDetails',
  props: {
    saleFlag: {
      type: Boolean,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    totalPayable: {
      type: Number,
      required: false,
      default: 0,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
    parentData: {
      type: Object,
      required: false,
      default: function() {
        return {
          mode: 3,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        };
      },
    },
    optionsData: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
    },
  },
  computed: {
    total: function() {
      return parseFloat(
        this.bankAccounts.reduce(
          (sum, acc) => sum + parseFloat((acc.amount || 0)), 0
        ) + (parseFloat(this.cash) || 0)
      ).toFixed(2);
    },
    due: function() {
      return parseFloat(
        (parseFloat(this?.totalPayable) || 0.00) - this.total
      ).toFixed(2);
    },
    ...mapGetters('global', ['isIndia']),
  },
   watch: {
    due() {
      this.form.isValid = true;
      if (this.due < 0.00 || (!this.customerName && this.due > 0.00)) {
        this.form.isValid = false;
      }
      this.onUpdateDetails()
    },
    updateCounter() {
      this.customerName = this.optionsData?.data?.name.name;
      this.clearFields();
      this.fetchBankAccounts();
      this.fetchAccounts();
      Object.assign(this.form, this.parentData);
      if (this.optionsData?.bankDetails) {
        this.form.bank.transaction_details = Object
          .entries(this.optionsData.bankDetails)
          .filter(([ key, value]) => value !== undefined && value !== null && value !== "")
          .map(([key, value]) => {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return `${capitalizedKey}: ${value}`;
          })
          .join(', ');
      }
    },
  },
   data() {
     return {
      form: {
        isValid: false,
        vouchers: {},
        bank: {
          transaction_details: '',
        },
      },
      cash: null,
      accounts: [],
      bankAccounts: [],
      isCollapsed: true,
      ifscCode: '',
    };
  },
  methods: {
    fetchAccounts() {
      this.$axios
          .get(`accountsbyrule?type=all`)
          .then((resp) => {
            this.accounts = resp;
          });
    },
    fetchBankAccounts() {
      this.$axios
          .get('/bank')
          .then((resp) => {
            this.bankAccounts = resp;
          });
    },
    prepareVouchers() {
      let vouchers = {
        "cr": [],
        "dr": [],
      }
      let cashAccType = this.saleFlag ? 'dr' : 'cr';
      let custAccType = this.saleFlag ? 'cr' : 'dr';

      let transactionAccountName = this.saleFlag ? 'Sale A/C' : 'Purchase A/C';

      let cashAccount = this.accounts.find(
        (acc) => acc.accountname === 'Cash in hand'
      );

      if (this.customerName)  {
        let custAcc = this.accounts.find(
          (acc) => acc.accountname === this.customerName
        );
        vouchers[custAccType].push(parseFloat(this.total) > 0 ? {
          account: custAcc.accountcode,
          amount: parseFloat(this.total),
        } : {});
      } else {
        let transactionAcc = this.accounts.find(
          (acc) => acc.accountname === transactionAccountName
        );
        vouchers[custAccType].push(parseFloat(this.total) > 0 ? {
          account: transactionAcc.accountcode,
          amount: parseFloat(this.total),
        } : {});
      }
      if (this.cash && parseFloat(this.cash) > 0) {
        vouchers[cashAccType].push({
          account: cashAccount.accountcode,
          amount: parseFloat(this.cash),
        });
      }
      this.bankAccounts.forEach((bank) => {
        if (bank.amount) {
          vouchers[cashAccType].push({
            account: bank.accountcode,
            amount: parseFloat(bank.amount),
          });
        }
      });

      let payload = {};

      payload.drs = vouchers.dr.reduce((acc, dr) => {
        acc[dr.account] = dr.amount;
        return acc;
      }, {});
      payload.crs = vouchers.cr.reduce((acc, cr) => {
        acc[cr.account] = cr.amount;
        return acc;
      }, {});
      Object.assign(this.form.vouchers, payload)
    },
    onUpdateDetails() {
      this.ifscCode = this.form.bank.ifsc;
      this.prepareVouchers();
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'payment-details',
        })
      );
    },
    clearFields(){
      this.cash = null;
      this.accounts = [];
      this.bankAccounts = [];
      this.form = {
          mode: 3,
          vouchers: {},
          isValid: false,
          bank: {
            transaction_details: '',
          },
      };
    },
  },
  mounted() {
    this.clearFields();
    this.fetchBankAccounts();
    this.fetchAccounts();
  },
};
</script>
