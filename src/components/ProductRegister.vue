<template>
  <section>
    <h2 class="mb-5 text-muted display-5">
      PRODUCT REGISTER
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
          Product Register: From {{ dateReverse(fromDate) }} to
          {{ dateReverse(toDate) }}
        </b-alert>
        <b-form @submit.prevent="check">
          <b-row>
            <b-col
              cols
              lg="6"
            >
              <b-form-group
                label="Product :"
                label-align="right"
                label-cols="auto"
              >
                <!-- select product -->
                <v-select
                  :options="productList"
                  v-model="productId"
                  placeholder="Select Product"
                  :reduce="product => product.id"
                  :required="true"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="From :"
                label-align="right"
                label-cols="auto"
              >
                <gk-date
                  :required="true"
                  v-model="fromDate"
                  id="from"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="To :"
                label-align="right"
                label-cols="auto"
              >
                <gk-date
                  :required="true"
                  v-model="toDate"
                  id="to"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="6"
            >
              <!-- Godown select -->
              <b-form-group
                label="Godown :"
                label-align="right"
                label-cols="auto"
              >
                <v-select
                  :options="godowns"
                  v-model="godownId"
                  placeholder="Select Godown"
                  label="text"
                  :reduce="godown => godown.value"
                  :required="true"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-button-group
            size="sm"
            class="float-right"
          >
            <b-button
              @click="$router.go()"
              variant="dark"
            >
              <translate>Clear</translate>
            </b-button>
            <b-button
              type="submit"
              variant="success"
              class="ml-1"
              :disabled="(productId == null) || (godownId == null)"
            >
              <b-icon
                class="mr-1"
                icon="cloud-download"
              />
              <translate>Get Details</translate>
            </b-button>
          </b-button-group>
        </b-form>
      </b-card>
    </b-overlay>
    <!-- report -->
    <div
      v-if="report.length > 0"
      class="mt-2"
    >
      <div class="mt-4">
        <div class="d-flex d-print-none justify-content-between align-items-center mb-2">
          <!-- Search Field -->
          <div>
            <b-input-group size="sm">
              <b-form-input
                size="sm"
                v-model="search"
                placeholder="Search Table"
                style="align-self:center"
              />
            </b-input-group>
          </div>

          <!-- Export and Print Buttons -->
          <div>
            <!-- Report download -->
            <gk-file-download
              :url="
                `/spreadsheet/product-register?calculatefrom=${dateReverse(
                  this.fromDate,
                )}&calculateto=${dateReverse(this.toDate)}&productcode=${
                  productId
                }&productdesc=${this.productName}&godownflag=1&goid=${
                  this.godownId
                }&goname=${getGodownName(this.godownId)?.text}&goaddr=${
                  getGodownName(this.godownId)?.text
                }&fystart=${dateReverse(this.yearStart)}&fyend=${dateReverse(
                  this.yearEnd,
                )}&orgname=${this.orgName}&orgtype=${this.orgType}`
              "
              file-extn="xlsx"
              :common-params="false"
              :message-from-parent="parentMessage"
              variant="dark"
              title="Export XLSX"
              name="Export XLSX"
            />
          </div>
        </div>
      </div>
      <b-table
        small
        outlined
        hover
        head-variant="light"
        :items="report"
        responsive="sm"
        :fields="fields"
        :filter="search"
        show-empty
      >
        <!-- Transaction type -->
        <template #cell(particulars)="data">
          <div v-if="data.item.trntype === 'invoice'">
            <b-icon icon="receipt" /> {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName:
                    data.item.icflag === 3
                      ? 'Transactions-CashMemo'
                      : 'Transactions-Invoice',
                  wfId: data.item.invid,
                },
              }"
            >
              <div
                class="d-inline"
              >
                {{ data.item.invno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'delchal'">
            {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-DeliveryNote',
                  wfId: data.item.dcid,
                },
              }"
            >
              <div
                class="d-inline"
              >
                {{ data.item.dcno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Debit Note'">
            <b-icon
              variant="warning"
              icon="file-earmark-minus"
            />
            {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-DebitCreditNote',
                  wfId: data.item.drcrid,
                },
              }"
            >
              <div
                class="d-inline"
              >
                {{ data.item.drcrno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Credit Note'">
            <b-icon
              variant="info"
              icon="file-earmark-plus"
            />
            {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-DebitCreditNote',
                  wfId: data.item.drcrid,
                },
              }"
            >
              <div
                class="d-inline"
              >
                {{ data.item.drcrno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'transfer note'">
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-TransferNote',
                  wfId: data.item.tnid,
                },
              }"
            >
              <div
                class="d-inline"
              >
                {{ data.item.tnno }}
              </div>
            </b-link>
          </div>
          <div
            v-else
            class="font-weight-bold"
          >
            <div
              class="d-inline"
            >
              {{ data.item.particulars }}
            </div>
          </div>
        </template>
        <template #cell(transactionType)="data">
          <div class="text-right">
            <span v-if="data.item.particulars === 'opening stock'" />
            <span v-if="data.item.particulars === 'Total'" />
            <span v-else>{{ data.item.trntype.charAt(0).toUpperCase() + data.item.trntype.slice(1) }}</span>
          </div>
        </template>
        <template #cell(inward)="data">
          <div class="text-right">
            <span v-if="data.item.particulars === 'opening stock'">{{
              data.item.inward
            }}</span>
            <span v-if="data.item.particulars === 'Total'">{{
              data.item.totalinwardqty
            }}</span>
            <span v-else>{{ data.item.inwardqty }}</span>
          </div>
        </template>
        <!-- Outward -->
        <template #cell(outward)="data">
          <div class="text-right">
            <span v-if="data.item.particulars === 'opening stock'">{{
              data.item.outward
            }}</span>
            <span v-if="data.item.particulars === 'Total'">{{
              data.item.totaloutwardqty
            }}</span>
            <span v-else>{{ data.item.outwardqty }}</span>
          </div>
        </template>
        <!-- balance -->
        <template
          #cell(balance)="data"
        >
          <div class="text-right">
            {{ data.item.balance }}
          </div>
        </template>
      </b-table>
    </div>
    <div v-if="report.length == 0">
      <b-alert
        show
        class="text-center mx-auto d-print-none"
        variant="primary"
      >
        Select a product to load table.
      </b-alert>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import GkDate from './GkDate.vue';
import { mapState } from 'vuex';
import GkFileDownload from '@/components/GkFileDownload.vue';

export default {
  name: 'ProductRegister',
  components: {
    GkDate,
    GkFileDownload,
  },
  data() {
    return {
      parentMessage: '',
      productList: [],
      search: '',
      loading: false,
      productId: null,
      fromDate: '',
      toDate: '',
      report: [],
      immutableReport: [],
      godowns: [],
      godownId: null,
      godownReport: [],
      invoiceFilter: ['invoice', 'Debit Note', 'Credit Note', 'transfer note', 'delchal'],
      fields: [
        {
          key: 'date',
          label: 'Date',
          sortable: true,
        },
        {
          key: 'particulars',
          label: 'Particulars',
        },
        {
          key: 'transactionType',
          label: 'Trntype',
        },
        {
          key: 'inward',
          label: 'Inward',
          class: 'text-right',
        },
        {
          key: 'outward',
          label: 'Outward',
          class: 'text-center',
        },
        {
          key: 'balance',
          label: 'Balance',
          class: 'text-center',
        },
      ],
    };
  },
  methods: {
    getGodownName(id) {
      return this.godowns.filter((go) => {
        return go.value == id;
      })[0];
    },
    check() {
      this.getGodownStock();
      this.updateRoute();
    },
    applyFilters() {
      if (this.invoiceFilter.length > 0) {
        let items = [];
        for (let i in this.invoiceFilter) {
          this.immutableReport.forEach((data) => {
            if (data.trntype == this.invoiceFilter[i]) {
              items.push(data);
            }
          });
        }
        if (items.length > 0) {
          this.report = items;
          // if selected filter has no matching entries show notification
        } else {
          this.report = [];
          this.gk_toast(
            this.$gettext('Alert'),
            this.$gettext('No data present for selected filter'),
            'warning'
          );
        }
      } else {
        this.report = [];
      }
    },
    getStockReport() {
      this.loading = true;
      axios
        .get(
          `/reports/stock-report?productcode=${this.productId}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          const data = r.data;
          if (r.status == 200) {
            switch (data.gkstatus) {
            case 0:
              {
                const r = data.gkresult.map((item) => {
                  if (item.trntype === 'delchal&invoice') {
                    item.trntype = 'invoice';
                  }
                  return item;
                });
                this.report = r;
                this.immutableReport = r;
              }
              break;
            case 1:
              this.gk_toast(
                this.$gettext('Alert'),
                this.$gettext('Duplicate Entry'),
                'warning'
              );
              break;
            case 2:
              this.gk_toast(
                this.$gettext('Unauthorised Access'),
                this.$gettext('Invalid user'),
                'danger'
              );
              break;
            case 3:
              this.gk_toast(
                this.$gettext('Data Error'),
                this.$gettext('Error in fetching the data'),
                'danger'
              );
              break;
            case 4:
              this.gk_toast(
                this.$gettext('Privilege Error'),
                this.$gettext('Your role does not have access to this data'),
                'danger'
              );
              break;
            case 5:
              this.gk_toast(
                this.$gettext('Integrity error'),
                this.$gettext('Something unexpected has happened'),
                'danger'
              );
              break;
            }
          } else {
            this.gk_toast(
              this.$gettext('Error'),
              this.$gettext('Failed to get the stock report'),
              'danger'
            );
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.gk_toast(
            this.$gettext('Error'),
            this.$gettext('Failed to get the stock report'),
            'danger'
          );
        });
    },
    getGodownStock() {
      if (!this.godownId) {
        const params = this.$route.query;
        this.fromDate = this.yearStart;
        this.toDate = params.current_date;
        this.productId = Number(params.product_id);
        this.godownId = Number((params.goid != 0) ? params.goid : this.godowns[0].value);
      }
      this.loading = true;
      this.invoiceFilter = ['invoice', 'Debit Note', 'Credit Note', 'transfer note', 'delchal'],
      axios
        .get(
          `/reports/product-register?goid=${this.godownId}&productcode=${this.productId}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            const report = r.data.gkresult.map((item) => {
              if (item.trntype === 'delchal&invoice') {
                item.trntype = 'invoice';
              }
              return item;
            });
            this.report = report;
            this.immutableReport = report;
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.gk_toast(
            this.$gettext('Error'),
            this.$gettext('Failed to get the stock report'),
            'danger'
          );
        })
        .finally(() => (this.loading = false));
    },
    getProductList() {
      this.loading = true;
      return axios
        .get('/product?invdc=4')
        .then((r) => {
          if (r.status == 200) {
            this.productList = r.data.gkresult.map((data) => {
              return {
                label: data.productdesc,
                id: data.productcode,
              };
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.gk_toast(this.$gettext('Error'), e.message);
          this.loading = false;
        });
    },
    getGodownList() {
      return axios
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
          console.error(e.message);
        });
    },
    // change url query params when user clicks on one of result
    // this is useful in keep track page of history
    updateRoute() {
      this.$router.replace({
        query: {
          from: this.fromDate,
          to: this.toDate,
          godown_id: this.godownId,
          product_id: this.productId,
        },
      });
    },
    // parse params and assign them to variables
    parseParams() {
      const params = this.$route.query;
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      if (Object.keys(params).length > 0) {
        let productId = this.productList.filter((product) => {
          return parseInt(params.product_id) == product.id;
        })[0];
        this.toDate = params.to;
        this.godownId = Number(params.godown_id);
        this.productId = Number(productId?.id ? productId?.id : productId );
        this.getGodownStock();
      }
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
    /**
     * Return godown object for given godown id
     */
    // eslint-disable-next-line
    godownInfo(id) {
      this.godowns.filter((data) => {
        if (data.goid == id) {
          return data;
        }
      });
    },
    /**
     * Fetch product name from product ID
     */
    productName: function () {
      let product = this.productList.find(obj => {
        return obj.id == this.productId;
      });
      return product.label;
    },
  },
  mounted() {
    this.getProductList()
      .then(() => this.getGodownList())
      .then(() => this.parseParams());
  },
};
</script>
