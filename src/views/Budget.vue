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
          <b-button
            :to="{ name: 'Create_Budget', params: { type: budgetType } }"
            class="float-right py-0"
            size="sm"
            variant="success"
          >
            + Add
          </b-button>
        </template>
        <b-form-group label-size="sm" label="Budget Type" label-cols="3">
          <b-form-radio-group
            size="sm"
            class="d-flex align-items-center"
            :style="{ height: '100%' }"
            v-model="budgetType"
            @input="onBudgetFilterUpdate"
          >
            <b-form-radio value="cash">Cash</b-form-radio>
            <b-form-radio value="pl">
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
            @input="onBudgetFilterUpdate"
            :required="true"
            :placeholder="
              budgetList.length ? 'Select a Budget' : 'No Budgets Found!'
            "
            :readonly="!budgetList.length"
          >
          </autocomplete>
        </b-form-group>
        <div class="float-right" v-if="budId">
          <b-button
            size="sm"
            class="mx-1"
            variant="primary"
            :to="{ name: 'Edit_Budget', params: { id: budId } }"
            >Edit</b-button
          >
          <b-button size="sm" variant="danger" @click.prevent="confirmOnDelete"
            >Delete</b-button
          >
        </div>
      </b-card>
    </b-overlay>
    <div class="px-2" v-if="budId">
      <u>
        <small>
          Budget:
          <span>
            {{ budName }} ({{ fromDate }} to {{ toDate }})
          </span>
        </small>
      </u>
      <br class="d-md-none" />
      <div class="d-flex align-items-center float-md-right">
        <b-form-checkbox
          id="checkbox-1"
          v-model="showPrintView"
          name="checkbox-1"
          class="d-inline-block"
          size="sm"
          switch
        >
          Print View
        </b-form-checkbox>
        <div>
          <print-helper
            v-if="showPrintView"
            name="Budget Report"
            contentId="budget-table-container"
          ></print-helper>
          <b-button
            v-if="showPrintView"
            @click="expandTable = !expandTable"
            class="p-2"
            variant="dark"
            size="sm"
          >
            <b-icon
              class="float-right"
              font-scale="0.95"
              :icon="expandTable ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </b-button>
        </div>
      </div>
    </div>
    <b-container fluid v-if="!showPrintView">
      <b-row>
        <b-col
          cols="12"
          :md="budget.isCardOpen ? 12 : 4"
          v-for="(budget, index) in report"
          :key="index"
          class="p-1 "
        >
          <b-card body-class="p-2 bg-dark-grey" class="shadow-sm">
            <div
              class="acc-card-header"
              v-b-toggle="`budget-${budget.name}-${index}`"
            >
              <h4 class="d-inline-block">{{ budget.name }}</h4>
              <b-icon
                class="float-right"
                font-scale="0.7"
                :icon="budget.isCardOpen ? 'dash' : 'arrows-fullscreen'"
              ></b-icon>
            </div>
            <div v-if="!budget.isCardOpen">
              <small>Budgeted: {{ budget.total.budget }}</small> <br />
              <small>Actual: {{ budget.total.actual }}</small> <br />
              <small>Variance: {{ budget.total.var }}</small> <br />
              <small>Variance (%): {{ budget.total.varPercent }}</small>
            </div>
            <b-collapse
              :id="`budget-${budget.name}-${index}`"
              v-model="budget.isCardOpen"
            >
              <u>
                <small>Accounts: {{ budget.acc.count }}</small>
              </u>
              <b-container class="mt-1" fluid>
                <b-row>
                  <b-col
                    cols="12"
                    md="4"
                    class="p-1"
                    v-for="(acc, accIndex) in budget.acc"
                    :key="accIndex"
                  >
                    <b-card body-class="p-2 bg-light-grey" class="shadow-sm">
                      <div class="acc-card-header">
                        <h5 class="d-inline-block">
                          {{ budget.acc[accIndex] }}
                        </h5>
                      </div>
                      <br />
                      <small>Budgeted: {{ budget.budget[accIndex] }}</small>
                      <br />
                      <small>Actual: {{ budget.actual[accIndex] }}</small>
                      <br />
                      <small>Variance: {{ budget.var[accIndex] }}</small> <br />
                      <small
                        >Variance (%): {{ budget.varPercent[accIndex] }}</small
                      >
                    </b-card>
                  </b-col>
                </b-row>
              </b-container>
            </b-collapse>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <!-- Table -->
    <div id="budget-table-container" v-if="budId && showPrintView">
      <report-header>
        <div class="text-center">
          <b>{{ isTypeCash ? 'Cash' : 'Profit & Sale' }} Budget</b>
          | From
          <b>{{ fromDate }}</b>
          to
          <b>{{ toDate }}</b>
        </div>
      </report-header>
      <b-table
        id="budget-table"
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
            <div class="position-relative">
              <b> {{ data.value }} </b>
            </div>
            <div v-for="(accName, index) in data.item.acc" :key="index">
              {{ accName }}
            </div>
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
import PrintHelper from '../components/PrintHelper.vue';
export default {
  name: 'Budget',
  components: { Autocomplete, ReportHeader, PrintHelper },
  data() {
    return {
      showPrintView: false,
      expandAllRows: false,
      tableHeight: window.innerHeight - 275,
      loading: false,
      budgetType: 'cash',
      expandTable: false,
      budId: null,
      report: [],
      options: {
        budget: {
          cash: [],
          pl: [],
        },
        budIdToData: {},
        budIdToNames: {},
        reports: {},
      },
    };
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
    type: {
      type: [String],
      validator: function(value) {
        return ['cash', 'pl'].indexOf(value) !== -1;
      },
      required: true,
    },
  },
  computed: {
    tableFields: (self) => {
      let res = [
        {
          key: 'name',
          label: 'Particulars',
          thStyle: { 'min-width': '125px' },
        },
        { key: 'budget', label: 'Budgeted' },
        { key: 'actual', label: 'Actuals' },
      ];
      if (self.expandTable) {
        res.push(
          { key: 'var', label: 'Variance' },
          { key: 'varPercent', label: 'Variance(%)' }
        );
      }
      return res;
    },
    budData: (self) =>
      self.budId && self.options.budIdToData[self.budId]
        ? self.options.budIdToData[self.budId]
        : {},
    budName: (self) => self.budData.name || '',
    fromDate: (self) => (self.budData.date ? self.budData.date.from : ''),
    toDate: (self) => (self.budData.date ? self.budData.date.to : ''),
    budgetList: (self) =>
      self.isTypeCash ? self.options.budget.cash : self.options.budget.pl,
    isTypeCash: (self) => self.budgetType === 'cash',
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    confirmOnDelete() {
      const self = this;
      let name = this.options.budIdToData[this.budId].name;
      let text = `Delete Budget <b>${name}</b> ?`;
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'danger',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            axios
              .delete('/budget', {
                data: {
                  budid: self.budId,
                },
              })
              .then((resp) => {
                if (resp.data.gkstatus === 0) {
                  let logdata = { activity: `budget deleted: ${name}` };
                  axios.post('/log', logdata);
                  self.$bvToast.toast(`Delete Budget "${name}" success!`, {
                    variant: 'success',
                    solid: true,
                  });
                  self.preloadData();
                } else {
                  self.$bvToast.toast(`Delete Budget "${name}" failed!`, {
                    variant: 'danger',
                    solid: true,
                  });
                }
              })
              .catch((e) => {
                self.$bvToast.toast(e.message, {
                  title: `Delete Budget "${name}" failed!`,
                  variant: 'danger',
                  solid: true,
                });
              });
          }
        });
    },
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
          isCardOpen: false,
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
            varPercent: (
              ((actualProfit - budgetProfit) / budgetProfit) *
              100
            ).toFixed(2),
          },
          isOpen: true,
        });
      }
      // console.log(result);
      return result;
    },
    onBudgetFilterUpdate() {
      if (this.budId) {
        this.updateUrl();
        this.getReport();
      }
    },
    getReport() {
      if (!this.budId) {
        return;
      }
      if (this.options.reports[this.budId]) {
        // use the existing report
        // return;
      }
      this.loading = true;
      let type = this.isTypeCash ? 'cashReport' : 'profitlossReport';
      let startDate = this.dateReverse(this.fromDate);
      const self = this;
      axios
        .get(
          `/budget?type=${type}&budid=${this.budId}&financialstart=${startDate}`
        )
        .then((r) => {
          switch (r.data.gkstatus) {
            case 0:
              {
                self.report = self.formatTableData(r.data.gkresult);
              }
              break;
            case 2:
              self.$bvToast.toast('Unauthorised Access', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
            default:
              self.$bvToast.toast('Data error', {
                variant: 'danger',
                solid: true,
              });
              break;
          }
          self.loading = false;
        })
        .catch((e) => {
          self.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          self.loading = false;
        });
    },
    preloadData() {
      this.loading = true;

      const requests = [
        axios.get('/budget?bud=all&btype=3'),
        axios.get('/budget?bud=all&btype=16'),
      ];
      return Promise.all([...requests])
        .then(([resp1, resp2]) => {
          let idToData = {};
          let preloadFail = false;
          if (resp1.data.gkstatus === 0) {
            this.options.budget.cash = resp1.data.gkresult.map((budget) => {
              idToData[budget.budid] = {
                date: {
                  from: budget.startdate,
                  to: budget.enddate,
                },
                name: budget.budname,
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
              idToData[budget.budid] = {
                date: {
                  from: budget.startdate,
                  to: budget.enddate,
                },
                name: budget.budname,
              };
              return {
                text: `${budget.budname} (${budget.startdate} - ${budget.enddate})`,
                value: budget.budid,
              };
            });
          } else {
            preloadFail = true;
          }

          this.options.budIdToData = idToData;

          if (preloadFail) {
            this.$bvToast.toast('Preload Budget List Failed!', {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
          return true;
        })
        .catch((e) => {
          this.loading = false;
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
    updateUrl() {
      let url = window.location.href.split('#')[0];
      let currentId = window.location.href.split('/').pop();
      if (currentId == this.budId) {
        return;
      }
      url += `#/budgets/${this.budgetType}/${this.budId || -1}`;
      history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
      // instead of creating a new history instances for every entity selected
    },
  },
  mounted() {
    // this.fromDate = this.dateReverse(this.yearStart);
    // this.toDate = this.dateReverse(this.yearEnd);
    const self = this;
    this.preloadData().then(() => {
      self.budgetType = self.type;
      self.$nextTick().then(() => {
        if (self.id) {
          self.budId = parseInt(self.id);
        }
        self.onBudgetFilterUpdate();
      });
    });
  },
};
</script>

<style>
.acc-card-header {
  border-bottom: 1px solid #0000001a;
}
.acc-card-header:hover {
  border-bottom: 1px solid #000;
}
.bg-dark-grey {
  background-color: #d6d6d6;
}
.bg-light-grey {
  background-color: #ecebeb;
}
@media all and (max-width: 576px) {
  .options-col {
    width: 50px;
  }
}
</style>
