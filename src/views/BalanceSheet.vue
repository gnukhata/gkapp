<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <b-card
        class="gkcard mx-auto"
        header-bg-variant="dark"
        header-text-variant="light"
      >
        <template #header>
          <gk-cardheader
            name="Balance Sheet Statement"
            :helpBody="''"
          ></gk-cardheader>
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
      <!--     {{ result }} -->
      <report-header>
        <div class="text-center">
          <b>Balance Sheet</b> for the period {{ fromDate }} to
          {{ toDate }}
        </div>
      </report-header>
      <div
        v-if="bsheet.left.length && bsheet.right.length"
        class="float-right d-print-none"
      >
        <b-form-checkbox
          id="checkbox-1"
          v-model="hideZero"
          name="checkbox-1"
          class="d-inline-block"
          size="sm"
          switch
        >
          Hide ₹0 rows
        </b-form-checkbox>
        <b-button class="px-1" variant="link" @click="printPage">
          <b-icon class="align-middle" icon="printer"></b-icon>
        </b-button>
      </div>
      <br class="d-print-none" />
      <br class="d-print-none" />
      <b-row class="row text-small">
        <b-col cols="12" md="6">
          <b-table
            striped
            small
            bordered
            :items="bsheet.left"
            :fields="tableFields"
            head-variant="dark"
            v-if="bsheet.left.length"
            class="text-small table-border-dark"
            tbody-tr-class="bs-row"
            fixed
            responsive=""
            sticky-header=""
            :filter="hideZeroFilter"
            :filter-function="hideZeroRows"
          >
            <template #cell(isGroup)="data">
              {{ data.value ? data.item.groupAccname : '' }}
            </template>
            <template #cell(isSubGroup)="data">
              {{ data.value ? data.item.groupAccname : '' }}
            </template>
            <template #cell(isAccount)="data">
              {{ data.value ? data.item.groupAccname : '' }}
            </template>
          </b-table>
        </b-col>
        <b-col cols="12" md="6">
          <b-table
            :items="bsheet.right"
            :fields="tableFields"
            striped
            small
            bordered
            head-variant="dark"
            v-if="bsheet.right.length"
            class="text-small table-border-dark"
            tbody-tr-class="bs-row"
            responsive=""
            fixed
            sticky-header=""
            :filter="hideZeroFilter"
            :filter-function="hideZeroRows"
          >
            <template #cell(isGroup)="data">
              {{ data.value ? data.item.groupAccname : '' }}
            </template>
            <template #cell(isSubGroup)="data">
              {{ data.value ? data.item.groupAccname : '' }}
            </template>
            <template #cell(isAccount)="data">
              {{ data.value ? data.item.groupAccname : '' }}
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkCardheader from '../components/GkCardheader.vue';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  components: { GkCardheader, GkDate, ReportHeader },
  name: 'BalanceSheet',
  data() {
    return {
      isLoading: false,
      fromDate: null,
      toDate: null,
      hideZero: false,
      tableFields: [
        {
          key: 'isGroup',
          label: 'Group',
          class: 'text-break ',
        },
        {
          key: 'isSubGroup',
          label: 'Sub Group',
          class: 'text-break',
        },
        {
          key: 'isAccount',
          label: 'Account',
          class: 'text-break',
        },
        {
          key: 'amount',
          label: 'Amount',
          class: 'text-right',
        },
      ],
      bsheet: {
        left: [],
        right: [],
      },
      options: {
        groupIndex: {
          left: {},
          right: {},
        },
      },
    };
  },
  methods: {
    hideZeroRows(item) {
      return !(item.amount === '0.00' || item.amount === '0');
    },
    printPage() {
      window.print();
    },
    formatReport(report) {
      let result = [];
      let map = {};
      report.forEach((item, index) => {
        let isGroup = !(!!item.subgroupof || !!item.accountof),
          isSubGroup = !!item.subgroupof && !item.accountof,
          isAccount = !!item.accountof;

        // ignore empty buffer rows
        if (item.amount === '') return;

        let parent = item.accountof || item.subgroupof;
        let parentIndex = map[parent] || -1;
        if (isGroup) {
          map[item.groupAcccode] = index;
          parentIndex = -1;
        }
        result.push(
          Object.assign(
            {
              parent: parentIndex,
              isGroup,
              isSubGroup,
              isAccount,
            },
            report[index]
          )
        );
      });
      return result;
    },
    getReport() {
      const self = this;
      this.isLoading = true;
      axios
        .get(
          `/report?type=balancesheet&calculateto=${this.fromDate}&baltype=1&calculatefrom=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                {
                  let report = r.data.gkresult;
                  report.leftlist.shift();
                  report.rightlist.shift();
                  self.bsheet = {
                    left: self.formatReport(report.leftlist),
                    right: self.formatReport(report.rightlist),
                  };
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
          }
          this.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
          this.isLoading = false;
        });
    },
  },
  computed: {
    hideZeroFilter: (self) => (self.hideZero ? 'a' : null),
    ...mapState(['yearStart', 'yearEnd']),
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
  },
};
</script>
<style scoped>
.text-small {
  font-size: 0.9rem;
}
.bs-row {
  height: 21px;
}
</style>
