<template>
  <section class="d-flex justify-content-center mt-2">
    <!-- Server Selection-->
    <b-card
      v-show="!showLogin"
      header-bg-variant="primary"
      header="Server Setup"
      class="mt-2 shadow"
    >
      <template #header>
        <h5 class="m-0 text-light">
          <b-icon icon="cloud-plus"></b-icon> GNUKhata Server Setup
        </h5>
      </template>
      <b-card-body>
        <b-form @submit.prevent="setServerUrl" class="text-center">
          <b-button @click.prevent="setDefaultServer">
            <b-icon icon="arrow-right-circle"></b-icon>
            Continue with Default Server
          </b-button>
          <div class="mt-2 mb-2"><b>OR</b></div>
          <h5 class="text-muted text-center">Custom Server URL</h5>
          <b-form-group label-cols="auto">
            <b-form-input
              :state="urlIsValid"
              v-model="serverUrl"
              type="url"
              placeholder="https://example.com"
            ></b-form-input>
            <b-form-invalid-feedback id="input-live-feedback">
              URL should not contain " / " in the end
            </b-form-invalid-feedback>
          </b-form-group>
          <b-button
            type="submit"
            variant="success"
            :disabled="serverUrl === '' ? true : false"
            ><b-icon icon="arrow-right-circle"></b-icon> Save &amp;
            Continue</b-button
          >
        </b-form>
      </b-card-body>
    </b-card>
    <!-- Login card -->
    <b-card
      v-show="showLogin"
      header="Login"
      class="shadow m-1"
      header-bg-variant="primary"
      header-text-variant="light"
    >
      <b-alert show variant="info">
        Demo Username: <b>admin</b> <br />
        Password: <b>admin</b> <br />
        Organisation: <b>WALLMART</b></b-alert
      >
      <b-card-body>
        <b-form @submit.prevent="login">
          <!--Username area-->
          <b-form-group
            label="Username"
            description="* Required"
            label-cols="auto"
            content-cols="auto"
          >
            <b-form-input
              v-model="form.username"
              type="text"
              placeholder="Enter Username"
              required
            ></b-form-input>
          </b-form-group>
          <!-- Password area -->
          <b-form-group
            id="input-group-2"
            label="Password"
            description="* Required"
            label-for="input-2"
            label-cols="auto"
            content-cols="auto"
          >
            <b-form-input
              id="input-2"
              v-model="form.userpassword"
              placeholder="Enter password"
              type="password"
              required
            ></b-form-input>
          </b-form-group>

          <!--Select company area-->
          <b-form-group
            id="input-group-3"
            label="Organisation"
            description="* Required"
            label-cols="auto"
            label-for="input-3"
            content-cols="auto"
          >
            <b-overlay :show="isDisabled">
              <b-form-select
                v-on:change="getOrgYears"
                id="input-3"
                v-model="orgIndex"
                :options="options"
                required
              >
                <b-form-select-option value="null" disabled
                  >-- Select Organisation --</b-form-select-option
                >
              </b-form-select>
            </b-overlay>
          </b-form-group>
          <!-- Financial Year-->
          <b-form-group
            id="input-group-3"
            label="Financial Year"
            description="* Required"
            label-cols="auto"
            content-cols="auto"
          >
            <b-overlay :show="isDisabled">
              <b-form-select
                v-model="form.orgcode"
                :options="orgYears"
                required
              >
                <b-form-select-option value="null" disabled
                  >-- Select Year --</b-form-select-option
                >
              </b-form-select>
            </b-overlay>
          </b-form-group>
          <!--Captcha area-->
          <b-form-group label="Question" content-cols="auto" label-cols="auto">
            <captcha v-model="answer"></captcha>
          </b-form-group>
          <!-- captcha answer -->
          <b-form-group
            label="Answer"
            description="* Required"
            label-cols="auto"
            content-cols="auto"
          >
            <b-form-input
              v-model="userAnswer"
              type="number"
              no-wheel
              placeholder="Enter the Answer"
              required
            >
            </b-form-input>
          </b-form-group>
          <!-- Login & create account buttons-->
          <div class="float-right">
            <b-button-group size="sm">
              <b-button
                :disabled="isDisabled"
                variant="primary"
                class="mr-2"
                type="submit"
              >
                <b-spinner v-if="isLoading" small></b-spinner>
                <b-icon v-if="!isLoading" icon="box-arrow-in-right"></b-icon>
                Login
              </b-button>
              <b-button
                variant="success"
                class="mr-2"
                :to="{ name: 'Create_Organisation' }"
              >
                <b-icon icon="person-plus"></b-icon>
                Create Organisation
              </b-button>
              <b-button variant="warning" class="mr-2" @click="switchServer">
                <b-icon icon="cloud"></b-icon>
                Change Server
              </b-button>
              <b-button variant="info" @click="$router.push('/resetpassword')">
                <b-icon icon="life-preserver"></b-icon>
                Forgot Password?
              </b-button>
            </b-button-group>
          </div>
        </b-form>
      </b-card-body>
    </b-card>
  </section>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Captcha from '../components/Captcha.vue';
