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
                            v-model="yearStart"
                            placeholder="dd / mm / yyyy"
                            icon="calendar-today"
                            editable
                            required>
                    </b-datepicker>
                  </b-field>
                  <b-field label="to" label-position="on-border">
                    <b-datepicker
                            v-model="yearEnd"
                            placeholder="dd / mm / yyyy"
                            icon="calendar-today"
                            editable
                            required>
                    </b-datepicker>
                  </b-field>
              </div>
            </div>
          </div>
          <div class="column">
            <b-field label="Admin Name" expanded>
              <b-input placeholder="Admin User"
                v-model="userName"
                icon="account-circle"
                required>
              </b-input>
            </b-field>
            <b-field label="Password">
              <b-input type="password"
                v-model="userPassword"
                icon="lock"
                placeholder="P@$$w0rd"
                password-reveal
                required></b-input>
            </b-field>
            <div class="field">
              <label class="label">Password Recovery</label>
              <div class="field-body mt-3">
                <b-field label="question" label-position="on-border">
                  <b-input placeholder="Who am i?" v-model="securityAnswer" required></b-input>
                </b-field>
                <b-field label="answer" label-position="on-border">
                  <b-input placeholder="GNUKhata" v-model="securityQuestion" required></b-input>
                </b-field>
              </div>
            </div>
          </div>
        </div>
        <hr>
        <b-field grouped position="is-right">
          <div class="control">
            <button type="submit" class="button is-success" :class="{'is-loading':isLoading}">
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

export default {
  name: 'CreateOrganisationForm',
  components: {
  },
  data () {
    return {
      isLoading: false,
      options: {
        orgType: ['Profit making', 'Not For Profit']
      },
      orgName: '',
      orgType: 0,
      yearStart: null,
      yearEnd: null,
      userName: '',
      userPassword: '',
      securityAnswer: '',
      securityQuestion: ''
    }
  },
  computed: {
    ...mapState(['gkCoreUrl'])
  },
  methods: {
    submitForm () {
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
                orgCode: response.orgcode,
                authToken: response.token,
                user: { username: this.username }
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
            message: error,
            type: 'is-warning',
            queue: false
          })
        })
        .then(() => {
          this.isLoading = false
        })
      // console.log(this.initPayload())
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
  }
}
</script>
