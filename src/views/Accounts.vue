<template>
  <section class="m-2">
    <h3 class="text-center">Accounts</h3>
    <hr class="mt-1" />

    <u><small class="ml-2">Groups</small></u>
    <b-container fluid>
      <b-row>
        <b-col
          cols="12"
          :md="gdata.open ? 8 : 4"
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
                                </div>
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
import { debounceEvent } from '../js/utils';
export default {
  name: 'Accounts',
  components: {},
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
        accData: {},
        groupIdToName: {},
      },
      loading: false,
    };
  },
  computed: {},
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
              }
              let subGroup = group.subGroups[acc.subgroupname];
              subGroup.accounts[acc.accountcode] = {
                name: acc.accountname,
                sysFlag: acc.sysaccount,
                defaultFlag: acc.defaultflag,
              };
              subGroup.accCount++;
              group.accCount++;
            });

            this.options.accData = accData;
            this.options.groupIdToName = idToName;
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
  },
  mounted() {
    const self = this;
    this.getAccountsList().then(() => {
      // open the group and subgroup from URL
      if (self.group) {
        const idToName = self.options.groupIdToName;
        const acc = self.options.accData;
        let gname = idToName[self.group];
        let sgname = idToName[self.subGroup];
        let accId = self.acc;
        if (acc[gname]) {
          acc[gname].open = true;
          if (acc[gname].subGroups[sgname]) {
            acc[gname].subGroups[sgname].open = true;
          }
        }
        self.$forceUpdate();
        self.$nextTick().then(() => {
          let openDom = document.getElementById(`g-${self.group}`);
          if (acc[gname]) {
            if (acc[gname].subGroups[sgname]) {
              openDom = document.getElementById(`sg-${self.subGroup}`);
              if (accId) {
                if (acc[gname].subGroups[sgname].accounts[accId]) {
                  openDom = document.getElementById(`acc-${accId}`);
                }
              }
            }
          }
          window.setTimeout(() => {
            openDom.scrollIntoView(true);
          }, 500)
        });
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
