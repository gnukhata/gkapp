<template>
  <section>
    <h2 class="my-4 text-muted display-5">
      STOCK ON HAND
    </h2>
    <b-overlay :show="loading">
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          Stock on Hand as on {{ dateReverse(selected?.toDate || toDate) }}
        </b-alert>
        <b-form @submit.prevent="stockOnHand">
          <b-row>
            <b-col
              cols
              lg="6"
            >
              <!-- product select -->
              <b-form-group
                label="Product"
                label-cols="auto"
              >
                <v-select
                  :options="productList"
                  v-model="selectedProduct"
                  :placeholder="this.$gettext('Search Products')"
                  label="name"
                  :required="true"
                />
                <div class="text-left" />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="6"
            >
              <!-- Godown select -->
              <b-form-group
                label="Godown"
                label-cols="auto"
              >
                <v-select
                  v-model="selectedGodown"
                  :options="godowns"
                  :placeholder="this.$gettext('Search / Select a godown')"
                  label="name"
                  :required="true"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="As on"
                label-cols="auto"
              >
                <gk-date
                  v-model="toDate"
                  :format="dateFormat"
                  :min="minimumDate"
                  :max="maxDate"
                  id="to"
                  @validity="setDateValidity"
                  :required="true"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-button-group
            size="sm"
          >
            <b-button
              @click="updateRoute"
              type="submit"
              variant="success"
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
    </b-overlay>
    <!-- Table -->
    <section
      class="mt-2"
      v-if="report.length > 0"
    >
      <report-header>
        <div class="text-center">
          <i>Stock report of {{ selectedProduct.name }} in Godown:
            {{ selectedGodown.name }} as on: {{ dateReverse(selected.toDate) }}
          </i>
        </div>
      </report-header>
      <div
        class="d-print-none d-flex align-items-center justify-content-start mb-2 mt-4"
      >
        <div>
          <b-form-input
            size="sm"
            v-model="search"
            :placeholder="$gettext('Search Products')"
            class="gkcard mx-auto d-print-none"
          />
        </div>
      </div>
      <!-- results -->
      <b-table
        caption-top
        head-variant="light"
        small
        outlined
        responsive="sm"
        v-if="report.length > 0"
        :items="paginatedItems"
        :fields="fields"
        :per-page="perPage"
      >
        <template #cell(product)="data">
          <router-link
            :to="
              `/product-register?product_id=${data.item?.productcode}&current_date=${toDate}&goid=${selectedGodown?.id == 0 ? '' : selectedGodown.id}`
            "
          >
            {{ data.item.product }}
          </router-link>
        </template>
        <template #cell(balance)="data">
          <div
            class="bg-danger text-light"
            v-if="data.item.balance.split('').includes('-')"
          >
            <div class="ml-1">
              {{ data.item.balance }}
            </div>
          </div>
          <div v-else>
            {{ data.item.balance }}
          </div>
        </template>
      </b-table>
      <div
        class="d-print-none d-flex align-items-center justify-content-end"
      >
        <b-pagination
          v-if="filteredItems.length > perPage"
          v-model="currentPage"
          :total-rows="filteredItems.length"
          :per-page="perPage"
          align="center"
          limit="4"
        />
      </div>
    </section>
    <div v-else>
      <b-alert
        show
        class="text-center mx-auto d-print-none"
        variant="primary"
      >
        No data available.
      </b-alert>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '@/components/ReportHeader.vue';
