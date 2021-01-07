<template>
    <section 
    v-if="$route.name !== 'Login' && $route.name !== 'Create_Organisation'" 
    class="d-flex m-1 justify-content-center mt-2">
    <b-button-group size="sm">
      <b-button 
      title="Current Page" 
      class="mr-1" 
      variant="outline-dark">
        {{userName}} / {{$route.name}}
      </b-button>
      <router-link v-if="$route.name !== 'Dashboard'" to="/dashboard">
      <b-button variant="outline-info" class="mr-1">
        <b-icon icon="arrow-left-circle"></b-icon> Back to Dashboard
      </b-button>
      </router-link>
      <b-button @click="back()" variant="outline-danger" >
        <b-icon icon="arrow-left-circle"></b-icon> Previous page
      </b-button>
    </b-button-group>
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