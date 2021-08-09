<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <b-card
        class="gkcard mx-auto"
        header-bg-variant="dark"
        header-text-variant="light"
      >
        <template #header>
          <gk-cardheader
            name="Profit & Loss Statement"
            help-body="Income & Expenditure Account / Profit & Loss Account
This report can be viewed for any period"
          ></gk-cardheader>
        </template>
        <b-form @submit.prevent="getProfitLossData">
          <b-form-group label="From" label-align="right" content-cols="8">
            <gk-date id="fromdate" v-model="fromDate"></gk-date>
          </b-form-group>
          <b-form-group label="To" label-align="right" content-cols="8">
            <gk-date id="todate" v-model="toDate"></gk-date>
          </b-form-group>
          <b-button variant="success" class="float-right" type="submit"
            ><b-icon icon="cloud-arrow-up"></b-icon> Get Details</b-button
          >
        </b-form>
      </b-card>
      <!--     {{ result }} -->
      <report-header>
        <div class="text-center">
          <b>Profit & Loss Account</b> for the period {{ fromDate }} to
          {{ toDate }}
        </div>
      </report-header>
      <div class="row mt-4 ml-2 mr-2" v-if="result !== null">
        <div class="col">
          <b-table-simple small bordered hover>
            <b-thead head-variant="dark">
              <b-tr>
                <b-th>Particulars</b-th>
                <b-th>Amount</b-th>
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr>
                <b-th>DIRECT EXPENSE</b-th>
                <b-th>{{ result['Direct Expense']['direxpbal'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-5 font-weight-normal"><i>Purchase</i></b-th>
                <b-th>{{
                  result['Direct Expense']['Purchase']['balance']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-5 font-weight-normal text-danger"
                  ><i>Gross Profit C/F</i></b-th
                >
                <b-th>{{ result['grossprofitcf'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th>INDIRECT EXPENSE</b-th>
                <b-th>{{ result['Indirect Expense']['indirexpbal'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th>Net Profit</b-th>
                <b-th>{{ result['netprofit'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th><b>Total</b></b-th>
                <b-th
                  ><b>{{ result['Total'] }}</b></b-th
                >
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </div>
        <div class="col">
          <b-table-simple small bordered hover>
            <b-thead head-variant="dark">
              <b-tr>
                <b-th>Particulars</b-th>
                <b-th>Amount</b-th>
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr>
                <b-th>DIRECT INCOME</b-th>
                <b-th>{{ result['Direct Income']['dirincmbal'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-4 font-weight-normal">SALES</b-th>
                <b-th>{{ result['Direct Income']['Sales']['balance'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-5 font-weight-normal">Sales A/C</b-th>
                <b-th>{{ result['Direct Income']['Sales']['Sale A/C'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th>INDIRECT INCOME</b-th>
                <b-th>{{ result['Indirect Expense']['indirexpbal'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th>Closing Stock</b-th>
                <b-th>{{ result['Closing Stock'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th><b>Total</b></b-th>
                <b-th
                  ><b>{{ result['Total'] }}</b></b-th
                >
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </div>
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
      result: null,
    };
  },
  methods: {
    getProfitLossData() {
      this.isLoading = true;
      axios
        .get(
          `/report?type=profitloss&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.result = r.data.gkresult;
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
<style scoped>
th {
  font-weight: normal;
}
</style>
