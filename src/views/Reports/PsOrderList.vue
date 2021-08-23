<template>
  <section class="container-fluid">
    <b-card
      class="gkcard mx-auto"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Purchase Sales Order List
      </template>
      <b-form @submit.prevent="getReport">
        <b-form-group label="From" label-align="right" content-cols="8">
          <gk-date
            id="fromdate"
            v-model="fromDate"
            @input="filter.date.from = fromDate"
          ></gk-date>
        </b-form-group>
        <b-form-group label="To" label-align="right" content-cols="8">
          <gk-date
            id="todate"
            v-model="toDate"
            @input="filter.date.to = toDate"
          ></gk-date>
        </b-form-group>
        <b-button variant="success" class="float-right" type="submit"
          ><b-icon icon="cloud-arrow-up"></b-icon> Get Details</b-button
        >
      </b-form>
    </b-card>
    <br />
    <div v-if="options.orders.length">
      <div class="d-print-none">
        <!-- Filter start -->
        <b-button
          class="float-right px-1"
          variant="link"
          @click="isFilterOpen = !isFilterOpen"
        >
          <b-icon icon="funnel"></b-icon><span class="sr-only">Filter</span>
        </b-button>
        <b-button class="float-right px-1" variant="link" @click="printPage">
          <b-icon icon="printer"></b-icon
          ><span class="sr-only">Print View</span>
        </b-button>
        <!-- Filter menu Collapsable card -->
        <b-collapse v-model="isFilterOpen">
          <b-card
            no-body
            class="float-right w-100 mt-2"
            :style="{
              'max-width': '450px',
            }"
            id="list-filter"
          >
            <b-card-body class="p-2">
              <!-- <b-button
                  @click="resetFilter"
                  title="Reset Filter"
                  class="py-0 px-1"
                  size="sm"
                  variant="primary"
                >
                  <b-icon icon="arrow-clockwise"></b-icon>
                </b-button> -->
              <!-- <b-form-group label="Invoice Type" label-size="sm">
                <b-form-select v-model="filter.type" plain size="sm">
                  <b-form-select-option value="all">All</b-form-select-option>
                  <b-form-select-option value="sales"
                    >Sale</b-form-select-option
                  >
                  <b-form-select-option value="purchase"
                    >Purchase</b-form-select-option
                  >
                </b-form-select>
              </b-form-group> -->
              <b-form-group label="Date Range" label-size="sm">
                <div class="px-3">
                  <b-row>
                    <b-col class="px-1">
                      <gk-date
                        id="filter-from-date"
                        v-model="filter.date.from"
                      ></gk-date>
                    </b-col>
                    <b-col class="px-1">
                      <gk-date
                        id="filter-to-date"
                        v-model="filter.date.to"
                      ></gk-date>
                    </b-col>
                  </b-row>
                </div>
              </b-form-group>
            </b-card-body>
          </b-card>
        </b-collapse>
        <!-- Filter end -->
        <div class="clearfix"></div>
      </div>
      <report-header>
        <div class="text-center">
          <b>Purchase Sales Order List</b> for the period {{ filter.date.from }} to
          {{ filter.date.to }}
        </div>
      </report-header>
      <b-table
        class="mx-auto"
        stacked="sm"
        small
        hover
        striped
        head-variant="dark"
        bordered
        :items="options.orders"
        :busy="isLoading"
        :fields="fields"
        sticky-header=""
        :style="{ 'font-size': '0.9rem' }"
        table-class="text-sm-center table-border-dark"
        id="report-table"
        :filter-function="filterData"
        :filter="'true'"
        tbody-tr-class="gk-vertical-row"
      >
        <template #table-busy>
          <div class="text-center">
            <b-spinner class="align-middle" type="grow"></b-spinner>
            <strong>Fetching Invoices ...</strong>
          </div>
        </template>
        <template #cell(index)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(orderno)="data">
          <b-link
            :to="{
              name: 'Workflow',
              params: {
                wfName: 'Transactions-PurchaseSalesOrder',
                wfId: data.item.orderid,
              },
            }"
          >
            {{ data.value }}
          </b-link>
        </template>
      </b-table>
    </div>
  </section>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';

import ReportHeader from '../../components/ReportHeader.vue';
import GkDate from '../../components/GkDate.vue';
export default {
  name: 'PsOrderList',
  components: { ReportHeader, GkDate },
  data() {
    return {
      isFilterOpen: false,
      isLoading: false,
      fromDate: '',
      toDate: '',
      filter: {
        type: 'all', // all, purchase, sales
        date: {
          from: '',
          to: '',
        },
      },
      fields: [
        {
          key: 'index',
          label: 'Sr.No.',
        },
        {
          key: 'orderno',
          label: 'Order No.',
          sortable: true,
        },
        {
          key: 'orderdate',
          label: 'Date',
          sortable: true,
          class: 'inv-date',
        },
        {
          key: 'ordertotal',
          label: 'Net Amt',
          sortable: true,
        },
      ],
      options: {
        orders: [],
      },
    };
  },
  computed: {
    fromTime: (self) =>
      self.filter.date.from ? Date.parse(self.filter.date.from) : 0,
    toTime: (self) =>
      self.filter.date.to ? Date.parse(self.filter.date.to) : 0,
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    printPage() {
      window.print();
    },
    filterData(data) {
      let pass = true;
      if (this.filter.type !== 'all') {
        let csflag = this.filter.type === 'sales' ? 3 : 19;
        pass = pass && data.csflag === csflag;
      }
      pass =
        pass && data.dateObj >= this.fromTime && data.dateObj <= this.toTime;
      return pass;
    },
    getReport() {
      this.isLoading = true;
      const self = this;
      axios
        .get('/purchaseorder')
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            self.options.orders = resp.data.gkresult.map((memo) => {
              return Object.assign(
                {
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    memo.orderdate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                memo
              );
            });
          }
          this.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
  },
};
</script>

<style>
.inv-date {
  min-width: 100px;
}
</style>
