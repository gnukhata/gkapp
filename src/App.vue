<template>
  <div id="app">
    <header id="app-header">
      <!--navbar-->
      <b-navbar size="sm" variant="light">
        <sidebar v-if="userOrgAuthenticated"></sidebar>
        <b-navbar-brand class="d-flex flex-row">
          <router-link
            style="border-bottom: 0px; align-self: center"
            to="/workflow/Transactions-Invoice/-1"
            class="flex-column"
          >
            <img
              :src="orgImg"
              width="40"
              height="40"
              class="d-inline-block align-top"
              alt="logo"
            />
          </router-link>
          <div class="ml-2 d-inline-block">
            <!-- truncate org name in mobile view -->
            <div>
              <div
                v-b-tooltip.click
                class="text-sm"
                :class="{ 'text-truncate': is_mobile() }"
                :style="{ 'max-width': is_mobile() ? '6.5em' : '' }"
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
                <!-- FY {{ yearStart.split('-')[0] }} - -->
                <!-- WARN: beware of Y3K Bug -->
                <!-- {{ yearEnd.split('-')[0].slice(2, 4) }} -->
                <v-select
                  :reduce="(option) => option.index"
                  :options="finYears"
                  v-model="currentFinYear"
                  class="mw-100p"
                  id="fin-years"
                >
                  <template #selected-option="{ yend, ystart }">
                    FY {{ ystart.split('-')[2] }} -
                    <!-- WARN: beware of Y3K Bug -->
                    {{ yend.split('-')[2].slice(2, 4) }}
                  </template>
                </v-select>
              </div>
            </div>
          </div>
        </b-navbar-brand>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown v-if="userOrgAuthenticated" right>
            <template #button-content>
              <b-avatar
                variant="dark"
                icon="person"
                :title="userName"
              ></b-avatar>
              <span class="d-none d-md-inline"> {{ userName }} </span>
            </template>
            <b-dropdown-item v-b-modal.change-pwd>
              <b-icon icon="key"></b-icon> Change Password
            </b-dropdown-item>
            <b-dropdown-item @click="logOut" href="#">
              <b-icon icon="box-arrow-in-left"></b-icon> Change Org
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <!-- Change password dialog -->
        <b-modal
          ref="change-pwd-close"
          id="change-pwd"
          size="md"
          :title="'Update Password for ' + userName"
          header-bg-variant="dark"
          header-text-variant="light"
          hide-footer
        >
          <change-pwd v-on:close-pwd="closeModal"></change-pwd>
        </b-modal>
      </b-navbar>
      <!-- Color bar -->
      <!-- <color-bar></color-bar> -->
    </header>
    <main role="main" class="mb-5">
      <router-view />
    </main>
    <go-to v-if="userOrgAuthenticated"></go-to>
    <title-bar></title-bar>
  </div>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
