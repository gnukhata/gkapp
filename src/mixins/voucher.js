import { mapState } from 'vuex';
import axios from 'axios';
export default {
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
    onSave: {
      type: Function,
      required: false,
      default: null,
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
        creditInv: {
          // on credit invoices for receipt and payment vouchers
          sale: [],
          purchase: [],
          map: {},
        },
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
      customerName: '-1',
      form: {
        inv: null,
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
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    isReceiptOrPayment: (self) => {
      let result = false;
      if (self.form.vtype) {
        let type = self.form.vtype.value;
        result = type === 'receipt' || type === 'payment';
      }
      return result;
    },
    creditInv: (self) =>
      self.form.vtype.value === 'payment'
        ? self.options.creditInv.purchase
        : self.options.creditInv.sale,
    creditInvData: (self) => {
      let data = {};
      if (self.isReceiptOrPayment && self.form.inv > 0) {
        data = self.options.creditInv.map[self.form.inv];
      }
      return data;
    },
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
    _minDate: (self) =>
      self.dateFormat === 'dd-mm-yyyy'
        ? self.dateReverse(self.yearStart)
        : self.yearStart,
    _maxDate: (self) =>
      self.dateFormat === 'dd-mm-yyyy'
        ? self.dateReverse(self.yearEnd)
        : self.yearEnd,
    isVoucherTotalValid: (self) =>
      self.totalCr && self.totalDr && self.totalCr === self.totalDr,
    ...mapState(['yearStart', 'yearEnd']),
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
              this.$gettext('Fetch State Data Failed!'),
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
      let type = this.form.vtype.acc
        ? this.form.vtype.acc
        : this.form.vtype.value;
      let requests = [
        axios.get(`/accountsbyrule?type=${type}&side=Dr`).catch((error) => {
          // this.displayToast(
          //   this.$gettext('Fetch State Data Failed!'),
          //   error.message,
          //   'danger'
          // );
          console.log('Fetch Dr accounts failed');
          return error;
        }),
        axios.get(`/accountsbyrule?type=${type}&side=Cr`).catch((error) => {
          // this.displayToast(
          //   this.$gettext('Fetch State Data Failed!'),
          //   error.message,
          //   'danger'
          // );
          console.log('Fetch Cr accounts failed');
          return error;
        }),
      ];

      this.options.creditInv = {
        sale: [],
        purchase: [],
        map: {},
      };

      if (this.isReceiptOrPayment) {
        requests.push(
          axios.get(`billwise?type=all`).catch((error) => {
            // this.displayToast(
            //   this.$gettext('Fetch State Data Failed!'),
            //   error.message,
            //   'danger'
            // );
            console.log('Fetch billwise accounts failed');
            return error;
          })
        );
      }

      const self = this;
      return Promise.all(requests).then(([resp1, resp2, resp3]) => {
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

        // on credit invoices
        if (self.isReceiptOrPayment) {
          if (resp3.data.gkstatus === 0) {
            self.options.creditInv = {
              sale: [],
              purchase: [],
              map: {},
            };
            resp3.data.invoices.forEach((item) => {
              let option = {
                id: item.invid,
                label: `${item.invoiceno}, ${item.custname}, ${item.invoicedate}`,
              };
              if (item.inoutflag === 15) {
                self.options.creditInv.sale.push(option);
              } else {
                self.options.creditInv.purchase.push(option);
              }
              self.options.creditInv.map[item.invid] = item;
            });
          } else {
            preloadErrorList += ' On credit invoices,';
          }
        }

        if (preloadErrorList !== '') {
          this.displayToast(
            this.$gettext('Error: Unable to Preload Data'),
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            'danger'
          );
        }
      });
    },

    _initPayload() {
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

      /**
       * 
       * Needs to be added for edit and easy modes separately
      if (!this.isCreateMode) {
        payload.projectcode = null;
        payload.vouchercode = this.vid;
        const vdata = this.options.vdata;
        if (vdata.vouchertype === 'sale' || vdata.vouchertype === 'purchase') {
          payload.invid = vdata.invid ? vdata.invid : null;
        }
      } else if (this.isReceiptOrPayment && !this.inOverlay) {
        payload.invid = `${this.form.inv}` || null;
      }
      */
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
    onInvSelect() {
      if (this.form.inv > 0) {
        let invData = this.options.creditInv.map[this.form.inv];
        this.customerName = invData.custname;
        this.autoChooseAccounts();
        this.form.dr[0].amount = this.form.cr[0].amount = parseFloat(
          invData.balanceamount
        );
      }
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
    updateAccounts(skipVtype) {
      if (!skipVtype) {
        this.form.vtype = this.options.vtype.find(
          (type) => type.value === this.type
        );
      }
      let self = this;
      return this.preloadData().then(() => {
        self.autoChooseAccounts();
      });
    },
    autoChooseAccounts() {
      if (this.customerName !== '-1') {
        let dr, cr;
        if (this.form.vtype.value === 'receipt') {
          dr = this.options.dr.find((acc) => acc.accountname === 'Bank A/C');
          cr = this.options.cr.find(
            (acc) => acc.accountname === this.customerName
          );
          this.form.dr[0].account = dr ? dr.accountcode : -1;
          this.form.cr[0].account = cr ? cr.accountcode : -1;
        } else if (this.form.vtype.value === 'payment') {
          dr = this.options.dr.find(
            (acc) => acc.accountname === this.customerName
          );
          cr = this.options.cr.find((acc) => acc.accountname === 'Bank A/C');
          this.form.dr[0].account = dr ? dr.accountcode : -1;
          this.form.cr[0].account = cr ? cr.accountcode : -1;
        }
      }
    },
    // skipVtype - skip the voucher type update
    _resetForm(skipVtype) {
      this.form.amount = 0;
      this.form.narration = '';
      this.form.dr = [];
      this.form.cr = [];
      this.form.inv = null;
      this.form.narration = '';
      this.options.creditInv = {
        sale: [],
        purchase: [],
        map: {},
      };
      this.customerName = '-1';
      this.addRow('cr');
      this.addRow('dr');
      this.updateDate();
      return this.updateAccounts(skipVtype);
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
  },
};
