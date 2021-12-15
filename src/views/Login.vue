<template>
  <section class="m-2">
    <b-alert
      v-if="gkConfig.notice"
      show
      variant="dark"
      :hidden="false"
      class="mb-2 mx-auto"
      style="max-width:35em"
    >
      <i>Demo Account Details:</i>
      <br />Organisation:
      <b>WALLMART</b>
      <br />Username:
      <b>admin</b>
      <br />Password:
      <b>admin</b>
    </b-alert>
    <!-- Login card -->
    <b-card
      class="shadow mx-auto"
      style="max-width: 35em"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        <gk-cardheader
          :name="'Login to ' + orgNameDisplay"
          help-title="Login"
          help-body="Login with your username, password"
        ></gk-cardheader>
      </template>
      <b-card-body class="p-0 m-0">
        <b-form @submit.prevent="login">
          <!--Username area-->
          <b-form-group
            label="Username"
            label-cols="4"
            label-size="sm"
            label-align="right"
          >
            <b-form-input
              v-model="form.username"
              type="text"
              size="sm"
              placeholder="Enter Username"
              required
            ></b-form-input>
          </b-form-group>
          <!-- Password area -->
          <b-form-group
            label="Password"
            label-cols="4"
            label-align="right"
            label-size="sm"
          >
            <password
              v-model="form.userpassword"
              :password-hint="false"
              placeholder="Password"
              size="sm"
            ></password>
            <router-link class="float-right" to="/resetpassword">
              <small>Forgot Password?</small>
            </router-link>
          </b-form-group>

          <!--Captcha question -->
          <b-form-group
            label="Question"
            label-align="right"
            label-cols="4"
            label-size="sm"
          >
            <captcha v-model="answer"></captcha>
          </b-form-group>

          <!-- captcha answer -->
          <b-form-group
            label="Answer"
            label-cols="4"
            label-size="sm"
            label-align="right"
          >
            <b-form-input
              v-model="userAnswer"
              type="number"
              no-wheel
              placeholder="Enter the Answer"
              required
              size="sm"
            ></b-form-input>
          </b-form-group>
          <!-- Login & create account buttons-->
          <b-button-group size="sm" class="row float-right">
            <b-button variant="dark" class="m-1" @click="switchServer">
              <b-icon icon="cloud"></b-icon> Change Server
            </b-button>
            <b-button
              class="m-1"
              variant="dark"
              @click="$router.push('/select-org')"
            >
              <b-icon icon="building"></b-icon> Change Organisation
            </b-button>
            <b-button class="m-1" variant="success" type="submit">
              <b-spinner v-if="isLoading" small></b-spinner>
              <b-icon v-if="!isLoading" icon="box-arrow-in-right"></b-icon>
              Login
            </b-button>
          </b-button-group>
        </b-form>
      </b-card-body>
    </b-card>
    <!-- <div class="d-flex mt-2 justify-content-center">
         <b-link class="m-2" size="sm" @click="switchServer">
         <b-icon icon="cloud"></b-icon>
         Change Server
         </b-link>
    </div>-->
  </section>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Captcha from '../components/Captcha.vue';
import GkCardheader from '../components/GkCardheader.vue';
import Password from '../components/Password.vue';
export default {
  name: 'login',
  components: { Captcha, GkCardheader, Password },
  data() {
    return {
      orgNameDisplay: null,
      captchaSolved: false,
      isLoading: false,
      answer: null,
      userAnswer: null,
      form: {
        username: null,
        userpassword: null,
        orgcode: null,
        orgname: null,
      },
    };
  },
  methods: {
    /**
     * Validate & Login the user
     */
    login() {
      this.isLoading = true;
      axios
        .post(`${this.gkCoreUrl}/login`, this.form)
        .then((response) => {
          // alert user depending on the gkstatus code
          switch (response.data.gkstatus) {
            case 0:
              this.isLoading = false;
              if (this.answer == this.userAnswer) {
                let orgname = this.orgNameDisplay;
                //let orgtype = this.orgList[this.orgIndex].orgtype;
                //                 let orgfy = this.orgFinancialYear();
                // Initiate axios defaults
                axios.defaults.baseURL = this.gkCoreUrl;
                axios.defaults.headers = { gktoken: response.data.token };

                // Initiate vuex store
                this.$store.dispatch('setSessionStates', {
                  auth: true,
                  orgCode: this.form.orgcode,
                  orgName: orgname,
                  authToken: response.data.token,
                  user: { username: this.form.username },
                  // orgYears: {
                  //   yearStart: orgfy.startYear,
                  //   yearEnd: orgfy.endYear,
                  // },
                });
                this.$store.dispatch('global/initGlobalConfig');

                // redirect to workflow on login
                this.$router.push('/workflow/Transactions-Invoice/-1');
              } else {
                // Alert the user on captcha failure
                this.$bvToast.toast(`Incorrect Answer`, {
                  title: 'Captcha failed',
                  autoHideDelay: 3000,
                  appendToast: true,
                  variant: 'danger',
                  solid: true,
                });
              }
              break;
            case 2:
              // Alert user on wrong credentials
              this.$bvToast.toast(`Invalid login details`, {
                title: 'Login Error!',
                autoHideDelay: 3000,
                variant: 'danger',
                appendToast: true,
                solid: true,
              });
              this.isLoading = false;
              break;
            default:
              this.isLoading = false;
          } // end switch
        })
        .catch((error) => {
          this.isLoading = false;
          this.$bvToast.toast(error.message, {
            title: 'Login Error!',
            autoHideDelay: 3000,
            variant: 'danger',
            appendToast: true,
            solid: true,
          });
          console.log(error.message);
        });
    },
    /* return an org's financial start & end year as object
     */
    orgFinancialYear() {
      for (let i in this.orgYears) {
        if (this.orgYears[i].orgcode === this.form.orgcode) {
          return {
            startYear: this.orgYears[i].yearstart,
            endYear: this.orgYears[i].yearend,
          };
        }
      }
    },
  },
  mounted() {
    let url = localStorage.getItem('gkCoreUrl');
    if (url == null || url == 'null') {
      this.$router.push('/server-setup');
    }
    if (this.userAuthenticated) {
      this.$router.push('/workflow/Transactions-Invoice/-1');
    }

    this.form.orgcode = localStorage.getItem('orgCodeChoice');
    if (this.form.orgcode === 'null' || this.form.orgcode == null) {
      this.$router.push('/select-org');
    }
    let orgChoice = localStorage.getItem('orgChoice');
    this.orgNameDisplay = orgChoice ? orgChoice.split('(')[0] : '';
  },
  computed: {
    ...mapState(['gkCoreUrl', 'userAuthenticated']),
  },
};
</script>
