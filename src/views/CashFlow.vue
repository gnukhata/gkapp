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
            :name="$gettext('Cash Flow Statement')"
            :help-body="
              $gettext(`Receipt & Payment Account or Cash Flow
This report can be viewed for any period.
Drill Down facility is available. You can double click or press enter key on any row to see the ledger for that account.
All users can view this report`)
            "
          ></gk-cardheader>
        </template>
        <b-form @submit.prevent="getProfitLossData">
          <b-form-group label="From" label-align="right" content-cols="8">
            <gk-date id="fromdate" v-model="fromDate"></gk-date>
          </b-form-group>
          <b-form-group label="To" label-align="right" content-cols="8">
            <gk-date id="todate" v-model="toDate"></gk-date>
          </b-form-group>
          <b-button variant="success" class="float-right" type="submit">
            <b-icon icon="cloud-arrow-down"></b-icon
            ><translate> Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
      <report-header>
        <div class="text-center">
          <b>Cash Flow Account</b>
          for the period {{ dateReverse(this.yearStart) }} to
          {{ dateReverse(this.yearEnd) }}
        </div>
      </report-header>
      <div class="row mt-3" v-if="result1 !== null">
        <div class="col">
          <b-table
            :fields="fields1"
            :items="result1"
            primary-key="particulars"
            small
            bordered
            striped
            responsive
            head-variant="dark"
          >
            <template #cell(particulars)="data">
              <b-link
                class="text-dark"
                @click="$router.push(`/ledger/${data.item.accountcode}`)"
                >{{ data.item.particulars }}
              </b-link>
            </template>
          </b-table>
        </div>
        <div class="col">
          <b-table
            :fields="fields2"
            :items="result2"
            primary-key="particulars"
            small
            bordered
            striped
            responsive
            head-variant="dark"
          >
            <template #cell(particulars)="data">
              <div
                v-if="data.item.particulars == 'Total'"
                class="text-weight-bold"
              >
                {{ data.item.particulars }}
              </div>
            </template>
          </b-table>
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
      result1: null,
      result2: null,
      fields1: [
        {
          key: 'toby',
          label: '',
        },
        {
          key: 'particulars',
          label: this.$gettext('Particulars'),
        },
        {
          key: 'amount',
          label: this.$gettext('Amount'),
        },
      ],
      fields2: [
        {
          key: 'toby',
          label: '',
        },
        {
          key: 'particulars',
          label: this.$gettext('Particulars'),
        },
        {
          key: 'amount',
          label: this.$gettext('Amount'),
        },
      ],
    };
  },
  methods: {
    getProfitLossData() {
      this.isLoading = true;
      axios
        .get(
          `/report?type=cashflow&calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.result1 = r.data.rcgkresult;
                this.result2 = r.data.pygkresult;
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
    ...mapState(['yearStart', 'yearEnd']),
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
