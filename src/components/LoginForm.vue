<template>
  <card-component title="User Login" icon="account-circle">
    <b-notification type="is-warning" role="alert" v-model="notificationIsActive" aria-close-label="Close notification">
      Demo <b>username:</b> user_a | <b>Password:</b> user_a | <b>organisation:</b> ABC Company
    </b-notification>
    <form @submit.prevent="login">
      <b-field horizontal label="Username" message="*Required">
        <b-input v-model="form.username" name="name" required/>
      </b-field>
      <b-field horizontal label="Password" message="*Required">
        <b-input v-model="form.userpassword" name="password" type="password" required/>
      </b-field>
      <b-field label="Organisation">
        <b-select v-model="form.orgcode" placeholder="Select your organisation" required>
          <option v-for="(org, number) in orgs" :value="number" :key="number">
            {{ org.orgname + " (" + org.orgtype + " )"}}
          </option>
        </b-select>
    </b-field>
<hr>
      <b-field horizontal>
        <div class="control">
          <button type="submit" class="button is-success" :class="{'is-loading':isLoading}" :disabled="isDisabled">
            Login
          </button>
          <router-link to="/createorg">
            <button type="submit" class="mx-2 button is-info" >
              Create Account
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
import axios from 'axios'

export default {
  name: 'LoginForm',
  components: {
    CardComponent
  },
  data () {
    return {
      notificationIsActive: true,
      url: 'https://satheerthan.site:6543/',
      isLoading: false,
      isDisabled: true,
      orgs: null,
      form: {
        username: null,
        userpassword: null,
        orgcode: null
      }
    }
  },
  methods: {
    login () {
      this.isLoading = true
      // add + 1 to organisation org list is indexed starting from 0
      this.form.orgcode = this.form.orgcode + 1
      axios.post(`${this.url}login`, this.form)
        .then((response) => {
          // alert user depending on the gkstatus code
          switch (response.data.gkstatus) {
            case 0:
              this.isLoading = false
              this.$store.commit('user', this.form)
              this.$store.commit('setAuthStatus', { auth: true })
              this.$router.push('/')
              this.$buefy.toast.open({
                message: 'Logged in Successfully!',
                type: 'is-success',
                queue: false
              })
              break
            case 2:
              this.$buefy.toast.open({
                message: 'Username / password / organisation does not match, Please try again',
                type: 'is-danger',
                queue: false
              })
              this.isLoading = false
              break
            case 3:
              this.$buefy.toast.open({
                message: 'Username / password / organisation does not match, Please try again',
                type: 'is-danger',
                queue: false
              })
              this.isLoading = false
              break
            default:
              this.$buefy.toast.open({
                message: 'Unable to login, Please try again',
                type: 'is-danger',
                queue: false
              })
              this.isLoading = false
          } // end switch
        })
        .catch((error) => {
          this.$buefy.toast.open({
            message: error,
            type: 'is-warning',
            queue: false
          })
        })
    },
    fetchOrgs () {
      axios.get(`${this.url}organisations`)
        .then((response) => {
          this.orgs = response.data.gkdata
          this.$buefy.toast.open({
            message: 'Organisation list is loaded',
            type: 'is-success',
            queue: false
          })
          this.isDisabled = false
        })
        .catch(function (error) {
          this.$buefy.toast.open({
            message: error + '| Please reload the page',
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
