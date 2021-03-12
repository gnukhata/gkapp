<!--
  ToDo:
  * API integrations -> Rectifiable Invoice list
-->
<template>
  <div class="card">
    <div class="card-header py-1 px-2">
      <b-dropdown size="sm" variant="outline-dark">
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
          <b-col>
          </b-col>
          <b-col class="mb-2" :style="{ 'max-width': '200px' }">
            <b-input-group>
              <b-form-input
                size="sm"
                id="date-1"
                v-model="form.date"
                type="text"
                placeholder="YYYY-MM-DD"
                autocomplete="off"
                required
              ></b-form-input>
              <b-input-group-append>
                <b-form-datepicker
                  size="sm"
                  v-model="form.date"
                  button-only
                  right
                  locale="en-GB"
                  aria-controls="date-1"
                >
                </b-form-datepicker>
              </b-input-group-append>
            </b-input-group>
          </b-col>
          <b-col cols="12">
            <b-table-simple hover small caption-top responsive bordered>
              <b-thead head-variant="dark">
                <!-- table header -->
                <b-tr class="text-center">
                  <!-- <b-th :style="{ maxWidth: '40px', width: '40px' }"
                    >Dr/Cr</b-th
                  > -->
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
                      minWidth: '80px',
                    }"
                    >Balance</b-th
                  >
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '110px',
                      minWidth: '75px',
                    }"
                    >Debit</b-th
                  >
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '110px',
                      minWidth: '75px',
                    }"
                    >Credit</b-th
                  >
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr
                  class="text-center"
                  v-for="(data, key, index) in form.voucher"
                  :key="index"
                >
                  <!-- Type  -->
                  <!-- <b-td class="text-capitalize align-middle">
                    {{ key }}
                  </b-td> -->

                  <!-- Account -->
                  <b-td>
                    <b-form-select
                      size="sm"
                      v-model="data.account"
                      :options="options[key]"
                      text-field="accountname"
                      value-field="accountcode"
                      disabled-field="disabled"
                      required
                      @input="onAccountSelect(data.account, key)"
                    ></b-form-select>
                  </b-td>

                  <!-- Balance -->
                  <b-td class="position-relative" :style="{'font-size': '0.85rem'}">
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
                      v-model="form.amount"
                      class="hide-spin-button text-right px-1"
                      type="number"
                      step="0.01"
                      min="0.01"
                      v-if="data.debit"
                      debounce="500"
                      required
                      size="sm"
                    ></b-input>
                  </b-td>

                  <!-- Cr Amount -->
                  <b-td>
                    <b-input
                      v-model="form.amount"
                      class="hide-spin-button text-right px-1"
                      type="number"
                      step="0.01"
                      min="0.01"
                      v-if="data.credit"
                      debounce="500"
                      required
                      size="sm"
                    ></b-input>
                  </b-td>
                </b-tr>
              </b-tbody>
              <b-tfoot>
                <b-tr variant="secondary" class="text-right">
                  <b-th colspan="2"> Total </b-th>
                  <b-th>
                    <span>₹ {{ form.amount }}</span>
                  </b-th>
                  <b-th>
                    <span>₹ {{ form.amount }}</span>
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
            variant="danger"
            :to="{ name: 'Workflow' }"
            v-if="!hideBackButton"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-left"
            ></b-icon>
            <span class="align-middle"> Back</span>
          </b-button>
          <b-button size="sm" type="submit" class="mr-2" variant="success">
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Save</span>
          </b-button>
        </div>
        <div class="clearfix"></div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import { numberToRupees } from "../../js/utils"
