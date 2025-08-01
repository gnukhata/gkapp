<template>
  <section>
    <b-overlay
      :show="loading"
      blur
    >
      <h2 class="mb-5 text-muted display-5">
        BANK RECONCILIATION STATEMENT
      </h2>
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          Bank Reconciliation Statement: From {{ dateReverse(selected?.fromDate || fromDate) }} to
          {{ dateReverse(selected?.toDate || toDate) }}
        </b-alert>
        <b-form class="text-small">
          <b-row>
            <b-col
              cols
              lg="6"
            >
              <!-- Select Register -->
              <b-form-group
                label="Account Name :"
                label-cols="auto"
              >
                <v-select
                  :options="bankAccs"
                  v-model="accId"
                  placeholder="Select Account"
                  label="accountname"
                  :reduce="account => account.accountcode"
                  :required="true"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <!-- Date -->
              <b-form-group
                label="From :"
                label-cols="auto"
              >
                <gk-date
                  id="date-from"
                  required
                  v-model="fromDate"
                  :format="dateFormat"
                  :min="minDate"
                  :max="maxDate"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="To :"
                label-cols="auto"
              >
                <gk-date
                  id="date-to"
                  required
                  v-model="toDate"
                  :format="dateFormat"
                  :min="minDate"
                  :max="maxDate"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="12"
            >
              <b-form-radio-group
                v-model="tableType"
                :options="tableTypeOptions"
                name="table-options"
                class="d-print-none"
              />
            </b-col>
          </b-row>
          <b-button-group
            size="sm"
            class="float-right"
          >
            <b-button
              @click="clear"
              variant="dark"
            >
              <translate>Clear</translate>
            </b-button>
            <b-button
              size="sm"
              variant="success"
              class="ml-1"
              @click.prevent="getVouchers"
            >
              <translate>Get Details</translate>
            </b-button>
          </b-button-group>
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <div
      class="mt-3"
      v-if="dataFetched"
    >
      <report-header>
        <div class="text-center">
          <b> Register</b>
          | From
          <b>{{ fromDate }}</b>
          to
          <b>{{ toDate }}</b>
        </div>
      </report-header>
      <div
        class="d-print-none d-flex align-items-center justify-content-end mb-2 mt-4"
      >
        <b-button-group
          size="sm"
        >
          <b-button
            v-if="tableType < 2 && activeVouchers.length"
            size="sm"
            variant="dark"
            @click="showVoucherForm = !showVoucherForm"
          >
            Add Voucher
          </b-button>
        </b-button-group>
      </div>
      <b-table
        class="text-small"
        head-variant="light"
        small
        outlined
        hover
        stacked="sm"
        v-if="tableType < 2 && activeVouchers.length"
        :items="activeVouchers"
        :fields="reconTableFields"
      >
        <template #cell(voucher_no)="data">
          <router-link :to="`/Workflow/Transactions-Voucher/${data.item.voucher_code}`">
            {{ data.value }}
          </router-link>
        </template>
        <template #cell(clearancedate)="data">
          <gk-date
            :id="`clearance-date-${data.index}`"
            required
            v-model="activeVouchers[data.index].clearancedate"
            :format="dateFormat"
            :min="minDate"
            :max="maxDate"
            @validity="(isValid) => (data.item.valid = isValid)"
          />
        </template>
        <template #cell(memo)="data">
          <b-input
            :id="`memo-${data.index}`"
            v-model="activeVouchers[data.index].memo"
            size="sm"
          />
        </template>
        <template #cell(save)="data">
          <b-button
            :disabled="!data.item.valid"
            @click.prevent="updateVoucher(activeVouchers[data.index])"
            variant="success"
            size="sm"
          >
            <b-icon
              class="align-middle"
              font-scale="1"
              icon="cloud-upload"
            />
          </b-button>
        </template>
      </b-table>
      <b-table
        class="mt-3 text-small"
        head-variant="light"
        small
        outlined
        hover
        v-if="tableType === 2"
        :items="statements"
        :fields="[
          {key: 'particulars', label: 'Reconciliation Statement'},
          'amount',
        ]"
      />
    </div>
    <b-modal
      size="lg"
      v-model="showVoucherForm"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <voucher
        :hide-back-button="true"
        :in-overlay="true"
        :on-save="postVoucherSave"
        :is-open="showVoucherForm"
        mode="create"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click="showVoucherForm = !showVoucherForm"
          >
            x
          </b-button>
        </template>
      </voucher>
    </b-modal>
  </section>
