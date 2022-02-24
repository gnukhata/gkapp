<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <!-- Card -->
      <b-form @submit.prevent="getAllTrialBalances">
        <b-card
          class="gkcard mx-auto"
          header-bg-variant="dark"
          header-text-variant="light"
        >
          <template #header>
            <gk-cardheader
              :name="$gettext('View Trial Balance')"
              :help-body="showHelpBody"
            ></gk-cardheader>
          </template>
          <b-form-group label="From" label-align="right" content-cols="8">
            <gk-date id="fromdate" v-model="fromDate"></gk-date>
          </b-form-group>
          <b-form-group label="To" label-align="right" content-cols="8">
            <gk-date id="todate" v-model="toDate"></gk-date>
          </b-form-group>
          <b-button variant="success" class="float-right" type="submit">
            <b-icon icon="cloud-arrow-down"></b-icon>
            <translate> Get Details</translate>
          </b-button>
        </b-card>
      </b-form>
      <!-- Report header -->
      <report-header>
        <div class="text-center">
          <b>{{ trialBalanceType }} Trial Balance</b>
          for the period {{ dateReverse(this.yearStart) }} to
          {{ dateReverse(this.yearEnd) }}
        </div>
      </report-header>
      <!-- Radio buttons -->
      <div class="mt-3 d-print-none" v-if="result !== null">
        <b-form-radio-group
          v-model="trialBalanceType"
          name="radio-options"
          class="mx-auto text-center d-print-none mb-3"
        >
          <b-form-radio value="Net"
            ><translate> Net</translate>

            <gk-tooltip
              class="ml-1"
              icon="info-circle"
              :helpTitle="$gettext('Net Trial Balance')"
              :help-body="
                $gettext(
                  'The Net Trial Balance will provide the closing balances (or current balance as on selected end date)'
                )
              "
            ></gk-tooltip>
          </b-form-radio>
          <b-form-radio value="Gross"
            ><translate>Gross</translate>

            <gk-tooltip
              class="ml-1"
              icon="info-circle"
              :helpTitle="$gettext('Gross Trial Balance')"
              :help-body="
                $gettext(
                  'The Gross Trial Balance shows for each account the total Drs and Crs along with Closing Balances'
                )
              "
            ></gk-tooltip>
          </b-form-radio>
          <b-form-radio value="Extended"
            ><translate>Extended</translate>

            <gk-tooltip
              class="ml-1"
              icon="info-circle"
              :helpTitle="$gettext('Extended Trial Balance')"
              :help-body="
                $gettext(
                  'The extended version shows all gross & net trial balances with Opening Balances'
                )
              "
            ></gk-tooltip>
          </b-form-radio>
        </b-form-radio-group>
        <!-- search bar -->
        <b-form-input
          v-model.lazy="search"
          type="text"
          class="mx-auto gkcard mb-2"
          :placeholder="$gettext('Search trial balance')"
        ></b-form-input>
        <!-- Toolbar -->
        <gk-toolbar>
          <gk-file-download
            v-if="trialBalanceType == 'Net'"
            :url="
              `/spreadsheet?trial-balance&calculateto=${this.toDate}&trialbalancetype=1&financialstart=${this.yearStart}&fystart=${this.yearStart}&fyend=${this.yearEnd}&startdate=${this.yearEnd}&orgname=${this.orgName}`
            "
            :commonParams="false"
            fileSuffix="NetTrialBalance"
            title="Download Net Trial Balance Spreadsheet"
          >
          </gk-file-download>
          <gk-file-download
            v-if="trialBalanceType == 'Extended'"
            :url="
              `/spreadsheet?trial-balance&calculateto=${this.toDate}&trialbalancetype=3&financialstart=${this.yearStart}&fystart=${this.yearStart}&fyend=${this.yearEnd}&startdate=${this.yearEnd}&orgname=${this.orgName}`
            "
            :commonParams="false"
            fileSuffix="ExtendedTrialBalance"
            title="Download Extended Trial Balance Spreadsheet"
          >
          </gk-file-download>
        </gk-toolbar>
        <!-- Tables -->
        <!-- Net trial balance -->
        <b-table
          v-if="trialBalanceType === 'Net'"
          :items="balance.gross"
          :fields="netfields"
          :filter="search"
          class="table-border-dark"
          small
          primary-key="accountname"
          bordered
          hover
          striped
          stacked="sm"
          head-variant="dark"
        >
          <template #cell(accountname)="data">
            <b-link
              v-if="data.item.accountname !== 'Total'"
              @click="$router.push(`/ledger/${data.item.accountcode}`)"
            >
              {{ data.item.accountname }}
            </b-link>
            <div v-else>{{ data.item.accountname }}</div>
          </template>
        </b-table>
        <!-- Gross Trial Balance -->
        <b-table
          v-else-if="trialBalanceType === 'Gross'"
          class="table-border-dark"
          :items="balance.net"
          :fields="grossfields"
          :filter="search"
          primary-key="accountname"
          small
          bordered
          striped
          stacked="sm"
          head-variant="dark"
        >
          <template #cell(accountname)="data">
            <b-link
              v-if="data.item.accountname !== 'Total'"
              @click="$router.push(`/ledger/${data.item.accountcode}`)"
            >
              {{ data.item.accountname }}
            </b-link>
            <div v-else>{{ data.item.accountname }}</div>
          </template>
        </b-table>
        <!-- Extended Trial Balance -->
        <b-table
          v-else
          class="table-border-dark"
          :items="balance.extended"
          :fields="extendedfields"
          :filter="search"
          primary-key="accountname"
          small
          bordered
          striped
          stacked="sm"
          head-variant="dark"
        >
          <template #cell(accountname)="data">
            <b-link
              v-if="data.item.accountname !== 'Total'"
              @click="$router.push(`/ledger/${data.item.accountcode}`)"
            >
              {{ data.item.accountname }}
            </b-link>
            <div v-else>{{ data.item.accountname }}</div>
          </template>
        </b-table>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkCardheader from '../components/GkCardheader.vue';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '../components/ReportHeader.vue';
