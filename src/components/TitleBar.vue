<template>
  <section 
  v-if="$route.name !== 'Login' && $route.name !== 'Create_Organisation'" 
  class="mt-2">
  <div class="d-flex">
    <div class="m-1">
      <b-button variant="outline-dark">{{userName}} / <span class="font-weight-bold">{{$route.name}}</span></b-button>
    </div>
    <div class="ml-auto m-1">
      <router-link v-if="$route.name !== 'Dashboard'" to="/dashboard">
      <b-button variant="info">
        <b-icon icon="display"></b-icon> Dashboard
      </b-button>
      </router-link>
    </div>
    <div class="m-1">
      <b-button @click="goBack()" variant="danger" >
        <b-icon icon="arrow-left-circle"></b-icon> Back
      </b-button>
    </div>
  </div>
  <hr class="mt-1">
  </section>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'TitleBar',
    computed: {
        ...mapState(['userName'])
    },
    methods: {
      goBack() {
        this.$router.go(-1)
      }
    }
}
</script>