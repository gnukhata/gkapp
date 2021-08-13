<template>
  <section class="m-2">
    <h3 class="text-center">Accounts</h3>
    <hr class="mt-1" />

    <b-card body-class="py-2">
      <div v-b-toggle="'search-bar'" :class="{ 'mb-3': showSearchBar }">
        <h6 class="d-inline-block">Search By</h6>
        <b-icon
          class="float-right"
          font-scale="0.7"
          :icon="showSearchBar ? 'dash' : 'arrows-fullscreen'"
        ></b-icon>
      </div>
      <b-collapse v-model="showSearchBar" id="search-bar">
        <b-row>
          <b-col class="px-1" cols="12" md="4">
            <b-form-group
              label-for="search-by-group"
              label="Group"
              label-class="label-on-input"
            >
              <autocomplete
                id="search-by-group"
                v-model="searchBy.group"
                :options="options.groups"
                placeholder=""
              ></autocomplete>
            </b-form-group>
          </b-col>
          <b-col class="px-1" cols="12" md="4">
            <b-form-group
              label-for="search-by-sub-group"
              label="Sub Group"
              label-class="label-on-input"
            >
              <autocomplete
                id="search-by-sub-group"
                v-model="searchBy.subGroup"
                :options="subGroups"
                placeholder=""
                @input="openSearchedCard(!!searchBy.subGroup, null)"
              ></autocomplete>
            </b-form-group>
          </b-col>
          <b-col class="px-1" cols="12" md="4">
            <b-form-group
              label-for="search-by-account"
              label="Account"
              label-class="label-on-input"
            >
              <autocomplete
                id="search-by-account"
                v-model="searchBy.account"
                :options="accounts"
                placeholder=""
                @input="openSearchedCard(null, !!searchBy.account)"
              ></autocomplete>
            </b-form-group>
          </b-col>
        </b-row>
      </b-collapse>
    </b-card>

    <u><small class="ml-2">Groups</small></u>
    <b-container fluid>
      <b-row>
        <b-col
          cols="12"
          :lg="gdata.open ? 8 : 4"
          v-for="(gdata, gname) in options.accData"
          :key="gdata.id"
          class="p-1 "
        >
          <b-card body-class="p-2 bg-dark-grey" class="shadow-sm">
            <div class="acc-card-header" v-b-toggle="`g-${gdata.id}`">
              <h4 class="d-inline-block">{{ gname }}</h4>
              <b-icon
                class="float-right"
                font-scale="0.7"
                :icon="gdata.open ? 'dash' : 'arrows-fullscreen'"
              ></b-icon>
            </div>
            <div v-if="!gdata.open">
              <small>Sub-Groups: {{ gdata.subCount }}</small> <br />
              <small>Accounts: {{ gdata.accCount }}</small>
            </div>
            <b-collapse :id="`g-${gdata.id}`" v-model="gdata.open">
              <u>
                <small>Sub-Groups: {{ gdata.subCount }}</small>
              </u>
              <b-container class="mt-1" fluid>
                <b-row>
                  <b-col
                    cols="12"
                    :md="sgdata.open ? 12 : 6"
                    class="p-1"
                    v-for="(sgdata, sgname) in gdata.subGroups"
                    :key="sgdata.id"
                  >
                    <b-card body-class="p-2 bg-light-grey" class="shadow-sm">
                      <div
                        class="acc-card-header"
                        v-b-toggle="`sg-${sgdata.id}`"
                      >
                        <h5 class="d-inline-block">{{ sgname }}</h5>
                        <b-icon
                          class="float-right"
                          font-scale="0.7"
                          :icon="sgdata.open ? 'dash' : 'arrows-fullscreen'"
                        ></b-icon>
                      </div>
                      <br />
                      <u>
                        <small>Accounts: {{ sgdata.accCount }}</small>
                      </u>
                      <b-button
                        class="ml-2 py-0 px-1"
                        variant="success"
                        size="sm"
                        @click.prevent="onCreateAccount(gdata.id, sgdata.id)"
                        >+</b-button
                      >
                      <b-collapse
                        :id="`sg-${sgdata.id}`"
                        class="mt-2"
                        v-model="sgdata.open"
                      >
                        <b-container
                          fluid
                          style="max-height: 150px; overflow: auto"
                        >
                          <b-row>
                            <b-col
                              cols="12"
                              :md="sgdata.open ? 4 : 12"
                              class="px-1"
                              v-for="(accData, accId) in sgdata.accounts"
                              :key="accId"
                            >
                              <b-card
                                :id="`acc-${accId}`"
                                class="my-1"
                                body-class="p-2"
                              >
                                {{ accData.name }}
                                <div class="d-inline-block float-right">
                                  <b-button
                                    v-if="accData.sysFlag === 0"
                                    size="sm"
                                    variant="danger"
                                    class="pt-0"
                                    @click.prevent="
                                      confirmOnDelete(accData, sgdata.id)
                                    "
                                  >
                                    <b-icon
                                      font-scale="0.9"
                                      icon="trash-fill"
                                    ></b-icon>
                                  </b-button>
                                  <b-button
                                    size="sm"
                                    variant="primary"
                                    class="pt-0 mx-1"
                                    @click.prevent="
                                      onEditAccount(
                                        gdata.id,
                                        sgdata.id,
                                        accId,
                                        accData.sysFlag
                                      )
                                    "
                                  >
                                    <b-icon
                                      class="font-bold"
                                      font-scale="0.8"
                                      icon="pencil-fill"
                                    ></b-icon>
                                  </b-button>
                                </div>
                                <br />
                                ₹ {{ accData.openingBal }}
                              </b-card>
                            </b-col>
                          </b-row>
                        </b-container>
                      </b-collapse>
                    </b-card>
                  </b-col>
                </b-row>
              </b-container>
            </b-collapse>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
