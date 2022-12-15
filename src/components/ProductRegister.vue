<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <b-card
        header="Product Register"
        header-bg-variant="dark"
        header-text-variant="light"
        style="max-width: 40em"
        class="mx-auto d-print-none"
      >
        <b-form @submit.prevent="check">
          <b-form-group label="Product" label-align="right" label-cols="auto">
            <!-- select product -->
            <v-select
              placeholder="Select Product"
              :options="productList"
              v-model="productId"
              required
            ></v-select>
          </b-form-group>
          <div class="row">
            <div class="col">
              <b-form-group label="From" label-align="left">
                <gk-date
                  :required="true"
                  v-model="fromDate"
                  id="from"
                  class="mr-4"
                ></gk-date>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group label="To" label-align="left">
                <gk-date :required="true" v-model="toDate" id="to"></gk-date>
              </b-form-group>
            </div>
          </div>
          <!-- Godown select -->
          <b-form-group label="Godown" label-cols="auto">
            <autocomplete
              placeholder="Search / Select a godown"
              v-model="godownId"
              :options="godowns"
              :required="true"
            ></autocomplete>
          </b-form-group>
          <b-button type="submit" variant="success" class="float-right"
            ><b-icon icon="eye-fill"></b-icon> View</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!-- report -->
    <div v-if="report.length > 0" class="mt-2">
      <report-header>
        <template>
          <div class="text-center">
            Product Register:
            <b>{{ productId.label }}</b>
            | From
            <b>{{ dateReverse(fromDate) }}</b>
            to
            <b>{{ dateReverse(toDate) }}</b>
          </div>
        </template>
      </report-header>
      <!-- Toolbar -->
      <gk-toolbar>
        <!-- search bar -->
        <template #left>
          <b-form-input
            size="sm"
            v-model="search"
            class="border-dark"
            style="align-self: center"
            placeholder="search invoices"
          ></b-form-input>
        </template>
        <!-- filters -->
        <gk-hovermenu>
          <div class="font-weight-bold bg-dark text-light p-1 mb-1">
            Invoice Type
          </div>
          <b-form-checkbox-group
            @change="applyFilters"
            @input="applyFilters"
            class=""
            v-model="invoiceFilter"
          >
            <b-form-checkbox value="invoice"
              ><b-icon icon="receipt"></b-icon> Invoice</b-form-checkbox
            >
            <b-form-checkbox value="Rejection Note"
              ><b-icon icon="journal-x" variant="danger"></b-icon> Rejection
              Note</b-form-checkbox
            >
            <b-form-checkbox value="Debit Note"
              ><b-icon icon="file-earmark-minus" variant="warning"></b-icon>
              Debit Note</b-form-checkbox
            >
            <b-form-checkbox value="Credit Note"
              ><b-icon icon="file-earmark-plus" variant="info"></b-icon> Credit
              Note</b-form-checkbox
            >
          </b-form-checkbox-group>
        </gk-hovermenu>
        <!-- Report download -->
        <gk-file-download
          :url="
            `/spreadsheet/product-register?calculatefrom=${dateReverse(
              this.fromDate
            )}&calculateto=${dateReverse(this.toDate)}&productcode=${
              productId.id
            }&productdesc=${productId.label}&godownflag=1&goid=${
              this.godownId
            }&goname=${getGodownName(this.godownId).text}&goaddr=${
              getGodownName(this.godownId).text
            }&fystart=${dateReverse(this.yearStart)}&fyend=${dateReverse(
              this.yearEnd
            )}&orgname=${this.orgName}&orgtype=${this.orgType}`
          "
          fileExtn="xlsx"
          :commonParams="false"
        ></gk-file-download>
      </gk-toolbar>
      <!-- result table -->
      <b-table
        small
        class="table-border-dark"
        striped
        head-variant="dark"
        :items="report"
        responsive="sm"
        :fields="fields"
        :filter="search"
      >
        <!-- Transaction type -->
        <template #cell(particulars)="data">
          <div v-if="data.item.trntype === 'invoice'">
            <b-icon icon="receipt"></b-icon> {{ data.item.particulars }} :
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
              {{ data.item.invno }}
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
              {{ data.item.dcno }}
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Rejection Note'">
            <b-icon variant="danger" icon="journal-x"></b-icon>
            {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-RejectionNote',
                  wfId: data.item.rnid,
                },
              }"
            >
              {{ data.item.rnno }}
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Debit Note'">
            <b-icon variant="warning" icon="file-earmark-minus"></b-icon>
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
              {{ data.item.drcrno }}
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Credit Note'">
            <b-icon variant="info" icon="file-earmark-plus"></b-icon>
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
              {{ data.item.drcrno }}
            </b-link>
          </div>
          <div v-else class="font-weight-bold">
            {{ data.item.particulars }}
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
        <template #cell(balance)="data"
          ><div class="text-right">{{ data.item.balance }}</div>
        </template>
      </b-table>
    </div>
  </section>
