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
          <div :style="{maxWidth: '185px'}" class="ml-2 d-inline-block text-truncate">
            <!-- Without textwrap, creates horizontal overlfow in mobile view -->
            {{ this.orgName || "GNUKhata" }}
          </div>
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav
            v-if="
              $router.currentRoute.path !== '/' &&
              $router.currentRoute.path !== '/createorg'
            "
          >
            <b-nav-item
              :to="{ name: 'Dashboard' }"
              :active="activeNav === 'Dashboard'"
              ><b-icon icon="tv"></b-icon> Dashboard</b-nav-item
            >
            <b-nav-item :to="{ name: 'About' }" :active="activeNav === 'About'"
              ><b-icon icon="info-circle"></b-icon> About</b-nav-item
            >
            <b-nav-item :to="{ name: 'Login' }" :active="activeNav === 'Login'"
              ><b-icon icon="box-arrow-in-right"></b-icon> Login</b-nav-item
            >
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown
              v-if="
                $router.currentRoute.path !== '/' &&
                $router.currentRoute.path !== '/createorg'
              "
              right
            >
              <!-- Using 'button-content' slot -->
              <template #button-content>
                <!-- <em>{{userName}} </em> -->
                <b-button variant="primary"
                  ><b-icon icon="person"></b-icon> {{ userName }}</b-button
                >
              </template>
              <!-- <b-dropdown-item href="#">Profile</b-dropdown-item> -->
              <b-dropdown-item @click="logOut" href="#"
                ><b-icon icon="box-arrow-in-left"></b-icon> Log
                Out</b-dropdown-item
              >
              <b-dropdown-item v-if="userRole == -1" to="/orgprofile"
                ><b-icon icon="gear"></b-icon> Company Profile</b-dropdown-item
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
     * Logout the user
     */
    logOut() {
      localStorage.clear(); // clear localStorage
      this.$router.push("/"); // redirect to login page
      // alert the user on logout
      this.$bvToast.toast(`Logged out succesfully`, {
        title: "Logout",
        solid: true,
        variant: "success",
      });
      // reset orgname
      this.$store.commit("resetOrg");
      this.$store.commit("setAuthStatus"); // change auth status
    },
    getUser() {
      axios
        .get(`${this.gkCoreUrl}/user?type=role`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.userRole = res.data.gkresult;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            solid: true,
            variant: "danger",
          });
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
        this.$bvToast.toast(`Updating app to the lastest version`, {
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