// import ColorBar from '@/components/ColorBar.vue';
import ChangePwd from '@/components/form/ChangePwd.vue';
import Sidebar from './components/Sidebar.vue';
import TitleBar from './components/TitleBar.vue';
import GoTo from './components/GoTo.vue';
export default {
  name: 'App',
  components: { /* ColorBar, */ ChangePwd, Sidebar, TitleBar, GoTo },
  data() {
    return {
      currentFinYear: null,
    };
  },
  computed: {
    activeNav: (self) => self.$route.name,
    ...mapState([
      'userName',
      'orgName',
      'gkCoreUrl',
      'authToken',
      'userOrgAuthenticated',
      'orgImg',
      'yearStart',
      'yearEnd',
      'finYears',
    ]),
  },
  watch: {
    currentFinYear(index) {
      this.orgLogin(this.finYears[index]);
    },
    yearStart(newStart, oldStart) {
      if (!oldStart && newStart && !this.currentFinYear) {
        let res = null;
        if (this.yearStart && this.yearEnd) {
          let ystart = this.yearStart
            .split('-')
            .reverse()
            .join('-');
          let yend = this.yearEnd
            .split('-')
            .reverse()
            .join('-');
          let currentYear = this.finYears.find(
            (ydata) => ydata.ystart === ystart && ydata.yend === yend
          );
          res = currentYear;
        }
        this.currentFinYear = res;
      }
    },
  },
  methods: {
    /**
     * fetch latest app changes, only when gkapp-config.json has it enabled
     */
    upgradeAppToLatestVersion() {
      if (this.gkConfig.fetch_latest_version) {
        this.$workbox.addEventListener('waiting', () => {
          // this.showUpdateUI = true;
          // notify the user before updating the app
          this.$bvToast.toast(`Updating app to the latest version`, {
            title: 'New Update Available!',
            solid: 'true',
            variant: 'warning',
            autoHideDelay: 3000,
          });
          // pull the latest code
          setTimeout(() => {
            this.$workbox.messageSW({ type: 'SKIP_WAITING' });
          }, 3000);
        });
      } else {
        console.warn(
          'Pulling latest app changes is disabled in the gkapp-config.json'
        );
      }
    },
    /*
     * Close Change password window on successful password change
     */
    closeModal() {
      setTimeout(() => {
        this.$refs['change-pwd-close'].hide();
      }, 1500);
    },
    orgLogin(yearData) {
      if (!yearData) {
        return;
      }
      const userAuthToken = localStorage.getItem('userAuthToken');
      let selectedYear = yearData;
      let payload = {
        orgcode: selectedYear.code,
      };
      // TODO: here instead of sending the username and password, send the new user auth token
      axios
        .post(`${this.gkCoreUrl}/login/org`, payload, {
          headers: {
            gktoken: userAuthToken,
            gkusertoken: userAuthToken,
          },
        })
        .then((resp) => {
          switch (resp.data.gkstatus) {
            case 0:
              axios.defaults.baseURL = this.gkCoreUrl;
              axios.defaults.headers = { gktoken: resp.data.token };
              // Initiate vuex store
              this.$store.dispatch('setSessionStates', {
                auth: true,
                orgCode: selectedYear.code,
                authToken: resp.data.token,
                orgYears: {
                  yearStart: selectedYear.ystart
                    .split('-')
                    .reverse()
                    .join('-'),
                  yearEnd: selectedYear.yend
                    .split('-')
                    .reverse()
                    .join('-'),
                },
              });

              Promise.all([
                this.$store.dispatch('initLocalStates'), // initialises vuex, org image and org address
                this.$store.dispatch('global/initGlobalConfig'), // initialises global config
                this.$store.dispatch('initGstin'), // initialises org GSTIN
              ]).then(() => {
                this.$store
                  .dispatch('global/initGlobalState', {
                    lang: this.$language,
                  })
                  .then(() => {
                    // debugger;
                    // redirect to workflow on login
                    location.reload();
                  });
              });
              break;
            case 2:
              this.$bvToast.toast(`Invalid login details`, {
                title: 'Login Error!',
                autoHideDelay: 3000,
                variant: 'danger',
              });
              break;
            case 5:
              this.$router.push('/select-org');
              break;
            default:
              this.$bvToast.toast(`Internal Server Error`, {
                title: 'Login Error!',
                autoHideDelay: 3000,
                variant: 'danger',
              });
          }
        });
    },
  },
  beforeCreate() {
    // initialize the required vuex states from local storage
    this.$store.dispatch('initLocalStates').then(() => {
      // init global config of an org
      this.$store.dispatch('global/initGlobalState', { lang: this.$language });
    });
  },
  mounted() {
    this.upgradeAppToLatestVersion();
    this.check_gst_news();
    document.querySelector('title').textContent = `GNUKhata ${
      this.orgName !== null ? '| ' + this.orgName : ''
    }`;
    // The below code checks the store and updates the current financial year when the app reloads
    // TODO: Must make this part of code reactive, such that the current financial year is updated when
    // its changed in any view and doesn't require a page refresh to reflect
    if (this.yearStart && this.yearEnd) {
      let ystart = this.yearStart
        .split('-')
        .reverse()
        .join('-');
      let yend = this.yearEnd
        .split('-')
        .reverse()
        .join('-');
      let currentYear = this.finYears.find(
        (ydata) => ydata.ystart === ystart && ydata.yend === yend
      );
      this.currentFinYear = currentYear;
    } else {
      this.currentFinYear = null;
    }
  },
  created() {
    // this.get_org_address();
    // this.getOrgImage();
  },
};
</script>
<style>
.mw-100p {
  max-width: 155px;
}
#fin-years .vs__dropdown-option {
  padding-left: 1em;
}
</style>
