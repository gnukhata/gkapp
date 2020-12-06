<template>
  <card-component title="User Login" icon="account-circle">
    <form @submit.prevent="login">
      <b-field horizontal label="User" message="Required. User name">
        <b-input v-model="form.name" name="name" required/>
      </b-field>
      <b-field horizontal label="Password" message="Required. User password">
        <b-input v-model="form.password" name="password" type="password" required/>
      </b-field>
      <hr>
      <b-field horizontal>
        <div class="control">
          <button type="submit" class="button is-primary" :class="{'is-loading':isLoading}">
            Login
          </button>
        </div>
      </b-field>
    </form>
  </card-component>
</template>

<script>
// import { mapState } from 'vuex'
import CardComponent from '@/components/CardComponent'

export default {
  name: 'LoginForm',
  components: {
    CardComponent
  },
  data () {
    return {
      isLoading: false,
      form: {
        name: null,
        password: null
      }
    }
  },
  methods: {
    login () {
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
        this.$store.commit('user', this.form)
        this.$store.commit('setAuthStatus', { auth: true })
        this.$buefy.snackbar.open({
          message: 'Authentication Success',
          queue: false
        })
        this.$router.push('/')
        // setTimeout(() => {
        // }, 100)
      }, 500)
    }
  }
}
</script>
