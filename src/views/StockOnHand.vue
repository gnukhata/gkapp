<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        header="Stock On Hand"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard"
      >
        <b-form @submit.prevent="stockOnHand">
          <!-- product select -->
          <b-form-group label="Product" label-cols="auto">
            <autocomplete
              v-model="productId"
              :options="productList"
              placeholder="Select Product"
              :required="!allProducts"
            ></autocomplete>
          </b-form-group>
          <div class="col">
            <b-form-group label="As on" label-cols="auto">
              <gk-date :required="true" v-model="toDate" id="to"></gk-date>
            </b-form-group>
          </div>
          <!-- checkboxes -->
          <b-form-checkbox
            v-model="allProducts"
            ref="allstock"
            class="mb-2"
            switch
            :disabled="showGodowns"
            :unchecked-value="false"
            >All Products Stock On Hand Report</b-form-checkbox
          >
          <b-form-checkbox
            v-model="showGodowns"
            ref="allstock"
            class="mb-2"
            switch
            :unchecked-value="false"
            :disabled="allProducts"
            >Godown Wise Stock On Hand Report</b-form-checkbox
          >
          <!-- Godown select -->
          <b-form-group v-if="showGodowns" label="Godown" label-cols="auto">
            <autocomplete
              placeholder="Search / Select a godown"
              v-model="godownId"
              :options="godowns"
            ></autocomplete>
          </b-form-group>
          <b-button type="submit" variant="success" class="float-right"
            ><b-icon icon="cloud-download"></b-icon> Get Details</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <section class="mt-2" v-if="report.length > 0">
      <div class="text-center">
        <div>
          Organisation: <b>{{ orgName.split('(')[0] }}</b>
        </div>
        <i>Stock report as on: {{ dateReverse(toDate) }}</i>
      </div>
      <b-table
        caption-top
        class="mt-3"
        head-variant="dark"
        small
        bordered
        striped
        stacked="sm"
        v-if="report.length > 0"
        :items="report"
      >
      </b-table>
    </section>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
import GkDate from '../components/GkDate.vue';
import { mapState } from 'vuex';
export default {
  name: 'StockOnHand',
  components: { Autocomplete, GkDate },
  data() {
    return {
      productList: [],
      loading: false,
      productId: '',
      allProducts: false,
      fromDate: '',
      toDate: '',
      report: [],
      godowns: [],
      showGodowns: false,
      godownId: '',
      godownReport: [],
      showCard: true,
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    getGodownList() {
      axios
        .get('/godown')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.godowns = r.data.gkresult.map((data) => {
              return {
                value: Object.values(data)[2],
                text: `${Object.values(data)[3]} (${Object.values(data)[4]}) `,
              };
            });
          }
        })
        .catch((e) => {
          console.log(e.message);
        });
    },
    getProductList() {
      this.loading = true;
      axios
        .get('/products?invdc=4')
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
    stockOnHand() {
      this.report = [];
      this.loading = true;

      if (this.allProducts) {
        this.productId = 'all';
      }

      let url = `/report?stockonhandreport&productcode=${this.productId}&enddate=${this.toDate}`;

      if (this.showGodowns) {
        url = `/report?godownwisestockonhand&type=pg&goid=${this.godownId}&productcode=${this.productId}&enddate=${this.toDate}`;
      }

      axios
        .get(url)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.report = r.data.gkresult;
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
            this.$bvToast.toast(
              'Failed to get product stock report with status ' + r.status,
              {
                variant: 'danger',
                solid: true,
              }
            );
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
    },
  },
  mounted() {
    this.getProductList();
    this.getGodownList();
    this.toDate = this.yearEnd;
  },
};
</script>