export default {
  name: "Voucher",
  components: {},
  props: {
    type: {
      type: String,
      validator: function (value) {
        return (
          [
            "receipt",
            "payment",
            "purchase",
            "sales",
            "journal",
            "contra",
          ].indexOf(value) !== -1
        );
      },
      default: "receipt",
      required: false,
    },
    customer: {
      type: String,
      required: false,
      default: null,
    },
    onSave: {
      type: Function,
      required: false,
      default: null
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
  },
  data() {
    return {
      isLoading: false,
      options: {
        dr: [],
        cr: [],
        balances: {},
        vtype: [
          { text: "Receipt", value: "receipt" },
          { text: "Payment", value: "payment" },
          { text: "Purchase", value: "purchase" },
          { text: "Sales", value: "sales" },
          { text: "Contra", value: "contra" },
          { text: "Journal", value: "journal" },
          { text: "Credit Note", value: "journal" },
          { text: "Debit Note", value: "journal" },
          { text: "Sales Return", value: "journal" },
          { text: "Purchase Return", value: "journal" },
        ],
      },
      form: {
        vtype: { text: "", value: "" },
        date: null,
        voucher: {
          dr: {
            account: null,
            balance: null,
            isLoading: false,
            debit: true,
            credit: false,
          },
          cr: {
            account: null,
            balance: null,
            isLoading: false,
            debit: false,
            credit: true,
          },
        },
        amount: 0,
        narration: "",
      },
    };
  },
  computed: {
    ...mapState(["yearStart"]),
  },
  watch: {
    isOpen(val) {
      if (this.inOverlay) {
        if(val) {
          this.updateAccounts();
        }
      }
    },
  },
  methods: {
    confirmOnSubmit() {
      let fromAcc = this.options.cr.find((account) => account.accountcode === this.form.voucher.cr.account).accountname
      let toAcc = this.options.dr.find((account) => account.accountcode === this.form.voucher.dr.account).accountname
      let text = `Create ${this.form.vtype.text} Voucher of ${numberToRupees(this.form.amount)} (₹ ${this.form.amount}), for transaction from Acc "${fromAcc}" to "${toAcc}?"`
      this.$bvModal
        .msgBoxConfirm(
          text,
          {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'p-1 border-top-0',
          bodyClass: 'p-2',
          centered: true
          }
        )
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
    onAccountSelect(accCode, type) {
      this.fetchAccountBalance(accCode, type);
      let oppType = type === "dr" ? "cr" : "dr";
      this.options[oppType].forEach((acc, index) => {
        this.options[oppType][index].disabled = acc.accountcode === accCode;
      });
    },
    /**
     * fetchAccountBalance()
     * 
     * Description: Fetches an account's balance amount, given its accountcode and type
     */
    fetchAccountBalance(accCode, type) {
      if (this.options.balances[accCode]) {
        this.form.voucher[type].balance = this.options.balances[accCode];
      } else {
        this.form.voucher[type].isLoading = true;
        axios
          .get(
            `/report?type=closingbalance&accountcode=${accCode}&financialstart=${this.yearStart}&calculateto=${this.form.date}`
          )
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              this.form.voucher[type].balance = resp.data.gkresult;
              this.options.balances[accCode] = resp.data.gkresult;
            }
            this.form.voucher[type].isLoading = false;
          })
          .catch((error) => {
            this.displayToast(
              "Fetch State Data Failed!",
              error.message,
              "danger"
            );
            this.form.voucher[type].isLoading = false;
            return error;
          });
      }
    },
    /**
     * preloadData()
     * 
     * Description: Fetches the Customers and Suppliers List 
     */
    preloadData() {
      const requests = [
        axios
          .get(`/accountsbyrule?type=${this.form.vtype.value}&side=Dr`)
          .catch((error) => {
            this.displayToast(
              "Fetch State Data Failed!",
              error.message,
              "danger"
            );
            return error;
          }),
        axios
          .get(`/accountsbyrule?type=${this.form.vtype.value}&side=Cr`)
          .catch((error) => {
            this.displayToast(
              "Fetch State Data Failed!",
              error.message,
              "danger"
            );
            return error;
          }),
      ];

      const self = this;
      return Promise.all([...requests]).then(([resp1, resp2]) => {
        let preloadErrorList = ""; // To handle the unloaded data, at once than individually

        // === Dr Accounts ===
        if (resp1.data.gkstatus === 0) {
          self.options.dr = resp1.data.gkresult.map((item) => {
            // console.log(item);
            return Object.assign(item, { disabled: false });
          });
        } else {
          preloadErrorList += " Dr Accounts,";
        }

        // === Cr Accounts ===
        if (resp2.data.gkstatus === 0) {
          self.options.cr = resp2.data.gkresult.map((item) => {
            return Object.assign(item, { disabled: false });
          });
        } else {
          preloadErrorList += " Cr Accounts,";
        }

        if (preloadErrorList !== "") {
          this.displayToast(
            "Error: Unable to Preload Data",
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            "danger"
          );
        }
      });
    },

    onSubmit() {
      this.isLoading = true;
      const payload = this.initPayload();
      axios
        .post("/transaction", payload)
        .then((response) => {
          // console.log(response)
          this.isLoading = false;
          switch (response.data.gkstatus) {
            case 0:
              this.displayToast(
                "Create Voucher Success!",
                "Voucher Created Successfully!",
                "success"
              );
              if(this.onSave !== null) {
                this.onSave(response.data)
              }
              this.resetForm()
              break;
            default:
              this.displayToast(
                "Create Voucher Failure!",
                "Voucher Creation Failed!",
                "danger"
              );
          } // end switch
        })
        .catch((error) => {
          this.isLoading = false;
          this.displayToast("Create Voucher Failure!", error.message, "danger");
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

      payload.drs[this.form.voucher.dr.account] = this.form.amount;
      payload.crs[this.form.voucher.cr.account] = this.form.amount;

      if (this.form.vno) {
        payload.vouchernumber = this.form.vno; // doubt on how to obtain this vno
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

      this.preloadData().then(() => {
        if (this.customer !== null) {
          if (this.type === "receipt") {
            this.form.voucher.dr.account = this.options.dr.find(
              (acc) => acc.accountname === "Bank A/C"
            ).accountcode;
            this.form.voucher.cr.account = this.options.cr.find(
              (acc) => acc.accountname === this.customer
            ).accountcode;
          } else if (this.type === "payment") {
            this.form.voucher.dr.account = this.options.dr.find(
              (acc) => acc.accountname === this.customer
            ).accountcode;
            this.form.voucher.cr.account = this.options.cr.find(
              (acc) => acc.accountname === "Bank A/C"
            ).accountcode;
          }
        }
      });
    },
    resetForm() {
      this.form.amount = 0;
      this.form.narration = "";
    }
  },
  mounted() {
    this.updateAccounts();

    // By default use the current date as Voucher Date
    let today = new Date();

    this.form.date =
      today.getFullYear() +
      "-" +
      (today.getMonth() < 9 ? "0" : "") +
      (today.getMonth() + 1) +
      "-" +
      (today.getDate() < 9 ? "0" : "") +
      today.getDate();
  },
};
</script>
