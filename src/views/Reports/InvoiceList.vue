<template>
  <section class="m-2">
    <b-card
      class="gkcard mx-auto"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Invoice List
      </template>
      <b-form @submit.prevent="getReport">
        <b-form-group label="From" label-align="right" content-cols="8">
          <gk-date @input="filter.date.from = fromDate" id="fromdate" v-model="fromDate"></gk-date>
        </b-form-group>
        <b-form-group label="To" label-align="right" content-cols="8">
          <gk-date id="todate" v-model="toDate"></gk-date>
        </b-form-group>
        <b-button variant="success" class="float-right" type="submit"
          ><b-icon icon="cloud-arrow-up"></b-icon> Get Details</b-button
        >
      </b-form>
    </b-card>
    <br />
    <div v-if="options.invoices.length">
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
              <b>Filter By</b>
              <hr class="mx-0 my-1" />
              <div class="my-2 ml-1">
                <b-form-radio-group
                  v-model="filter.mode"
                  button-variant="outline-secondary"
                  size="sm"
                  class="mx-1 d-inline-block"
                >
                  <b-form-radio value="all">All</b-form-radio>
                  <b-form-radio value="cancelled"
                    >Cancelled Invoices</b-form-radio
                  >
                  <b-form-radio value="oncredit"
                    >Outstanding Invoices</b-form-radio
                  >
                </b-form-radio-group>
                <!-- <b-button
                  @click="resetFilter"
                  title="Reset Filter"
                  class="py-0 px-1"
                  size="sm"
                  variant="primary"
                >
                  <b-icon icon="arrow-clockwise"></b-icon>
                </b-button> -->
              </div>
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
              <!-- <b-form-group label="Date Range" label-size="sm">
                <div class="px-3">
                  <b-row>
                    <b-col class="px-1">
                      <gk-date id="fromdate" v-model="fromDate"></gk-date>
                    </b-col>
                    <b-col class="px-1">
                      <gk-date id="todate" v-model="toDate"></gk-date>
                    </b-col>
                  </b-row>
                </div>
              </b-form-group> -->
            </b-card-body>
          </b-card>
        </b-collapse>
        <!-- Filter end -->
        <div class="clearfix"></div>
      </div>
      <report-header>
        <div class="text-center">
          <b>Invoice List</b> for the period {{ fromDate }} to
          {{ toDate }}
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
        :items="options.invoices"
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
              params: { wfName: 'Transactions-Invoice', wfId: data.item.invid },
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
  name: 'InvoiceList',
  components: { ReportHeader, GkDate },
  data() {
    return {
      isFilterOpen: false,
      isLoading: false,
      fromDate: '',
      toDate: '',
      filter: {
        type: 'all', // all, purchase, sales
        cancelled: false,
        onCredit: false,
        mode: 'all', // all, cancelled, oncredit
        date: { from: '', to: '' },
      },
      fields: [
        {
          key: 'index',
          label: 'Sr.No.',
        },
        {
          key: 'invoiceno',
          label: 'Inv No.',
          sortable: true,
        },
        {
          key: 'invoicedate',
          label: 'Date',
          sortable: true,
          class: 'inv-date',
        },
        {
          key: 'dcno',
          label: 'Deli. Note',
          sortable: true,
        },
        {
          key: 'custname',
          label: 'Customer',
          sortable: true,
        },
        {
          key: 'netamt',
          label: 'Net Amt',
          sortable: true,
        },
        {
          key: 'taxamt',
          label: 'Tax Amt',
          sortable: true,
        },
        {
          key: 'godown',
          label: 'Godown',
          sortable: true,
        },
      ],
      options: {
        invoices: [],
      },
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    printPage() {
      window.print();
    },
    filterData(data) {
      let pass = true;
      if (this.filter.mode === 'cancelled') {
        pass = data.deletedFlag;
      } else if (this.filter.mode === 'oncredit') {
        pass = data.onCreditFlag;
      }
      if (this.filter.type !== 'all') {
        let csflag = this.filter.type === 'sales' ? 3 : 19;
        pass = pass && data.csflag === csflag;
      }
      return pass;
    },
    getReport() {
      this.isLoading = true;
      const self = this;
      const requests = [
        axios
          .get(
            `/invoice?type=list&flag=0&fromdate=${this.fromDate}&todate=${this.toDate}`
          )
          .catch((error) => {
            return error;
          }),
        axios.get('/billwise?type=all').catch((error) => {
          return error;
        }),
        axios
          .get(
            `/invoice?type=listdeleted&flag=0&fromdate=${this.fromDate}&todate=${this.toDate}`
          )
          .catch((error) => {
            return error;
          }),
      ];
      Promise.all([...requests])
        .then((resp) => {
          // Invoice List
          let invoiceMap = {};
          if (resp[0].data.gkstatus === 0) {
            self.options.invoices = resp[0].data.gkresult.map((item, index) => {
              invoiceMap[item.invid] = index;
              return Object.assign(
                {
                  onCreditFlag: false,
                  rectifyFlag: false, // can be rectified or not
                  deletedFlag: false,
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    item.invoicedate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                item
              );
            });
          } else {
            console.log(resp[0].message);
          }

          // Invoice in credit
          if (resp[1].data.gkstatus === 0) {
            let data = self.options.invoices;
            if (resp[1].data.gkstatus === 0 && data.length) {
              let index = '';
              resp[1].data.invoices.forEach((inv) => {
                index = invoiceMap[inv.invid];
                if (index >= 0) {
                  data[index].onCreditFlag = true;
                  data[index].rectifyFlag =
                    inv.balanceamount === inv.invoicetotal; // can be rectified or not
                }
              });
            }
          } else {
            console.log(resp[1].message);
          }

          if (resp[2].data.gkstatus === 0) {
            const deletedInv = resp[2].data.gkresult.map((item) => {
              return Object.assign(
                {
                  onCreditFlag: false,
                  rectifyFlag: false, // can be rectified or not
                  deletedFlag: true,
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    item.invoicedate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                item
              );
            });
            self.options.invoices.push(...deletedInv);
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
