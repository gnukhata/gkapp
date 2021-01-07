<template>
    <section 
    v-if="$route.name !== 'Login' && $route.name !== 'Create_Organisation'" 
    class="d-flex mt-2">
    <div class="m-1">
      <b-button sm variant="light">{{userName}} / {{$route.name}} </b-button>
    </div>
    <div class="ml-auto m-1">
      <router-link v-if="$route.name !== 'Dashboard'" to="/dashboard">
      <b-button variant="outline-info">
        <b-icon icon="arrow-left-circle"></b-icon> Dashboard
      </b-button>
      </router-link>
    </div>
      <!-- <b-button @click="back()" variant="outline-danger" >
        <b-icon icon="arrow-left-circle"></b-icon> Previous page
      </b-button> -->
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

    back: () => { this.$router.go(2) }

    }
}
</script>