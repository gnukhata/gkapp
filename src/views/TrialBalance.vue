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
              name="View Trial Balance"
              help-body="Trial Balance can be seen in three formats.
                  The Net Trial Balance will provide the closing balances (or current balance as on selected end date). The Gross Trial Balance shows for each account the total Drs and Crs along with Closing Balances, while the Extended version shows all this with Opening Balances.
                  Apart from the regular account names and balances, these reports include Group name of each account.
                  The period for this report must begin with the first date of the Financial Year and can end on any date. If an account has an adverse balance it is shown in red colour.
                  The difference in Trial Balance, if any, is shown in the last row.
                  Drill Down facility is available for all types of Trial Balances. You can click or press enter key on any row to see the ledger for that account.
                  All users can view all types of Trial Balances. "
            ></gk-cardheader>
          </template>
          <b-form-group label="From" label-align="right" content-cols="8">
            <gk-date id="fromdate" v-model="fromDate"></gk-date>
          </b-form-group>
          <b-form-group label="To" label-align="right" content-cols="8">
            <gk-date id="todate" v-model="toDate"></gk-date>
          </b-form-group>
          <b-button variant="success" class="float-right" type="submit">
            <b-icon icon="cloud-arrow-down"></b-icon> Get Details
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
      <div class="mt-3" v-if="result !== null">
        <b-form-radio-group
          v-model="trialBalanceType"
          :options="options"
          name="radio-options"
          class="mx-auto text-center d-print-none mb-3"
        ></b-form-radio-group>
        <!-- Tables -->
        <!-- Net trial balance -->
        <b-table
          v-if="trialBalanceType === 'Net'"
          :items="balance.gross"
          :fields="netfields"
          small
          primary-key="accountname"
          bordered
          hover
          striped
          stacked="sm"
          head-variant="dark"
        >
        </b-table>
        <!-- Gross Trial Balance -->
        <b-table
          v-if="trialBalanceType === 'Gross'"
          :items="balance.net"
          :fields="grossfields"
          small
          bordered
          striped
          stacked="sm"
          head-variant="dark"
        >
        </b-table>
        <!-- Extended Trial Balance -->
        <b-table
          v-if="trialBalanceType === 'Extended'"
          :items="balance.extended"
          :fields="extendedfields"
          small
          bordered
          striped
          stacked="sm"
          head-variant="dark"
        >
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
export default {
  components: { GkCardheader, GkDate, ReportHeader },
  name: 'ProfitLoss',
  data() {
    return {
      isLoading: false,
      fromDate: null,
      toDate: null,
      trialBalanceType: 'Net',
      balance: Object,
      result: null,
      options: [
        { text: 'Net Trial Balance', value: 'Net' },
        { text: 'Gross Trial Balance', value: 'Gross' },
        { text: 'Extended Trial Balance', value: 'Extended' },
      ],
      netfields: [
        {
          key: 'srno',
          label: 'Sr. No.',
        },
        {
          key: 'accountname',
          label: 'Account Name',
        },

        {
          key: 'Dr balance',
          label: 'Debit',
        },
        {
          key: 'Cr balance',
          label: 'Credit',
        },
        {
          key: 'groupname',
          label: 'Group',
        },
      ],
      grossfields: [
        {
          key: 'srno',
          label: 'Sr. No.',
        },
        {
          key: 'accountname',
          label: 'Account Name',
        },

        {
          key: 'ttlRunDr',
          label: 'Debit',
        },
        {
          key: 'ttlRunCr',
          label: 'Credit',
        },

        {
          key: 'Dr',
          label: 'Dr Balance',
        },
        {
          key: 'Cr',
          label: 'Cr Balance',
        },

        {
          key: 'groupname',
          label: 'Group',
        },
      ],
      extendedfields: [
        {
          key: 'srno',
          label: 'Sr. No.',
        },
        {
          key: 'accountname',
          label: 'Account Name',
        },
        {
          key: 'openingbalance',
          label: 'Opening Balance',
        },
        {
          key: 'totaldr',
          label: 'Total Drs',
        },
        {
          key: 'totalcr',
          label: 'Total Crs',
        },
        {
          key: 'curbaldr',
          label: 'Dr Balance',
        },
        {
          key: 'curbalcr',
          label: 'Cr Balance',
        },
      ],
    };
  },
  methods: {
    // switchBalance() {
    //   if (this.trialBalanceType === 'Net') {
    //     this.result = this.balance.net;
    //   } else if (this.trialBalanceType === 'Gross') {
    //     this.result = this.balance.gross;
    //   } else {
    //     this.result = this.balance.extended;
    //   }
    // },
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
                this.$bvToast.toast('Duplicate Entry', {
                  variant: 'warning',
                  solid: true,
                });
                break;
              case 2:
                this.$bvToast.toast('Unauthorised Access', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 3:
                this.$bvToast.toast('Data error', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast('No Privilege', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 5:
                this.$bvToast.toast('Integrity error', {
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
    ...mapState(['yearStart', 'yearEnd']),
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
  },
};
</script>
