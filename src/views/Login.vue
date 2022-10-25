<template>
  <section class="m-2">
    <!-- Login card -->
    <b-card
      v-if="!loginSuccess"
      class="shadow mx-auto"
      style="max-width: 35em"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        <gk-cardheader
          :name="
            $gettextInterpolate($gettext('Login To %{orgNameDisplay}'), {
              orgNameDisplay: orgNameDisplay,
            })
          "
          help-title="Login"
          help-body="Login with your username, password"
        ></gk-cardheader>
      </template>
      <b-card-body class="p-0 m-0">
        <b-form @submit.prevent="login">
          <!--Username area-->
          <b-form-group
            :label="$gettext('Username')"
            label-cols="4"
            label-size="sm"
            label-align="right"
          >
            <b-form-input
              v-model="form.username"
              type="text"
              size="sm"
              :placeholder="$gettext('Enter Username')"
              required
            ></b-form-input>
          </b-form-group>
          <!-- Password area -->
          <b-form-group
            :label="$gettext('Password')"
            label-cols="4"
            label-align="right"
            label-size="sm"
          >
            <password
              v-model="form.userpassword"
              :password-hint="false"
              :placeholder="$gettext('Password')"
              size="sm"
            ></password>

            <b-button
              variant="link"
              class="p-0 float-right"
              @click="showResetPwd = true"
            >
              <small> <translate>Forgot Password?</translate> </small>
            </b-button>
          </b-form-group>

          <!--Captcha question -->
          <b-form-group
            :label="$gettext('Question')"
            label-align="right"
            label-cols="4"
            label-size="sm"
          >
            <captcha v-model="answer"></captcha>
          </b-form-group>

          <!-- captcha answer -->
          <b-form-group
            :label="$gettext('Answer')"
            label-cols="4"
            label-size="sm"
            label-align="right"
          >
            <b-form-input
              v-model="userAnswer"
              type="number"
              no-wheel
              :placeholder="$gettext('Enter the Answer')"
              required
              size="sm"
            ></b-form-input>
          </b-form-group>
          <!-- Login & create account buttons-->
          <b-button-group size="sm" class="row float-right">
            <b-button variant="dark" class="m-1" @click="switchServer">
              <b-icon class="mr-1" icon="cloud"></b-icon>
              <translate> Change Server</translate>
            </b-button>
            <b-button
              class="m-1"
              variant="dark"
              @click="$router.push('/select-org')"
            >
              <b-icon class="mr-1" icon="building"></b-icon>
              <translate> Change Organisation</translate>
            </b-button>
            <b-button class="m-1" variant="success" type="submit">
              <b-spinner v-if="isLoading" small></b-spinner>
              <b-icon
                class="mr-1"
                v-if="!isLoading"
                icon="box-arrow-in-right"
              ></b-icon>
              <translate> Login</translate>
            </b-button>
          </b-button-group>
        </b-form>
      </b-card-body>
    </b-card>
    <b-card
      v-else
      class="shadow mx-auto"
      style="max-width: 35em"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Rename User
      </template>
      <b-alert show variant="dark" :hidden="false" class="mb-2 mx-auto">
        Note: We have moved to a unique username system on this server. Thus all
        the users without a unique username have to reset their usernames.
      </b-alert>
      <b-form @submit.prevent="updateUserName">
        <b-form-group
          :label="$gettext('New User Name')"
          label-cols="4"
          label-size="sm"
          label-align="right"
          valid-feedback="User name available!"
          invalid-feedback="User name already taken."
          :state="userNameValidity"
        >
          <b-form-input
            :debounce="500"
            v-model.trim="newUserName"
            required
            size="sm"
            :state="userNameValidity"
            @update="updateUserNameValidity"
          ></b-form-input>
        </b-form-group>
        <b-button
          :disabled="!userNameValidity"
          class="m-1 float-right"
          variant="success"
          type="submit"
        >
          <b-spinner v-if="isLoading" small></b-spinner>
          <b-icon
            class="mr-1"
            v-if="!isLoading"
            icon="box-arrow-in-right"
          ></b-icon>
          <translate> Continue</translate>
        </b-button>
      </b-form>
    </b-card>
    <b-modal
      size="lg"
      v-model="showResetPwd"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <reset-password :onSuccess="onPwdReset"></reset-password>
    </b-modal>
  </section>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Captcha from '../components/Captcha.vue';
