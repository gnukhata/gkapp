<template>
  <section class="m-2">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <b-button variant="warning" size="sm" @click="showAccountForm = true"
          ><b-icon icon="building"></b-icon> Add Account</b-button
        >
      </template>
      <b-form-input
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
        {{ data.index + 1 }} <br />
        <b-button
          v-if="data.item.defaultFor"
          size="sm d-md-none"
          @click="data.toggleDetails"
          class="px-2 py-0"
        >
          {{ data.item._showDetails ? '-' : '+' }}
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
        mode="create"
        :inOverlay="true"
        :onSave="() => {}"
        @account-created="onAccountCreated"
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
      tableFields: [
        { key: 'index', label: 'No', thStyle: { width: '50px' } },
        { key: 'account', sortable: true },
        { key: 'group', sortable: true },
        { key: 'subGroup', sortable: true },
        { key: 'defaultFor', class: 'd-none d-sm-table-cell' },
      ],
      options: {
        accounts: [],
      },
      loading: false,
    };
  },
  computed: {},
  methods: {
    onAccountCreated() {
      this.showAccountForm = false;
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
        if (this.tableFields.length === 4) {
          this.tableFields.push({
            key: 'defaultFor',
          });
        }
      } else if (this.tableFields.length === 5) {
        this.tableFields.pop();
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
<style scoped>
table {
  width: 70%;
}
@media all and (max-width: 600px) {
  table {
    width: 90%;
  }
}
</style>
