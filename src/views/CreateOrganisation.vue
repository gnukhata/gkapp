<!--
  ToDo:
  * Add validation for the fields (Password, Date)
  * Check accessibility
-->
<template>
  <div class="container-fluid mt-3">
    <div class="card">
      <div class="card-header">
        Create Organisation
      </div>
      <div class="card-body">
        <b-form class="text-left" @submit.prevent="onSubmit">
          <div class="row">
            <div class="col">
              <b-form-group
                id="input-group-1"
                label="Name"
                label-for="input-1"
                label-cols-sm="1">
                <b-form-input
                  id="input-1"
                  type="text"
                  placeholder="ABC Organisation"
                  v-model="orgName"
                  required>
                </b-form-input>
              </b-form-group>
              <b-form-group label="Type" v-slot="{ ariaDescribedby }" label-cols-sm="1">
                <b-form-radio-group
                  id="btn-radios-1"
                  v-model="orgType"
                  :options="options.orgType"
                  :aria-describedby="ariaDescribedby"
                  button-variant="outline-primary"
                  name="radios-btn-outline"
                  buttons
                ></b-form-radio-group>
              </b-form-group>
              <b-form-group
                id="input-group-2"
                label="Financial Year">
                <div class="row">
                  <div class="col-6">
                    <b-form-group
                      id="input-group-3"
                      label="From"
                      label-for="date-1">
                      <b-input-group class="mb-3">
                        <b-form-input
                          @input="setYearEnd"
                          id="date-1"
                          v-model="yearStart"
                          type="text"
                          placeholder="YYYY-MM-DD"
                          autocomplete="off"
                          required
                        ></b-form-input>
                        <b-input-group-append>
                          <b-form-datepicker
                            v-model="yearStart"
                            button-only
                            right
                            locale="en-GB"
                            @context="setYearEnd"
                            aria-controls="date-1">
                          </b-form-datepicker>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                  </div>
                  <div class="col">
                    <b-form-group
                      id="input-group-4"
                      label="To"
                      label-for="date-2">
                      <b-input-group class="mb-3">
                        <b-form-input
                          id="date-2"
                          v-model="yearEnd"
                          type="text"
                          placeholder="YYYY-MM-DD"
                          autocomplete="off"
                          required
                        ></b-form-input>
                        <b-input-group-append>
                          <b-form-datepicker
                            v-model="yearEnd"
                            button-only
                            right
                            locale="en-GB"
                            aria-controls="date-2">
                          </b-form-datepicker>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                  </div>
                </div>
              </b-form-group>
            </div>
         <!--Right columns-->
            <div class="col-md-6">
              <b-form-group
                id="input-group-5"
                label="Name"
                label-for="input-2"
                label-cols-sm="1">
                <b-form-input
                  id="input-2"
                  type="text"
                  placeholder="Enter Admin Username"
                  v-model="userName"
                  required>
                </b-form-input>
              </b-form-group>
              <b-form-group
                id="input-group-6"
                label="Password"
                label-for="password-1"
                label-cols-sm="1"
                :state="isPasswordValid"
                :invalid-feedback="passwordFeedback"
                :valid-feedback="passwordFeedback"
                >
                <b-form-input
                  id="password-1"
                  type="password"
                  placeholder="P@$$w0rd"
                  v-model="userPassword"
                  label-cols="1"
                  :state="isPasswordValid"
                  debounce="500"
                  required>
                </b-form-input>
              </b-form-group>
              <b-form-group
                id="input-group-7"
                label="Password Recovery"
                label-for="input-3">
                <div class="row">
                  <div class="col-6">
                    <b-form-group
                      id="input-group-8"
                      label="Question"
                      label-for="input-3">
                      <b-form-input
                        id="input-3"
                        type="text"
                        placeholder="Who am I?"
                        v-model="securityQuestion"
                        required>
                      </b-form-input>
                    </b-form-group>
                  </div>
                  <div class="col-6">
                    <b-form-group
                      id="input-group-9"
                      label="Answer"
                      label-for="input-4">
                      <b-form-input
                        id="input-4"
                        type="text"
                        placeholder="GNUKhata"
                        v-model="securityAnswer"
                        required>
                      </b-form-input>
                    </b-form-group>
                  </div>
                </div>
              </b-form-group>
              <b-form-group id="input-group-1" label="Captcha" label-for="captcha-1" description="* Required">
                <b-row>
                    <canvas ria-label="Captcha field" width="70" height="30" id="captchaCanvas" style="border:1px solid #d3d3d3;"></canvas>
                    <b-button size="sm" 
                      @click.prevent="audioCaptcha" 
                      role="button" 
                      title="listen to captcha" 
                      aria-label="Audio Captcha button"
                      class="mb-button ml-1">
                      <b-icon aria-hidden="true" icon="play-circle"></b-icon>
                      Audio
                    </b-button>
                  <!-- <b-col> -->
                    <b-form-input class="mt-3"
                      id="captcha-1"
                      v-model="userAnswer"
                      type="text"
                      placeholder="Answer"
                      required>
                    </b-form-input>
                  <!-- </b-col> -->
                </b-row>
              </b-form-group>
            </div>
          </div>
          <hr>
          <div class="float-right">
            <b-button class="mr-2" variant="danger" :to="{ name: 'Login' }">
              <b-icon aria-hidden="true" class="align-middle" icon="arrow-left"></b-icon>
              <span class="align-middle"> Back</span>
            </b-button>
            <b-button type="submit" class="mr-2" variant="primary">
              <b-spinner v-if="isLoading" small></b-spinner>
              <b-icon v-else aria-hidden="true" class="align-middle" icon="plus-square"></b-icon>
              <span class="align-middle"> Create &amp; Login</span>
            </b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import passwordStrength from 'check-password-strength'

