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
      <div class="row mt-4 ml-2 mr-2 text-small">
        <div class="col">
          <b-table-lite
            small
            bordered
            sticky-header=""
            :items="bsheet.left"
            :fields="['name', 'amount']"
            head-variant="dark"
            v-if="bsheet.left.length"
            class="text-small table-border-dark"
          >
            <template #cell(name)="data">
              {{ data.value }}
              <div
                class="ml-3"
                v-for="(sg, id) in data.item.subGroups"
                :key="id"
              >
                {{ sg ? sg.name : '' }}
                <div
                  class="ml-3"
                  v-for="(acc, accid) in sg.accounts"
                  :key="accid"
                >
                  {{ acc.name }}
                </div>
              </div>
            </template>
            <template #cell(amount)="data">
              <div class="text-right">{{ data.value }}</div>
              <div
                class="mr-3 text-right"
                v-for="(sg, id) in data.item.subGroups"
                :key="id"
              >
                {{ sg ? sg.amount : '' }}
                <div
                  class="mr-3"
                  v-for="(acc, accid) in sg.accounts"
                  :key="accid"
                >
                  {{ acc.amount }}
                </div>
              </div>
            </template>
          </b-table-lite>
        </div>
        <div class="col">
          <b-table-lite
            small
            bordered
            sticky-header=""
            :items="bsheet.right"
            :fields="['name', 'amount']"
            head-variant="dark"
            v-if="bsheet.right.length"
            class="text-small table-border-dark"
          >
            <template #cell(name)="data">
              {{ data.value }}
              <div
                class="ml-3"
                v-for="(sg, id) in data.item.subGroups"
                :key="id"
              >
                {{ sg ? sg.name : '' }}
                <div
                  class="ml-3"
                  v-for="(acc, accid) in sg.accounts"
                  :key="accid"
                >
                  {{ acc.name }}
                </div>
              </div>
            </template>
            <template #cell(amount)="data">
              <div class="text-right">{{ data.value }}</div>
              <div
                class="mr-3 text-right"
                v-for="(sg, id) in data.item.subGroups"
                :key="id"
              >
                {{ sg ? sg.amount : '' }}
                <div
                  class="mr-3"
                  v-for="(acc, accid) in sg.accounts"
                  :key="accid"
                >
                  {{ acc.amount }}
                </div>
              </div>
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
                });
                groupIndex[id] = data.length - 1;
              } else {
                // the item is a subgroup
                let index = groupIndex[item.subgroupof];
                let group = data[index];
                let id = item.groupAcccode;
                group.subGroups[id] = {
                  name: item.groupAccname,
                  id: id,
                  amount: item.amount,
                  accounts: {},
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
</style>
