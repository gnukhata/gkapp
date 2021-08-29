<template>
  <section class="container-fluid">
    <b-card
      class="gkcard mx-auto"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Delivery Note List
      </template>
      <b-form @submit.prevent="getReport">
        <b-form-group label="From" label-align="right" content-cols="8">
          <gk-date id="fromdate" v-model="fromDate"></gk-date>
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
    <div v-if="options.dnotes.length">
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
                    >Cancelled Delivery Notes</b-form-radio
                  >
                  <b-form-radio value="unbilled"
                    >Unbilled Delivery Notes</b-form-radio
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
          <b>Delivery Note List</b> for the period {{ fromDate }} to
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
        :items="options.dnotes"
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
        <template #cell(dcno)="data">
          <b-link
            :to="{
              name: 'Workflow',
              params: { wfName: 'Transactions-DeliveryNote', wfId: data.item.dcid },
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
  name: 'DeliveryNoteList',
  components: { ReportHeader, GkDate },
  data() {
    return {
      isLoading: false,
      fromDate: '',
      toDate: '',
      isFilterOpen: false,
      filter: {
        type: 'all', // all, purchase, sales
        cancelled: false,
        unBilled: false,
        mode: 'all', // all, cancelled, unbilled
      },
      fields: [
        {
          key: 'index',
          label: 'Sr.No.',
        },
        {
          key: 'dcno',
          label: 'Deli. Note No.',
          sortable: true,
        },
        {
          key: 'dcdate',
          label: 'Date',
          sortable: true,
          class: 'inv-date',
        },
        {
          key: 'custname',
          label: 'Customer',
          sortable: true,
        },
        {
          key: 'goname',
          label: 'Godown',
          sortable: true,
        },
        {
          key: 'dcflag',
          label: 'Delivery Type',
          sortable: true,
        },
      ],
      options: {
        dnotes: [],
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
        pass = data.cancelFlag;
      } else if (this.filter.mode === 'unbilled') {
        pass = data.unBillFlag;
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
        axios.get('/delchal?delchal=all').catch((error) => {
          return error;
        }),
        axios
          .get(
            `/report?type=del_unbilled&inout=i&inputdate=${this.fromDate}&del_unbilled_type=0`
          )
          .catch((error) => {
            return error;
          }),
        axios
          .get(
            `/report?type=del_unbilled&inout=o&inputdate=${this.fromDate}&del_unbilled_type=0`
          )
          .catch((error) => {
            return error;
          }),
        axios
          .get(
            `/delchal?type=listofcancelleddel&inout=i&inputdate=${this.fromDate}&del_cancelled_type=0`
          )
          .catch((error) => {
            return error;
          }),
        axios
          .get(
            `/delchal?type=listofcancelleddel&inout=o&inputdate=${this.fromDate}&del_cancelled_type=0`
          )
          .catch((error) => {
            return error;
          }),
      ];
      Promise.all(requests)
        .then((resp) => {
          // Invoice List
          let dnoteMap = {};
          let dnotes = [];

          if (resp[0].data.gkstatus === 0) {
            dnotes = resp[0].data.gkresult.map((note, index) => {
              dnoteMap[note.dcid] = index;
              return Object.assign(
                {
                  unBillFlag: false,
                  cancelFlag: false,
                  dcflag: ''
                },
                note
              );
            });
          }

          if (resp[1].data.gkstatus === 0) {
            resp[1].data.gkresult.forEach((note) => {
              let index = dnoteMap[note.dcid];
              if(index) {
                Object.assign(dnotes[index], {
                  unBillFlag: true,
                  goname: note.goname,
                  dcflag: note.dcflag,
                });
              } else {
                dnotes.push(Object.assign({
                  unBillFlag: true,
                  cancelFlag: false,
                  goname: note.goname,
                  dcflag: note.dcflag,
                }, note))
              }
            });
          }

          if (resp[2].data.gkstatus === 0) {
            resp[2].data.gkresult.forEach((note) => {
              let index = dnoteMap[note.dcid];
              if(index) {
                Object.assign(dnotes[index], {
                  unBillFlag: true,
                  goname: note.goname,
                  dcflag: note.dcflag,
                });
              } else {
                dnotes.push(Object.assign({
                  unBillFlag: true,
                  cancelFlag: false,
                  goname: note.goname,
                  dcflag: note.dcflag,
                }, note))
              }
            });
          }

          if (resp[3].data.gkstatus === 0) {
            resp[3].data.gkresult.forEach((note) => {
              let index = dnoteMap[note.dcid];
              if(index) {
                Object.assign(dnotes[index], {
                  cancelFlag: true,
                  goname: note.goname,
                  dcflag: note.dcflag,
                });
              } else {
                dnotes.push(Object.assign({
                  cancelFlag: true,
                  unBillFlag: false,
                  goname: note.goname,
                  dcflag: note.dcflag,
                }, note))
              }
            });
          }

          if (resp[4].data.gkstatus === 0) {
            resp[4].data.gkresult.forEach((note) => {
              let index = dnoteMap[note.dcid];
              if(index) {
                Object.assign(dnotes[index], {
                  cancelFlag: true,
                  goname: note.goname,
                  dcflag: note.dcflag,
                });
              } else {
                dnotes.push(Object.assign({
                  cancelFlag: true,
                  unBillFlag: false,
                  goname: note.goname,
                  dcflag: note.dcflag,
                }, note))
              }
            });
          }
          self.options.dnotes = dnotes;
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
  },
};
</script>

<style>
.inv-date {
  min-width: 100px;
}
</style>
