<template>
  <section>
    <h2 class="my-4 text-muted display-5">
      LEDGER
    </h2>
    <b-overlay :show="loading">
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          {{ selected?.accountName }} Ledger: From {{ dateReverse(selected?.fromDate || fromDate) }} to
          {{ dateReverse(selected?.toDate || toDate) }}
        </b-alert>
        <b-row>
          <b-col
            cols
            lg="6"
          >
            <!-- Account name -->
            <b-form-group
              label="Account"
              label-cols="auto"
            >
              <v-select
                :options="accountsList"
                v-model="accountCode"
                placeholder="Select Account"
                label="accountname"
                :reduce="account => account.accountcode"
                :required="true"
              />
            </b-form-group>
          </b-col>
          <!-- Date fields -->
          <b-col
            cols
            lg="3"
          >
            <b-form-group
              label="From"
              label-cols="auto"
            >
              <gk-date
                id="from"
                v-model="fromDate"
                :readonly="showMonthlyLedger"
              />
            </b-form-group>
          </b-col>
          <b-col
            cols
            lg="3"
          >
            <b-form-group
              label="To"
              label-cols="auto"
            >
              <gk-date
                id="to"
                v-model="toDate"
                :readonly="showMonthlyLedger"
              />
            </b-form-group>
          </b-col>
          <b-col
            cols
            lg="2"
          >
            <b-form-group
              label="Monthwise"
              label-cols="auto"
            >
              <!-- monthly ledger checkbox -->
              <b-form-checkbox
                switch
                size="lg"
                class="mt-1"
                v-model="showMonthlyLedger"
              />
            </b-form-group>
          </b-col>
          <b-col
            cols
            lg="3"
            v-if="!showMonthlyLedger"
          >
            <b-form-group
              label="Type"
              label-cols="auto"
            >
              <v-select
                :options="transactionOptions"
                v-model="transactionType"
                placeholder="Select Register Type"
                :reduce="register => register.code"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-button-group
          size="sm"
        >
          <b-button
            variant="success"
            @click="loadTable"
            :disabled="(accountCode == null) || (transactionType == null)"
            class="mr-2"
          >
            Submit
          </b-button>
          <b-button
            @click="clear"
            variant="dark"
          >
            <translate>Clear</translate>
          </b-button>
        </b-button-group>
      </b-card>
    </b-overlay>
    <div v-if="isLoaded">
      <report-header>
        <div class="text-center">
          <span>
            Monthly ledger of account:
            <b>{{ selected.accountName }}</b> from
            {{ selected.fromDate }} to
            {{ selected.toDate }}
          </span>
        </div>
      </report-header>
      <b-card
        class="mb-3 d-print-none"
        v-if="selected.transactionType=='all'"
      >
        <b-card-title class="h5">
          Summary
        </b-card-title>
        <b-row>
          <b-col
            cols
            xl="3"
            md="4"
            sm="6"
          >
            <b>Total of Transactions (Dr):</b> {{ result?.at(-3)?.Dr || "0.00" }}
          </b-col>
          <b-col
            cols
            xl="3"
            md="4"
            sm="6"
          >
            <b>Total of Transactions (Cr):</b> {{ result?.at(-3)?.Cr || "0.00" }}
          </b-col>
          <b-col
            cols
            xl="3"
            md="4"
            sm="6"
          >
            <b>Closing Balance C/F (
              <span v-if="result?.at(-2)?.Dr">Dr</span>
              <span v-else>Cr</span>
              ):</b> {{ result?.at(-2)?.Dr || result?.at(-2)?.Cr || "0.00" }}
          </b-col>
          <b-col
            cols
            xl="3"
            md="4"
            sm="6"
          >
            <b>Grand Total (Dr):</b> {{ result?.at(-1)?.Dr || "0.00" }}
          </b-col>
          <b-col
            cols
            xl="3"
            md="4"
            sm="6"
          >
            <b>Grand Total (Cr):</b> {{ result?.at(-1)?.Cr || "0.00" }}
          </b-col>
        </b-row>
      </b-card>
      <div
        class="d-print-none d-flex align-items-center justify-content-end mb-2 mt-4"
      >
        <div>
          <b-button-group
            size="sm"
          >
            <gk-file-download
              v-if="isMonthlyLedger"
              :common-params="false"
              :url="
                `/spreadsheet/ledger/monthly?accountcode=${this.selected.accountCode}&accname=${this.selected.accountName}&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`
              "
              variant="dark"
              title="Export XLSX"
              name="Export XLSX"
              file-extn=".xlsx"
              :message-from-parent="parentMessage"
            />
            <gk-file-download
              v-if="selected.transactionType=='all'"
              :common-params="false"
              :url="
                `/spreadsheet/ledger?accountcode=${this.selected.accountCode}&accountname=${this.selected.accountname}&from=${this.selected.fromDate}&to=${this.selected.toDate}&orgtype=${this.orgType}&projectcode=&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`
              "
              :message-from-parent="parentMessage"
              variant="dark"
              title="Export XLSX"
              name="Export XLSX"
              file-extn=".xlsx"
            />
          </b-button-group>
        </div>
      </div>
      <b-table
        :items="paginatedItems"
        :per-page="perPage"
        small
        outlined
        stacked="sm"
        hover
        head-variant="light"
        responsive="sm"
        :busy="loading"
        :fields="fields"
      >
        <template
          #cell(status)="data"
          v-if="!isMonthlyLedger"
        >
          <div v-if="data.item.status">
            {{ data.item.status }}
          </div>
        </template>
        <template
          #cell(vouchernumber)="data"
          v-if="!isMonthlyLedger"
        >
          <router-link
            :to="`/Workflow/Transactions-Voucher/${data.item.vouchercode}`"
          >
            {{ data.item.vouchernumber }}
          </router-link>
        </template>
        <template
          #cell(particulars)="data"
          v-if="!isMonthlyLedger"
        >
          <div
            v-for="item in data.item.particulars"
            :key="item.accountname"
          >
            {{ item.accountname }}
          </div>
        </template>
        <template
          #cell(Dr)="data"
          v-if="isMonthlyLedger"
        >
          {{ data.value || "0.00" }}
        </template>
        <template
          #cell(Cr)="data"
          v-if="isMonthlyLedger"
        >
          {{ data.value || "0.00" }}
        </template>
      </b-table>
      <div
        class="d-print-none d-flex align-items-center justify-content-end"
      >
        <b-pagination
          v-if="result.length > perPage"
          v-model="currentPage"
          :total-rows="result.length"
          :per-page="perPage"
          align="center"
          limit="4"
        />
      </div>
    </div>
    <div v-else>
      <b-alert
        show
        class="text-center mx-auto d-print-none"
        variant="primary"
      >
        Select an account to load table.
      </b-alert>
    </div>
  </section>
