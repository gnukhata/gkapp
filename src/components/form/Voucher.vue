<!--
  ToDo:
  * API integrations -> Rectifiable Invoice list
-->
<template>
  <div class="card">
    <div class="card-header py-1 px-2">
      <!-- === Voucher Type Dropdown -->
      <b-dropdown size="sm" variant="outline-dark" :disabled="!isCreateMode">
        <template #button-content>
          <b> {{ form.vtype.text }} Voucher </b>
        </template>
        <b-dropdown-item
          v-for="(type, index) in options.vtype"
          :key="index"
          @click.prevent="
            () => {
              form.vtype = type;
              preloadData();
            }
          "
        >
          {{ type.text }}
        </b-dropdown-item>
      </b-dropdown>
      <slot name="close-button"> </slot>
    </div>
    <div>
      <b-form class="p-2 pt-3" @submit.prevent="confirmOnSubmit">
        <b-row no-gutters>
          <b-col> </b-col>
          <b-col class="mb-2" :style="{ 'max-width': '200px' }">
            <gk-date
              id="v-date-1"
              :format="dateFormat"
              v-model="form.date"
              :min="minDate"
              :max="maxDate"
              @validity="setDateValidity"
              :required="true"
            >
            </gk-date>
          </b-col>
          <b-col cols="12">
            <b-table-simple hover small caption-top bordered>
              <b-thead head-variant="dark">
                <!-- table header -->
                <b-tr class="text-center">
                  <b-th :style="{ maxWidth: '25px', width: '25px' }">-</b-th>
                  <b-th
                    :style="{
                      maxWidth: '300px',
                      width: '150px',
                      minWidth: '100px',
                    }"
                    >Account
                  </b-th>
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '150px',
                      minWidth: '70px',
                    }"
                    >Balance</b-th
                  >
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '110px',
                      minWidth: '75px',
                    }"
                  >
                    <b-button
                      @click.prevent="addRow('dr')"
                      class="py-0"
                      variant="success"
                      size="sm"
                      >+</b-button
                    >
                    Dr
                  </b-th>
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '110px',
                      minWidth: '75px',
                    }"
                  >
                    <b-button
                      @click.prevent="addRow('cr')"
                      class="py-0"
                      variant="success"
                      size="sm"
                      >+</b-button
                    >
                    Cr</b-th
                  >
                </b-tr>
              </b-thead>
              <b-tbody>
                <!-- Debit Row -->
                <b-tr
                  class="text-center"
                  v-for="(data, indexDr) in form.dr"
                  :key="indexDr + '-dr'"
                  variant="success"
                >
                  <!-- Type  -->
                  <b-td class="text-capitalize align-middle">
                    <b-button
                      @click.prevent="deleteRow('dr', indexDr)"
                      class="py-0 px-1"
                      variant="success"
                      size="sm"
                      >-</b-button
                    >
                  </b-td>

                  <!-- Account -->
                  <b-td>
                    <autocomplete
                      size="sm"
                      v-model="form.dr[indexDr].account"
                      :options="options['dr']"
                      text-field="accountname"
                      value-field="accountcode"
                      disabled-field="disabled"
                      required
                      @input="onAccountSelect(data.account, 'dr', indexDr)"
                      :isOptionsShared="true"
                      class="text-left"
                      dropDownWidth="200px"
                    ></autocomplete>
                  </b-td>

                  <!-- Balance -->
                  <b-td
                    class="position-relative"
                    :style="{ 'font-size': '0.85rem' }"
                  >
                    <b-overlay
                      :show="data.isLoading"
                      variant="secondary"
                      no-wrap
                      blur
                    >
                    </b-overlay>
                    <b>{{ data.balance }}</b>
                  </b-td>

                  <!-- Dr Amount -->
                  <b-td>
                    <b-input
                      v-model="data.amount"
                      class="hide-spin-button text-right px-1"
                      type="number"
                      no-wheel
                      step="0.01"
                      min="0.01"
                      debounce="500"
                      required
                      size="sm"
                    ></b-input>
                  </b-td>

                  <!-- Cr Amount -->
                  <b-td> </b-td>
                </b-tr>
                <!-- Credit Row -->
                <b-tr
                  class="text-center"
                  v-for="(data, indexCr) in form.cr"
                  :key="indexCr + '-cr'"
                  variant="warning"
                >
                  <!-- Type  -->
                  <b-td class="text-capitalize align-middle">
                    <b-button
                      @click.prevent="deleteRow('cr', indexCr)"
                      class="py-0 px-1"
                      variant="success"
                      size="sm"
                      >-</b-button
                    >
                  </b-td>

                  <!-- Account -->
                  <b-td>
                    <autocomplete
                      class="text-left"
                      size="sm"
                      v-model="data.account"
                      :options="options['cr']"
                      text-field="accountname"
                      value-field="accountcode"
                      disabled-field="disabled"
                      :isOptionsShared="true"
                      required
                      @input="onAccountSelect(data.account, 'cr', indexCr)"
                      dropDownWidth="200px"
                    ></autocomplete>
                  </b-td>

                  <!-- Balance -->
                  <b-td
                    class="position-relative"
                    :style="{ 'font-size': '0.85rem' }"
                  >
                    <b-overlay
                      :show="data.isLoading"
                      variant="secondary"
                      no-wrap
                      blur
                    >
                    </b-overlay>
                    <b>{{ data.balance }}</b>
                  </b-td>

                  <!-- Dr Amount -->
                  <b-td> </b-td>

                  <!-- Cr Amount -->
                  <b-td>
                    <b-input
                      v-model="data.amount"
                      class="hide-spin-button text-right px-1"
                      type="number"
                      no-wheel
                      step="0.01"
                      min="0.01"
                      debounce="500"
                      required
                      size="sm"
                    ></b-input>
                  </b-td>
                </b-tr>
              </b-tbody>
              <b-tfoot>
                <b-tr variant="secondary" class="text-right">
                  <b-th colspan="3"> Total </b-th>
                  <b-th>
                    <span>₹ {{ totalDr }}</span>
                  </b-th>
                  <b-th>
                    <span>₹ {{ totalCr }}</span>
                  </b-th>
                </b-tr>
              </b-tfoot>
            </b-table-simple>
          </b-col>
          <b-col cols="12" sm="6"></b-col>
          <b-col cols="12" sm="6">
            <b-form-group
              label="Comments"
              label-for="vo-comment"
              label-cols="auto"
              label-size="sm"
              label-cols-lg="autauto"
            >
              <b-form-textarea
                size="sm"
                id="vo-comment"
                v-model="form.narration"
                rows="4"
                max-rows="5"
                trim
              ></b-form-textarea>
            </b-form-group>
          </b-col>
        </b-row>

        <hr class="my-2 mx-0" />
        <div class="float-right">
          <b-button
            size="sm"
            class="mr-2"
            variant="secondary"
            @click.prevent="$router.go(-1)"
            v-if="!hideBackButton"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-left"
            ></b-icon>
            <span class="align-middle"> Back</span>
          </b-button>
          <b-button
            size="sm"
            class="mr-2"
            variant="danger"
            @click.prevent="confirmOnDelete"
            v-if="!isCreateMode"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="trash"
            ></b-icon>
            <span class="align-middle"> Delete</span>
          </b-button>
          <b-button
            size="sm"
            type="submit"
            class="mr-2"
            variant="success"
            :disabled="!isDateValid || !isVoucherTotalValid"
          >
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              :icon="isCreateMode ? 'plus-square' : 'cloud-arrow-up'"
            ></b-icon>
            <span class="align-middle">
              {{ isCreateMode ? 'Save' : 'Update' }}</span
            >
          </b-button>
        </div>
        <div class="clearfix"></div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { numberToRupees } from '../../js/utils';