export default {
  name: 'login',
  components: { Captcha },
  data() {
    return {
      notificationIsActive: true,
      captchaSolved: false,
      isLoading: false,
      isDisabled: true,
      options: null, // companys list
      answer: null,
      userAnswer: null,
      showLogin: false,
      orgList: null,
      orgIndex: null,
      orgYears: [], //
      orgYearsFull: [], // org array with org details objects
      serverUrl: '',
      form: {
        username: null,
        userpassword: null,
        orgcode: null,
        orgName: null,
      },
    };
  },
  methods: {
    /** Check if gkCoreUrl is not null,
     * If so, show URL window
     */
    checkUrl() {
      if (this.gkCoreUrl == null) {
        this.showLogin = false;
      } else {
        this.showLogin = true;
      }
    },
    setDefaultServer() {
      // If you want to change this value, Set environment variable VUE_APP_GKCORE_URL (only updates during build)
      const defaultGkCoreUrl =
        process.env.VUE_APP_GKCORE_URL !== undefined
          ? process.env.VUE_APP_GKCORE_URL
          : 'http://localhost:6543';
      axios
        .get(`${defaultGkCoreUrl}/state`)
        .then((res) => {
          if (res.status == 200 && res.data.gkstatus == 0) {
            this.$store.commit('setGkCoreUrl', {
              gkCoreUrl: defaultGkCoreUrl,
            });
            this.showLogin = true;
            this.fetchOrgs();
          } else {
            this.$bvToast.toast('Please check your server setup', {
              title: 'Unable to Connect To The Server :-(',
              variant: 'danger',
              solid: true,
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(
            'Please check if gkcore is properly setup & running on port 6543',
            {
              title: e.message,
              solid: true,
              variant: 'danger',
            }
          );
        });
    },
    /**
     * Validate given server URL
     */
    setServerUrl() {
      // Check if it's a valid gkcore url
      console.log('checking custom url ', this.serverUrl);
      axios
        .get(`${this.serverUrl}/state`)
        .then((res) => {
          if (res.status == 200 && res.data.gkstatus == 0) {
            this.$store.commit('setGkCoreUrl', {
              gkCoreUrl: this.serverUrl,
            });
            this.showLogin = true;
            this.fetchOrgs();
          } else {
            this.$bvToast.toast('Please check your server setup', {
              title: 'Unable to Connect To The Server :-(',
              variant: 'danger',
              solid: true,
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Invalid URL',
            variant: 'danger',
            solid: true,
          });
        });
    },
    /**
     * Clear localStorage, reset vuex state
     * and show the server setup menu
     */
    switchServer() {
      localStorage.clear();
      this.$store.commit('setGkCoreUrl', {
        gkCoreUrl: null,
      });
      this.checkUrl();
    },
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
                let orgname = this.orgList[this.orgIndex].orgname;
                let orgtype = this.orgList[this.orgIndex].orgtype;
                let orgfy = this.orgFinancialYear();
                this.$store.dispatch('setSessionStates', {
                  auth: true,
                  orgCode: this.form.orgcode,
                  orgName: `${orgname} (${orgtype})`,
                  authToken: response.data.token,
                  user: { username: this.form.username },
                  orgYears: {
                    yearStart: orgfy.startYear,
                    yearEnd: orgfy.endYear,
                  },
                });
                // Initiate axios defaults
                axios.defaults.baseURL = this.gkCoreUrl;
                axios.defaults.headers = { gktoken: response.data.token };
                this.$router.push('/workflow/Transactions/-1');
                // Alert the user on successful login
                this.$bvToast.toast(`Welcome to gnukhata!`, {
                  title: 'Login Successful',
                  autoHideDelay: 3000,
                  appendToast: true,
                  variant: 'success',
                  solid: true,
                });
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
              console.log('Wrong login details');
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
          console.log(error.message);
        });
    },
    /**
     * Get list of companies & show them in login form for user to select
     * */
    fetchOrgs() {
      axios
        .get(`${this.gkCoreUrl}/organisations`)
        .then((response) => {
          this.orgList = response.data.gkdata;
          // Convert the api data b-vue compatible
          let opt = [];
          for (const i in this.orgList) {
            const item = {
              value: i,
              text: `${this.orgList[i].orgname} (${this.orgList[i].orgtype})`,
            };
            opt.push(item);
          }
          this.options = opt;
          this.isDisabled = false; // hide the spinner
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    /*
     * send org name & type & get a org's financial years as objects
     */
    getOrgYears() {
      this.isDisabled = true;
      let name = this.orgList[this.orgIndex].orgname;
      let type = this.orgList[this.orgIndex].orgtype;
      axios
        .get(`/orgyears/${name}/${type}`)
        .then((r) => {
          if (r.status == 200) {
            let data = r.data.gkdata.map((data) => {
              // console.log(Object.values(data));
              let obj = {};
              obj.text = `${Object.values(data)[0]} to ${
                Object.values(data)[1]
              }`;
              obj.value = Object.values(data)[2];
              return obj;
            });
            this.orgYears = data;
            this.orgYearsFull = r.data.gkdata;
            this.isDisabled = false;
          }
        })
        .catch((e) => {
          console.log(e.message);
          this.isDisabled = false;
        });
    },
    /* return an org's financial start & end year as object
     */
    orgFinancialYear() {
      for (let i in this.orgYearsFull) {
        if (this.orgYearsFull[i].orgcode === this.form.orgcode) {
          return {
            startYear: this.orgYearsFull[i].yearstart,
            endYear: this.orgYearsFull[i].yearend,
          };
        }
      }
    },
  },
  mounted() {
    this.fetchOrgs();
    this.checkUrl();
    if (this.userAuthenticated) {
      this.$router.push('/workflow/Transactions/-1');
    }
  },
  computed: {
    ...mapState(['gkCoreUrl', 'userAuthenticated']),
    urlIsValid() {
      return this.serverUrl
        .split('')
        .reverse()
        .join('')[0] == '/'
        ? false
        : true;
    },
  },
};
</script>
<style></style>
