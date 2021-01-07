<template>
    <section 
    v-if="$route.name !== 'Login' && $route.name !== 'Create_Organisation'" 
    class="d-flex mt-2">
    <div class="m-1">
      <b-button variant="light">{{userName}} / {{$route.name}} </b-button>
    </div>
    <div class="ml-auto m-1">
      <router-link v-if="$route.name !== 'Dashboard'" to="/dashboard">
      <b-button size="sm" variant="outline-info">
        <b-icon icon="display"></b-icon> Dashboard
      </b-button>
      </router-link>
    </div>
    <div class="m-1">
      <b-button @click="goBack()" size="sm" variant="outline-danger" >
        <b-icon icon="arrow-left-circle"></b-icon> Back
      </b-button>
    </div>
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