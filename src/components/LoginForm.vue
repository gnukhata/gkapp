<template>
  <card-component title="User Login" icon="account-circle">
    <form @submit.prevent="login">
      <b-field horizontal label="User" message="Required. User name">
        <b-input v-model="form.name" name="name" required/>
      </b-field>
      <b-field horizontal label="Password" message="Required. User password">
        <b-input v-model="form.password" name="password" type="password" required/>
      </b-field>
      <b-field label="Organisation">
        <b-select v-model="form.orgCode" placeholder="Select your organisation" required>
          <option v-for="(org, number) in orgs" :value="number" :key="number">
            {{ org.orgname + " (" + org.orgtype + " )"}}
          </option>
        </b-select>
    </b-field>
<hr>
      <b-field horizontal>
        <div class="control">
          <button type="submit" class="button is-primary" :class="{'is-loading':isLoading}">
            Login
          </button>
          <router-link to="/">
            <button type="submit" class="mx-2 button is-primary" >
              Create Organisation
            </button>
          </router-link>
        </div>
      </b-field>
    </form>
  </card-component>
</template>

<script>
// import { mapState } from 'vuex'
import CardComponent from '@/components/CardComponent'
import Axios from 'axios'

export default {
  name: 'LoginForm',
  components: {
    CardComponent
  },
  data () {
    return {
      isLoading: false,
      orgs: null,
      form: {
        name: null,
        password: null,
        orgCode: null
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
    },
    fetchOrgs () {
      Axios.get('https://satheerthan.site:6543/organisations')
        .then((response) => {
          this.orgs = response.data.gkdata
          this.$buefy.toast.open({
            message: 'Organisation list is loaded',
            type: 'is-info',
            queue: false
          })
        })
        .catch(function (error) {
          this.$buefy.toast.open({
            message: error,
            queue: false,
            type: 'is-error'
          })
        })
    }
  },
  mounted () {
    this.fetchOrgs()
  }
}
</script>
