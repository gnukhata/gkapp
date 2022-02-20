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
            <autocomplete
              v-model="productId"
              :options="productList"
              placeholder="Select Product"
            ></autocomplete>
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
          <b-form-checkbox
            v-model="showGodowns"
            @change="report = []"
            class="mb-2"
            switch
            >Godown Wise Product Register</b-form-checkbox
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
            ><b-icon icon="eye-fill"></b-icon> View</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!-- report -->
    <div v-if="report.length > 0" class="mt-2">
      <!-- filters -->
      <div>
        <b-form-checkbox-group
          @change="applyFilters"
          @input="applyFilters"
          class="text-center mb-2"
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
            ><b-icon icon="file-earmark-minus" variant="warning"></b-icon> Debit
            Note</b-form-checkbox
          >
          <b-form-checkbox value="Credit Note"
            ><b-icon icon="file-earmark-plus" variant="info"></b-icon> Credit
            Note</b-form-checkbox
          >
        </b-form-checkbox-group>
      </div>
      <!-- search bar -->
      <div class="gkcard mx-auto mb-4">
        <b-form-input
          v-model="search"
          class="border-dark"
          placeholder="search invoices"
        ></b-form-input>
      </div>
      <report-header>
        <template>
          <div class="text-center">
            Product Register:
            <b>{{
              productList.filter((p) => p['value'] == productId)[0]['text']
            }}</b>
            | From
            <b>{{ dateReverse(fromDate) }}</b>
            to
            <b>{{ dateReverse(toDate) }}</b>
          </div>
        </template>
      </report-header>
      <!-- Report download -->
      <div class="text-right">
        <gk-file-download
          :url="
            `/spreadsheet?stock-report&calculatefrom=${dateReverse(
              this.fromDate
            )}&calculateto=${dateReverse(this.toDate)}&fystart=${
              this.yearStart
            }&fyend=${this.yearEnd}&orgname=${
              this.orgName
            }&productcode=${productId}&godownflag=0&productdesc=WALLMART`
          "
          fileExtn="xlsx"
        ></gk-file-download>
      </div>
      <!-- result table -->
      <keep-alive>
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
                @click="
                  $router.push(
                    '/Workflow/Transactions-Invoice/' + data.item.invid
                  )
                "
              >
                {{ data.item.invno }}</b-link
              >
            </div>
            <div v-else-if="data.item.trntype === 'Rejection Note'">
              <b-icon variant="danger" icon="journal-x"></b-icon>
              {{ data.item.particulars }} :
              <b-link
                @click="
                  $router.push(
                    '/Workflow/Transactions-RejectionNote/' + data.item.rnid
                  )
                "
              >
                {{ data.item.rnno }}</b-link
              >
            </div>
            <div v-else-if="data.item.trntype === 'Debit Note'">
              <b-icon variant="warning" icon="file-earmark-minus"></b-icon>
              {{ data.item.particulars }} :
              <b-link
                @click="
                  $router.push(
                    '/Workflow/Transactions-DebitCreditNote/' + data.item.drcrid
                  )
                "
              >
                {{ data.item.drcrno }}</b-link
              >
            </div>
            <div v-else-if="data.item.trntype === 'Credit Note'">
              <b-icon variant="info" icon="file-earmark-plus"></b-icon>
              {{ data.item.particulars }} :
              <b-link
                @click="
                  $router.push(
                    '/Workflow/Transactions-DebitCreditNote/' + data.item.drcrid
                  )
                "
              >
                {{ data.item.drcrno }}</b-link
              >
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
      </keep-alive>
    </div>
  </section>
</template>
<script>
import axios from 'axios';
import Autocomplete from './Autocomplete.vue';
import GkDate from './GkDate.vue';
import ReportHeader from './ReportHeader.vue';
import { mapState } from 'vuex';
import GkFileDownload from '@/components/GkFileDownload.vue';
export default {
  name: 'ProductRegister',
  components: { Autocomplete, GkDate, ReportHeader, GkFileDownload },
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
      showGodowns: false,
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
    check() {
      if (this.showGodowns) {
        this.getGodownStock();
      } else {
        this.getStockReport();
      }
    },
    applyFilters() {
      if (this.invoiceFilter.length > 0) {
        let items = [];
        for (let i in this.invoiceFilter) {
          this.report2.filter((data) => {
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
          `/report?type=stockreport&productcode=${this.productId}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          const data = r.data;
          if (r.status == 200) {
            switch (data.gkstatus) {
              case 0:
                this.report = data.gkresult;
                this.report2 = data.gkresult;
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
            this.report = r.data.gkresult;
            //             this.showCard = false;
          }
          this.loading = false;
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
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
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
    this.getGodownList();
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
  },
};
</script>
