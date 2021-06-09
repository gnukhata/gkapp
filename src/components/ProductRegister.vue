<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <b-card
        header="Product Register"
        header-bg-variant="dark"
        header-text-variant="light"
        style="max-width: 40em"
        class="mx-auto"
      >
        <b-form @submit.prevent="check">
          <b-form-group label="Product" label-align="right" label-cols="auto">
            <autocomplete
              v-model="productId"
              :options="productList"
            ></autocomplete>
          </b-form-group>
          <div class="d-flex">
            <b-form-group label="From" label-align="right" label-cols="auto">
              <gk-date
                :required="true"
                v-model="fromDate"
                id="from"
                class="mr-4"
              ></gk-date>
            </b-form-group>
            <b-form-group label="To" label-cols="auto">
              <gk-date :required="true" v-model="toDate" id="to"></gk-date>
            </b-form-group>
          </div>
          <b-checkbox v-model="showGodowns" class="mb-2" switch
            >Godown Wise Product Register</b-checkbox
          >
          <b-form-group v-if="showGodowns" label="Godown" label-cols="auto">
            <autocomplete v-model="godownId" :options="godowns"></autocomplete>
          </b-form-group>
          <b-button type="submit" variant="success" class="float-right"
            >Get Details</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>

    <!-- Godown Stock Table -->
    <b-table-simple
      v-if="report.length > 0 && !showGodowns"
      class="mt-3"
      small
      responsive="sm"
      bordered
      striped
      hover
      caption-top
    >
      <caption>
        Product Stock
      </caption>
      <b-thead head-variant="dark">
        <b-tr>
          <b-th>Date</b-th>
          <b-th>Particulars</b-th>
          <b-th>Document Type</b-th>
          <b-th>Document Id</b-th>
          <b-th>RN No.</b-th>
          <b-th>Inward</b-th>
          <b-th>Outward</b-th>
          <b-th>Balance</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr v-for="(row, index) in report" :key="index">
          <b-th class="font-weight-normal">{{ row.date }}</b-th>
          <b-th
            :class="
              row.particulars == 'Total'
                ? 'font-weight-bold'
                : 'font-weight-normal'
            "
            :variant="row.particulars == 'Total' ? 'warning' : ''"
            >{{ row.particulars }}</b-th
          >
          <b-th class="font-weight-normal">{{ row.trntype }}</b-th>
          <router-link :to="'/workflow/Transactions/' + row.invid">
            <b-th class="font-weight-normal">{{ row.invno }}</b-th>
          </router-link>
          <b-th class="font-weight-normal">{{ row.rnno }}</b-th>
          <b-th v-if="row.particulars == 'Total'">{{
            row.totalinwardqty
          }}</b-th>
          <b-th class="font-weight-normal" v-else> {{ row.inwardqty }} </b-th>

          <b-th v-if="row.particulars == 'Total'">{{
            row.totaloutwardqty
          }}</b-th>
          <b-th class="font-weight-normal" v-else> {{ row.outwardqty }} </b-th>
          <b-th class="font-weight-normal">{{ row.balance }}</b-th>
        </b-tr>
      </b-tbody>
    </b-table-simple>
    <!-- Godown Wise Stock Table -->
    <b-table-simple
      v-model="godownReport"
      v-if="godownReport.length > 0 && showGodowns"
      class="mt-3"
      small
      responsive="sm"
      bordered
      striped
      hover
      caption-top
    >
      <caption>
        Godown Wise Stock
      </caption>
      <b-thead head-variant="dark">
        <b-tr>
          <b-th>Date</b-th>
          <b-th>Particulars</b-th>
          <b-th>Document Type</b-th>
          <b-th>Document Id</b-th>
          <b-th>RN No.</b-th>
          <b-th>Inward</b-th>
          <b-th>Outward</b-th>
          <b-th>Balance</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr v-for="(row, index) in godownReport" :key="index">
          <b-th class="font-weight-normal">{{ row.date }}</b-th>
          <b-th
            :class="
              row.particulars == 'Total'
                ? 'font-weight-bold'
                : 'font-weight-normal'
            "
            :variant="row.particulars == 'Total' ? 'warning' : ''"
            >{{ row.particulars }}</b-th
          >
          <b-th class="font-weight-normal">{{ row.trntype }}</b-th>
          <router-link :to="'/workflow/Transactions/' + row.invid">
            <b-th class="font-weight-normal">{{ row.invno }}</b-th>
          </router-link>
          <b-th class="font-weight-normal">{{ row.rnno }}</b-th>
          <b-th v-if="row.particulars == 'Total'">{{
            row.totalinwardqty
          }}</b-th>
          <b-th class="font-weight-normal" v-else> {{ row.inwardqty }} </b-th>

          <b-th v-if="row.particulars == 'Total'">{{
            row.totaloutwardqty
          }}</b-th>
          <b-th class="font-weight-normal" v-else> {{ row.outwardqty }} </b-th>
          <b-th class="font-weight-normal">{{ row.balance }}</b-th>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from './Autocomplete.vue';
import GkDate from './GkDate.vue';
import { mapState } from 'vuex';
export default {
  components: { Autocomplete, GkDate },
  name: 'ProductRegister',
  data() {
    return {
      productList: [],
      loading: false,
      productId: null,
      fromDate: '',
      toDate: '',
      report: [],
      godowns: [],
      showGodowns: false,
      godownId: '',
      godownReport: [],
    };
  },
  computed: {
    ...mapState(['orgYears']),
  },
  methods: {
    check() {
      if (this.showGodowns) {
        this.getGodownStock();
      } else {
        this.getStockReport();
      }
    },
    getStockReport() {
      this.loading = true;
      axios
        .get(
          `/report?type=stockreport&productcode=${this.productId}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          const data = r.data;
          if (r.status == 200) {
            switch (data.gkstatus) {
              case 0:
                this.report = data.gkresult;
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
          } else {
            this.$bvToast.toast('Failed to get stock report ', {
              variant: 'danger',
              title: r.status,
              solid: true,
            });
          }
          this.loading = false;
        });
    },
    getGodownStock() {
      this.loading = true;
      axios
        .get(
          `/report?type=godownstockreport&goid=${this.godownId}&productcode=${this.productId}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            this.godownReport = r.data.gkresult;
          }
          this.loading = false;
        });
    },
    getProductList() {
      this.loading = true;
      axios
        .get('/products')
        .then((r) => {
          if (r.status == 200) {
            this.productList = r.data.gkresult.map((data) => {
              return {
                text: Object.values(data)[4],
                value: Object.values(data)[3],
              };
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
      this.loading = true;
    },
    getGodownList() {
      axios
        .get('/godown')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.godowns = r.data.gkresult.map((data) => {
              return {
                value: Object.values(data)[2],
                text: Object.values(data)[3],
              };
            });
          }
        })
        .catch((e) => {
          console.log(e.message);
        });
    },
  },
  mounted() {
    this.getProductList();
    this.getGodownList();
    const org = JSON.parse(localStorage.getItem('orgYears'));
    this.fromDate = org.yearStart;
    this.toDate = org.yearEnd;
  },
};
// report?type=godownstockreport&goid=%d&productcode=%d&startdate=%s&enddate=%s
</script>
