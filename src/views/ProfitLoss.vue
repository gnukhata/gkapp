<template>
  <section>
    <h2 class="my-4 text-muted display-5">
      {{ reportName().toUpperCase() }}
    </h2>
    <b-overlay :show="isLoading">
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          {{ reportName() }}: From {{ dateReverse(selected?.fromDate || fromDate) }} to
          {{ dateReverse(selected?.toDate || toDate) }}
        </b-alert>
        <b-form @submit.prevent="getReport">
          <b-row>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="From"
                label-cols="auto"
              >
                <gk-date
                  id="fromdate"
                  v-model="fromDate"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="To"
                label-cols="auto"
              >
                <gk-date
                  id="todate"
                  v-model="toDate"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="2"
            >
              <b-form-group
                label="Hide ₹0 rows"
                label-cols="auto"
              >
                <b-form-checkbox
                  id="checkbox-1"
                  v-model="hideZero"
                  name="checkbox-1"
                  class="d-inline-block mt-1"
                  size="lg"
                  switch
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="Divide by 1000"
                label-cols="auto"
              >
                <b-form-checkbox
                  id="checkbox-2"
                  v-model="divideThousand"
                  name="checkbox-2"
                  class="d-inline-block mt-1"
                  size="lg"
                  switch
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-button-group
            size="sm"
          >
            <b-button
              variant="success"
              type="submit"
              class="mr-2"
            >
              Submit
            </b-button>
            <b-button
              @click="clear"
              variant="dark"
            >
              Clear
            </b-button>
          </b-button-group>
        </b-form>
      </b-card>
      <!--     {{ result }} -->
      <report-header>
        <div class="text-center">
          <b
            v-if="orgType == 'Profit Making'"
            v-translate
          >Profit & Loss</b>
          <b
            v-else
            v-translate
          >Income & Expenditure</b>for the period
          {{ dateReverse(selected.fromDate) }} to
          {{ dateReverse(selected.toDate) }}
          <br>
        </div>
      </report-header>
      <div
        class="d-print-none d-flex align-items-center justify-content-end mb-2 mt-4"
      >
        <b-button-group
          size="sm"
        >
          <b-button
            class="px-1 d-none d-lg-inline-block mr-1"
            variant="dark"
            size="sm"
            @click="printPage"
          >
            <b-icon
              class="align-middle"
              icon="printer"
            />
            Print
          </b-button>
          <gk-file-download
            :url="downloadUrl"
            :file-name="downloadFileName"
            variant="dark"
            title="Export XLSX"
            name="Export XLSX"
            file-extn=".xlsx"
            :message-from-parent="parentMessage"
          />
        </b-button-group>
      </div>
      <b-row class="row text-small">
        <b-col
          cols="6"
          class="pr-0"
        >
          <report-table-three-col
            :items="tradingLeft"
            :fields="reportFields"
            :filter-table="filterTable"
            :table-name="'trading'"
            :divide-thousand="divideThousand"
          />
        </b-col>
        <b-col
          cols="6"
          class="pl-0"
        >
          <report-table-three-col
            :items="tradingRight"
            :fields="reportFields"
            :filter-table="filterTable"
            :table-name="'trading'"
            :divide-thousand="divideThousand"
          />
        </b-col>
      </b-row>

      <b-row class="row text-small">
        <b-col
          cols="6"
          class="pr-0"
        >
          <b-table
            borderless
            small
            :items="totals.trading_left"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="" />
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
            </template>
          </b-table>
        </b-col>
        <b-col
          cols="6"
          class="pl-0"
        >
          <b-table
            borderless
            small
            :items="totals.trading_right"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="" />
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
            </template>
          </b-table>
        </b-col>
      </b-row>
      <b-row class="row text-small">
        <b-col
          cols="6"
          class="pr-0"
        >
          <report-table-three-col
            :items="pnlLeft"
            :fields="reportFields"
            :filter-table="filterTable"
            :table-name="'pnl'"
            :divide-thousand="divideThousand"
          />
        </b-col>
        <b-col
          cols="6"
          class="pl-0"
        >
          <report-table-three-col
            :items="pnlRight"
            :fields="reportFields"
            :filter-table="filterTable"
            :table-name="'pnl'"
            :divide-thousand="divideThousand"
          />
        </b-col>
      </b-row>

      <b-row class="row text-small">
        <b-col
          cols="6"
          class="pr-0"
        >
          <b-table
            borderless
            small
            :items="totals.pnl_left"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="" />
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
            </template>
          </b-table>
        </b-col>
        <b-col
          cols="6"
          class="pl-0"
        >
          <b-table
            borderless
            small
            :items="totals.pnl_right"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="" />
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '../components/ReportHeader.vue';
import ReportTableThreeCol from '../components/reports/ReportTableThreeCol.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
export default {
  components: { GkDate, ReportHeader, GkFileDownload, ReportTableThreeCol },
  name: 'ProfitLoss',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      fromDate: null,
      toDate: null,
      hideZero: false,
      selected: {},
      divideThousand: false,

      // set level based fields
      reportFields: [
        {
          key: 'name',
          label: 'Particulars',
          class: 'text-break col-6',
        },
        {
          key: 'colOne',
          label: '',
          class: 'text-break text-right col-3',
        },
        {
          key: 'colTwo',
          label: 'Amount',
          class: 'text-break text-right col-3',
        },
      ],
      tradingLeft: [],
      tradingRight: [],
      pnlLeft: [],
      pnlRight: [],
      totals: {
        trading_left: [],
        trading_right: [],
        pnl_left: [],
        pnl_right: [],
      },
    };
  },
  computed: {
    downloadUrl: (self) => {
      return `/spreadsheet/profit-loss?from=${self.fromDate}&to=${self.toDate}`
    },
    downloadFileName: (self) =>
      `Profit_Loss_${self.fromDate}_to_${self.toDate}`,
    hideZeroFilter: (self) => (self.hideZero ? 'a' : null),
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
  methods: {
    clear() {
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      this.hideZero = false;
      this.divideThousand = false;
      this.selected = {};
      this.getReport();
    },
    reportName() {
      return this.orgType == "Profit Making" ? "Profit & Loss Statement" : "Income & Expenditure"
    },
    printPage() {
      window.print();
    },
    filterTable(item) {
      if (this.hideZeroFilter && item.amount == 0.00) {
        return false
      }
      return item.isShown;
    },
    prepareReport(report, reportName) {
      report.forEach((item, index) => {
        let isStock, isGroup, isSubGroup, isAccount, isPNL, isTotal, isParentSubgroup;
        let amount = parseFloat(item?.amount || 0).toFixed(2);
        switch (item.type) {
        case "stock":
          isStock = true;
          break;
        case "group":
          isGroup = true;
          break;
        case "subgroup":
          isSubGroup = true;
          break;
        case "account":
          isAccount = true;
          break;
        case "pnl_str":
          isPNL = true;
          break;
        case "total":
          isTotal = true;
          this.totals[reportName] = [{...item, "colOne": false, "colTwo": true, amount}];
          break;
        }
        if (item?.subgroupcode) {
          isParentSubgroup = true;
        }
        report[index] = {
          ...item,
          ...{isStock, isGroup, isSubGroup, isAccount, isPNL, isTotal, isParentSubgroup},
          amount,
        };
      });
      return report;
    },
    formatTrading(tradingData) {
      tradingData.forEach((item, index) => {
        let isShown, colOne, colTwo ;
        let children = [];
        isShown = (item?.isParentSubgroup || item?.isGroup || item?.isTotal) ? false : true;
        colOne = false;
        colTwo = true;
        if (item?.isSubGroup) {
          tradingData.forEach((tradingItem) => {
            if (tradingItem?.isAccount && item.id === tradingItem?.parent_group) {
              tradingItem["isShown"] = true;
              tradingItem["colTwo"] = false;
              tradingItem["colOne"] = true;
              children.push(tradingItem);
            }
          });
        }
        tradingData[index] = {...item, isShown, children, colOne, colTwo};
      });
      return tradingData;
    },
    formatPNL(pnlData) {
      pnlData.forEach((item, index) => {
        let isShown, colOne, colTwo;
        let children = [];
        isShown = (item?.isGroup || item?.isPNL) ? true : false;
        colOne = false;
        colTwo = true;
        if (item?.isGroup) {
          pnlData.forEach((pnlItem) => {
            if (item.id === pnlItem?.groupcode) {
              if (pnlItem?.isAccount) {
                pnlItem["isShown"] = true;
                pnlItem["colTwo"] = false;
                pnlItem["colOne"] = true;
                children.push(pnlItem);
              }
            }
          });
        }
        pnlData[index] = {...item, isShown, children, colOne, colTwo};
      });
      return pnlData;
    },
    formatResponse(response) {
      for (let report_name of ["trading_left", "trading_right", "pnl_left", "pnl_right"]) {
        response[report_name] = this.prepareReport(response[report_name], report_name);
        if (["trading_left", "trading_right"].includes(report_name)) {
          response[report_name] = this.formatTrading(response[report_name]);
        }
        if (["pnl_left", "pnl_right"].includes(report_name)) {
          response[report_name] = this.formatPNL(response[report_name]);
        }
      }
      this.tradingLeft = response["trading_left"];
      this.pnlLeft = response["pnl_left"];
      this.tradingRight = response["trading_right"];
      this.pnlRight = response["pnl_right"];
      return response;
    },
    getReport() {
      this.isLoading = true;
      this.$axios
        .get(
          `/reports/profit-loss?calculateto=${this.toDate}&calculatefrom=${this.fromDate}`
        )
        .then((resp) => {
          this.formatResponse(resp);
          this.selected = {
            fromDate: this.fromDate,
            toDate: this.toDate,
          }
        })
      this.isLoading = false;
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    this.getReport();
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
.bs-col-name {
  width: 190px;
}
.bs-col-amount {
  width: 50px;
  color: blue;
}
</style>
