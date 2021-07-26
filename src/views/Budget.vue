<template>
  <section class="m-1 align-form-label-right">
    <b-overlay :show="loading" blur>
      <b-card
        header="Budget"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mb-3 mx-auto gkcard d-print-none"
        header-class="py-2"
        body-class="p-2"
      >
        <template #header>
          Budget
          <b-button class="float-right py-0" size="sm" variant="success">
            + Add
          </b-button>
        </template>
        <b-form-group label-size="sm" label="Budget Type" label-cols="3">
          <b-form-radio-group
            size="sm"
            class="d-flex align-items-center"
            :style="{ height: '100%' }"
            v-model="budgetType"
          >
            <b-form-radio value="3">Cash</b-form-radio>
            <b-form-radio value="16">
              Profit & Loss
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-form-group
          label="Budget List"
          label-for="input-10"
          label-cols="3"
          label-size="sm"
        >
          <autocomplete
            size="sm"
            id="input-10"
            v-model="budId"
            :options="budgetList"
            @input="getReport"
            :required="true"
            :placeholder="
              budgetList.length ? 'Select a Budget' : 'No Budgets Found!'
            "
            :readonly="!budgetList.length"
          >
          </autocomplete>
        </b-form-group>
      </b-card>
    </b-overlay>

    <!-- Table -->
    <div v-if="report.length">
      <report-header>
        <div class="text-center">
          <b>{{ isTypeCash ? 'Cash' : 'Profit & Sale' }} Budget</b>
          | From
          <b>{{ fromDate }}</b>
          to
          <b>{{ toDate }}</b>
        </div>
      </report-header>
      <b-button
        size="sm"
        class="float-right mb-1"
        @click="expandRows = !expandRows"
      >
        Expand All
      </b-button>
      <b-table
        caption-top
        class="mt-3"
        head-variant="dark"
        responsive
        small
        bordered
        striped
        :items="report"
        :fields="tableFields"
        :sticky-header="`${tableHeight}px`"
        thead-class="text-right"
      >
        <template #cell(name)="data">
          <div class="text-right position-relative">
            <div class="position-relative" v-b-toggle="`bl-${data.item.name}`">
              <b-icon
                font-scale="0.8"
                :style="{ left: '0px', top: '0px' }"
                class="position-absolute"
                :icon="data.item.isOpen ? 'dash' : 'arrows-fullscreen'"
              ></b-icon>
              <b> {{ data.value }} </b>
            </div>
            <b-collapse :id="`bl-${data.item.name}`" v-model="data.item.isOpen">
              <div v-for="(accName, index) in data.item.acc" :key="index">
                {{ accName }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(budget)="data">
          <div class="text-right">
            <b> {{ data.item.total.budget }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div v-for="(bud, index) in data.value" :key="index">
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(actual)="data">
          <div class="text-right">
            <b> {{ data.item.total.actual }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div v-for="(bud, index) in data.value" :key="index">
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(var)="data">
          <div class="text-right">
            <b> {{ data.item.total.var }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div v-for="(bud, index) in data.value" :key="index">
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(varPercent)="data">
          <div class="text-right">
            <b> {{ data.item.total.varPercent }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div v-for="(bud, index) in data.value" :key="index">
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
      </b-table>
    </div>
  </section>
</template>
<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  name: 'Budget',
  components: { Autocomplete, ReportHeader },
  data() {
    return {
      expandAllRows: false,
      tableHeight: window.innerHeight - 275,
      tableFields: [
        {
          key: 'name',
          label: 'Particulars',
          thStyle: { 'min-width': '125px' },
        },
        { key: 'budget', label: 'Budgeted' },
        { key: 'actual', label: 'Actuals' },
        { key: 'var', label: 'Variance' },
        { key: 'varPercent', label: 'Variance(%)' },
      ],
      loading: false,
      budgetType: '3',
      budId: null,
      report: [],
      options: {
        budget: {
          cash: [],
          pl: [],
        },
        budIdToDates: {},
        reports: {},
      },
    };
  },
  computed: {
    expandRows: {
      get: function() {
        return this.expandAllRows;
      },
      set: function(expandFlag) {
        this.report.forEach((item) => {
          item.isOpen = expandFlag;
        });
      },
    },
    fromDate: (self) =>
      self.budId && self.options.budIdToDates[self.budId]
        ? self.options.budIdToDates[self.budId].from
        : '',
    toDate: (self) =>
      self.budId && self.options.budIdToDates[self.budId]
        ? self.options.budIdToDates[self.budId].to
        : '',
    budgetList: (self) =>
      self.isTypeCash ? self.options.budget.cash : self.options.budget.pl,
    isTypeCash: (self) => self.budgetType === '3',
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    formatTableData(data) {
      let formatRowData = function(rowData, name, isCash) {
        let total = {
          budget: 0,
          actual: 0,
          var: 0, // actual - budgeted
          varPercent: 0, // var / budgeted
          total: {},
        };
        let row = {
          name: name,
          acc: [],
          budget: [],
          actual: [],
          var: [],
          varPercent: [],
          isOpen: true,
        };
        let nameKey = isCash ? 'accountname' : 'name';
        let noBudget = rowData[0].budget === undefined; // openingacc data doesn't have budget or actual, so balance data is used instead
        let noActual = rowData[0].actual === undefined; // closing data doesn't have actual, so balance is used instead
        rowData.forEach((item) => {
          row.acc.push(item[nameKey]);
          if (noBudget) {
            row.budget.push(item.balance);
            row.actual.push(item.balance);
            row.var.push('-');
            row.varPercent.push('-');
            Object.assign(total, {
              budget: total.budget + (parseFloat(item.balance) || 0),
              actual: total.actual + (parseFloat(item.balance) || 0),
              var: 0,
              varPercent: 0,
            });
          } else {
            row.budget.push(item.budget);
            row.actual.push(noActual ? item.balance : item.actual);
            row.var.push(item.var);
            row.varPercent.push(item.varinpercent);
            Object.assign(total, {
              budget: total.budget + (parseFloat(item.budget) || 0),
              actual:
                total.actual +
                (parseFloat(noActual ? item.balance : item.actual) || 0),
              var: total.var + (parseFloat(item.var) || 0),
              varPercent: total.varPercent + (parseFloat(item.varPercent) || 0),
            });
          }
        });
        total.var = total.actual - total.budget;
        total.varPercent = total.var / total.budget;
        row.total = {
          budget: total.budget.toFixed(2),
          actual: total.actual.toFixed(2),
          var: total.var.toFixed(2),
          varPercent: total.varPercent.toFixed(2),
        };
        return row;
      };
      let result = [];
      if (this.isTypeCash) {
        result.push(formatRowData(data.openingacc, 'Opening', this.isTypeCash));
        result.push(formatRowData(data.inflow, 'Inflow', this.isTypeCash));
        result.push(formatRowData(data.outflow, 'Outflow', this.isTypeCash));
        result.push(formatRowData(data.closing, 'Closing', this.isTypeCash));
      } else {
        result.push(formatRowData(data.incomeacc, 'Income', this.isTypeCash));
        result.push(formatRowData(data.expenseacc, 'Expense', this.isTypeCash));
        let budgetProfit = result[0].total.budget - result[1].total.budget, // income - expense
          actualProfit = result[0].total.actual - result[1].total.actual; // income - expense
        result.push({
          name: 'Net Profit',
          acc: [],
          budget: [],
          actual: [],
          var: [],
          varPercent: [],
          total: {
            budget: budgetProfit.toFixed(2),
            actual: actualProfit.toFixed(2),
            var: (actualProfit - budgetProfit).toFixed(2),
            varPercent: (((actualProfit - budgetProfit) / budgetProfit) * 100).toFixed(2),
          },
          isOpen: true,
        });
      }
      // console.log(result);
      return result;
    },
    getReport() {
      if (!this.budId) {
        return;
      }
      if (this.options.reports[this.budId]) {
        // use the existing report
        return;
      }
      this.loading = true;
      let type = this.isTypeCash ? 'cashReport' : 'profitlossReport';
      let startDate = this.dateReverse(this.fromDate);
      axios
        .get(
          `/budget?type=${type}&budid=${this.budId}&financialstart=${startDate}`
        )
        .then((r) => {
          switch (r.data.gkstatus) {
            case 0:
              {
                this.report = this.formatTableData(r.data.gkresult);
              }
              break;
            case 2:
              this.$bvToast.toast('Unauthorised Access', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
            default:
              this.$bvToast.toast('Data error', {
                variant: 'danger',
                solid: true,
              });
              break;
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
    },
    preloadData() {
      this.loading = true;

      const requests = [
        axios.get('/budget?bud=all&btype=3'),
        axios.get('/budget?bud=all&btype=16'),
      ];
      Promise.all([...requests])
        .then(([resp1, resp2]) => {
          let idToDates = {};
          let preloadFail = false;
          if (resp1.data.gkstatus === 0) {
            this.options.budget.cash = resp1.data.gkresult.map((budget) => {
              idToDates[budget.budid] = {
                from: budget.startdate,
                to: budget.enddate,
              };
              return {
                text: `${budget.budname} (${budget.startdate} - ${budget.enddate})`,
                value: budget.budid,
              };
            });
          } else {
            preloadFail = true;
          }

          if (resp2.data.gkstatus === 0) {
            this.options.budget.pl = resp2.data.gkresult.map((budget) => {
              idToDates[budget.budid] = {
                from: budget.startdate,
                to: budget.enddate,
              };
              return {
                text: `${budget.budname} (${budget.startdate} - ${budget.enddate})`,
                value: budget.budid,
              };
            });
          } else {
            preloadFail = true;
          }

          this.options.budIdToDates = idToDates;

          if (preloadFail) {
            this.$bvToast.toast('Preload Budget List Failed!', {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  mounted() {
    // this.fromDate = this.dateReverse(this.yearStart);
    // this.toDate = this.dateReverse(this.yearEnd);
    this.preloadData();
  },
};
</script>