import GkCardheader from '../components/GkCardheader.vue';
import Password from '../components/Password.vue';
import ResetPassword from '@/components/form/ResetPassword.vue';
export default {
  name: 'login',
  components: { Captcha, GkCardheader, Password, ResetPassword },
  data() {
    return {
      showResetPwd: false,
      orgNameDisplay: '',
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
      loginSuccess: false,
      newUserName: '',
      userNameValidity: null,
      userid: null,
      olduserid: null,
      authToken: null,
    };
  },
  methods: {
    onPwdReset() {
      this.showResetPwd = false;
    },
    updateUserName() {
      if (!this.userNameValidity) {
        return;
      }
      let payload = {
        userid: this.userid,
        olduserid: this.olduserid,
        username: this.newUserName,
      };
      axios.put('/gkusers?type=default_user_name', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.$store.dispatch('setSessionStates', {
            userAuth: true,
            userAuthToken: resp.data.token,
          });
          this.openOrg();
        } else {
          console.log(resp);
        }
      });
    },
    openOrg() {
      let orgname = this.orgNameDisplay;
      // Initiate vuex store
      this.$store.dispatch('setSessionStates', {
        auth: true,
        orgCode: this.form.orgcode,
        orgName: orgname,
        authToken: this.authToken,
        user: { username: this.form.username },
        // orgYears: {
        //   yearStart: orgfy.startYear,
        //   yearEnd: orgfy.endYear,
        // },
      });
      Promise.all([
        this.$store.dispatch('initLocalStates'), // initialises vuex, org image and org address
        this.$store.dispatch('global/initGlobalConfig'), // initialises global config
      ]).then(() => {
        this.$store
          .dispatch('global/initGlobalState', {
            lang: this.$language,
          })
          .then(() => {
            // debugger;
            // redirect to workflow on login
            this.$router.push('/workflow/Transactions-Invoice/-1');
          });
      });
    },
    /**
     * Validate & Login the user
     */
    login() {
      this.isLoading = true;
      axios
        .post(`${this.gkCoreUrl}/login?type=org`, this.form)
        .then((response) => {
          // alert user depending on the gkstatus code
          this.loginSuccess = false;
          switch (response.data.gkstatus) {
            case 0:
              this.isLoading = false;
              if (this.answer == this.userAnswer) {
                //let orgtype = this.orgList[this.orgIndex].orgtype;
                //                 let orgfy = this.orgFinancialYear();
                // Initiate axios defaults
                axios.defaults.baseURL = this.gkCoreUrl;
                axios.defaults.headers = { gktoken: response.data.token };

                this.loginSuccess = true;
                this.userid = response.data.userid;
                this.olduserid = response.data.olduserid;
                this.authToken = response.data.token;
                // this.get_org_address();
                // this.getOrgImage();
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
    oldLogin() {
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

                Promise.all([
                  this.$store.dispatch('initLocalStates'), // initialises vuex, org image and org address
                  this.$store.dispatch('global/initGlobalConfig'), // initialises global config
                ]).then(() => {
                  this.$store
                    .dispatch('global/initGlobalState', {
                      lang: this.$language,
                    })
                    .then(() => {
                      // debugger;
                      // redirect to workflow on login
                      this.$router.push('/workflow/Transactions-Invoice/-1');
                    });
                });

                // this.get_org_address();
                // this.getOrgImage();
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
    updateUserNameValidity(name) {
      if (name) {
        axios
          .get(`/gkusers?type=unique_check&username=${name}&check_legacy=true`)
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              this.userNameValidity = resp.data.gkresult;
            }
          });
      } else {
        this.userNameValidity = null;
      }
    }
  },
  mounted() {
    let url = localStorage.getItem('gkCoreUrl');
    if (url == null || url == 'null') {
      this.$router.push('/server-setup');
    }
    if (this.userOrgAuthenticated) {
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
    ...mapState(['gkCoreUrl', 'userOrgAuthenticated']),
  },
};
</script>
