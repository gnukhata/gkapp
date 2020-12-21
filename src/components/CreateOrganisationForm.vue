<!--
    ToDo
    1. Add sanity checks for the financial year dates, password, organisation name
    2. Add the POST call to /organisations API
    3. Route to dashboard if creation is suceess, or show error message if failed
-->
<template>
    <div>
      <form @submit.prevent="submitForm">
        <div class="columns">
          <div class="column">
            <b-field label="Organisation Name">
              <b-input placeholder="ABC Organisation"
                minlength="3"
                validation-message="Organisation name must be 3 or more characters long"
                v-model="orgName"
                icon="office-building"
                required>
              </b-input>
            </b-field>
            <b-field label="Organisation Type">
              <b-radio-button type="is-info"
                  v-model="orgType"
                  v-for="(option, index) in options.orgType"
                  :native-value="index"
                  :key="index">
                  {{option}}
              </b-radio-button>
            </b-field>
            <div class="field">
              <label class="label">Financial Year</label>
              <div class="field-body mt-3">
                  <b-field label="from" label-position="on-border">
                    <b-datepicker
                            @input="this.setToDate"
                            v-model="yearStart"
                            placeholder="dd / mm / yyyy"
                            icon="calendar-today"
                            required>
                    </b-datepicker>
                  </b-field>
                  <b-field label="to" label-position="on-border">
                    <b-datepicker
                            v-model="yearEnd"
                            placeholder="dd / mm / yyyy"
                            icon="calendar-today"
                            :min-date="yearStart"
                            required>
                    </b-datepicker>
                  </b-field>
              </div>
            </div>
          </div>
          <div class="column">
            <b-field label="Admin Name" expanded>
              <b-input placeholder="Admin User"
                minlength="3"
                validation-message="User name must be 3 or more characters long"
                v-model="userName"
                icon="account-circle"
                required>
              </b-input>
            </b-field>
            <b-field label="Password" :message="passwordCheckText" :type="passwordMode">
              <b-input type="password"
                v-model="userPassword"
                icon="lock"
                placeholder="P@$$w0rd"
                password-reveal
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).{8,}"
                required></b-input>
            </b-field>
            <div class="field">
              <label class="label">Password Recovery</label>
              <div class="field-body mt-3">
                <b-field label="question" label-position="on-border">
                  <b-input placeholder="Who am i?"
                    v-model="securityQuestion"
                    minlength="3"
                    validation-message="Question must be 3 or more characters long"
                    required>
                  </b-input>
                </b-field>
                <b-field label="answer" label-position="on-border">
                  <b-input
                    placeholder="GNUKhata"
                    v-model="securityAnswer"
                    validation-message="Answer must be 3 or more characters long"
                    minlength="3"
                    required>
                  </b-input>
                </b-field>
              </div>
            </div>
            <b-field label="Captcha">
              <canvas class="" width="100" height="38" id="captchaCanvas" style="border:1px solid #d3d3d3;"></canvas>
              <button @click.prevent="audioCaptcha()" class=" mt-1 mx-1 button is-small is-rounded is-dark"><span class="mdi mdi-volume-high"></span></button>
              <b-input class="ml-3" v-model="userAnswer" placeholder="Answer" type="text" required/>
            </b-field>
          </div>
        </div>
        <hr>
        <b-field grouped position="is-right">
          <div class="control">
            <router-link to='/login'>
              <button type="submit" class="button is-danger">
                <b-icon icon="close-thick" class></b-icon> <span>Cancel</span>
              </button>
            </router-link>
            <button type="submit" class="mx-1 button is-success" :class="{'is-loading':isLoading}">
              <b-icon icon="content-save" class></b-icon> <span>Create & Login</span>
            </button>
          </div>
        </b-field>
      </form>
    </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import passwordStrength from 'check-password-strength'