import { mapState } from 'vuex';
export default {
  name: 'StockOnHand',
  components: { GkDate, ReportHeader },
  data() {
    return {
      date: {
        valid: null,
        format: 'dd-mm-yyyy',
      },
      productList: [],
      loading: false,
      selectedProduct: {
        id: 0,
        name: 'All',
      },
      allProducts: false,
      fromDate: '',
      toDate: '',
      report: [],
      godowns: [],
      currentPage: 1,
      perPage: 10,
      selectedGodown: {
        id: 0,
        name: 'All',
      },
      selected: {},
      godownReport: [],
      fields: [],
      showCard: true,
      search: '',
    };
  },
  watch: {
    search() {
      this.currentPage = 1;
    },
  },
  computed: {
    filteredItems() {
      return this.report.filter(item =>  item.product.toLowerCase().includes(this.search.toLowerCase()));
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredItems.slice(start, start + this.perPage);
    },
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
    defaultFields: function() {
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
      return fields;
    },
    minimumDate: (self) => {
      let date = self.reverseDate(self.yearStart);
      return date;
    },
    maxDate: (self) => {
      let date = self.reverseDate(self.yearEnd);
      return date;
    },
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
  },
  methods: {
    clear() {
      this.selectedProduct = {
        id: 0,
        name: 'All',
      };
      this.selectedGodown = {
        id: 0,
        name: 'All',
      };
      this.toDate = this.dateReverse(this.yearEnd);
      this.$router.replace({});
      this.report = [];
      this.selected = {};
      this.currentPage = 1;
    },
    getGodownList() {
      axios
        .get('/godown')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.godowns = r.data.gkresult.map((data) => {
              return {
                id: data.goid,
                name: `${data.goname} (${data.goaddr}) `,
              };
            });
            this.godowns = [
              {
                name: 'All',
                id: 0,
              },
              ...this.godowns,
            ];
            // pre fill the godown input with a godown if user selected godown exits
            if (Object.keys(this.$route.query).length == 0) {
              this.selectedGodown = this.godowns[0];
            }
          }
        })
        .catch((e) => {
          console.error(e.message);
        });
    },
    // get product list from the api
    getProductList() {
      this.currentPage = 1;
      this.loading = true;
      axios
        .get('/product?invdc=4')
        .then((r) => {
          if (r.status == 200) {
            this.productList = r.data.gkresult.map((data) => {
              return {
                name: data.productdesc,
                id: data.productcode,
              };
            });
            this.productList = [
              {
                name: 'All',
                id: 0,
              },
              ...this.productList,
            ];
            //prefill a product if user did not specify any
            if (Object.keys(this.$route.query).length == 0) {
              this.selectedProduct = this.productList[0];
            }
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

      let _type = 'pg';
      this.fields = this.defaultFields;
      if (Number(this.selectedProduct.id) === 0 && Number(this.selectedGodown.id) === 0) {
        _type = 'apag';
      } else if (Number(this.selectedProduct.id) === 0 && Number(this.selectedGodown.id) !== 0) {
        _type = 'apg';
      } else if (Number(this.selectedProduct.id) !== 0 && Number(this.selectedGodown.id) === 0) {
        _type = 'pag';
      }

      if ( _type == 'pg' || _type == 'apg' ) {
        this.fields = [
          ...this.defaultFields,
          {
            key: 'value',
            label: this.$gettext('Value'),
          }
        ];
      }
      let url = `/reports/godownwise-stock-on-hand?type=${_type}&goid=${this.selectedGodown.id}&productcode=${this.selectedProduct.id}&enddate=${this.toDate}`;
      this.$axios
          .get(url)
          .then(resp => {
            this.report = resp.map((data) => {
              return {
                no: data.srno,
                product: data.productname || this.selectedProduct.name,
                total_inward_qty: data.totalinwardqty,
                total_outward_qty: data.totaloutwardqty,
                balance: data.balance,
                productcode: data.productcode,
                value: data.value,
              };
            }) ?? [];
            this.selected = {
              toDate: this.toDate,
            }
          })
      .finally(this.loading = false);
    },
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          to: this.toDate,
          prodcode: this.selectedProduct.id,
          prodname: this.selectedProduct.name,
          goid: this.selectedGodown.id,
          goname: this.selectedGodown.name,
        },
      });
    },
    getDefaultDate() {
      const startDate = dayjs(this.yearStart);
      const endDate = dayjs(this.yearEnd);
      const currentDate = dayjs();
      let defaultDate;
      if (currentDate < startDate) {
        defaultDate = startDate;
      }
      if (currentDate > endDate) {
        defaultDate = endDate;
      }
      if (!defaultDate) {
        defaultDate = currentDate;
      }
      defaultDate = dayjs(defaultDate).format('YYYY-MM-DD');
      return defaultDate;
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      this.getGodownList();
      this.getProductList();
      this.toDate = this.getDefaultDate();
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.toDate = params.to;
        this.selectedProduct['id'] = params.prodcode || 0;
        this.selectedProduct['name'] = params.prodname || "All";
        this.selectedGodown.id = params.goid || 0;
        this.selectedGodown.name = params.goname || "All";
        this.stockOnHand();
      }
    },
    setDateValidity(validity) {
      this.date.valid = validity;
    },
    reverseDate(date) {
      return date
        ? date
          .split('-')
          .reverse()
          .join('-')
        : '';
    },
  },
  mounted() {
    this.parseParams();
    this.stockOnHand();
  },
};
</script>
