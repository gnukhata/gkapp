<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        :header="$gettext('Stock On Hand')"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="stockOnHand">
          <!-- product select -->
          <b-form-group :label="$gettext('Product')" label-cols="auto">
            <autocomplete
              v-model="productId"
              :options="productList"
              :placeholder="$gettext('Select Product')"
              :required="!allProducts"
              :disabled="allProducts"
            ></autocomplete>
            <div class="text-left">
              <b-form-checkbox
                v-model="allProducts"
                ref="allstock"
                class="mt-2"
                switch
                :disabled="showGodowns"
                :unchecked-value="false"
                ><translate>All Products</translate></b-form-checkbox
              >
            </div>
          </b-form-group>

          <div class="col">
            <b-form-group
              :label="$gettext('As on')"
              label-cols="auto"
              label-align="right"
            >
              <gk-date :required="true" v-model="toDate" id="to"></gk-date>
            </b-form-group>
          </div>
          <!-- checkboxes -->
          <b-form-group>
            <b-form-checkbox
              v-model="showGodowns"
              ref="allstock"
              class="mb-2"
              switch
              :unchecked-value="false"
              :disabled="allProducts"
              ><translate
                >Godown Wise Stock On Hand Report</translate
              ></b-form-checkbox
            >
          </b-form-group>
          <!-- Godown select -->
          <b-form-group
            v-if="showGodowns"
            :label="$gettext('Godown')"
            label-cols="auto"
          >
            <autocomplete
              :placeholder="$gettext('Search / Select a godown')"
              v-model="godownId"
              :options="godowns"
            ></autocomplete>
          </b-form-group>
          <b-button
            @click="updateRoute"
            type="submit"
            variant="success"
            class="float-right"
          >
            <b-icon class="mr-1" icon="cloud-download"></b-icon>
            <translate>Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <section class="mt-2" v-if="report.length > 0">
      <report-header>
        <div class="text-center">
          <i>Stock report as on: {{ dateReverse(toDate) }}</i>
        </div>
      </report-header>
      <b-form-input
        v-model="search"
        :placeholder="$gettext('Search Products')"
        class="gkcard mx-auto d-print-none"
      ></b-form-input>
      <b-table
        caption-top
        class="mt-3"
        head-variant="dark"
        small
        bordered
        striped
        responsive
        :filter="search"
        v-if="report.length > 0"
        :items="report"
        :fields="fields"
      >
        <template #cell(product)="data">
          <router-link
            :to="
              `/product-register?product_id=${data.item.productcode}&current_date=${toDate}`
            "
            >{{ data.item.product }}
          </router-link>
        </template>
        <template #cell(balance)="data">
          <div
            class="bg-danger text-light"
            v-if="data.item.balance.split('').includes('-')"
          >
            <div class="ml-1">{{ data.item.balance }}</div>
          </div>
          <div v-else>{{ data.item.balance }}</div>
        </template>
      </b-table>
    </section>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
import GkDate from '../components/GkDate.vue';
import { mapState } from 'vuex';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  name: 'StockOnHand',
  components: { Autocomplete, GkDate, ReportHeader },
  data() {
    return {
      prodMap: {}, // product id to name map
      productList: [],
      loading: false,
      productId: 'all',
      allProducts: false,
      fromDate: '',
      toDate: '',
      report: [],
      godowns: [],
      showGodowns: false,
      godownId: '',
      godownReport: [],
      showCard: true,
      search: '',
    };
  },
  computed: {
    fields: function() {
      let fields = [
        {
          key: 'product',
          label: this.$gettext('Product'),
        },
        {
          key: 'total_inward_qty',
          label: this.$gettext('Total Inward Qty'),
        },
        {
          key: 'total_outward_qty',
          label: this.$gettext('Total Outward Qty'),
        },
        {
          key: 'balance',
          label: this.$gettext('Balance'),
        },
      ];
      if (this.showGodowns) {
        fields.push({
          key: 'value',
          label: this.$gettext('Value'),
        });
      }
      return fields;
    },
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
                value: data.goid,
                text: `${data.goname} (${data.goaddr}) `,
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
        .get('/product?invdc=4')
        .then((r) => {
          if (r.status == 200) {
            this.productList = r.data.gkresult.map((data) => {
              this.prodMap[data.productcode] = data.productdesc; // create product id to name map
              return {
                text: data.productdesc,
                value: data.productcode,
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

      let stockValueUrl = '';

      let requests = [];

      if (this.showGodowns) {
        url = `/report?godownwisestockonhand&type=pg&goid=${this.godownId}&productcode=${this.productId}&enddate=${this.toDate}`;
        stockValueUrl = `/report?godownwise_stock_value&goid=${this.godownId}&productcode=${this.productId}&enddate=${this.toDate}`;
        requests = [axios.get(url), axios.get(stockValueUrl)];
      } else {
        requests = [axios.get(url)];
      }

      Promise.all(requests)
        .then(([resp1, resp2]) => {
          switch (resp1.data.gkstatus) {
            case 0:
              this.report = resp1.data.gkresult.map((data) => {
                return {
                  no: data.srno,
                  product:
                    data.productname || this.prodMap[this.productId] || '',
                  total_inward_qty: data.totalinwardqty,
                  total_outward_qty: data.totaloutwardqty,
                  balance: data.balance,
                  productcode: data.productcode,
                };
              });
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                variant: 'danger',
                solid: true,
              });
              break;
            default:
              this.$bvToast.toast(this.$gettext('Data error'), {
                variant: 'danger',
                solid: true,
              });
          }

          if (this.showGodowns && resp2.data.gkstatus === 0) {
            this.report[0].value = resp2.data.gkresult;
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
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          to: this.toDate,
          prodcode: this.allProducts ? 'all' : this.productId,
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.toDate = params.to;
        this.productId = params.prodcode;
        if (this.productId == 'all') {
          this.allProducts = true;
        }
      } else {
        this.allProducts = true;
        this.toDate = this.currentDate();
        this.getProductList();
        this.getGodownList();
      }
      this.stockOnHand();
    },
  },
  mounted() {
    this.parseParams();
  },
};
</script>
