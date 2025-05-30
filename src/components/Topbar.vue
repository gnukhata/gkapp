<template>
  <b-navbar
    size="sm"
    variant="light"
  >
    <template v-if="screenWidth < 1200">
      <sidebar v-if="userOrgAuthenticated" />
    </template>
    <b-navbar-brand class="d-flex flex-row">
      <router-link
        style="border-bottom: 0px; align-self: center"
        to="/dashboard"
        class="flex-column"
      >
        <img
          :src="orgImg"
          width="40"
          height="40"
          class="d-inline-block align-top"
          alt="logo"
        >
      </router-link>
      <div class="ml-2 d-inline-block">
        <!-- truncate org name in mobile view -->
        <div>
          <div
            v-b-tooltip.click
            class="text-sm"
            :class="{'text-truncate': is_mobile()}"
            :style="{'max-width': is_mobile() ? '6.5em' : ''}"
          >
            <span v-if="this.orgName">
              {{ this.orgName }}
            </span>
            <span v-else>
              <translate>
                GNUKhata
              </translate>
            </span>
          </div>
          <div
            style="font-size: 0.6em"
            class="font-italic"
            v-if="userOrgAuthenticated"
          >
            <!-- WARN: beware of Y3K Bug ;-)  -->
            FY {{ yearStart.split('-')[0] }} -
            {{ yearEnd.split('-')[0].slice(2, 4) }}
          </div>
        </div>
      </div>
    </b-navbar-brand>
    <!-- user menu -->
    <b-navbar-nav class="ml-auto">
      <b-nav-item-dropdown
        v-if="userOrgAuthenticated"
        id="quick-actions"
        class="mt-2"
        right
      >
        <template #button-content>
          <b-icon icon="plus-lg" /> Add
        </template>
        <b-dropdown-item to="/invoice">
          Invoice
        </b-dropdown-item>
        <b-dropdown-item to="/dc-note">
          Debit/Credit Note
        </b-dropdown-item>
        <b-dropdown-item to="/cash-memo">
          Point of Sales
        </b-dropdown-item>
        <b-dropdown-item to="/ps-order">
          Purchase/Sales Order
        </b-dropdown-item>
        <b-dropdown-item to="/voucher/create/receipt/-1">
          Voucher
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item to="/business-details/create">
          Business Items
        </b-dropdown-item>
        <b-dropdown-item to="/contact-details/create">
          Contacts
        </b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown
        v-if="userAuthenticated"
        id="usermenu"
        toggle-class="nav-link-custom"
        right
      >
        <template #button-content>
          <b-avatar
            variant="dark"
            icon="person"
            :title="userName"
          />
          <span class="d-none d-md-inline"> {{ userName }} </span>
        </template>
        <b-dropdown-item-button
          v-if="userOrgAuthenticated"
          @click="logOut"
        >
          <b-icon
            icon="arrow-counterclockwise"
            class="mr-1"
          /> Change Org
        </b-dropdown-item-button>
        <!-- fy switch button, only shown when org has more than one financial year -->
        <b-dropdown-item-button
          v-if="userOrgAuthenticated && finYears.length > 1"
          v-b-modal.fy-modal
        >
          <b-icon
            icon="toggles"
            class="mr-1"
          /> Switch FY
        </b-dropdown-item-button>
        <b-dropdown-divider v-if="userOrgAuthenticated" />
        <b-dropdown-item-button v-b-modal.change-pwd>
          <b-icon
            icon="key"
            class="mr-1"
          />
          <translate>Change Password</translate>
          <b-modal
            ref="change-pwd-close"
            id="change-pwd"
            size="md"
            :title="'Change Password for ' + userName"
            header-bg-variant="dark"
            header-text-variant="light"
            hide-footer
          >
            <change-pwd @close-pwd="closePasswordModal" />
          </b-modal>
        </b-dropdown-item-button>
        <b-dropdown-item-button @click="deleteUser">
          <b-icon
            icon="person-x"
            class="mr-1"
          />
          <translate>Delete Account</translate>
        </b-dropdown-item-button>
        <b-dropdown-divider v-if="userOrgAuthenticated" />
        <b-dropdown-item-button @click="onLogout">
          <b-icon icon="box-arrow-in-left" /> Logout
        </b-dropdown-item-button>
      </b-nav-item-dropdown>
    </b-navbar-nav>
    <gk-tour
      target="quick-actions"
      title="Quick Actions"
      placement="bottom"
    >
      You can use this <b>Add</b> menu to create new transactions (invoices, debit/credit notes, etc.), contacts and business items (products and services) directly from here or you can also go to the <b>Sales</b> and <b>Purchases</b> menu options.
    </gk-tour>
  </b-navbar>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import ChangePwd from './form/ChangePwd.vue';
import Sidebar from './Sidebar.vue';
import GkTour from '../components/GkTour.vue';

export default {
  name: 'Topbar',
  props: {
    screenWidth: {
      type: Number,
      required: true,
    },
  },
  components: { ChangePwd, Sidebar, GkTour },
  computed: {
    ...mapState([
      'userName',
      'orgName',
      'orgImg',
      'userOrgAuthenticated',
      'yearStart',
      'yearEnd',
      'finYears',
    ]),
    ...mapState('tour', ['showTour', 'currentStep']),
  },
  methods: {
    closePasswordModal() {
      setTimeout(() => {
        this.$refs['change-pwd-close'].hide();
      }, 1500);
    },
    deleteUser() {
      // confirm before sending the delete api request
      this.$bvModal
        .msgBoxConfirm(`Are you sure you want to delete your account? Note that this action cannot be reversed.`, {
          centered: true,
          size: 'md',
          okVariant: 'danger',

          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        // send the api request if the user confirmed
        .then((r) => {
          if (r) {
            axios.delete('/gkuser').then((r) => {
              if (r.status === 200) {
                if (r.data.gkstatus == 0) {
                  this.$bvToast.toast(`Account Deletion Successful`, {
                    autoHideDelay: 3000,
                    variant: 'success',
                  });
                  this.onLogout();
                } else {
                  this.$bvToast.toast(
                    `Delete all the organisations which you created first, or leave the organisations which you are already part of, where you have admin role`,
                    {
                      title: 'Account Deletion Unsuccessful',
                      autoHideDelay: 5000,
                      variant: 'danger',
                      solid: true,
                    }
                  );
                }
              } else {
                this.$bvToast.toast(
                  `Request failed with status code ${r.status}`,
                  {
                    autoHideDelay: 3000,
                    variant: 'danger',
                  }
                );
              }
            });
          }
        });
    },
    onLogout() {
      if (this.userOrgAuthenticated) {
        this.logOut();
      }
      this.$store.dispatch('setSessionStates', {
        userAuth: false,
        userAuthToken: null,
        authToken: null,
        finYears: [],
        orgName: null,
        orgYears: null,
      });
      this.orgs = [];
      this.invitedOrgs = [];
      localStorage.removeItem('userName');
    },
  },
  watch: {
    currentStep(newStep) {
      if (newStep === 'orgLogo') {
        this.$router.push('/orgprofile');
      }
    },
  },
}
</script>
