<template>
  <section>
    <b-overlay :show="isLoading">
      <h2 class="my-4 text-muted display-5">
        TRIAL BALANCE
      </h2>
      <!-- Card -->
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          Trial Balance: From {{ dateReverse(selected?.fromDate || fromDate) }} to
          {{ dateReverse(selected?.toDate || toDate) }}
        </b-alert>
        <b-form @submit.prevent="updateTrialBalance">
          <b-row>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="From"
                label-cols="auto"
              >
                <gk-date
                  id="fromdate"
                  v-model="fromDate"
                  required
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
                label="To"
                label-cols="auto"
              >
                <gk-date
                  id="todate"
                  v-model="toDate"
                  required
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
                label="Type"
                label-cols="auto"
              >
                <v-select
                  :options="trialBalanceOptions"
                  v-model="trialBalanceType"
                  placeholder="Select Trial Balance Type"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-button-group
            size="sm"
          >
            <b-button
              variant="success"
              type="submit"
              class="mr-2"
            >
              Submit
            </b-button>
            <b-button
              @click="clear"
              variant="dark"
            >
              Clear
            </b-button>
          </b-button-group>
        </b-form>
      </b-card>
      <!-- Report header -->
      <div
        class="mt-3"
        v-if="tableItems !== null"
      >
        <report-header>
          <div class="text-center">
            <b>{{ trialBalanceType }} Trial Balance</b>
            for the period {{ dateReverse(selected.fromDate) }} to
            {{ dateReverse(selected.toDate) }}
          </div>
        </report-header>
        <b-card
          class="mb-3 d-print-none"
        >
          <b-card-title class="h5">
            Summary
          </b-card-title>
          <b-row v-if="currentTrialBalanceType == 'Net'">
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Credit Balance:</b> {{ tableItems?.at(-1)?.Cr }}
            </b-col>
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Debit Balance:</b> {{ tableItems?.at(-1)?.Dr }}
            </b-col>
          </b-row>
          <b-row v-if="currentTrialBalanceType == 'Gross'">
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Credit Balance:</b> {{ tableItems?.at(-1)?.["Cr balance"] }}
            </b-col>
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Debit Balance:</b> {{ tableItems?.at(-1)?.["Dr balance"] }}
            </b-col>
          </b-row>
          <b-row v-if="currentTrialBalanceType == 'Extended'">
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Credit Balance:</b> {{ tableItems?.at(-1)?.curbalcr }}
            </b-col>
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Debit Balance:</b> {{ tableItems?.at(-1)?.curbaldr }}
            </b-col>
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Total Crs:</b> {{ tableItems?.at(-1)?.totalcr }}
            </b-col>
            <b-col
              cols
              xl="3"
              md="4"
              sm="6"
            >
              <b>Total Drs:</b> {{ tableItems?.at(-1)?.totaldr }}
            </b-col>
          </b-row>
        </b-card>
        <!-- Toolbar -->
        <div class="mt-4">
          <div class="d-flex d-print-none justify-content-between align-items-center mb-2">
            <!-- Search Field -->
            <div>
              <b-input-group size="sm">
                <!-- search bar -->
                <b-form-input
                  size="sm"
                  v-model.lazy="search"
                  type="text"
                  placeholder="Search Table"
                  style="align-self: center"
                />
              </b-input-group>
            </div>
            <div>
              <!-- spreadsheet download button -->
              <gk-file-download
                v-if="currentTrialBalanceType == 'Net'"
                :url="
                  `/spreadsheet/trial-balance?calculateto=${selected.toDate}&trialbalancetype=1&fystart=${yearStart}&fyend=${yearEnd}&orgname=${orgName}`
                "
                variant="dark"
                name="Export XLSX"
                file-extn=".xlsx"
                :common-params="false"
                file-suffix="NetTrialBalance"
                title="Download Net Trial Balance Spreadsheet"
                :message-from-parent="parentMessage"
              />
              <gk-file-download
                v-if="currentTrialBalanceType == 'Gross'"
                :url="
                  `/spreadsheet/trial-balance?calculateto=${selected.toDate}&trialbalancetype=2&fystart=${yearStart}&fyend=${yearEnd}&orgname=${orgName}`
                "
                :common-params="false"
                variant="dark"
                name="Export XLSX"
                file-extn=".xlsx"
                file-suffix="NetTrialBalance"
                title="Download Net Trial Balance Spreadsheet"
                :message-from-parent="parentMessage"
              />
              <gk-file-download
                v-if="currentTrialBalanceType == 'Extended'"
                :url="
                  `/spreadsheet/trial-balance?calculateto=${selected.toDate}&trialbalancetype=3&fystart=${yearStart}&fyend=${yearEnd}&orgname=${orgName}`
                "
                :common-params="false"
                variant="dark"
                name="Export XLSX"
                file-extn=".xlsx"
                file-suffix="ExtendedTrialBalance"
                title="Download Extended Trial Balance Spreadsheet"
                :message-from-parent="parentMessage"
              />
            </div>
          </div>
        </div>
        <!-- Table -->
        <b-table
          :items="paginatedItems"
          :fields="tableFields"
          :per-page="perPage"
          small
          primary-key="accountname"
          outlined
          hover
          head-variant="light"
          responsive
        >
          <template #cell(accountname)="data">
            <router-link
              v-if="!['Total', 'Difference in Trial balance'].includes(data.item.accountname)"
              :to="`/ledger/${data.item.accountcode}`"
            >
              {{ data.item.accountname }}
            </router-link>
            <div v-else>
              {{ data.item.accountname }}
            </div>
          </template>
        </b-table>
        <div
          class="d-print-none d-flex align-items-center justify-content-end"
        >
          <b-pagination
            v-if="filteredItems.length > perPage"
            v-model="currentPage"
            :total-rows="filteredItems.length"
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
          No data available for this period.
        </b-alert>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