export default {
  name: 'CreateOrganisation',
  components: {
  },
  data () {
    return {
      // gkCoreUrl: 'https://satheerthan.site:6543', // 'http://localhost:6543',
      isLoading: false,
      options: {
        orgType: [{ text: 'Profit Making', value: 0 }, { text: 'Not For Profit', value: 1 }],
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
    pwdStrength: (self) => (self.userPassword !== '' && self.userPassword !== null) ? passwordStrength(self.userPassword) : { value: 'Empty' },
    isPasswordValid: (self) => (self.pwdStrength.value === 'Empty') ? null : (self.pwdStrength.value === 'Strong'),
    passwordFeedback () {
      let text = ''
      if (this.userPassword) {
        switch (this.pwdStrength.value) {
          case 'Strong':
            text = 'Password is Strong.'
            break
          case 'Medium':
            text = this.getPasswordHint(this.pwdStrength)
            break
          case 'Weak':
            text = this.getPasswordHint(this.pwdStrength)
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
    setYearEnd () {
      // console.log('On date change')
      if(this.yearStart !== null && this.year !== '') {
        const from = this.yearStart.split('-') // yyyy/mm/dd
        const to = new Date(`${parseInt(from[0]) + 1}/${from[1]}/${from[2]}`)
        let end = null
        to.setDate(to.getDate() - 1)
        end = `${ to.getFullYear() }-${ to.getMonth() + 1 }-${ to.getDate() }`
        if(end.includes('NaN')) {
          this.yearEnd = null
        } else {
          this.yearEnd = end
        }
      } else {
        this.yearEnd = null
      }
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
    onSubmit () {
      this.captcha()
      if (this.captchaSolved) {
        this.isLoading = true
        const payload = this.initPayload()
        axios.post("/organisations", payload)
          .then((response) => {
            // console.log(response)
            this.isLoading = false
            switch (response.data.gkstatus) {
              case 0:
                this.$store.dispatch("setSessionStates", {
                  orgCode: response.data.orgcode,
                  authToken: response.data.token,
                }).then(() => {
                  axios.get("/organisation").then((response2) => {
                    if(response2.data.gkstatus === 0) {
                      this.$store.dispatch("setSessionStates", {
                      auth: true,
                      orgName: `${response2.data.gkdata.orgname} (${response2.data.gkdata.orgtype})`,
                      user: { username: payload.userdetails.username },
                      orgYears: {
                        yearStart: response2.data.gkdata.yearstart,
                        yearEnd: response2.data.gkdata.yearend,
                      },
                    }); 
                      this.$router.push('/workflow')
                      this.$bvToast.toast(`Logged in Successfully!`, {
                        title: 'Create Account Success!',
                        autoHideDelay: 3000,
                        variant: 'success',
                        appendToast: true,
                        solid: true
                      })
                    } else {
                      this.$bvToast.toast(`Unable to Login to Account, Please try again`, {
                        title: 'Login Error!',
                        autoHideDelay: 3000,
                        variant: 'danger',
                        appendToast: true,
                        solid: true
                      })
                    }
                  }).catch((error) => {
                    this.$bvToast.toast(`Error: ${error.message}`, {
                      title: 'Login Error!',
                      autoHideDelay: 3000,
                      variant: 'danger',
                      appendToast: true,
                      solid: true
                    })
                  })
                })
                break
              case 1:
                this.$bvToast.toast(`Duplicate Entry! Please Check the Organisation Name`, {
                  title: 'Create Account Error!',
                  autoHideDelay: 3000,
                  variant: 'danger',
                  appendToast: true,
                  solid: true
                })
                break;
              break;
              default:
                this.$bvToast.toast(`Unable to create account, Please try again`, {
                  title: 'Create Account Error!',
                  autoHideDelay: 3000,
                  variant: 'danger',
                  appendToast: true,
                  solid: true
                })
            } // end switch
          })
          .catch((error) => {
            this.$bvToast.toast(`Error: ${error.message}`, {
              title: 'Create Account Error!',
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true
            })
          })
          .then(() => {
            this.isLoading = false
          })
        // console.log(this.initPayload())
      } else {
        // Alert the user on captcha failure
        this.$bvToast.toast(`Captcha is incorrect. Please try again`, {
          title: 'Captcha Error!',
          autoHideDelay: 3000,
          variant: 'warning',
          appendToast: true,
          solid: true
        })
        // Generate new captcha
        this.genCaptcha()
      }
    },
    initPayload () {
      console.log(this.orgType)
      return {
        userdetails: {
          username: this.userName,
          userpassword: this.userPassword,
          userquestion: this.securityQuestion,
          useranswer: this.securityAnswer
        },
        orgdetails: {
          orgname: this.orgName,
          orgtype: this.options.orgType[this.orgType].text,
          yearstart: this.yearStart.split("-").join("/"),
          yearend: this.yearEnd.split("-").join("/"),
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
