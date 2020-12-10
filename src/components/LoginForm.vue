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
        <b-select placeholder="Select your organisation" required>
        <option v-for="org in form.orgs" :value="org.orgname + org.orgtype" :key="org.orgname">
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
            <button type="submit" class="mx-5 button is-primary" >
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
      form: {
        name: null,
        password: null,
        orgs: null
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
          this.form.orgs = response.data.gkdata
          this.$buefy.snackbar.open({
            message: 'Organisations list is loaded',
            queue: false
          })
        })
        .catch(function (error) {
          this.$buefy.snackbar.open({
            message: error,
            queue: false
          })
        })
    }
  },
  mounted () {
    this.fetchOrgs()
  }
}
</script>
