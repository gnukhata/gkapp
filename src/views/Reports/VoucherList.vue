<template>
  <section class="container-fluid">
    <b-card
      class="gkcard mx-auto"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Voucher List
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
    <b-table
      class="mx-auto"
      stacked="sm"
      small
      hover
      striped
      head-variant="dark"
      bordered
      :items="options.vouchers"
      :busy="isLoading"
      :fields="fields"
      v-if="options.vouchers.length"
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
      <template #cell(vouchernumber)="data">
        <b-link
          :to="{
            name: 'Workflow',
            params: {
              wfName: 'Transactions-Voucher',
              wfId: data.item.vouchercode,
            },
          }"
        >
          {{ data.value }}
        </b-link>
      </template>
    </b-table>
  </section>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkDate from '../../components/GkDate.vue';

export default {
  name: 'RejectionNoteList',
  components: { ReportHeader, GkDate },
  data() {
    return {
      isLoading: false,
      fromDate: '',
      toDate: '',
      filter: {
        type: 'all', // all, purchase, sales
      },
      fields: [
        {
          key: 'index',
          label: 'Sr.No.',
        },
        {
          key: 'vouchernumber',
          label: 'Voucher No.',
          sortable: true,
        },
        {
          key: 'voucherdate',
          label: 'Date',
          sortable: true,
          class: 'inv-date',
        },
        {
          key: 'vouchertype',
          label: 'Type',
          sortable: true,
        },
      ],
      options: {
        vouchers: [],
      },
    };
  },
  computed: {
    fromTime: (self) => (self.fromDate ? Date.parse(self.fromDate) : 0),
    toTime: (self) => (self.toDate ? Date.parse(self.toDate) : 0),
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
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
        axios
          .get(
            `/transaction?searchby=date&from=${this.fromDate}&to=${this.toDate}`
          )
          .catch((error) => {
            return error;
          }),
        axios.get('/report?type=deletedvoucher').catch((error) => {
          return error;
        }),
      ];
      Promise.all(requests)
        .then((resp) => {
          let vouchers = [],
            delVouchers = [];
          if (resp[0].data.gkstatus === 0) {
            vouchers = resp[0].data.gkresult.map((voucher) => {
              return Object.assign(
                {
                  deletedFlag: false,
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    voucher.voucherdate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                voucher
              );
            });
          }
          if (resp[1].data.gkstatus === 0) {
            delVouchers = resp[1].data.gkresult.map((voucher) => {
              return Object.assign(
                {
                  deletedFlag: true,
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    voucher.voucherdate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                voucher
              );
            });
          }

          self.options.vouchers = [...vouchers, ...delVouchers];
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
