<template>
  <section>
    <h2 class="my-4 text-muted display-5">
      CASH FLOW STATEMENT
    </h2>
    <b-overlay :show="isLoading">
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          Cash Flow Statement: From {{ dateReverse(selected?.fromDate || fromDate) }} to
          {{ dateReverse(selected?.toDate || toDate) }}
        </b-alert>

        <b-form @submit.prevent="getCashFlowData">
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
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-button-group
            size="sm"
          >
            <b-button
              variant="success"
              @click="updateRoute"
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
      <div
        class="d-print-none d-flex align-items-center justify-content-end mb-2 mt-4"
      >
        <gk-file-download
          v-if="result1 !== null"
          :url="
            `/spreadsheet?cash-flow&from=${selected.fromDate}&to=${selected.toDate}&orgtype=${orgType}&fystart=${yearStart}&fyend=${yearEnd}&orgname=${orgName}`
          "
          variant="dark"
          title="Export XLSX"
          name="Export XLSX"
          file-extn=".xlsx"
          :common-params="false"
          :message-from-parent="parentMessage"
        />
      </div>
      <div
        class="row"
        v-if="result1 !== null"
      >
        <report-header>
          <div class="text-center">
            <b>Cash Flow Account</b>
            for the period {{ dateReverse(selected.fromDate) }} to
            {{ dateReverse(selected.toDate) }}
          </div>
        </report-header>
        <div class="col-lg-6">
          <b-table
            :fields="fields1"
            :items="result1"
            primary-key="particulars"
            small
            outlined
            hover
            responsive
            head-variant="light"
          >
            <template #cell(particulars)="data">
              <router-link
                v-if="!['Total', 'Opening balance', 'Closing balance'].includes(data.item.particulars)"
                :to="
                  `/ledger/${data.item.accountcode}&null&${fromDate}&${toDate}`
                "
              >
                {{ data.item.particulars }}
              </router-link>
              <b v-else>{{ data.item.particulars }}</b>
            </template>

            <template #cell(amount)="data">
              {{ data.item.amount }}
            </template>
          </b-table>
        </div>
        <div class="col-lg-6">
          <b-table
            :fields="fields2"
            :items="result2"
            primary-key="particulars"
            small
            outlined
            hover
            responsive
            head-variant="light"
          >
            <template #cell(particulars)="data">
              <router-link
                v-if="!['Total', 'Opening balance', 'Closing balance'].includes(data.item.particulars)"
                :to="
                  `/ledger/${data.item.accountcode}&null&${fromDate}&${toDate}`
                "
              >
                {{ data.item.particulars }}
              </router-link>
              <b v-else>{{ data.item.particulars }}</b>
            </template>

            <template #cell(amount)="data">
              {{ data.item.amount }}
            </template>
          </b-table>
        </div>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  components: { GkDate, GkFileDownload, ReportHeader },
  name: 'CashFlow',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      fromDate: null,
      toDate: null,
      result1: null,
      result2: null,
      selected: {},
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
          class: 'gk-currency',
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
          class: 'gk-currency',
        },
      ],
    };
  },
  methods: {
    clear() {
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      this.selected = {};
      this.$router.replace({});
      this.result1 = null;
      this.result2 = null;
      this.parseParams();
    },
    getCashFlowData() {
      this.isLoading = true;
      this.$axios
        .get(
          `/reports/cash-flow?calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}`
        )
        .then((resp) => {
          this.result1 = resp.rcgkresult;
          this.result2 = resp.pygkresult;
          this.selected = {
            fromDate: this.fromDate,
            toDate: this.toDate,
          }
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
      this.getCashFlowData();
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
  mounted() {
    this.parseParams();
  },
};
</script>