import ReportHeader from '../components/ReportHeader.vue';
import { reverseDate } from '../js/utils.js';

export default {
  components: {
    GkDate,
    GkFileDownload,
    ReportHeader,
  },
  name: 'TrialBalance',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      search: '',
      fromDate: null,
      selected: {},
      toDate: null,
      currentPage: 1,
      perPage: 10,
      tableFields: [],
      tableItems: [],
      trialBalanceType: 'Net',
      currentTrialBalanceType: 'Net',
      trialBalanceOptions: ["Net", "Gross", "Extended"],
      balance: Object,
      netFields: [
        {
          key: 'srno',
          label: this.$gettext('Sr. No.'),
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
        },

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
          key: 'groupname',
          label: this.$gettext('Group'),
          class: 'text-center',
        },
      ],
      grossFields: [
        {
          key: 'srno',
          label: 'Sr. No.',
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
        },
        {
          key: 'Dr balance',
          label: this.$gettext('Dr Balance'),
          class: 'text-right',
        },
        {
          key: 'Cr balance',
          label: this.$gettext('Cr Balance'),
          class: 'text-right',
        },

        {
          key: 'groupname',
          label: this.$gettext('Group'),
          class: 'text-center',
        },
      ],
      extendedFields: [
        {
          key: 'srno',
          label: this.$gettext('Sr. No.'),
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
        },
        {
          key: 'openingbalance',
          label: this.$gettext('Opening Balance'),
          class: 'text-right',
        },
        {
          key: 'totaldr',
          label: this.$gettext('Total Drs'),
          class: 'text-right',
        },
        {
          key: 'totalcr',
          label: this.$gettext('Total Crs'),
          class: 'text-right',
        },
        {
          key: 'curbaldr',
          label: this.$gettext('Dr Balance'),
          class: 'text-right',
        },
        {
          key: 'curbalcr',
          label: this.$gettext('Cr Balance'),
          class: 'text-right',
        },
      ],
    };
  },
  methods: {
    clear() {
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      this.trialBalanceType = "Net";
      this.getTrialBalance()
    },
    /**
     * Return appropriate trial balance code for generating spreadsheet
     */
    trialBalanceCode() {
      if (this.trialBalanceType == 'Net') {
        return 1;
      } else if (this.trialBalanceType == 'Gross') {
        return 2;
      } else {
        return 3;
      }
    },
    setTableFields() {
      if (this.trialBalanceType == 'Net') {
        this.tableFields = this.netFields
      } else if (this.trialBalanceType == 'Gross') {
        this.tableFields = this.grossFields
      } else {
        this.tableFields = this.extendedFields
      }
    },
    updateTrialBalance() {
      this.getTrialBalance();
      this.updateRoute();
    },
    getTrialBalance() {
      this.currentPage = 1;
      this.isLoading = true;
      let url = '';
      if (this.trialBalanceType == 'Net') {
        url = `/reports/trial-balance/net?financialstart=${this.fromDate}&calculateto=${this.toDate}`;
      } else if (this.trialBalanceType == 'Gross') {
        url = `/reports/trial-balance/gross?financialstart=${this.fromDate}&calculateto=${this.toDate}`;
      } else {
        url = `/reports/trial-balance/extended?financialstart=${this.fromDate}&calculateto=${this.toDate}`;
      }
      this.$axios.get(url)
        .then((resp) => {
          this.tableItems = resp;
          this.setTableFields();
          this.currentTrialBalanceType = this.trialBalanceType;
          this.selected = {
            fromDate: this.fromDate,
            toDate: this.toDate,
          };
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          from: this.fromDate,
          to: this.toDate,
          balType: this.trialBalanceType,
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.fromDate = params?.from || this.yearStart;
        this.toDate = params?.to || this.yearEnd;
        this.trialBalanceType = params.balType;
      } else {
        this.fromDate = this.yearStart;
        this.toDate = this.yearEnd;
      }
    },
  },
  watch: {
    search() {
      this.currentPage = 1;
    },
  },
  computed: {
    filteredItems() {
      return this.tableItems.filter(
        item =>  (
          item.accountname.toLowerCase().includes(this.search.toLowerCase())
          || item.groupname?.toLowerCase().includes(this.search.toLowerCase())
        )
      );
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredItems.slice(start, start + this.perPage);
    },
    minDate: (self) => reverseDate(self.yearStart),
    maxDate: (self) => reverseDate(self.yearEnd),
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  mounted() {
    this.parseParams();
    this.getTrialBalance();
  },
};
</script>

<style>
tr[data-pk='Total'] {
  font-weight: bold;
}
</style>
