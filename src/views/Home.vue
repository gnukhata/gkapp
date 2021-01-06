<template>
<section class="container-fluid">
  <h1 class="mt-5 text-muted mb-5">{{userName}} / Dashboard</h1>
  <!--Cards section-->
  <div class="container">
    <b-card-group deck>
      <router-link to='/workflow' class="text-dark">
        <b-card
          footer="Workflow"
          footer-text-variant="white"
          footer-tag="footer"
          footer-bg-variant="dark"
          border-variant="dark"
          style="max-width: 20rem;">
          <b-card-text><b-icon scale="4" icon="tv"></b-icon></b-card-text>
          <b-card-text>Manage Customers /Suppliers</b-card-text>
        </b-card>      
      </router-link>
      <b-card
        footer="Cash Balance"
        footer-text-variant="light"
        footer-tag="footer"
        footer-bg-variant="success"
        border-variant="dark"
        style="max-width: 20rem;">
         <b-card-text><b-icon scale="3" icon="wallet"></b-icon></b-card-text>
         <b-card-text>₹5,000</b-card-text>
      </b-card>
      <b-card
        footer="Bank Balance"
        footer-text-variant="white"
        footer-tag="footer"
        footer-bg-variant="primary"
        border-variant="dark"
        style="max-width: 20rem;">
        <b-card-text><b-icon scale="4" icon="cash"></b-icon></b-card-text>
         <b-card-text>₹57,000</b-card-text>
      </b-card>
    </b-card-group>
  </div>
</section>
</template>

<script>
// @ is an alias to /src
import {mapState} from 'vuex'

export default {
  name: 'Home',
  data () {
    return {

    }
  },
  computed: {
    ...mapState([
      'userName'
    ])
  }
}
</script>
