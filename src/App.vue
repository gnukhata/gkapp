<template>
  <div id="app">
    <header id="app-header">
      <!--navbar-->
      <b-navbar size="sm">
        <sidebar v-if="userAuthenticated"></sidebar>
        <b-navbar-brand class="mt-2">
          <router-link
            style="border-bottom: 0px"
            to="/workflow/Transactions-Invoice/-1"
          >
            <img
              :src="orgImg"
              width="30"
              height="30"
              class="d-inline-block align-top"
              alt="logo"
            />
          </router-link>
          <div
            :style="{ maxWidth: '185px' }"
            class="ml-2 d-inline-block text-truncate"
          >
            <!-- Without textwrap, creates horizontal overlfow in mobile view -->
            {{ this.orgName || 'GNUKhata' }}
          </div>
        </b-navbar-brand>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown v-if="userAuthenticated" right>
            <template #button-content>
              <b-avatar
                variant="dark"
                icon="person"
                :title="userName"
              ></b-avatar>
              {{ userName }}
            </template>
            <b-dropdown-item v-b-modal.change-pwd>
              <b-icon icon="key"></b-icon>Change Password
            </b-dropdown-item>
            <b-dropdown-item @click="logOut" href="#">
              <b-icon icon="box-arrow-in-left"></b-icon>Log Out
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
      <color-bar></color-bar>
    </header>
    <main role="main" class="mb-5">
      <router-view />
    </main>
    <go-to v-if="userAuthenticated"></go-to>
    <title-bar></title-bar>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import ColorBar from '@/components/ColorBar.vue';
import ChangePwd from '@/components/form/ChangePwd.vue';
import Sidebar from './components/Sidebar.vue';
import TitleBar from './components/TitleBar.vue';
import GoTo from './components/GoTo.vue';
export default {
  name: 'App',
  components: { ColorBar, ChangePwd, Sidebar, TitleBar, GoTo },
  computed: {
    activeNav: (self) => self.$route.name,
    ...mapState([
      'userName',
      'orgName',
      'gkCoreUrl',
      'authToken',
      'userAuthenticated',
      'orgImg',
    ]),
  },
  methods: {
    /*
     * Close Change password window on successful password change
     */
    closeModal() {
      setTimeout(() => {
        this.$refs['change-pwd-close'].hide();
      }, 1500);
    },
  },
  mounted() {
    document.querySelector('title').textContent = `GNUKhata ${
      this.orgName !== null ? '| ' + this.orgName : ''
    }`;
    /**
     * fetch latest app changes
     */
    if (this.$workbox) {
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
    }
  },
  created() {
    this.get_org_address();
    this.getOrgImage();
  },
};
</script>