</template>

<script>
import GkFileDownload from '../components/GkFileDownload.vue';
import ReportHeader from '../components/ReportHeader.vue';
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
export default {
  components: { GkDate, GkFileDownload, ReportHeader },
  name: 'Ledger',
  data() {
    return {
      loading: false,
      accountsList: [],
      fields: [],
      result: [],
      showMonthlyLedger: false, // to change the monthly ledger status
      isMonthlyLedger: false, // current monthly ledget status
      currentPage: 1,
      perPage: 10,
      selected: {},
      accountCode: null,
      accountName: null,
      projectCode: null,
      fromDate: null,
      toDate: null,
      transactionType: null,
      transactionOptions: [
        { "code": "all", "label": "All" },
        { "code": "cr", "label": "Crs" },
        { "code": "dr", "label": "Drs" },
      ],
      isLoaded: false,
      parentMessage: '',
    };
  },
   computed: {
    paginatedItems() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.result.slice(start, start + this.perPage);
    },
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
  methods: {
    clear() {
      this.accountCode = null;
      this.projectCode = null;
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      this.showMonthlyLedger = false, // to change the monthly ledger status
      this.isMonthlyLedger = false, // current monthly ledget status
      this.transactionType = "all";
      this.selected = {};
      this.fields = [];
      this.result = [];
      this.isLoaded = false;
      this.$router.push(`/ledger/`);
    },
    loadTable() {
      this.isLoaded = true;
      this.getLedger();
      this.updateRoute();
    },
    getAccounts() {
      return this.$axios.get('/accounts').then((resp) => {
        this.accountsList = resp;
      });
    },
    setFields(isMonthly){
      let fields = [];
      if (isMonthly) {
        fields = [
          {
            key: 'month',
            label: this.$gettext('Month'),
          },
          {
            key: 'Dr',
            label: this.$gettext('Debit Balance'),
            class: 'text-right',
          },
          {
            key: 'vcountDr',
            label: this.$gettext('No. Of Debit Records'),
            class: 'text-right',
          },
          {
            key: 'Cr',
            label: this.$gettext('Credit Balance'),
            class: 'text-right',
          },
          {
            key: 'vcountCr',
            label: this.$gettext('No. Of Credit Records'),
            class: 'text-right',
          },
        ];
      } else {
        fields = [
          {
            key: 'voucherdate',
            label: this.$gettext('Date'),
            sortable: true,
          },
          {
            key: 'vouchernumber',
            label: this.$gettext('Voucher No.'),
            class: 'text-right',
          },
          {
            key: 'vouchertype',
            label: this.$gettext('Type'),
            class: 'text-right',
          },
          {
            key: 'particulars',
            label: this.$gettext('Particulars'),
            class: 'text-right',
          },
        ]
        if (this.transactionType == "dr") {
          fields.push(
            {
              key: 'Dr',
              label: this.$gettext('Debit'),
              class: 'text-right',
            }
          );
        } else if (this.transactionType == "cr") {
          fields.push(
            {
              key: 'Cr',
              label: this.$gettext('Credit'),
              class: 'text-right',
            },
          );
        } else {
          fields.push(
            {
              key: 'Dr',
              label: this.$gettext('Debit'),
              class: 'text-right',
            },
            {
              key: 'Cr',
              label: this.$gettext('Credit'),
              class: 'text-right',
            },
            {
              key: 'balance',
              label: this.$gettext('Balance'),
              class: 'text-right',
            },
          );
        }
      }
      this.fields = fields;
    },
    updateRoute() {
      if (this.showMonthlyLedger) {
        this.$router.push(`/ledger/monthly/${this.accountCode}`);
      } else {
        this.$router.push(`/ledger/${this.accountCode}?pc=${this.projectCode || null}&fd=${this.fromDate}&td=${this.toDate}&tt=${this.transactionType || null}`);
      }
    },
    getLedger() {
      let url = null;
      if (this.showMonthlyLedger) {
        this.fromDate = this.yearStart;
        this.toDate = this.yearEnd;
        this.transactionType = 'all';
        url = `/reports/ledger/monthly?accountcode=${this.accountCode}`;
      } else {
        if (this.transactionType == 'all') {
          url = `/reports/ledger?accountcode=${this.accountCode}&projectcode=&calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}`;
        } else {
          url = `/reports/ledger/crdr?accountcode=${this.accountCode}&projectcode=&calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}&side=${this.transactionType}`;
        }
      }
      this.loading = true;
      this.$axios
        .get(url)
        .then((resp) => {
          this.accountName = this.accountsList.find(
            (account) => account.accountcode === this.accountCode
          )?.accountname;
          this.isMonthlyLedger = this.showMonthlyLedger;
          this.setFields(this.showMonthlyLedger);
          this.result = resp;
          if (this.showMonthlyLedger) {
            this.selected = {
              accountCode: this.accountCode,
              accountName: this.accountName,
              projectCode: this.projectCode,
              fromDate: this.yearStart,
              toDate: this.yearEnd,
            }
          } else {
            this.selected = {
              accountCode: this.accountCode,
              accountName: this.accountName,
              projectCode: this.projectCode,
              fromDate: this.fromDate,
              toDate: this.toDate,
              transactionType: this.transactionType,
            };
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.getAccounts()
      .then(
        () => {
          const params = this.$route.params;
          this.accountCode = params?.ac ? Number(params?.ac) : null;
          const query = this.$route.query;
          if (query.pc !== 'null') {
            this.projectCode = query.pc || '';
          }
          this.fromDate = query.fd || this.yearStart;
          this.toDate = query.td || this.yearEnd;
          this.transactionType = query.tt || "all";
          if (this.accountCode) {
            this.isLoaded = true;
            this.getLedger();
          }
        }
      )
  },
};
</script>