</template>
<script>
import axios from 'axios';
import GkDate from './GkDate.vue';
import ReportHeader from './ReportHeader.vue';
import { mapState } from 'vuex';
import GkFileDownload from '@/components/GkFileDownload.vue';
import GkToolbar from './GkToolbar.vue';
import autocomplete from '@/components/Autocomplete.vue';
import GkHovermenu from '@/components/GkHovermenu.vue';

export default {
  name: 'ProductRegister',
  components: {
    GkDate,
    ReportHeader,
    GkFileDownload,
    GkToolbar,
    autocomplete,
    GkHovermenu,
  },
  data() {
    return {
      productList: [],
      search: '',
      loading: false,
      productId: null,
      fromDate: '',
      toDate: '',
      report: [],
      report2: [],
      godowns: [],
      godownId: '',
      godownReport: [],
      invoiceFilter: [],
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
    },
    applyFilters() {
      if (this.invoiceFilter.length > 0) {
        let items = [];
        for (let i in this.invoiceFilter) {
          this.report2.forEach((data) => {
            if (data.trntype == this.invoiceFilter[i]) {
              items.push(data);
            }
          });
        }
        if (items.length > 0) {
          this.report = items;
          // if selected filter has no matching entries show notification
        } else {
          this.report = this.report2;
          this.$bvToast.toast(`No data present for selected filter`, {
            variant: 'warning',
            title: 'Alert',
            solid: true,
          });
        }
      } else {
        this.report = this.report2;
      }
    },
    getStockReport() {
      this.loading = true;
      axios
        .get(
          `/report?type=stockreport&productcode=${this.productId.id}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          const data = r.data;
          if (r.status == 200) {
            switch (data.gkstatus) {
              case 0:
                {
                  let report = data.gkresult.map((item) => {
                    if (item.trntype === 'delchal&invoice') {
                      item.trntype = 'invoice';
                    }
                    return item;
                  });
                  this.report = report;
                  this.report2 = report;
                }
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
        })
        .catch(() => {
          this.loading = false;
          this.$bvToast.toast('Failed to get stock report ', {
            variant: 'danger',
            title: 'Server Error',
            solid: true,
          });
        });
    },
    getGodownStock() {
      this.loading = true;
      axios
        .get(
          `/reports/product-register?goid=${this.godownId}&productcode=${this.productId.id}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            let report = r.data.gkresult.map((item) => {
              if (item.trntype === 'delchal&invoice') {
                item.trntype = 'invoice';
              }
              return item;
            });
            this.report = report;
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.$bvToast.toast('Failed to get stock report ', {
            variant: 'danger',
            title: 'Server Error',
            solid: true,
          });
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
                label: data.productdesc,
                id: data.productcode,
              };
            });
          }
          this.loading = false;
        })
        .then(() => this.parseParams())
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
          console.log(e.message);
        });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      if (Object.keys(params).length > 0) {
        this.productId = this.productList.filter((d) => {
          return params.product_id == d.id;
        })[0];
        this.toDate = params.current_date;
        this.getStockReport();
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
  },
  mounted() {
    this.getProductList();
    this.getGodownList().then(() => {
      this.godownId = this.$store.getters['global/getDefaultGodown'];
    });
  },
};
</script>
