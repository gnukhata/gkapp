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
        <b-button class="px-1" variant="link" @click="printPage">
          <b-icon class="align-middle" icon="printer"></b-icon>
        </b-button>
        <b-button class="px-1" variant="link" @click="toggleAllRows">
          <b-icon
            class="align-middle"
            font-scale="0.9"
            :icon="openAllFlag ? 'dash' : 'arrows-fullscreen'"
          ></b-icon>
        </b-button>
      </div>
      <br class="d-print-none" />
      <br class="d-print-none" />
      <div class="row pl-2 pr-2 text-small">
        <div class="col">
          <b-table-lite
            striped
            small
            bordered
            :items="bsheet.left"
            :fields="[
              {
                key: 'name',
                label: 'Capital and Liabilities',
                class: 'p-0',
                thClass: 'p-1',
              },
              {
                key: 'amount',
                label: 'Amount',
                class: 'p-0 pr-1',
                thClass: 'text-right p-1',
              },
            ]"
            head-variant="dark"
            v-if="bsheet.left.length"
            class="text-small table-border-dark"
          >
            <template #cell(name)="data">
              <div
                class="bs-group bs-row pl-1"
                :style="{ 'min-height': '21px' }"
                v-b-toggle="
                  data.item.sgLength || data.item.accLength
                    ? `g-${data.item.id}`
                    : null
                "
              >
                <b-icon
                  v-if="data.item.sgLength || data.item.accLength"
                  class="d-print-none"
                  font-scale="0.7"
                  :icon="data.item.open ? 'dash' : 'arrows-fullscreen'"
                ></b-icon>
                <span class="ml-1">
                  {{ data.value }}
                </span>
              </div>
              <b-collapse :id="`g-${data.item.id}`" v-model="data.item.open">
                <div
                  class="pl-5 bs-account bs-row font-italic"
                  v-for="(acc, accid) in data.item.accounts"
                  :key="accid"
                >
                  {{ acc.name }}
                </div>
                <div v-for="(sg, id) in data.item.subGroups" :key="id">
                  <div
                    class="pl-3 bs-sub-group bs-row"
                    v-b-toggle="sg.accLength ? `sg-${sg.id}` : null"
                  >
                    <b-icon
                      class="d-print-none"
                      font-scale="0.7"
                      :icon="
                        sg.accLength
                          ? sg.open
                            ? 'dash'
                            : 'arrows-fullscreen'
                          : ''
                      "
                    ></b-icon>
                    <span class="ml-1">
                      {{ sg ? sg.name : '' }}
                    </span>
                  </div>
                  <b-collapse v-model="sg.open" :id="`sg-${sg.id}`">
                    <div
                      class="pl-5 bs-account bs-row font-italic"
                      v-for="(acc, accid) in sg.accounts"
                      :key="accid"
                    >
                      {{ acc.name }}
                    </div>
                  </b-collapse>
                </div>
              </b-collapse>
            </template>
            <template #cell(amount)="data">
              <div class="text-right bs-row">{{ data.value }}</div>
              <b-collapse v-model="data.item.open">
                <div
                  class="text-right"
                  v-for="(sg, id) in data.item.subGroups"
                  :key="id"
                >
                  <div class="bs-row">{{ sg ? sg.amount : '' }}</div>
                  <b-collapse v-model="sg.open">
                    <div
                      class="bs-row font-italic"
                      v-for="(acc, accid) in sg.accounts"
                      :key="accid"
                    >
                      {{ acc.amount }}
                    </div>
                  </b-collapse>
                </div>
              </b-collapse>
            </template>
          </b-table-lite>
        </div>
        <div class="col">
          <b-table-lite
            striped
            small
            bordered
            :items="bsheet.right"
            :fields="[
              {
                key: 'name',
                label: 'Property and Assets',
                class: 'p-0',
                thClass: 'p-1',
              },
              {
                key: 'amount',
                label: 'Amount',
                class: 'p-0 pr-1',
                thClass: 'text-right p-1',
              },
            ]"
            head-variant="dark"
            v-if="bsheet.right.length"
            class="text-small table-border-dark"
          >
            <template #cell(name)="data">
              <div
                class="bs-group bs-row pl-1"
                :style="{ 'min-height': '21px' }"
                v-b-toggle="
                  data.item.sgLength || data.item.accLength
                    ? `g-${data.item.id}`
                    : null
                "
              >
                <b-icon
                  v-if="data.item.sgLength || data.item.accLength"
                  class="d-print-none"
                  font-scale="0.7"
                  :icon="data.item.open ? 'dash' : 'arrows-fullscreen'"
                ></b-icon>
                <span class="ml-1">
                  {{ data.value }}
                </span>
              </div>
              <b-collapse :id="`g-${data.item.id}`" v-model="data.item.open">
                <div
                  class="pl-5 bs-account bs-row font-italic"
                  v-for="(acc, accid) in data.item.accounts"
                  :key="accid"
                >
                  {{ acc.name }}
                </div>
                <div v-for="(sg, id) in data.item.subGroups" :key="id">
                  <div
                    class="pl-3 bs-sub-group bs-row"
                    v-b-toggle="sg.accLength ? `sg-${sg.id}` : null"
                  >
                    <b-icon
                      class="d-print-none"
                      font-scale="0.7"
                      :icon="
                        sg.accLength
                          ? sg.open
                            ? 'dash'
                            : 'arrows-fullscreen'
                          : ''
                      "
                    ></b-icon>
                    <span class="ml-1">
                      {{ sg ? sg.name : '' }}
                    </span>
                  </div>
                  <b-collapse v-model="sg.open" :id="`sg-${sg.id}`">
                    <div
                      class="pl-5 bs-account bs-row font-italic"
                      v-for="(acc, accid) in sg.accounts"
                      :key="accid"
                    >
                      {{ acc.name }}
                    </div>
                  </b-collapse>
                </div>
              </b-collapse>
            </template>
            <template #cell(amount)="data">
              <div class="text-right bs-row">{{ data.value }}</div>
              <b-collapse v-model="data.item.open">
                <div
                  class="text-right"
                  v-for="(sg, id) in data.item.subGroups"
                  :key="id"
                >
                  <div class="bs-row">{{ sg ? sg.amount : '' }}</div>
                  <b-collapse v-model="sg.open">
                    <div
                      class="bs-row font-italic"
                      v-for="(acc, accid) in sg.accounts"
                      :key="accid"
                    >
                      {{ acc.amount }}
                    </div>
                  </b-collapse>
                </div>
              </b-collapse>
            </template>
          </b-table-lite>
        </div>
      </div>
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
      openAllFlag: false,
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
    printPage() {
      window.print();
    },
    toggleAllRows() {
      this.openAllFlag = !this.openAllFlag;
      let open = this.openAllFlag;
      if (this.bsheet.left.length) {
        this.bsheet.left.forEach((g) => {
          g.open = open;
          for (const sg in g.subGroups) {
            g.subGroups[sg].open = open;
          }
        });
      }
      if (this.bsheet.right.length) {
        this.bsheet.right.forEach((g) => {
          g.open = open;
          for (const sg in g.subGroups) {
            g.subGroups[sg].open = open;
          }
        });
      }
    },
    /**
     * formatReport
     *
     * Must send leftlist and rightlist separately as input, and will return a formatted object.
     */
    formatReport(report) {
      let data = [];
      let groupIndex = {};
      let counter = 0;

      // groupAccflag -> denotes if the account is under a subgroup or directly under a group

      report.forEach((item) => {
        switch (item.groupAccflag) {
          case 1:
            {
              // item is a direct account of a group
              let index = groupIndex[item.accountof];
              let group = data[index];
              let id = item.groupAcccode;
              group.accLength++;
              group.accounts[id] = {
                name: item.groupAccname,
                id: id,
                amount: item.amount,
              };
            }
            break;
          case 2:
            {
              // item is an account under a sub group
              let id = item.groupAcccode;
              let index = groupIndex[item.subgroupof];
              let sgid = item.accountof;
              let subGroup = data[index].subGroups[sgid];
              if (!id) {
                // some total are listed as accounts for display purposes
                data[index].accounts[counter++] = {
                  name: item.groupAccname,
                  amount: item.amount,
                };
                break;
              }
              subGroup.accLength++;
              subGroup.accounts[id] = {
                name: item.groupAccname,
                id: id,
                amount: item.amount,
              };
            }
            break;
          default: {
            if (!data[item.groupAcccode]) {
              if (!item.subgroupof) {
                // the item is a group
                let id = item.groupAcccode || counter++;
                data.push({
                  name: item.groupAccname,
                  amount: item.amount,
                  id: id,
                  subGroups: {},
                  accounts: {},
                  open: false,
                  sgLength: 0,
                  accLength: 0,
                });
                groupIndex[id] = data.length - 1;
              } else {
                // the item is a subgroup
                let index = groupIndex[item.subgroupof];
                let group = data[index];
                let id = item.groupAcccode;
                group.sgLength++;
                group.subGroups[id] = {
                  name: item.groupAccname,
                  id: id,
                  amount: item.amount,
                  accounts: {},
                  open: false,
                  accLength: 0,
                };
              }
            }
          }
        }
      });
      return { data, groupIndex };
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
                  // if (report.leftlist.length < report.rightlist.length) {
                  //   let patchLength =
                  //     report.rightlist.length - report.leftlist.length - 1;
                  //   let lastVal = report.leftlist.pop();
                  //   while (patchLength--) {
                  //     report.leftlist.push({
                  //       groupAccname: '',
                  //       amount: '',
                  //       groupAcccode: '',
                  //       subgroupof: '',
                  //       accountof: '',
                  //       groupAccflag: '',
                  //       advflag: '',
                  //     });
                  //   }
                  //   report.leftlist.push(lastVal);
                  // } else {
                  //   let patchLength =
                  //     report.leftlist.length - report.rightlist.length - 1;
                  //   let lastVal = report.rightlist.pop();
                  //   while (patchLength--) {
                  //     report.rightlist.push({
                  //       groupAccname: '',
                  //       amount: '',
                  //       groupAcccode: '',
                  //       subgroupof: '',
                  //       accountof: '',
                  //       groupAccflag: '',
                  //       advflag: '',
                  //     });
                  //   }
                  //   report.rightlist.push(lastVal);
                  // }
                  let left = self.formatReport(report.leftlist);
                  let right = self.formatReport(report.rightlist);
                  self.bsheet = {
                    left: left.data,
                    right: right.data,
                  };
                  self.options.groupIndex = {
                    left: left.groupIndex,
                    right: right.groupIndex,
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
/* .bs-row {
  border-bottom: 1px solid black;
}
td > .bs-row:last-child {
  border-bottom: unset;
} */

.bs-group {
}
.bs-sub-group {
}
.bs-account {
}
</style>
