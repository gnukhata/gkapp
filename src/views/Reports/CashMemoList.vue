<template>
  <section class="container-fluid">
    <b-card
      class="gkcard mx-auto"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Cash Memo List
      </template>
      <b-form @submit.prevent="getReport">
        <b-form-group label="From" label-align="right" content-cols="8">
          <gk-date
            @input="filter.date.from = fromDate"
            id="fromdate"
            v-model="fromDate"
          ></gk-date>
        </b-form-group>
        <b-form-group label="To" label-align="right" content-cols="8">
          <gk-date
            @input="filter.date.to = toDate"
            id="todate"
            v-model="toDate"
          ></gk-date>
        </b-form-group>
        <b-button variant="success" class="float-right" type="submit"
          ><b-icon icon="cloud-arrow-up"></b-icon> Get Details</b-button
        >
      </b-form>
    </b-card>
    <br />
    <div v-if="options.cmemos.length">
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
              <b-form-group label="Invoice Type" label-size="sm">
                <b-form-select v-model="filter.type" plain size="sm">
                  <b-form-select-option value="all">All</b-form-select-option>
                  <b-form-select-option value="sales"
                    >Sale</b-form-select-option
                  >
                  <b-form-select-option value="purchase"
                    >Purchase</b-form-select-option
                  >
                </b-form-select>
              </b-form-group>
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
          <b>Cash Memo List</b> for the period {{ filter.date.from }} to
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
        :items="options.cmemos"
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
        <template #cell(invoiceno)="data">
          <b-link
            :to="{
              name: 'Workflow',
              params: {
                wfName: 'Transactions-CashMemo',
                wfId: data.item.invid,
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
  name: 'CashMemoList',
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
          key: 'invoiceno',
          label: 'Memo No.',
          sortable: true,
        },
        {
          key: 'invoicedate',
          label: 'Date',
          sortable: true,
          class: 'inv-date',
        },
        {
          key: 'invoicetotal',
          label: 'Net Amt',
          sortable: true,
        },
        {
          key: 'type',
          label: 'Memo Type',
        },
      ],
      options: {
        cmemos: [],
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
      const requests = [
        //sale
        axios.get('/invoice?cash=all&inoutflag=15').catch((error) => {
          return error;
        }),
        //purchase
        axios.get('/invoice?cash=all&inoutflag=9').catch((error) => {
          return error;
        }),
      ];
      Promise.all(requests)
        .then((resp) => {
          let cmemos = [],
            pmemos = [];
          if (resp[0].data.gkstatus === 0) {
            cmemos = resp[0].data.gkresult.map((memo) => {
              return Object.assign(
                {
                  type: 'Sale',
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    memo.invoicedate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                memo
              );
            });
          }

          if (resp[1].data.gkstatus === 0) {
            pmemos = resp[1].data.gkresult.map((memo) => {
              return Object.assign(
                {
                  type: 'Purchase',
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    memo.invoicedate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                memo
              );
            });
          }
          self.options.cmemos = [...cmemos, ...pmemos];
          self.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    // this.filter.date = {
    //   from: this.yearStart,
    //   to: this.yearEnd,
    // };
  },
};
</script>

<style>
.inv-date {
  min-width: 100px;
}
</style>
