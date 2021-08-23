<template>
  <section class="container-fluid">
    <b-card
      class="gkcard mx-auto"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Transfer Note List
      </template>
      <b-form @submit.prevent="getReport">
        <b-form-group label="From" label-align="right" content-cols="8">
          <gk-date id="fromdate" v-model="fromDate"></gk-date>
        </b-form-group>
        <b-form-group label="To" label-align="right" content-cols="8">
          <gk-date id="todate" v-model="toDate"></gk-date>
        </b-form-group>
        <!-- Godown select -->
        <b-form-group label="Godown" label-align="right" content-cols="8">
          <autocomplete
            placeholder="Search / Select a godown"
            v-model="godownId"
            :options="options.godowns"
          ></autocomplete>
        </b-form-group>
        <b-button
          variant="success"
          class="float-right"
          type="submit"
          :disabled="isPreloading"
        >
          <b-icon icon="cloud-arrow-up"></b-icon> Get Details
        </b-button>
      </b-form>
    </b-card>
    <br />
    <div v-if="options.tnotes.length">
      <div class="d-print-none">
        <!-- Filter start -->
        <b-button class="float-right px-1" variant="link" @click="printPage">
          <b-icon icon="printer"></b-icon
          ><span class="sr-only">Print View</span>
        </b-button>
        <!-- Filter end -->
        <div class="clearfix"></div>
      </div>
      <report-header>
        <div class="text-center">
          <b>Transfer Note List</b> for the period {{ fromDate }} to
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
        :items="options.tnotes"
        :busy="isLoading"
        :fields="fields"
        sticky-header=""
        :style="{ 'font-size': '0.9rem' }"
        table-class="text-sm-center table-border-dark"
        id="report-table"
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
        <template #cell(transfernoteno)="data">
          <b-link
            :to="{
              name: 'Workflow',
              params: { wfName: 'Transactions-TransferNote', wfId: data.item.transfernoteid },
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
import Autocomplete from '../../components/Autocomplete.vue';
export default {
  name: 'TransferNoteList',
  components: { ReportHeader, GkDate, Autocomplete },
  data() {
    return {
      isPreloading: false,
      isLoading: false,
      fromDate: '',
      toDate: '',
      godownId: 0,
      fields: [
        {
          key: 'index',
          label: 'Sr.No.',
        },
        {
          key: 'transfernoteno',
          label: 'TN No.',
          sortable: true,
        },
        {
          key: 'transfernotedate',
          label: 'Date',
          sortable: true,
          class: 'inv-date',
        },
        {
          key: 'fromgodown',
          label: 'Dispatch From',
          sortable: true,
        },
        {
          key: 'togodown',
          label: 'Deliver At',
          sortable: true,
        },
        {
          key: 'products',
          label: 'Products',
          sortable: true,
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
        },
      ],
      options: {
        tnotes: [],
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
      if (this.filter.cancelled) {
        pass = data.cancelFlag;
      } else if (this.filter.unBilled) {
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
      let from = this.dateReverse(this.fromDate),
        to = this.dateReverse(this.toDate);
      let url = `/transfernote?type=list&startdate=${from}&enddate=${to}`;
      if (this.godownId != 0) {
        url += `&goid=${this.godownId}`;
      }
      axios
        .get(url)
        .then((resp) => {
          self.options.tnotes = resp.data.gkresult.map((tnote) => {
            let products = tnote.productqty[0].productdesc;
            if (tnote.numberofproducts > 1) {
              products += ' +1';
            }
            return Object.assign(
              {
                products,
                status: tnote.receivedflag ? 'Received' : 'Pending',
              },
              tnote
            );
          });
          self.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getGodownList() {
      this.isPreloading = true;
      axios
        .get('/godown')
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let godowns = [];
            godowns = resp.data.gkresult.map((godown) => {
              return {
                value: godown.goid,
                text: `${godown.goname} (${godown.goaddr}) `,
              };
            });
            this.options.godowns = [{ value: 0, text: 'All' }, ...godowns];
            this.$nextTick().then(() => {
              this.godownId = 0;
            });
          }
          this.isPreloading = false;
        })
        .catch((e) => {
          console.log(e.message);
          this.isPreloading = false;
        });
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    this.getGodownList();
  },
};
</script>

<style>
.inv-date {
  min-width: 100px;
}
</style>