import Autocomplete from '../Autocomplete.vue';
import GkDate from '../GkDate.vue';
export default {
  name: 'Voucher',
  components: { Autocomplete, GkDate },
  props: {
    type: {
      type: String,
      validator: function(value) {
        return (
          [
            'receipt',
            'payment',
            'purchase',
            'sales',
            'journal',
            'contra',
          ].indexOf(value) !== -1
        );
      },
      default: 'receipt',
      required: false,
    },
    customer: {
      type: String,
      required: false,
      default: '-1',
    },
    onSave: {
      type: Function,
      required: false,
      default: null,
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
    isOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
    mode: {
      type: String,
      required: true,
      validator: (mode) => {
        let values = ['create', 'edit'];
        return values.indexOf(mode) >= 0;
      },
    },
    vid: {
      type: [Number, String],
      required: false,
      default: -1,
      note: 'Used while in edit mode to fetch the voucher details',
    },
  },
  data() {
    return {
      isLoading: false,
      options: {
        vdata: {}, // voucher data to be edited
        nameToId: {}, // account name to id map
        acc: {}, // account id to name map
        dr: [],
        cr: [],
        balances: {},
        vtype: [
          { text: 'Receipt', value: 'receipt' },
          { text: 'Payment', value: 'payment' },
          { text: 'Purchase', value: 'purchase' },
          { text: 'Sales', value: 'sales' },
          { text: 'Contra', value: 'contra' },
          { text: 'Journal', value: 'journal' },
          { text: 'Credit Note', acc: 'journal', value: 'creditnote' },
          { text: 'Debit Note', acc: 'journal', value: 'debitnote' },
          { text: 'Sales Return', acc: 'journal', value: 'salesreturn' },
          { text: 'Purchase Return', acc: 'journal', value: 'purchasereturn' },
        ],
      },
      isDateValid: null,
      form: {
        vtype: { text: '', value: '' },
        date: null,
        dr: [
          {
            account: null,
            balance: null,
            isLoading: false,
            debit: true,
            credit: false,
            amount: 0,
          },
        ],
        cr: [
          {
            account: null,
            balance: null,
            isLoading: false,
            debit: true,
            credit: false,
            amount: 0,
          },
        ],
        amount: 0,
        narration: '',
      },
    };
  },
  computed: {
    isCreateMode: (self) => self.mode === 'create',
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    totalDr: (self) =>
      self.form.dr.reduce(
        (acc, item) => acc + (item.amount ? parseFloat(item.amount) : 0),
        0
      ) || null,
    totalCr: (self) =>
      self.form.cr.reduce(
        (acc, item) => acc + (item.amount ? parseFloat(item.amount) : 0),
        0
      ) || null,
    minDate: (self) =>
      self.dateFormat === 'dd-mm-yyyy'
        ? self.dateReverse(self.yearStart)
        : self.yearStart,
    maxDate: (self) =>
      self.dateFormat === 'dd-mm-yyyy'
        ? self.dateReverse(self.yearEnd)
        : self.yearEnd,
    isVoucherTotalValid: (self) =>
      self.totalCr && self.totalDr && self.totalCr === self.totalDr,
    ...mapState(['yearStart', 'yearEnd']),
  },
  watch: {
    isOpen(val) {
      if (this.inOverlay) {
        if (val) {
          this.updateAccounts();
        }
      }
    },
    vid(id) {
      this.fetchVoucherDetails(id);
    },
  },
  methods: {
    setDateValidity(validity) {
      this.isDateValid = validity;
    },
    addRow(type) {
      this.form[type].push({
        account: null,
        balance: null,
        isLoading: false,
        debit: true,
        credit: false,
        amount: null,
      });
    },
    deleteRow(type, index) {
      this.form[type].splice(index, 1);
    },
    confirmOnDelete() {
      const self = this;
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Delete ${
            this.form.vtype.text
          } Voucher <b>${this.form.vno}</b>?"`,
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
            // return;
            axios.delete('/transaction', {
              data: {
                vouchercode: this.vid,
              },
            }).then((resp) => {
              if(resp.data.gkstatus === 0) {
                self.$router.push({name: 'Workflow', params: {wfName: 'Transactions-Voucher', wfId: '-1'}});
                self.displayToast(`Voucher Delete success!`, `${self.form.vtype.text} Voucher : ${self.form.vno}, deleted successfully.`, 'success');
              } else {
                self.displayToast(`Voucher Delete failed!`, `Unable to delete ${self.form.vtype.text} Voucher : ${self.form.vno}`, 'danger');
              }
            })
          }
        });
    },
    confirmOnSubmit() {
      const self = this;
      const fromAcc = this.form.cr
        .reduce((acc, cr) => (acc += `  ${self.options.acc[cr.account]},`), '')
        .slice(0, -1);
      const toAcc = this.form.dr
        .reduce((acc, dr) => (acc += `  ${self.options.acc[dr.account]},`), '')
        .slice(0, -1);
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Create ${
            this.form.vtype.text
          } Voucher of ${numberToRupees(this.totalDr)} <b>(₹ ${
            this.totalDr
          })</b>, for transaction from Acc <b>"${fromAcc}"</b> to <b>"${toAcc}</b>?"`,
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
            this.onSubmit();
          }
        });
    },
    /**
     * onAccountSelect()
     *
     * Description: Does two things:
     * 1. The balance amount in the account chosen is fetched from server
     * 2. Makes the account selected disabled in the opposite account list
     */
    onAccountSelect(accCode, type, index) {
      if (!accCode) {
        this.form[type][index].balance = '';
        return;
      }
      this.fetchAccountBalance(accCode, type, index);
      let oppType = type === 'dr' ? 'cr' : 'dr';
      this.options[oppType].forEach((acc, index) => {
        this.options[oppType][index].disabled = acc.accountcode === accCode;
      });
    },
    /**
     * fetchAccountBalance()
     *
     * Description: Fetches an account's balance amount, given its accountcode and type
     */
    fetchAccountBalance(accCode, type, index) {
      if (this.options.balances[accCode]) {
        this.form[type][index].balance = this.options.balances[accCode];
      } else {
        this.form[type][index].isLoading = true;
        axios
          .get(
            `/report?type=closingbalance&accountcode=${accCode}&financialstart=${this.yearStart}&calculateto=${this.form.date}`
          )
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              this.form[type][index].balance = resp.data.gkresult;
              this.options.balances[accCode] = resp.data.gkresult;
            } else {
              this.form[type][index].balance = '';
              this.options.balances[accCode] = '';
            }
            this.form[type][index].isLoading = false;
          })
          .catch((error) => {
            this.displayToast(
              'Fetch State Data Failed!',
              error.message,
              'danger'
            );
            this.form[type][index].isLoading = false;
            return error;
          });
      }
    },
    /**
     * preloadData()
     *
     * Description: Fetches the list of Accounts for Dr and Cr fields for the current Voucher type
     */
    preloadData() {
      let type = this.form.vtype.acc? this.form.vtype.acc : this.form.vtype.value;
      const requests = [
        axios
          .get(`/accountsbyrule?type=${type}&side=Dr`)
          .catch((error) => {
            this.displayToast(
              'Fetch State Data Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
        axios
          .get(`/accountsbyrule?type=${type}&side=Cr`)
          .catch((error) => {
            this.displayToast(
              'Fetch State Data Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
      ];

      const self = this;
      return Promise.all(requests).then(([resp1, resp2]) => {
        let preloadErrorList = ''; // To handle the unloaded data, at once than individually
        // === Dr Accounts ===
        if (resp1.data.gkstatus === 0) {
          self.options.dr = [];
          resp1.data.gkresult.forEach((item) => {
            self.options.dr.push(Object.assign(item, { disabled: false }));
            self.options.acc[item.accountcode] = item.accountname;
            self.options.nameToId[item.accountname] = item.accountcode;
          });
        } else {
          preloadErrorList += ' Dr Accounts,';
        }

        // === Cr Accounts ===
        if (resp2.data.gkstatus === 0) {
          self.options.cr = [];
          resp2.data.gkresult.forEach((item) => {
            self.options.cr.push(Object.assign(item, { disabled: false }));
            self.options.acc[item.accountcode] = item.accountname;
            self.options.nameToId[item.accountname] = item.accountcode;
          });
        } else {
          preloadErrorList += ' Cr Accounts,';
        }

        if (preloadErrorList !== '') {
          this.displayToast(
            'Error: Unable to Preload Data',
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            'danger'
          );
        }
      });
    },

    onSubmit() {
      this.isLoading = true;
      const self = this;

      const payload = this.initPayload();
      // console.log(payload);
      // return;

      const method = this.isCreateMode ? 'post' : 'put';
      const actionText = this.isCreateMode ? 'Create' : 'Update';
      axios({ method: method, url: '/transaction', data: payload })
        .then((resp) => {
          self.isLoading = false;
          switch (resp.data.gkstatus) {
            case 0:
              {
                if (this.isCreateMode) {
                  self.displayToast(
                    'Create Voucher Success!',
                    'Voucher Created Successfully!',
                    'success'
                  );
                  const accMap = self.options.acc;
                  let dr = self.form.dr.reduce(
                    (acc, dr) => acc + `${accMap[dr.account]}, `,
                    ''
                  );
                  let cr = self.form.cr.reduce(
                    (acc, cr) => acc + `${accMap[cr.account]}, `,
                    ''
                  );
                  dr = dr.substring(0, dr.length - 2);
                  cr = cr.substring(0, cr.length - 2);
                  let log = {
                    activity: `${self.form.vtype.value} voucher created: dr [ ${dr} ], cr [ ${cr} ]`,
                  };
                  axios.post('/log', log);

                  if (self.onSave !== null) {
                    self.onSave(resp.data);
                  }
                  self.resetForm();
                } else {
                  self.displayToast(
                    'Update Voucher Success!',
                    `Voucher ${self.form.vno} Updated Successfully!`,
                    'success'
                  );

                  let log = {
                    activity: `${self.form.vtype.value} voucher updated: ${self.form.vno} `,
                  };
                  axios.post('/log', log);
                }
              }
              break;
            default:
              self.displayToast(
                `${actionText} Voucher Failure!`,
                `Voucher ${actionText} Failed!`,
                'danger'
              );
          } // end switch
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            `${actionText} Voucher Failure!`,
            error.message,
            'danger'
          );
        });
    },
    initPayload() {
      let payload = {
        voucherdate: this.form.date,
        narration: this.form.narration,
        drs: {},
        crs: {},
        vouchertype: this.form.vtype.value,
      };
      payload.drs = this.form.dr.reduce((acc, dr) => {
        acc[dr.account] = dr.amount;
        return acc;
      }, {});
      payload.crs = this.form.cr.reduce((acc, cr) => {
        acc[cr.account] = cr.amount;
        return acc;
      }, {});
      // payload.drs[this.form.voucher.dr.account] = this.form.amount;
      // payload.crs[this.form.voucher.cr.account] = this.form.amount;

      if (this.form.vno) {
        payload.vouchernumber = this.form.vno; // doubt on how to obtain this vno
      }

      if (!this.isCreateMode) {
        payload.projectcode = null;
        payload.vouchercode = this.vid;
        const vdata = this.options.vdata;
        if (vdata.vouchertype === 'sale' || vdata.vouchertype === 'purchase') {
          payload.invid = vdata.invid ? vdata.invid : null;
        }
      }

      return payload;
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
    /**
     * updateAccounts()
     *
     * Description: Automatically updates the Debit and Credit accounts,
     * based on the voucher type.
     *
     * Uses the 'customer' prop to fill the customer/supplier related Account
     *
     * (Currently only supports receipt and payment vouchers)
     */
    updateAccounts() {
      this.form.vtype = this.options.vtype.find(
        (type) => type.value === this.type
      );
      let self = this;
      return this.preloadData().then(() => {
        if (self.customer !== '-1') {
          let dr, cr;
          if (self.type === 'receipt') {
            dr = self.options.dr.find((acc) => acc.accountname === 'Bank A/C');
            cr = self.options.cr.find(
              (acc) => acc.accountname === self.customer
            );
            self.form.dr[0].account = dr ? dr.accountcode : -1;
            self.form.cr[0].account = cr ? cr.accountcode : -1;
          } else if (self.type === 'payment') {
            dr = self.options.dr.find(
              (acc) => acc.accountname === self.customer
            );
            cr = self.options.cr.find((acc) => acc.accountname === 'Bank A/C');
            self.form.dr[0].account = dr ? dr.accountcode : -1;
            self.form.cr[0].account = cr ? cr.accountcode : -1;
          }
        }
        return;
      });
    },
    resetForm() {
      this.form.amount = 0;
      this.form.narration = '';
      this.form.dr = [];
      this.form.cr = [];
      this.addRow('cr');
      this.addRow('dr');
      this.updateDate();
      return this.updateAccounts();
    },
    updateDate() {
      let today = new Date().getTime();
      let maxDate = new Date(this.yearEnd).getTime();
      if (today > maxDate) {
        this.form.date = this.yearEnd;
      } else {
        this.form.date = new Date().toISOString().slice(0, 10);
      }
    },

    // === Edit Mode Methods ===

    fetchVoucherDetails(vid) {
      const self = this;
      const nameToId = this.options.nameToId;
      axios.get(`/transaction?code=${vid}`).then((resp) => {
        if (resp.data.gkstatus === 0) {
          let data = resp.data.gkresult;
          self.form.date = self.dateReverse(data.voucherdate);
          self.form.narration = data.narration;

          self.form.vtype = self.options.vtype.find((vtype) => vtype.value === data.vouchertype)
          self.form.vno = data.vouchernumber;
          self.form.dr = [];
          self.form.cr = [];
          let drs = Object.keys(data.drs);
          let crs = Object.keys(data.crs);
          let dlength = drs.length;
          let clength = crs.length;
          let loopLength = dlength > clength ? dlength : clength;
          while (loopLength--) {
            if (dlength--) {
              self.addRow('dr');
            }
            if (clength--) {
              self.addRow('cr');
            }
          }
          self.preloadData().then(() => {
            self.$nextTick().then(() => {
              drs.forEach((acc, index) => {
                Object.assign(self.form.dr[index], {
                  account: nameToId[acc],
                  balance: null,
                  isLoading: false,
                  debit: true,
                  credit: false,
                  amount: data.drs[acc],
                });
              });
              crs.forEach((acc, index) => {
                Object.assign(self.form.cr[index], {
                  account: nameToId[acc],
                  balance: null,
                  isLoading: false,
                  debit: false,
                  credit: true,
                  amount: data.crs[acc],
                });
              });
              self.$forceUpdate();
            });
          })
          self.options.vdata = data;
        }
      });
    },
  },
  mounted() {
    if(this.isCreateMode) {
      this.resetForm();
    } else {
      this.fetchVoucherDetails(this.vid);
    }
  },
};
</script>
