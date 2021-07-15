<template>
  <section class="m-2">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <b-button
          variant="warning"
          size="sm"
          :to="{
            name: 'Create_Account',
          }"
        >
          <b-icon icon="files-alt"></b-icon> Add Account
        </b-button>
      </template>
      <b-form-input
        size="sm"
        type="text"
        placeholder="Search Accounts"
        v-model="searchText"
      ></b-form-input>
    </b-input-group>

    <b-table
      :filter="searchText"
      :items="options.accounts"
      :fields="tableFields"
      striped
      sort-direction="asc"
      head-variant="dark"
      class="mx-auto"
      :sticky-header="`${tableHeight}px`"
      outlined
      small
      fixed
      :busy="loading"
      tbody-tr-class="text-break"
      details-td-class="d-md-none"
    >
      <template #cell(index)="data">
        {{ data.index + 1 }}
      </template>
      <template #cell(options)="data">
        <b-button
          v-if="data.item.defaultFor"
          size="sm"
          @click="data.toggleDetails"
          class="d-md-none px-2 py-0"
        >
          {{ data.item._showDetails ? '-' : '+' }}
        </b-button>
        <br class="d-md-none" v-if="data.item.defaultFor" />
        <b-button
          size="sm"
          variant="primary"
          class="mb-1 mb-md-0 mx-md-1 pt-0"
          :to="{
            name: 'Edit_Account',
            params: {
              id: data.item.accountCode,
              sysFlag: data.item.sysAccount,
            },
          }"
        >
          <b-icon font-scale="0.8" icon="pencil"></b-icon> </b-button
        ><br class="d-md-none" />
        <b-button
          v-if="!data.item.sysAccount"
          size="sm"
          variant="danger"
          class="pt-0"
          @click.prevent="confirmOnDelete(data.item)"
        >
          <b-icon font-scale="0.9" icon="trash"></b-icon>
        </b-button>
      </template>
      <template #row-details="row">
        <b-container fluid>
          <b-row class="mb-2">
            <b-col cols="5" class="text-sm-right"
              ><b>Default A/C For:</b></b-col
            >
            <b-col>{{ row.item.defaultFor }}</b-col>
          </b-row>
        </b-container>
      </template>
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching Accounts... </strong>
        </div>
      </template>
    </b-table>
    <b-modal
      size="lg"
      v-model="showAccountForm"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <account
        :hideBackButton="true"
        :mode="accountMode"
        :accountId="accountId"
        :isSysAccount="isSysAccount"
        :inOverlay="true"
        :onSave="() => {}"
        :overlayOpen="showAccountForm"
        @account-created="onAccountCreated"
        @account-edited="onAccountEdited"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click.prevent="
              () => {
                showAccountForm = false;
              }
            "
            >x</b-button
          >
        </template>
      </account>
    </b-modal>
  </section>
</template>

<script>
import axios from 'axios';
import { debounceEvent } from '../js/utils';
import Account from '../components/form/Account.vue';
export default {
  name: 'Accounts',
  components: { Account },
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
      },
      loading: false,
    };
  },
  computed: {},
  methods: {
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
    confirmOnDelete(accDetails) {
      this.getCust(accDetails.subGroupCode, accDetails.account).then((cust) => {
        const self = this;
        let text = `Delete Account <b>${accDetails.account}</b> ?`;
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
                  accDetails.accountCode,
                  accDetails.account,
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
    onEditAccount(id, isSysAccount) {
      this.accountMode = 'edit';
      this.accountId = id;
      this.showAccountForm = true;
      this.isSysAccount = !!isSysAccount;
    },
    onCreateAccount() {
      this.accountMode = 'create';
      this.accountId = -1;
      this.showAccountForm = true;
    },
    onAccountCreated() {
      this.showAccountForm = false;
      this.getAccountsList();
    },
    onAccountEdited() {
      this.getAccountsList();
    },
    /* Fetch all accounts */
    getAccountsList() {
      this.loading = true;
      axios
        .get(`/accounts`)
        .then((r) => {
          if (r.data.gkstatus === 0) {
            this.options.accounts = r.data.gkresult.map((acc) => {
              return {
                account: acc.accountname,
                accountCode: acc.accountcode,
                group: acc.groupname,
                groupCode: acc.groupcode,
                subGroup: acc.subgroupname,
                subGroupCode: acc.subgroupcode,
                defaultFor: acc.defaultflag,
                sysAccount: acc.sysaccount,
                _showDetails: !!acc.defaultflag,
              };
            });
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
    onResize() {
      if (window.innerWidth > 576) {
        if (this.tableFields.length === 5) {
          this.tableFields.splice(4, 0, {
            key: 'defaultFor',
          });
        }
      } else if (this.tableFields.length === 6) {
        this.tableFields.splice(4, 1);
      }
    },
  },
  mounted() {
    this.getAccountsList();
    this.onResize();
    debounceEvent(window, 'resize', this.onResize, 100);
  },
};
</script>
<style>
@media all and (max-width: 576px) {
  .options-col {
    width: 50px;
  }
}
</style>
