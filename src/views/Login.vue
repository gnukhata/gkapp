<template>
  <section class="d-flex justify-content-center mt-3">
    <b-card
      header="Login"
      class="shadow"
      header-bg-variant="primary"
      header-text-variant="light"
    >
      <!-- <div class="card-header">Login</div> -->
      <b-card-body class="card-body">
        <b-form>
          <b-alert show variant="info"
            >Demo Username: <b>user_a</b> / Password: <b>user_a</b> / Company:
            <b>ABC Delivery</b></b-alert
          >
          <!--Username area-->
          <b-form-group
            label="Username"
            description="* Required"
            label-cols="auto"
          >
            <b-form-input
              id="input-1"
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
            label="Company"
            description="* Required"
            label-cols="auto"
            label-for="input-3"
          >
            <b-overlay :show="isDisabled" variant="secondary" no-wrap blur>
            </b-overlay>
            <b-form-select
              id="input-3"
              v-model="orgIndex"
              :options="options"
              required
            >
              <b-form-select-option value="null" disabled
                >-- Select Company --</b-form-select-option
              >
            </b-form-select>
          </b-form-group>
          <!--Gkcore url select-->
          <b-form-group
            v-if="gkCoreUrl == ''"
            label="gkcore url"
            description="* Leave blank for default url"
            label-cols-sm="1"
          >
            <b-form-input
              placeholder="https://example.com"
              v-model="form.customUrl"
            >
            </b-form-input>
          </b-form-group>
          <!--Captcha area-->
          <b-form-group label="Question" label-cols="auto">
            <b-form-row>
              <canvas
                aria-label="Question audio button"
                title="Audio question"
                width="90"
                height="30"
                id="captchaCanvas"
                style="border: 1px solid black; background-color: white"
                class="ml-2"
              ></canvas>
              <b-icon
                class="ml-3 mt-2 h3"
                @click="audioCaptcha"
                role="button"
                icon="volume-up-fill"
                sm
                variant="dark"
                aria-label="audio question button"
              ></b-icon>
            </b-form-row>
          </b-form-group>
          <!-- captcha answer -->
          <b-form-group
            label="Answer"
            description="* Required"
            label-cols="auto"
          >
            <b-form-input
              v-model="userAnswer"
              type="number"
              placeholder="Enter the Answer"
              required
            >
            </b-form-input>
          </b-form-group>
          <!-- Login & create account buttons-->
          <div class="float-right">
            <b-button-group>
              <b-button
                @click="login()"
                :disabled="isDisabled"
                class="mr-2"
                variant="primary"
              >
                <b-spinner v-if="isLoading" small></b-spinner>
                <b-icon v-if="!isLoading" icon="box-arrow-in-right"></b-icon>
                Login
              </b-button>
              <b-button variant="success" :to="{ name: 'Create_Organisation' }">
                <b-icon icon="person-plus"></b-icon>
                Create Account
              </b-button>
            </b-button-group>
          </div>
        </b-form>
      </b-card-body>
    </b-card>
  </section>
</template>
<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "login",
  data() {
    return {
      // gkCoreUrl: 'https://satheerthan.site:6543', // 'http://localhost:6543',
      notificationIsActive: true,
      captchaSolved: false,
      isLoading: false,
      isDisabled: true,
      options: null, // companys list
      question: null,
      userAnswer: null,

      orgList: null,
      orgIndex: null,

      form: {
        username: null,
        userpassword: null,
        orgcode: null,
        customUrl: null,
        orgName: null,
      },
    };
  },
  methods: {
    /**
     * Vaidate & Login the user
     */
    login() {
      this.isLoading = true;
      // Validate user's captcha answer
      this.captcha();

      const orgname = this.orgList[this.orgIndex].orgname;
      const orgtype = this.orgList[this.orgIndex].orgtype;

      // fetch orgcode from /orgyears API
      axios
        .get(`${this.gkCoreUrl}/orgyears/${orgname}/${orgtype}`)
        .then((orgCodeResponse) => {
          if (orgCodeResponse.data.gkstatus === 0) {
            this.form.orgcode = orgCodeResponse.data.gkdata[0].orgcode;
            this.form.orgName = `${orgname} (${orgtype})`;
            axios
              .post(`${this.gkCoreUrl}/login`, this.form)
              .then((response) => {
                // alert user depending on the gkstatus code
                switch (response.data.gkstatus) {
                  case 0:
                    this.isLoading = false;
                    if (this.captchaSolved) {
                      this.$store.dispatch("setSessionStates", {
                        auth: true,
                        orgCode: this.form.orgcode,
                        orgName: this.form.orgName,
                        authToken: response.data.token,
                        user: { username: this.form.username },
                        gkCoreUrl: this.customUrl,
                      });
                      this.$router.push("/workflow");
                      // Alert the user on successful login
                      this.$bvToast.toast(`Welcome to gnukhata!`, {
                        title: "Login Successful",
                        autoHideDelay: 3000,
                        appendToast: true,
                        variant: "success",
                        solid: true,
                      });
                    } else {
                      // Alert the user on captcha failure
                      console.log("Invalid Captcha answer");
                      this.$bvToast.toast(`Info`, {
                        title: "Captcha failed",
                        autoHideDelay: 3000,
                        appendToast: true,
                        variant: "danger",
                        solid: true,
                      });
                      // And Generate new captcha
                      this.genCaptcha();
                    }
                    break;
                  case 2:
                    // Alert user on wrong credentials
                    console.log("Wrong login details");
                    this.$bvToast.toast(`Invalid login details`, {
                      title: "Login Error!",
                      autoHideDelay: 3000,
                      variant: "danger",
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
          } else {
            this.isLoading = false;
            this.$bvToast.toast(`Error: Error fetching orgcode`, {
              title: "Error fetching orgcode",
              autoHideDelay: 3000,
              variant: "warning",
              appendToast: true,
              solid: true,
            });
          }
        })
        .catch((error) => {
          this.isLoading = false;
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: "Error fetching orgcode",
            autoHideDelay: 3000,
            variant: "warning",
            appendToast: true,
            solid: true,
          });
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
        .catch(function (error) {
          console.log(error);
        });
    },
    genCaptcha() {
      this.question = `${Math.floor(Math.random() * 11)} + ${Math.floor(
        Math.random() * 11
      )}`;
      const canvas = document.getElementById("captchaCanvas");
      const ctx = canvas.getContext("2d");
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText(`${this.question} = `, canvas.width / 2, canvas.height / 2);
    },
    captcha() {
      const q = this.question.split("+");
      const ans = parseInt(q[0]) + parseInt(q[1]);
      console.log(ans);
      if (parseInt(this.userAnswer) === ans) {
        this.captchaSolved = true;
      }
    },
    audioCaptcha() {
      if ("speechSynthesis" in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = this.question;
        window.speechSynthesis.speak(msg);
      } else {
        this.$buefy.toast({
          message: "Your browser does not support speech synthesis",
          type: "is-error",
          queue: false,
        });
      }
    },
  },
  mounted() {
    this.fetchOrgs();
    this.genCaptcha();
  },
  computed: {
    ...mapState(["gkCoreUrl"]),
  },
};
</script>
<style>
</style>