export default {
  name: 'Accounts',
  components: { Autocomplete },
  props: {
    acc: {
      type: [Number, String],
      required: true,
    },
    group: {
      type: [Number, String],
      required: true,
    },
    subGroup: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      searchBy: {
        group: null,
        subGroup: null,
        account: null,
      },
      showSearchBar: false,
      showAccountForm: false,
      tableHeight: window.innerHeight - 175,
      searchText: '',
      accountMode: 'create',
      accountId: -1,
      isSysAccount: false,
      tableFields: [
        { key: 'index', label: 'No', thStyle: { width: '45px' } },
        { key: 'account', sortable: true },
        { key: 'group', sortable: true },
        { key: 'subGroup', sortable: true },
        { key: 'defaultFor', class: 'd-none d-sm-table-cell' },
        {
          key: 'options',
          label: 'Options',
          thClass: 'options-col',
        },
      ],
      options: {
        accounts: [],
        groups: [],
        subGroups: [],
        accData: {},
        groupIdToName: {},
      },
      loading: false,
    };
  },
  computed: {
    accounts: (self) => {
      let subGroup = self.searchBy.subGroup;
      let group = self.searchBy.group;
      let res = [];
      if (subGroup) {
        res = self.options.accounts.filter((sg) => sg.subGroup === subGroup);
      } else if (group) {
        res = self.options.accounts.filter((g) => g.group === group);
      } else {
        res = self.options.accounts;
      }
      return res;
    },
    subGroups: (self) => {
      let group = self.searchBy.group;
      let res = [];
      if (group) {
        res = self.options.subGroups.filter((sg) => sg.group === group);
      } else {
        res = self.options.subGroups;
      }
      return res;
    },
  },
  methods: {
    onCreateAccount(gid, sgid) {
      this.updateUrl(gid, sgid, -1);
      this.$router.push({
        name: 'Create_Account',
        params: { group: gid, subGroup: sgid },
      });
    },
    onEditAccount(gid, sgid, accId, isSys) {
      this.updateUrl(gid, sgid, accId);
      this.$router.push({
        name: 'Edit_Account',
        params: { id: accId, sysFlag: isSys },
      });
    },
    deleteAccount(accountId, accountName, custId, custName, isCustomer) {
      if (!accountId) return;
      return axios
        .delete('/accounts', {
          data: {
            accountcode: accountId,
          },
        })
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            if (custId) {
              axios
                .delete('/customersupplier', {
                  data: {
                    custid: custId,
                  },
                })
                .then((resp2) => {
                  let custType = isCustomer ? 'customer' : 'supplier';
                  if (resp2.data.gkstatus !== 0) {
                    this.$bvToast.toast(
                      `Delete ${custType} ${custName} Failed!`,
                      {
                        variant: 'danger',
                        solid: true,
                      }
                    );
                    return;
                  }
                  let custLog = {
                    activity: `${custName} ${custType} deleted.`,
                  };
                  axios.post('/log', custLog);
                  this.$bvToast.toast(
                    `Delete ${custType} ${custName} Success!`,
                    {
                      variant: 'success',
                      solid: true,
                    }
                  );
                });
            }
            let log = { activity: `${accountName} account deleted.` };
            axios.post('/log', log);
            this.$bvToast.toast(`Delete account ${accountName} Success!`, {
              variant: 'success',
              solid: true,
            });
            return resp.data.gkstatus;
          } else {
            this.$bvToast.toast(`Delete Account: ${accountName} Failed!`, {
              variant: 'danger',
              solid: true,
            });
          }
        });
    },
    getCust(groupCode, account) {
      return axios.get('/groupsubgroups?groupflatlist').then((resp) => {
        if (resp.data.gkstatus !== 0) {
          return null;
        }
        let debtGroupCode = resp.data.gkresult['Sundry Debtors'],
          credGroupCode = resp.data.gkresult['Sundry Creditors for Purchase'];
        if (debtGroupCode === groupCode || credGroupCode === groupCode) {
          let custType = debtGroupCode === groupCode ? 'custall' : 'supall';
          return axios
            .get(`/customersupplier?qty=${custType}`)
            .then((resp2) => {
              if (resp2.data.gkstatus === 0) {
                let cust = resp2.data.gkresult.find(
                  (cust) => cust.custname === account
                );
                if (cust) {
                  cust.isCustomer = debtGroupCode === groupCode;
                }
                return cust;
              }
              return null;
            });
        } else {
          return null;
        }
      });
    },
    confirmOnDelete(accDetails, subGroupCode) {
      this.getCust(subGroupCode, accDetails.name).then((cust) => {
        const self = this;
        let text = `Delete Account <b>${accDetails.name}</b> ?`;
        if (cust) {
          text += ` This will also delete the ${
            cust.isCustomer ? 'Customer' : 'Supplier'
          } <b>${cust.custname}.</b> Do you want to proceed?`;
        } else {
          cust = {};
        }
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
            // bodyClass: 'p-2',
            centered: true,
          })
          .then((val) => {
            if (val) {
              self
                .deleteAccount(
                  accDetails.id,
                  accDetails.name,
                  cust.custid,
                  cust.custname,
                  cust.isCustomer
                )
                .then((status) => {
                  if (status === 0) {
                    self.getAccountsList();
                  }
                });
            }
          });
      });
    },
    /* Fetch all accounts */
    getAccountsList() {
      this.loading = true;
      return axios
        .get(`/accounts`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let accData = {};
            let idToName = {};
            let emptySGCounter = 0;
            let groups = [],
              accounts = [],
              subGroups = [];
            resp.data.gkresult.forEach((acc) => {
              if (!accData[acc.groupname]) {
                accData[acc.groupname] = {
                  subGroups: {},
                  subCount: 0,
                  accCount: 0,
                  id: acc.groupcode,
                  open: false,
                };
                idToName[acc.groupcode] = acc.groupname;
                groups.push({
                  text: acc.groupname,
                  value: acc.groupcode,
                });
              }
              let group = accData[acc.groupname];
              if (!group.subGroups[acc.subgroupname]) {
                let sgId = acc.subgroupcode || `-${++emptySGCounter}`;
                group.subGroups[acc.subgroupname] = {
                  accounts: {},
                  accCount: 0,
                  id: sgId,
                  open: false,
                };
                group.subCount++;
                idToName[sgId] = acc.subgroupname;
                if (acc.subgroupname) {
                  subGroups.push({
                    text: acc.subgroupname,
                    value: sgId,
                    group: acc.groupcode,
                  });
                }
              }
              let subGroup = group.subGroups[acc.subgroupname];
              subGroup.accounts[acc.accountcode] = {
                name: acc.accountname,
                sysFlag: acc.sysaccount,
                defaultFlag: acc.defaultflag,
                openingBal: acc.openingbal,
              };
              accounts.push({
                text: acc.accountname,
                value: acc.accountcode,
                group: acc.groupcode,
                subGroup: group.subGroups[acc.subgroupname].id,
              });
              subGroup.accCount++;
              group.accCount++;
            });

            this.options.accData = accData;
            this.options.groupIdToName = idToName;
            this.options.accounts = accounts;
            this.options.groups = groups;
            this.options.subGroups = subGroups;
          } else {
            this.$bvToast.toast('Failed to fetch Accounts', {
              variant: 'danger',
              solid: true,
            });
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
    /** Update the URL based on the group and subgroup open last */
    updateUrl(gid, sgid, aid) {
      let url = window.location.href.split('#')[0];
      url += `#/accounts/${gid}/${sgid}/${aid}`;
      history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
      // instead of creating a new history instances for every entity selected
    },
    closeAllCards() {
      const acc = this.options.accData;
      this.options.groups.forEach((group) => {
        if (acc[group.text]) {
          acc[group.text].open = false;
        }
      });
    },
    openCard(groupId, subGroupId, accId) {
      const self = this;
      const acc = self.options.accData;
      const idToName = self.options.groupIdToName;
      let gname = idToName[groupId];
      let sgname = idToName[subGroupId];
      if (acc[gname]) {
        acc[gname].open = true;
        if (acc[gname].subGroups[sgname]) {
          acc[gname].subGroups[sgname].open = true;
        }
      }
      this.$forceUpdate();
      this.$nextTick().then(() => {
        let openDom = document.getElementById(`g-${groupId}`);
        if (acc[gname]) {
          if (acc[gname].subGroups[sgname]) {
            openDom = document.getElementById(`sg-${subGroupId}`);
            if (accId) {
              if (acc[gname].subGroups[sgname].accounts[accId]) {
                openDom = document.getElementById(`acc-${accId}`);
              }
            }
          }
        }
        if (openDom) {
          window.setTimeout(() => {
            openDom.scrollIntoView({ block: 'center', inline: 'nearest' });
          }, 500);
        }
      });
    },
    openSearchedCard(subGroupFlag, accountFlag) {
      if (!(subGroupFlag || accountFlag)) {
        return;
      }
      let accCode = this.searchBy.account;
      let sgCode = this.searchBy.subGroup;
      if (accountFlag && accCode) {
        let account = this.accounts.filter((acc) => acc.value === accCode)[0];
        if (account) {
          this.closeAllCards();
          this.openCard(account.group, account.subGroup, accCode);
        }
      } else if (subGroupFlag && sgCode) {
        let subGroup = this.subGroups.filter((sg) => sg.value === sgCode)[0];
        if (subGroup) {
          this.closeAllCards();
          this.openCard(subGroup.group, sgCode);
        }
      }
    },
  },
  mounted() {
    const self = this;
    this.getAccountsList().then(() => {
      // open the group and subgroup from URL
      if (self.group) {
        self.openCard(self.group, self.subGroup, self.acc);
      }
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