import GkTooltip from '../components/GkTooltip.vue';
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
export default {
  components: {
    GkCardheader,
    GkDate,
    ReportHeader,
    GkTooltip,
    GkToolbar,
    GkFileDownload,
  },
  name: 'TrialBalance',
  data() {
    return {
      isLoading: false,
      search: '',
      fromDate: null,
      toDate: null,
      trialBalanceType: 'Net',
      balance: Object,
      result: null,
      // options: [
      //   { text: 'Net Trial Balance', value: 'Net' },
      //   { text: 'Gross Trial Balance', value: 'Gross' },
      //   { text: 'Extended Trial Balance', value: 'Extended' },
      // ],
      netfields: [
        {
          key: 'srno',
          label: this.$gettext('Sr. No.'),
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
        },

        {
          key: 'Dr balance',
          label: this.$gettext('Debit'),
          class: 'text-right',
        },
        {
          key: 'Cr balance',
          label: this.$gettext('Credit'),
          class: 'text-right',
        },
        {
          key: 'groupname',
          label: this.$gettext('Group'),
          class: 'text-center',
        },
      ],
      grossfields: [
        {
          key: 'srno',
          label: 'Sr. No.',
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
        },

        {
          key: 'ttlRunDr',
          label: this.$gettext('Debit'),
          class: 'text-right',
        },
        {
          key: 'ttlRunCr',
          label: this.$gettext('Credit'),
          class: 'text-right',
        },

        {
          key: 'Dr',
          label: this.$gettext('Dr Balance'),
          class: 'text-right',
        },
        {
          key: 'Cr',
          label: this.$gettext('Cr Balance'),
          class: 'text-right',
        },

        {
          key: 'groupname',
          label: this.$gettext('Group'),
          class: 'text-center',
        },
      ],
      extendedfields: [
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
    /**
     * Return appropriate trial balance code for generating spreadsheet
     */
    trialBalanceCode() {
      console.log(this.trialBalanceType);
      if (this.trialBalanceType == 'Net') {
        return 1;
      } else if (this.trialBalanceType == 'Gross') {
        return 2;
      } else {
        return 3;
      }
    },
    getAllTrialBalances() {
      this.isLoading = true;
      Promise.all([
        axios.get(
          `/report?type=nettrialbalance&financialstart=${this.fromDate}&calculateto=${this.toDate}`
        ),
        axios.get(
          `/report?type=grosstrialbalance&financialstart=${this.fromDate}&calculateto=${this.toDate}`
        ),
        axios.get(
          `/report?type=extendedtrialbalance&financialstart=${this.fromDate}&calculateto=${this.toDate}`
        ),
      ])
        .then((r) => {
          if (r[0].status === 200) {
            switch (r[0].data.gkstatus) {
              case 0:
                this.balance.net = r[0].data.gkresult;
                this.balance.gross = r[1].data.gkresult;
                this.balance.extended = r[2].data.gkresult;
                this.result = this.balance.net;
                break;
              case 1:
                this.$bvToast.toast(this.$gettext('Duplicate Entry'), {
                  variant: 'warning',
                  solid: true,
                });
                break;
              case 2:
                this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 3:
                this.$bvToast.toast(this.$gettext('Data error'), {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast(this.$gettext('No Privilege'), {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 5:
                this.$bvToast.toast(this.$gettext('Integrity error'), {
                  variant: 'danger',
                  solid: true,
                });
                break;
            }
          }
          this.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
          this.isLoading = false;
        });
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
    showHelpBody() {
      return this.$gettext(`Trial Balance can be seen in three formats.
                  The Net Trial Balance will provide the closing balances or current balance as on selected end date. The Gross Trial Balance shows for each account the total Drs and Crs along with Closing Balances, while the Extended version shows all this with Opening Balances.
                  Apart from the regular account names and balances, these reports include Group name of each account.
                  The period for this report must begin with the first date of the Financial Year and can end on any date. If an account has an adverse balance it is shown in red colour.
                  The difference in Trial Balance, if any, is shown in the last row.
                  Drill Down facility is available for all types of Trial Balances. You can click or press enter key on any row to see the ledger for that account.
                  All users can view all types of Trial Balances.`);
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
  },
};
</script>
<style>
tr[data-pk='Total'] {
  font-weight: bold;
}
</style>