</template>

<!-- TODOS
     * Fix Table fields
     * API response has object with multiple key/values. Process them
     * Add Button for export as spreadsheet
-->
<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import axios from 'axios';
import ReportHeader from '../components/ReportHeader.vue';
import Voucher from '../components/form/Voucher.vue';
import { reverseDate } from '../js/utils';

export default {
  name: 'BankRecon',
  components: { GkDate, ReportHeader, Voucher },
  data() {
    return {
      loading: false,
      accId: null,
      dataFetched: false,
      fromDate: '',
      toDate: '',
      search: '',
      vouchers: {
        cleared: [],
        uncleared: [],
      },
      selected: {},
      unclearedVouchers: [],
      clearedVouchers: [],
      showVoucherForm: false,
      statements: [],
      bankAccs: [],
      tableType: 0,
      tableTypeOptions: [
        {
          text: 'Uncleared Vouchers',
          value: 0,
        },
        {
          text: 'Cleared Vouchers',
          value: 1,
        },
        {
          text: 'Statement',
          value: 2,
        },
      ],
      reconTableFields: [
        'date',
        {
          key: 'voucher_no',
          label: 'V.No.',
        },
        'particulars',
        {
          key: 'dr',
          label: 'Debit',
          class: 'text-md-right',
        },
        {
          key: 'cr',
          label: 'Credit',
          class: 'text-md-right',
        },
        {
          key: 'clearancedate',
          label: 'Clearance Date',
        },
        'memo',
        'save',
      ],
    };
  },
  computed: {
    activeVouchers: (self) =>
      self.tableType === 0 ? self.vouchers.uncleared : self.vouchers.cleared,
    minDate: (self) => reverseDate(self.yearStart),
    maxDate: (self) => reverseDate(self.yearEnd),
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    clear() {
      this.accId = null;
      this.tableType = 0;
      this.dataFetched = false;
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      this.selected = {};
      this.unclearedVouchers = [];
      this.clearedVouchers = [];
      this.statements = [];
    },
    postVoucherSave() {
      this.getVouchers();
      this.showVoucherForm = false;
    },
    getBankAccounts() {
      this.loading = true;
      this.$axios
        .get(`/bankrecon`)
        .then((resp) => { this.bankAccs.push(...resp); })
        .finally(this.loading = false);
    },
    updateVoucher(voucher) {
      let payload = {
        accountcode: this.accId,
        reconcode: voucher.reconcode,
        memo: voucher.memo,
        clearancedate: voucher.clearancedate,
        calculatefrom: this.fromDate,
        calculateto: this.toDate,
      };
      axios.put('/bankrecon', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.$bvToast.toast(`Voucher ${voucher.voucher_no} Updated successfully!`, {
            variant: 'success',
            solid: true,
          });
          this.getVouchers();
        } else {
          this.$bvToast.toast(`Voucher ${voucher.voucher_no} Update Failed!`, {
            variant: 'danger',
            solid: true,
          });
        }
      });
    },
    getVouchers() {
      this.dataFetched = false;
      this.vouchers = {
        cleared: [],
        uncleared: [],
      };
      this.statements = [];
      this.loading = true;
      Promise.all([
        axios
          .get(
            `/bankrecon?recon=uncleared&accountcode=${this.accId}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
          )
          .catch((e) => {
            this.$bvToast.toast(e.message, {
              variant: 'danger',
              solid: true,
            });
          }),
        axios
          .get(
            `/bankrecon?recon=cleared&accountcode=${this.accId}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
          )
          .catch((e) => {
            this.$bvToast.toast(e.message, {
              variant: 'danger',
              solid: true,
            });
          }),
      ])
        .then((resp) => {
          if (resp[0].data.gkstatus === 0) {
            this.vouchers.uncleared = resp[0].data.gkresult.recongrid.map(
              (voucher) => {
                voucher.valid = false;
                return voucher;
              }
            );
            this.statements = resp[0].data.gkresult.reconstatement;
            this.statements.shift();
            this.dataFetched = true;
          }
          if (resp[1].data.gkstatus === 0) {
            this.vouchers.cleared = resp[1].data.gkresult.recongrid.map(
              (voucher) => {
                voucher.date = reverseDate(voucher.date);
                voucher.valid = false;
                return voucher;
              }
            );
            this.dataFetched = true;
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    this.getBankAccounts();
  },
};
</script>
