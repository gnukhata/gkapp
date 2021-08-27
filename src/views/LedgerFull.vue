<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <div class="bg-dark mb-4">
        <!-- header -->
        <h6 class="text-center card-header text-light d-print-none">
          <i>Ledger Account:</i> <b>{{ ledgerHead.accountname }}</b> |
          <i>Period: </i>
          <b> {{ ledgerHead.calculatefrom }} </b> to
          <b>{{ ledgerHead.calculateto }} </b>
        </h6>
      </div>
      <!-- print header -->
      <report-header>
        <div class="text-center">
          Monthly ledger of account:
          <b>{{ ledgerHead.accountname }}</b> from
          {{ ledgerHead.calculatefrom }} to
          {{ ledgerHead.calculateto }}
        </div>
      </report-header>
      <!-- result -->
      <b-table
        :items="result"
        small
        striped
        bordered
        hover
        head-variant="dark"
        responsive="sm"
        :busy="loading"
        :fields="fields"
      >
        <template #cell(status)="data">
          <div v-if="data.item.status">
            {{ data.item.status }}
          </div>
        </template>
        <template #cell(vouchernumber)="data">
          <b-link
            @click="
              $router.push(
                `/Workflow/Transactions-Voucher/${data.item.vouchercode}`
              )
            "
          >
            {{ data.item.vouchernumber }}
          </b-link>
        </template>
        <template #cell(particulars)="data">
          <div v-for="item in data.item.particulars" :key="item.accountname">
            {{ item.accountname }}
          </div>
        </template>
      </b-table>
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
      // projectCode null value is '', else it will result in data error
      projectCode: '',
      result: [],
      ledgerHead: '',
      accountName: null,
      fromDate: null,
      toDate: null,
      fields: [
        {
          key: 'voucherdate',
          label: 'Date',
          sortable: true,
        },
        {
          key: 'vouchernumber',
          label: 'Voucher No.',
        },

        {
          key: 'status',
          label: 'Status',
        },
        {
          key: 'vouchertype',
          label: 'Type',
        },
        {
          key: 'particulars',
          label: 'Particulars',
        },
        {
          key: 'Dr',
          label: 'Debit',
          class: 'text-right',
        },
        {
          key: 'Cr',
          label: 'Credit',
          class: 'text-right',
        },
        {
          key: 'balance',
          label: 'Balance',
          class: 'text-right',
        },
      ],
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  mounted() {
    const params = this.$route.params;
    this.accountCode = params.id;
    if (params.pc !== 'null') {
      this.projectCode = params.pc || '';
    }
    this.accountCode = params.ac;
    this.fromDate = params.fd || this.yearStart;
    this.toDate = params.td || this.yearEnd;
    this.getLedger();
  },
  methods: {
    getLedger() {
      this.loading = true;
      axios
        .get(
          `/report?type=ledger&accountcode=${this.accountCode}&projectcode=${this.projectCode}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.result = r.data.gkresult;
                this.ledgerHead = r.data.ledgerheader;
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
