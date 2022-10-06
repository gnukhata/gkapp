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
            :name="$gettext('Profit & Loss Statement')"
            :help-body="
              $gettext(`Income & Expenditure Account / Profit & Loss Account
This report can be viewed for any period`)
            "
          ></gk-cardheader>
        </template>
        <b-form @submit.prevent="getProfitLossData">
          <b-form-group
            :label="$gettext('From')"
            label-align="right"
            content-cols="8"
          >
            <gk-date id="fromdate" v-model="fromDate"></gk-date>
          </b-form-group>
          <b-form-group
            :label="$gettext('To')"
            label-align="right"
            content-cols="8"
          >
            <gk-date id="todate" v-model="toDate"></gk-date>
          </b-form-group>
          <b-button variant="success" class="float-right" type="submit"
            ><b-icon class="mr-1" icon="cloud-arrow-down"></b-icon
            ><translate> Get Details</translate></b-button
          >
        </b-form>
      </b-card>
      <report-header>
        <div class="text-center">
          <b>Profit & Loss Account</b> for the period {{ fromDate }} to
          {{ toDate }}
        </div>
      </report-header>
      <!-- Tool bar -->
      <gk-toolbar class="mt-2">
        <GkFileDownload
          v-if="result !== null"
          :url="
            `/spreadsheet?profit-loss&from=${this.fromDate}&to=${this.toDate}&orgtype=${orgType}`
          "
          title="Download Profit & Loss Spreadsheet"
          aria-label="profit & loss Spreadsheet download button"
        />
      </gk-toolbar>
      <div class="row mt-4 ml-2 mr-2" v-if="result !== null">
        <div class="col">
          <b-table-simple striped small bordered hover>
            <b-thead head-variant="dark">
              <b-tr>
                <b-th v-translate>Particulars</b-th>
                <b-th v-translate>Amount</b-th>
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr>
                <b-th v-translate>DIRECT EXPENSE</b-th>
                <b-th class="text-right">{{
                  result['Direct Expense']['direxpbal']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-5 font-weight-normal"
                  ><i v-translate>Purchase</i></b-th
                >
                <b-th class="text-right">{{
                  result['Direct Expense']['Purchase']['balance']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-5 font-weight-normal text-danger"
                  ><i v-translate>Gross Profit C/F</i></b-th
                >
                <b-th class="text-right">{{ result['grossprofitcf'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th v-translate>INDIRECT EXPENSE</b-th>
                <b-th class="text-right">{{
                  result['Indirect Expense']['indirexpbal']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th v-translate>Net Profit</b-th>
                <b-th class="text-right">{{ result['netprofit'] }}</b-th>
              </b-tr>
              <b-tr>
                <b-th><b v-translate>Total</b></b-th>
                <b-th class="text-right"
                  ><b>{{ result['Total'] }}</b></b-th
                >
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </div>
        <div class="col">
          <b-table-simple class="mb-1" striped small bordered hover>
            <b-thead head-variant="dark">
              <b-tr>
                <b-th v-translate>Particulars</b-th>
                <b-th v-translate>Amount</b-th>
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr>
                <b-th v-translate>DIRECT INCOME</b-th>
                <b-th class="text-right">{{
                  result['Direct Income']['dirincmbal']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-4 font-weight-normal" v-translate>SALES</b-th>
                <b-th class="text-right">{{
                  result['Direct Income']['Sales']['balance']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th class="pl-5 font-weight-normal" v-translate
                  >Sales A/C</b-th
                >
                <b-th class="text-right">{{
                  result['Direct Income']['Sales']['Sale A/C']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th v-translate>INDIRECT INCOME</b-th>
                <b-th class="text-right">{{
                  result['Indirect Expense']['indirexpbal']
                }}</b-th>
              </b-tr>
              <b-tr>
                <b-th v-translate>Closing Stock</b-th>
                <b-th class="text-right">
                  {{ result['Closing Stock']['total'] }}
                </b-th>
              </b-tr>
              <b-tr>
                <b-th><b v-translate>Total</b></b-th>
                <b-th class="text-right"
                  ><b>{{ result['Total'] }}</b></b-th
                >
              </b-tr>
            </b-tbody>
          </b-table-simple>
          <small> <b> * (Closing Stock is calculated using FIFO algorithm) </b> </small>
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
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
export default {
  components: { GkCardheader, GkDate, ReportHeader, GkToolbar, GkFileDownload },
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
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          from: this.fromDate,
          to: this.toDate,
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.fromDate = params.from;
        this.toDate = params.to;
      } else {
        this.fromDate = this.yearStart;
        this.toDate = this.yearEnd;
      }
      this.getProfitLossData();
    },
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
    ...mapState(['yearStart', 'yearEnd', 'orgType']),
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    this.getProfitLossData();
  },
};
</script>
<style scoped>
th {
  font-weight: normal;
}
</style>
