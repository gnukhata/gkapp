<template>
  <card-component title="User Login" icon="account-circle">
    <b-notification type="is-warning" role="alert" v-model="notificationIsActive" aria-close-label="Close notification">
      Demo <b>username:</b> user_a | <b>Password:</b> user_a | <b>organisation:</b> ABC Delivery
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
    <b-field label="Captcha">
      <canvas title="captcha" width="100" height="50" id="captchaCanvas" style="border:1px solid #d3d3d3;"></canvas>
      <button @click.prevent="audioCaptcha()" class=" mt-3 mx-1 button is-rounded is-small is-dark"><span class="mdi mdi-volume-high"></span></button>
      <b-input class="ml-1 mt-1" v-model="userAnswer" placeholder="Answer" type="text" required/>
    </b-field>
    <hr>
      <b-field horizontal>
        <div class="control">
          <button type="submit" icon='login' @click="captcha()" class="button is-primary" :class="{'is-loading':isLoading}" :disabled="isDisabled">
            <b-icon icon="login" class></b-icon> <span>Login</span>
          </button>
          <router-link to="/createorg">
            <button type="submit" class="mx-2 button is-success" >
              <b-icon icon="account-plus-outline" class></b-icon> <span>Create account</span>
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
      captchaSolved: false,
      url: 'https://satheerthan.site:6543/',
      isLoading: false,
      isDisabled: true,
      orgs: null,
      question: null,
      userAnswer: null,
      // User login details
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
              if (this.captchaSolved) {
                // add auth token to form object
                // this.form.authToken = response.data.token
                // this.$store.commit('user', this.form)
                // this.$store.commit('setAuthStatus', { auth: true })
                this.$store.dispatch('setSessionStates', {
                  auth: true,
                  orgCode: this.form.orgcode,
                  authToken: response.data.token,
                  user: { username: this.form.username }
                })
                this.$router.push('/')
                // Alert the user on successful login
                this.$buefy.toast.open({
                  message: 'Logged in Successfully!',
                  type: 'is-success',
                  queue: false
                })
              } else {
                // Alert the user on captcha failure
                this.$buefy.toast.open({
                  message: 'Captcha is incorrect. Please try again',
                  type: 'is-danger',
                  queue: false
                })
                // Generate new captcha
                this.genCaptcha()
              }
              break
            case 2:
              // Alert user on wrong credentials
              this.$buefy.toast.open({
                message: 'Username / password / organisation does not match, Please try again',
                type: 'is-danger',
                queue: false
              })
              this.isLoading = false
              break
            case 3:
              // Alert user on wrong credentials
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
    // Get list of companies & show them in login form for user to select
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
    },
    // Generate captcha using random numbers from 0-10
    genCaptcha () {
      this.question = `${Math.floor(Math.random() * 11)} + ${Math.floor(Math.random() * 11)}`
      const canvas = document.getElementById('captchaCanvas')
      const ctx = canvas.getContext('2d')
      ctx.font = '18px Arial'
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillText(`${this.question} = `, 22, 33)
    },
    // Validate captcha based on user input
    captcha () {
      const q = this.question.split('+')
      const ans = parseInt(q[0]) + parseInt(q[1])
      if (parseInt(this.userAnswer) === ans) {
        this.captchaSolved = true
      }
    },
    audioCaptcha () {
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance()
        msg.text = this.question
        window.speechSynthesis.speak(msg)
      } else {
        this.$buefy.toast({
          message: 'Your browser does not support speech synthesis',
          type: 'is-error',
          queue: false
        })
      }
    }
  },
  mounted () {
    this.fetchOrgs()
    this.genCaptcha()
  }
}
</script>
