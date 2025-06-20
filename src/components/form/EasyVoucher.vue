<!-- Note: Uses Mixin located at /src/mixins/voucher.js, please refer there for
list of all the props, methods, computed and data items not defined in this file  -->
<template>
  <section class="container-fluid p-0">
    <b-form @submit.prevent="confirmOnSubmit">
      <b-card no-body>
        <template #header>
          <h5 class="my-2">
            <b v-translate>{{ vtitle }}</b>
          </h5>
        </template>
        <b-card-body>
          <b-overlay
            :show="isLoading"
            variant="secondary"
            no-wrap
            blur
          />
          <b-card class="mb-4">
            <b-card-text>
              <h5 class="text-center">
                Invoice Details
              </h5>
              No : {{ creditInvData?.invoiceno }} <br class="d-sm-none">
              <span class="float-sm-right">
                Date: {{ creditInvData?.invoicedate }}
              </span>
              <br>
              Invoice Amount : {{ creditInvData?.invoicetotal || '' }} <br>
              Balance Amount : {{ creditInvData?.balanceamount || '' }} <br>
            </b-card-text>
          </b-card>
          <b-form-group
            label="Date"
            label-cols="3"
            label-size="sm"
            id="ci-input-group-1"
          >
            <template #label>
              <translate> Date </translate>
            </template>
            <gk-date
              id="ci-date-1"
              :format="dateFormat"
              v-model="form.date"
              :min="minDate"
              :max="_maxDate"
              @validity="setDateValidity"
              :required="true"
            />
          </b-form-group>
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
          <b-form-group
            label-size="sm"
            label="Balance Due"
            label-for="ci-input-10"
            label-cols="3"
          >
            <template #label>
              <translate> Balance Due </translate>
            </template>

            <b-form-input
              size="sm"
              id="ci-input-10"
              type="number"
              class="gk-currency"
              step="0.1"
              no-wheel
              v-model="due"
              disabled
              :class="{'text-danger': !isDueValid}"
            />
          </b-form-group>
          <b-form-group
            label-size="sm"
            label="Narration"
            label-for="ci-input-30"
            label-cols="3"
          >
            <b-form-textarea
              :placeholder="defComment"
              id="ci-input-30"
              size="sm"
              rows="2"
              max-rows="3"
            />
          </b-form-group>
          <hr class="my-2">
          <div>
            <b-button
              :disabled="!allValid"
              type="submit"
              size="sm"
              class="m-1"
              variant="success"
            >
              Save
            </b-button>
            <b-button
              size="sm"
              class="m-1"
              variant="dark"
              @click.prevent="resetForm"
            >
              Reset
            </b-button>
          </div>
        </b-card-body>
      </b-card>
    </b-form>
  </section>
</template>

