<template>
  <div id="app">
    <header>
      <!--navbar-->
      <b-navbar toggleable="lg" type="light" variant="light">
        <b-navbar-brand :to="{ name: 'Login' }">
          <img src="img/gk.png" width="30" height="30" class="d-inline-block align-top" alt="GNUKhata Logo">
          GNUKhata
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav v-if="$router.currentRoute.path !== '/' && $router.currentRoute.path !== '/createorg'">
            <b-nav-item :to="{ name: 'Dashboard' }" :active="activeNav === 'Dashboard'">Dashboard</b-nav-item>
            <b-nav-item :to="{ name: 'About' }" :active="activeNav === 'About'">About</b-nav-item>
            <b-nav-item :to="{ name: 'Login' }" :active="activeNav === 'Login'">Login</b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown v-if="$router.currentRoute.path !== '/' && $router.currentRoute.path !== '/createorg'" right>
              <!-- Using 'button-content' slot -->
              <template #button-content>
                <em>{{userName}} </em>
              </template>
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <router-link to="/">
              <b-dropdown-item href="#">Sign Out</b-dropdown-item>
              </router-link>
            </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
      </b-navbar>
     <title-bar></title-bar>
    </header>
    <main role="main">
      <router-view/>
    </main>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import TitleBar from './components/TitleBar'

export default {
  name: 'App',
  components: { TitleBar },
  computed: {
    activeNav: (self) => self.$route.name,
    ...mapState(['userName'])
  },
  created() {
    if (this.$workbox) {
      this.$workbox.addEventListener("waiting", () => {
        this.showUpdateUI = true;
      });
    }
  // async accept() {
  // this.showUpdateUI = false;
  // await this.$workbox.messageSW({ type: "SKIP_WAITING" });
  // }
  }
}
</script>