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
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="Type"
                label-cols="auto"
              >
                <v-select
                  :options="pnlTypeOptions"
                  v-model="pnlType"
                  placeholder="Profit and Loss Type"
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
    </b-overlay>
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
    <b-row
      class="row text-small"
      v-if="pnlType == 'Vertical'"
    >
      <b-col
        cols="12"
      >
        <b-table
          :items="visibleRows"
          :fields="fields"
          responsive
          head-variant="light"
          small
          outlined
        >
          <template #cell(particulars)="data">
            <span
              :style="{
                paddingLeft: data.item.level * 20 + 'px',
              }"
              :class="{
                'font-weight-bold': data.item.type === 'total' || data.item.type === 'pnl_str',
                'font-italic': data.item.type === 'pnl_str',
              }"
            >
              <span
                v-if="hasChildren(data.item)"
                @click="toggle(data.item)"
                style="cursor: pointer;"
              >
                <b-icon
                  :icon="isExpanded(data.item) ? 'chevron-down' : 'chevron-right'"
                  class="mr-1"
                />
                {{ data.item.name }}
              </span>
              <b-button
                size="sm"
                variant="link"
                class="p-0"
                :to="{path: `/ledger/?ac=${data.item.id}`}"
                v-else-if="data.item.type === 'account'"
              >
                {{ data.item.name }}
              </b-button>
              <b-button
                size="sm"
                variant="link"
                class="p-0"
                :to="{path: `/stock-on-hand?to=${toDate}`}"
                v-else-if="data.item.type == 'stock'"
              >
                {{ data.item.name }}
              </b-button>
              <span v-else>
                {{ data.item.name }}
              </span>
            </span>
          </template>
          <template #cell(amount)="data">
            <span
              class="float-right"
              :class="{
                'font-weight-bold': data.item.type === 'total' || data.item.type === 'pnl_str',
                'pnl-str': data.item.type === 'pnl_str',
                'font-italic': data.item.type === 'pnl_str',
                'pr-2': data.item.level == 1,
                'pr-4': data.item.level == 2
              }"
            >
              {{ formatAmount(data.item.amount / (divideThousand ? 1000 : 1)) }}
            </span>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row
      class="row text-small"
      v-if="pnlType == 'Horizontal'"
    >
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

    <b-row
      class="row text-small"
      v-if="pnlType == 'Horizontal'"
    >
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
    <b-row
      class="row text-small"
      v-if="pnlType == 'Horizontal'"
    >
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

    <b-row
      class="row text-small"
      v-if="pnlType == 'Horizontal'"
    >
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
      pnlType: 'Vertical',
      pnlTypeOptions: ["Vertical", "Horizontal"],

      fields: [
        { key: 'particulars', label: 'Name' },
        { key: 'amount', label: 'Amount', class: 'text-right' }
      ],
      rows: [], // preprocessed data will go here
      expanded: {}, // track which parent IDs are expanded

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
    visibleRows: (self) => {
      const result = [];
      const parentVisible = {};

      self.rows.forEach(row => {
        const parentId = row.parentId;
        const isZeroAmountRow = row.amount === 0;

        const isSpecial = (
          self.hideZero
          && isZeroAmountRow
          && !(row.type === 'total' || row.type === 'pnl_str')
        )

        if ((!parentId || parentVisible[parentId]) && !isSpecial) {
          result.push(row);
          parentVisible[row.id] = self.isExpanded(row);
        }
      });

      // console.log(self.rows)
      // self.rows.forEach(row => {
      //   const parentId = row.parentId;
      //
      //   if (!parentId || parentVisible[parentId]) {
      //     result.push(row);
      //     parentVisible[row.id] = self.isExpanded(row);
      //   }
      // });

      return result;
    },
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
    preprocessVerticalData(vertical) {
      const flatRows = [];

      vertical.forEach(item => {
        const amount = typeof item.amount === 'object' ? item.amount.parsedValue : item.amount;

        switch (item.type) {
          case 'stock':
          case 'total':
          case 'pnl_str':
            flatRows.push({
              id: item.name,
              name: item.name,
              amount,
              type: item.type,
              level: 0,
              parentId: null
            });
            break;

          case 'group':
            flatRows.push({
              id: item.id,
              name: item.name,
              amount,
              type: 'group',
              level: 0,
              parentId: null
            });
            break;

          case 'subgroup':
            flatRows.push({
              id: item.id,
              name: item.name,
              amount,
              type: 'subgroup',
              level: 1,
              parentId: item.parent_group
            });
            break;

          case 'account':
            flatRows.push({
              id: item.id,
              name: item.name,
              amount,
              type: 'account',
              level: item.subgroupcode ? 2 : 1,
              parentId: item.parent_group,
            });
            break;
        }
      });

      return flatRows;
    },
    formatAmount(amount) {
      return typeof amount === 'number' ? amount.toFixed(2) : amount;
    },
    hasChildren(row) {
      return this.rows.some(r => r.parentId === row.id);
    },
    isExpanded(row) {
      return this.expanded[row.id];
    },
    toggle(row) {
      this.$set(this.expanded, row.id, !this.isExpanded(row));
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
      this.rows = this.preprocessVerticalData(response["vertical"]);
      this.tradingLeft = response["trading_left"];
      this.pnlLeft = response["pnl_left"];
      this.tradingRight = response["trading_right"];
      this.pnlRight = response["pnl_right"];
      this.vertical = response["vertical"]
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
.pnl-str {
  text-decoration-line: underline;
}
</style>