export default {
  name: 'CreateOrganisationForm',
  components: {
  },
  data () {
    return {
      isLoading: false,
      options: {
        orgType: ['Profit making', 'Not For Profit'],
        pwdFieldTypes: ['lowercase', 'uppercase', 'symbol', 'number']
      },
      orgName: '',
      orgType: 0,
      yearStart: null,
      yearEnd: null,
      userName: '',
      userPassword: '',
      securityAnswer: '',
      securityQuestion: '',

      userAnswer: null,
      captchaSolved: false
    }
  },
  computed: {
    passwordCheckText () {
      let text = ''
      if (this.userPassword) {
        const strength = passwordStrength(this.userPassword)
        switch (strength.value) {
          case 'Strong':
            text = 'Password is Strong.'
            break
          case 'Medium':
            text = this.getPasswordHint(strength)
            break
          case 'Weak':
            text = this.getPasswordHint(strength)
            break
          default:
            if (this.userPassword.length < 8) {
              text = 'is-danger'
            } else {
              text = 'is-success'
            }
        }
      }
      return text
    },
    passwordMode () {
      let mode = ''
      if (this.userPassword) {
        switch (passwordStrength(this.userPassword).value) {
          case 'Strong':
            mode = 'is-success'
            break
          case 'Medium':
            mode = 'is-warning'
            break
          case 'Weak':
            mode = 'is-danger'
            break
          default:
            if (this.userPassword.length < 8) {
              mode = 'is-danger'
            } else {
              mode = 'is-success'
            }
        }
      }
      return mode
    },
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl'])
  },
  methods: {
    // Generate captcha using random numbers from 0-10
    genCaptcha () {
      this.question = `${Math.floor(Math.random() * 11)} + ${Math.floor(Math.random() * 11)}`
      const canvas = document.getElementById('captchaCanvas')
      const ctx = canvas.getContext('2d')
      ctx.font = '18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillText(`${this.question} = `, canvas.width / 2, canvas.height / 2)
    },
    // Validate captcha based on user input
    captcha () {
      const q = this.question.split('+')
      const ans = parseInt(q[0]) + parseInt(q[1])
      if (parseInt(this.userAnswer) === ans) {
        this.captchaSolved = true
      } else {
        this.captchaSolved = false
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
    },
    setToDate () {
      console.log('On date change')
      const from = window.gkutils.dateToString(this.yearStart).split('/') // yyyy/mm/dd
      const to = window.gkutils.stringToDate(`${parseInt(from[0]) + 1}/${from[1]}/${from[2]}`)
      to.setDate(to.getDate() - 1)
      this.yearEnd = to
    },
    getPasswordHint (pwdStrength) {
      const available = pwdStrength.contains.map((item) => item.message)
      let hint = this.options.pwdFieldTypes
        .filter((item) => !available.includes(item))
        .reduce((prev, cur) => { return `${prev} ${cur},` }, '')
      if (available.length < 4) {
        hint = `Require atleast 1 ${hint}.`
      }
      if (pwdStrength.length < 8) {
        hint += ' Must be minimum 8 characters long'
      }
      return hint
    },
    submitForm () {
      this.captcha()
      if (this.captchaSolved) {
        this.isLoading = true
        const payload = this.initPayload()
        axios.post(`${this.gkCoreUrl}/organisations`, payload)
          .then((response) => {
            // console.log(response)
            this.isLoading = false
            switch (response.data.gkstatus) {
              case 0:
                this.$store.dispatch('setSessionStates', {
                  auth: true,
                  orgCode: response.data.orgcode,
                  authToken: response.data.token,
                  user: { username: this.userName }
                })
                this.$router.push('/')
                this.$buefy.toast.open({
                  message: 'Logged in Successfully!',
                  type: 'is-success',
                  queue: false
                })
                break
              default:
                this.$buefy.toast.open({
                  message: 'Unable to create account, Please try again',
                  type: 'is-danger',
                  queue: false
                })
            } // end switch
          })
          .catch((error) => {
            this.$buefy.toast.open({
              message: `Error: ${error.message}`,
              type: 'is-warning',
              queue: false
            })
          })
          .then(() => {
            this.isLoading = false
          })
        // console.log(this.initPayload())
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
    },
    initPayload () {
      return {
        userdetails: {
          username: this.userName,
          userpassword: this.userPassword,
          userquestion: this.securityQuestion,
          useranswer: this.securityAnswer
        },
        orgdetails: {
          orgname: this.orgName,
          orgtype: this.options.orgType[this.orgType],
          yearstart: window.gkutils.dateToString(this.yearStart),
          yearend: window.gkutils.dateToString(this.yearEnd),
          orgcity: null,
          orgaddr: null,
          orgpincode: null,
          orgcountry: null,
          orgtelno: null,
          orgfax: null,
          orgwebsite: null,
          orgemail: null,
          orgpan: null,
          orgmvat: null,
          orgstax: null,
          orgregno: null,
          orgregdate: null,
          orgfcrano: null,
          orgfcradate: null,
          invflag: null,
          invsflag: null,
          billflag: null,
          avflag: null,
          maflag: null,
          avnoflag: null,
          ainvnoflag: null,
          modeflag: null
        }
      }
    }
  },
  mounted () {
    this.genCaptcha()
  }
}
</script>
