<template>
  <div id="app">
    <header id="app-header">
      <!--navbar-->
      <b-navbar toggleable="lg" type="light" variant="light">
        <b-navbar-brand>
          <img
            src="img/gk.png"
            width="30"
            height="30"
            class="d-inline-block align-top"
            alt="GNUKhata Logo"
          />
          <div
            :style="{ maxWidth: '185px' }"
            class="ml-2 d-inline-block text-truncate"
          >
            <!-- Without textwrap, creates horizontal overlfow in mobile view -->
            {{ this.orgName || "GNUKhata" }}
          </div>
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <!-- show only for authenticated user -->
            <template v-if="userAuthenticated">
              <b-nav-item
                :to="{ name: 'Workflow' }"
                :active="activeNav === 'Dashboard'"
                ><b-icon icon="wrench"></b-icon> Workflow</b-nav-item
              >
            </template>
            <b-nav-item :to="{ name: 'About' }" :active="activeNav === 'About'"
              ><b-icon icon="info-circle"></b-icon> About</b-nav-item
            >
            <!-- <b-nav-item :to="{ name: 'Login' }" :active="activeNav === 'Login'"
              ><b-icon icon="box-arrow-in-right"></b-icon> Login</b-nav-item
            > -->
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown v-if="userAuthenticated" right>
              <template #button-content>
                <b-button @click="getUser" variant="outline-primary"
                  ><b-icon icon="person"></b-icon> {{ userName }}</b-button
                >
              </template>
              <!-- admin only options -->
              <template v-if="userRole == -1">
                <b-dropdown-item to="/orgprofile"
                  ><b-icon icon="building"></b-icon> Company
                  Profile</b-dropdown-item
                >
                <b-dropdown-item to="/closebooks"
                  ><b-icon icon="journals"></b-icon> Close Books / Roll
                  Over</b-dropdown-item
                >
                <b-dropdown-item to="/logs"
                  ><b-icon icon="server"></b-icon> Audit Logs</b-dropdown-item
                >
              </template>
              <b-dropdown-item @click="logOut" href="#"
                ><b-icon icon="box-arrow-in-left"></b-icon> Log
                Out</b-dropdown-item
              >
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <color-bar></color-bar>
    </header>
    <main role="main">
      <router-view />
    </main>
  </div>
</template>
<script>
import { mapState } from "vuex";
import ColorBar from "@/components/ColorBar.vue";
import axios from "axios";

export default {
  name: "App",
  components: { ColorBar },
  data() {
    return {
      userRole: Number,
    };
  },
  computed: {
    activeNav: (self) => self.$route.name,
    ...mapState([
      "userName",
      "orgName",
      "gkCoreUrl",
      "authToken",
      "userAuthenticated",
    ]),
  },
  methods: {
    /**
     * Logout the user, But preserve the gkcore url
     */
    logOut() {
      // reset orgname
      this.$store.commit("resetOrg");
      // change auth status
      this.$store.commit("setAuthStatus");
      // redirect to login page
      this.$router.push("/");
      // clear localStorage
      localStorage.clear();
      // set gkCore url
      this.$store.commit("setGkCoreUrl", { gkCoreUrl: this.gkCoreUrl });
      // alert the user on logout
      this.$bvToast.toast(`Logged out succesfully`, {
        title: "Logout",
        solid: true,
        variant: "success",
      });
    },
    /**
     * Get the company's users role
     * to decide which items to show in user menu
     */
    getUser() {
      axios
        .get(`/user?type=role`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.userRole = res.data.gkresult;
        })
        .catch((e) => {
          console.log("admin fetch", e.message);
        });
    },
  },
  mounted() {
    this.getUser();
    /**
     * fetch latest app changes
     */
    if (this.$workbox) {
      this.$workbox.addEventListener("waiting", () => {
        // this.showUpdateUI = true;
        // notify the user before updating the app
        this.$bvToast.toast(`Updating app to the latest version`, {
          title: "New Update Available!",
          solid: "true",
          variant: "warning",
          autoHideDelay: 3000,
        });
        // pull the latest code
        setTimeout(() => {
          this.$workbox.messageSW({ type: "SKIP_WAITING" });
        }, 3000);
      });
    }
  },
};
</script>
<style scoped>
.router-link-exact-active {
  /* font-weight: bolder; */
  border-bottom: 2px solid;
}
</style>