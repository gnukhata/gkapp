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
              lg="3"
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
    <report-header>
      <div class="text-center">
        <b>{{ reportName() }}</b>
        {{ selected.fromDate }} to
        {{ selected.toDate }}
        <br>
        <small
          v-if="hideZeroFilter"
          v-translate
        >
          "Hide Zero Value Rows" Filter has been applied
        </small>
      </div>
    </report-header>
    <div
      v-if="bsheet.left.length && bsheet.right.length"
      class="d-print-none d-flex align-items-center justify-content-end mb-2 mt-4"
    >
      <b-button-group
        size="sm"
      >
        <b-button
          class="px-1 mr-1 d-none d-lg-inline-block"
          @click="printPage"
          variant="dark"
        >
          <b-icon
            class="align-middle"
            icon="printer"
          />
          Print
        </b-button>
        <gk-file-download
          :url="
            `/spreadsheet/balance-sheet?calculateto=${selected.toDate}&calculatefrom=${selected.fromDate}&fystart=${yearStart}&orgname=${orgName}&fyend=${yearEnd}&orgtype=${orgType}&baltype=1`
          "
          :file-name="downloadFileName"
          title="Export XLSX"
          name="Export XLSX"
          file-extn=".xlsx"
          variant="dark"
          :message-from-parent="parentMessage"
        />
      </b-button-group>
    </div>
    <b-row class="row text-small">
      <b-col
        cols
        md="6"
      >
        <b-table
          small
          outlined
          :items="bsheet.left"
          :fields="tableFields"
          head-variant="light"
          v-if="bsheet.left.length"
          tbody-tr-class="bs-row"
          responsive=""
          filter="a"
          :filter-function="filterLeftTable"
        >
          <template #head(groupAccname)="">
            <translate> Capital and Liabilities </translate>
          </template>
          <template #cell(groupAccname)="data">
            <div
              :class="{
                'ml-1': data.item.isSubGroup,
                'ml-5': data.item.isAccount,
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              <b-button
                @click="data.item.isOpen = !data.item.isOpen"
                class="p-0 text-dark"
                :class="{
                  'font-weight-bold': data.item.isGroup,
                }"
                v-if="data.item.hasChildren"
                variant="link"
              >
                <b-icon
                  class="d-print-none"
                  font-scale="0.7"
                  :icon="data.item.isOpen ? 'dash' : 'arrows-fullscreen'"
                  v-if="!data.item.isAccount && data.item.hasChildren"
                />
                {{ data.value }}
              </b-button>
              <b-button
                size="sm"
                variant="link"
                class="p-0"
                :to="{path: `/ledger/${data.item.groupAcccode}`}"
                v-else-if="data.item.isAccount"
              >
                {{ data.value }}
              </b-button>
              <b-button
                size="sm"
                variant="link"
                class="p-0"
                :to="{path: `/profit-loss`}"
                v-else-if="data.item?.type === 'pnl'"
              >
                {{ data.value }}
              </b-button>
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                }"
                v-else
              >
                {{ data.value }}
              </span>
            </div>
          </template>
          <template #cell(isGroup)="data">
            <span
              :class="{
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              {{ data.value ? data.item.amount : '' }}
            </span>
          </template>
          <template #cell(isSubGroup)="data">
            <span
              :class="{
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              {{ data.value ? data.item.amount : '' }}
            </span>
          </template>
          <template #cell(isAccount)="data">
            <span
              :class="{
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              {{ data.value ? data.item.amount : '' }}
            </span>
          </template>
        </b-table>
      </b-col>
      <b-col
        cols="12"
        md="6"
      >
        <b-table
          :items="bsheet.right"
          :fields="tableFields"
          small
          outlined
          head-variant="light"
          v-if="bsheet.right.length"
          tbody-tr-class="bs-row"
          responsive=""
          filter="a"
          :filter-function="filterRightTable"
        >
          <template #head(groupAccname)="">
            <translate> Property and Assets </translate>
          </template>
          <template #cell(groupAccname)="data">
            <div
              :class="{
                'ml-1': data.item.isSubGroup,
                'ml-5': data.item.isAccount,
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              <b-button
                @click="data.item.isOpen = !data.item.isOpen"
                class="p-0 text-dark"
                :class="{
                  'font-weight-bold': data.item.isGroup,
                }"
                v-if="data.item.hasChildren"
                variant="link"
              >
                <b-icon
                  class="d-print-none"
                  font-scale="0.7"
                  :icon="data.item.isOpen ? 'dash' : 'arrows-fullscreen'"
                  v-if="!data.item.isAccount && data.item.hasChildren"
                />
                {{ data.value }}
              </b-button>
              <b-button
                size="sm"
                variant="link"
                class="p-0"
                :to="{path: `/stock-on-hand?to=${toDate}`}"
                v-else-if="data.value == 'Closing Stock'"
              >
                {{ data.value }}
              </b-button>
              <span
                v-else-if="data.item.isAccount && !data.item.groupAcccode"
              >
                {{ data.value }}
              </span>
              <b-button
                size="sm"
                variant="link"
                class="p-0"
                :to="{path: `/ledger/${data.item.groupAcccode}`}"
                v-else-if="data.item.isAccount"
              >
                {{ data.value }}
              </b-button>
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                }"
                v-else
              >
                {{ data.value }}
              </span>
            </div>
          </template>
          <template #cell(isGroup)="data">
            <span
              :class="{
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              {{ data.value ? data.item.amount : '' }}
            </span>
          </template>
          <template #cell(isSubGroup)="data">
            <span
              :class="{
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              {{ data.value ? data.item.amount : '' }}
            </span>
          </template>
          <template #cell(isAccount)="data">
            <span
              :class="{
                'font-weight-bold': data.item.isGroup,
                'font-italic': data.item.isAccount,
              }"
            >
              {{ data.value ? data.item.amount : '' }}
            </span>
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
import GkFileDownload from '@/components/GkFileDownload.vue';
export default {
  components: { GkDate, GkFileDownload, ReportHeader },
  name: 'BalanceSheet',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      fromDate: null,
      toDate: null,
      hideZero: true,
      selected: {},
      tableFields: [
        {
          key: 'groupAccname',
          label: 'Accounts',
          class: 'text-break',
          thStyle: { width: '46%' },
        },
        {
          key: 'isAccount',
          label: '',
          class: 'text-break text-right',
          thStyle: { width: '18%' },
        },
        {
          key: 'isSubGroup',
          label: '',
          class: 'text-break text-right',
          thStyle: { width: '18%' },
        },
        {
          key: 'isGroup',
          label: '',
          class: 'text-break text-right',
          thStyle: { width: '18%' },
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
  computed: {
    minTableHeight: (self) => {
      let height = 300;
      let bsheet = self.bsheet;
      if (bsheet.left.length && bsheet.right.length) {
        height =
          bsheet.left.length < bsheet.right.length
            ? bsheet.left.length
            : bsheet.right.length;
        height *= 26;
      }
      return height;
    },
    downloadUrl: (self) => {
      let orgChoice = (localStorage.getItem('orgChoice') || '').split(' (');
      let orgType = '';
      if (orgChoice.length) {
        orgType = orgChoice[orgChoice.length - 1].split(')')[0];
      } else {
        orgType = 'Organisation';
      }
      return `/spreadsheet/balance-sheet?calculateto=${self.selected.toDate}&calculatefrom=${self.selected.fromDate}&fystart=${self.yearStart}&orgname=${self.orgName}&fyend=${self.yearEnd}&orgtype=${orgType}&baltype=1`;
    },
    downloadFileName: (self) =>
      `Balance_Sheet_${self.fromDate}_to_${self.toDate}`,
    hideZeroFilter: (self) => (self.hideZero ? 'a' : null),
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
  methods: {
    clear() {
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      this.hideZero = false;
      this.getReport();
    },
    reportName() {
      return this.orgType == "Profit Making" ? "Balance Sheet Statement" : "Statement of Affairs"
    },
    filterTable(list, item) {
      let show = true;
      if (this.hideZeroFilter) {
        show = !(item.amount === '0.00' || item.amount === '0');
      }
      if (item.parent >= 0) {
        let parent = list[item.parent];
        if (parent.parent >= 0) {
          let grandparent = list[parent.parent];
          if (!grandparent.isOpen) {
            show = show && grandparent.isOpen;
          } else {
            show = show && parent.isOpen;
          }
        } else {
          show = show && parent.isOpen;
        }
      }
      return show;
    },
    filterLeftTable(item) {
      return this.filterTable(this.bsheet.left, item);
    },
    filterRightTable(item) {
      return this.filterTable(this.bsheet.right, item);
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
        let parentIndex = map[parent] >= 0 ? map[parent] : -1;
        if (!isAccount) {
          map[item.groupAcccode] = index;
          if (isGroup) parentIndex = -1;
        }
        if (parentIndex >= 0) {
          result[parentIndex].hasChildren = true;
        }
        result.push(
          Object.assign(
            {
              isOpen: !isSubGroup,
              parent: parentIndex,
              isGroup,
              isSubGroup,
              isAccount,
              hasChildren: false,
            },
            report[index]
          )
        );
      });
      return result;
    },
    getReport() {
      this.isLoading = true;
      this.$axios
        .get(
          `/reports/balance-sheet?calculateto=${this.toDate}&baltype=1&calculatefrom=${this.fromDate}`
        )
        .then((resp) => {
          resp.leftlist.shift();
          resp.rightlist.shift();
          this.bsheet = {
            left: this.formatReport(resp.leftlist),
            right: this.formatReport(resp.rightlist),
          };
          this.isLoading = false;
          this.selected = {
            fromDate: this.fromDate,
            toDate: this.toDate,
          };
        })
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
