<template>
<section>
  <!--Cards-->
  <div class="container mt-3">
    <b-card-group deck>
      <router-link to='/workflow' class="text-dark">
        <b-card
          footer="Workflow"
          class="text-center"
          footer-text-variant="white"
          footer-tag="footer"
          footer-bg-variant="dark"
          border-variant="dark"
          style="width: 20rem;">
          <b-card-text><b-icon scale="4" icon="tv"></b-icon></b-card-text>
          <b-card-text>Manage Customers / Suppliers / Goods / Services</b-card-text>
        </b-card>      
      </router-link>
      <b-card
        footer="Cash Balance"
        footer-text-variant="light"
        footer-tag="footer"
        footer-bg-variant="success"
        border-variant="dark"
        class="text-center"
        style="max-width: 20rem;">
         <b-card-text><b-icon scale="3" icon="wallet2"></b-icon></b-card-text>
         <b-card-text>₹5,000</b-card-text>
      </b-card>
      <b-card
        footer="Bank Balance"
        footer-text-variant="white"
        footer-tag="footer"
        footer-bg-variant="primary"
        border-variant="dark"
        class="text-center"
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
export default {
  name: 'Home',
  data () {
    return {

    }
  },
}
</script>
