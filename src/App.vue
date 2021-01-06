<template>
  <div id="app">
    <header>
      <b-navbar toggleable="lg" type="light" variant="warning">
        <b-navbar-brand :to="{ name: 'Login' }">
          <img src="img/gk.png" width="30" height="30" class="d-inline-block align-top" alt="GNUKhata Logo">
          GNUKhata
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item :to="{ name: 'Dashboard' }" :active="activeNav === 'Dashboard'">Dashboard</b-nav-item>
            <b-nav-item :to="{ name: 'About' }" :active="activeNav === 'About'">About</b-nav-item>
            <b-nav-item :to="{ name: 'Login' }" :active="activeNav === 'Login'">Login</b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown right>
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
    </header>
    <main role="main">
      <router-view/>
    </main>
    <footer class="bg-primary mt-5 text-white fixed-bottom">
      <div class="">
        <div class="copyleft">&copy;</div> {{ currentYear }} - GNUKhata
      </div>
    </footer>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  }
</style>
<script>
import { mapState } from 'vuex'
export default {
  name: 'App',
  data () {
    return {
      currentYear: new Date().getFullYear()
    }
  },
  computed: {
    activeNav: (self) => self.$route.name,
    ...mapState(['userName'])
  }
}
</script>