<script>
import axios from 'axios';
import voucherMixin from '@/mixins/voucher.js';
import GkDate from '@/components/GkDate.vue';
export default {
  name: 'EasyVoucher',
  mixins: [voucherMixin],
  components: { GkDate },
  props: {
    invId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      cash: 0,
      bank: 0,
      bankAccounts: [],
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
    };
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
        this.creditInvData.balanceamount - this.total
      ).toFixed(2);
    },
    vtitle: function() {
      let title = '';
      if (this.type === 'receipt') {
        title += 'Receive payment from';
      } else if (this.type === 'payment') {
        title += 'Make payment to';
      }

      title += ` ${this.creditInvData?.custname || ''}`;
      return title;
    },
    defComment: function() {
      let comment = '';
      let invNo = this.creditInvData?.invoiceno || '';
      let invTotal = this.total;
      if (this.type === 'receipt') {
        comment += `Received payment of Rs. ${invTotal} from`;
      } else if (this.type === 'payment') {
        comment += `Made payment of Rs. ${invTotal} to`;
      }
      comment += ` ${this.creditInvData?.custname || ''}`;
      comment += ` for Invoice on credit, ${invNo}.`;
      return comment;
    },
    minDate: function() {
      let date = '';
      if (this.creditInvData?.invoicedate) {
        date = this.creditInvData.invoicedate;
      } else {
        date =
          this.dateFormat === 'dd-mm-yyyy'
            ? this.dateReverse(this.yearStart)
            : this.yearStart;
      }
      return date;
    },
    isDueValid: function() {
      let balance = parseFloat(this.creditInvData?.balanceamount || 0);
      return this.due >= 0 && this.due < balance;
    },
    allValid: function() {
      let total = parseFloat(this.total || 0);
      let balance = parseFloat(this.creditInvData?.balanceamount || 0);
      let totalValid = total > 0 && total <= balance;
      let dueValid = this.due >= 0 && this.due < balance;
      let dateValid = this.isDateValid || this.isDateValid === null;
      return dateValid && totalValid && dueValid;
    },
  },
  watch: {
    invId(id) {
      if (id) {
        const self = this;
        this.resetForm().then(() => {
          self.form.inv = id;
          self.onInvSelect();
          self.bank = parseFloat(self.creditInvData.balanceamount || 0);
        });
      }
    },
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
    },
    confirmOnSubmit() {
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `${this.vtitle} of Rs. ${this.total}?"`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            this.onSubmit();
          }
        });
    },

    onSubmit() {
      this.isLoading = true;
      const self = this;
      const payload = this.initPayload();
      const method = 'post';
      const failTitle = this.$gettext('Create Voucher Failure!'),
            failMessage = this.$gettext('Voucher Creation Failed!');

      axios({ method: method, url: '/transaction', data: payload })
        .then((resp) => {
          self.isLoading = false;
          switch (resp.data.gkstatus) {
          case 0:
            {
              self.displayToast(
                this.$gettext('Success!'),
                `Successfully ${self.defComment}`,
                'success'
              );
              const accMap = self.options.acc;
              let dr = self.form.dr.reduce(
                (acc, dr) => acc + `${accMap[dr.account.accountcode]}, `,
                ''
              );
              let cr = self.form.cr.reduce(
                (acc, cr) => acc + `${accMap[cr.account.accountcode]}, `,
                ''
              );
              dr = dr.substring(0, dr.length - 2);
              cr = cr.substring(0, cr.length - 2);
              let log = {
                activity: `${self.form.vtype.value} voucher created: dr [ ${dr} ], cr [ ${cr} ]`,
              };
              axios.post('/log', log);

              // update billwise if receipt or payment
              let billData = {
                adjbills: [
                  {
                    invid: parseInt(payload.invid),
                    adjamount: parseFloat(self.totalCr),
                    vouchercode: resp.data.vouchercode,
                  },
                ],
              };

              axios.post('/billwise', billData).finally(() => {
                if (self.onSave !== null) {
                  self.onSave(resp.data);
                }
              });
            }
            break;
          default:
            self.displayToast(failTitle, failMessage, 'danger');
          } // end switch
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(failTitle, error.message, 'danger');
        });
    },
    initPayload() {
      // convert the easy voucher data format to normal voucher data format
      // and use _initPayload
      this.form.cr = [];
      this.form.dr = [];
      let cashAccType = this.type === 'receipt' ? 'dr' : 'cr';
      let custAccType = this.type === 'receipt' ? 'cr' : 'dr';

      let cashAccount = this.options[cashAccType].find(
        (acc) => acc.accountname === 'Cash in hand'
      );
      let custAcc = this.options[custAccType].find(
        (acc) => acc.accountname === this.customerName
      );

      if (this.cash && parseFloat(this.cash) > 0) {
        this.form[cashAccType].push({
          account: cashAccount,
          amount: parseFloat(this.cash),
        });
      }
      this.bankAccounts.forEach((bank) => {
        if (bank.amount) {
          this.form[cashAccType].push({
            account: bank,
            amount: parseFloat(bank.amount),
          });
        }
      });

      this.form[custAccType].push({
        account: custAcc,
        amount: this.total,
      });

      if (!this.form.narration) {
        this.form.narration = this.defComment;
      }

      let payload = this._initPayload();
      payload.invid = `${this.form.inv}` || null;
      return payload;
    },
    resetForm() {
      this.cash = 0;
      this.bank = 0;
      return this._resetForm(null, true);
    },
    fetchBankAccounts() {
      this.$axios
          .get('/bank')
          .then((resp) => {
            this.bankAccounts = resp;
          });
    },
  },
  mounted() {
    const self = this;
    this.isLoading = true;
    this._resetForm().then(() => {
      this.fetchBankAccounts();
      self.isLoading = false;
      if (this.invId > 0) {
        self.form.inv = this.invId;
        self.onInvSelect();
        self.bank = parseFloat(self.creditInvData.balanceamount || 0);
      }
    });
  },
};
</script>
