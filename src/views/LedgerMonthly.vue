<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <div class="bg-dark mb-4">
        <h5 class="text-center card-header text-light d-print-none">
          <i>Ledger Account:</i> <b>{{ accountName }}</b>
        </h5>
      </div>
      <report-header>
        <div class="text-center">
          Monthly ledger of account: <b>{{ accountName }}</b> from
          {{ dateReverse(yearStart) }} to {{ dateReverse(yearEnd) }}
        </div>
      </report-header>
      <b-table
        :items="result"
        small
        striped
        hover
        head-variant="dark"
        responsive="sm"
        :busy="loading"
        :fields="fields"
      ></b-table>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  components: { ReportHeader },
  name: 'LedgerMonthly',
  data() {
    return {
      loading: false,
      accountCode: null,
      result: null,
      accountName: null,
      fields: [
        {
          key: 'month',
          label: 'Month',
        },
        {
          key: 'Dr',
          label: 'Debit Balance',
        },
        {
          key: 'vcountDr',
          label: 'No. Of Debit Records',
        },
        {
          key: 'Cr',
          label: 'Credit Balance',
        },
        {
          key: 'vcountCr',
          label: 'No. Of Credit Records',
        },
        {
          key: 'vcountLock',
          label: 'No. of Unlocked Transactions',
        },
      ],
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  mounted() {
    this.accountCode = this.$route.params.id;
    this.getAccounts();
  },
  methods: {
    getAccounts() {
      this.loading = true;
      axios
        .get(`/report?type=monthlyledger&accountcode=${this.accountCode}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.result = r.data.gkresult;
                this.accountName = r.data.accountname;
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
          this.loading = false;
        });
    },
  },
};
</script>