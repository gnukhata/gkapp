<template>
  <b-form @submit.prevent="validatePwd"
    ><b-overlay :show="isLoading" blur no-wrap></b-overlay>
    <b-form-group label="Current Password">
      <b-form-input type="password" v-model.lazy="currentPwd" required>
      </b-form-input>
    </b-form-group>
    <b-form-group label="New Password">
      <b-form-input type="password" v-model="form.userpassword" required>
      </b-form-input>
    </b-form-group>
    <b-form-group label="Confirm Password">
      <b-form-input
        type="password"
        :state="matchingPwds"
        v-model="confirmPwd"
        required
      >
      </b-form-input>
      <b-form-invalid-feedback id="input-live-feedback">
        Passwords do not match
      </b-form-invalid-feedback>
    </b-form-group>
    <!--Captcha area-->
    <b-form-group label="Question" content-cols="auto" label-cols="auto">
      <captcha @answer="captchaAnswer"></captcha>
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
    <b-button
      type="submit"
      :disabled="!matchingPwds"
      variant="success"
      class="float-right"
      ><b-icon icon="key"></b-icon> Change Password</b-button
    >
  </b-form>
</template>

<script>
/*
 /This module has functions to update current user's password
 */
import { mapState } from "vuex";
import Captcha from "../Captcha.vue";
export default {
  components: { Captcha },
  name: "ChangePwd",
  data() {
    return {
      isLoading: false,
      currentPwd: "",
      confirmPwd: "",
      answer: "",
      userAnswer: "",
      form: {
        userid: Number,
        userpassword: ""
      }
    };
  },
  computed: {
    ...mapState(["userName", "gkCoreUrl", "authToken"]),
    matchingPwds() {
      if (this.form.userpassword === this.confirmPwd) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    /* Captcha Answer */
    captchaAnswer(ans) {
      this.answer = ans;
    },
    /* Get user's details from api */
    getUserInfo() {
      this.isLoading = true;
      axios
        .get(`${this.gkCoreUrl}/users?user=single`, {
          headers: {
            gktoken: this.authToken
          }
        })
        .then(r => {
          if (r.status == 200) {
            let info = r.data.gkresult;
            switch (r.data.gkstatus) {
              case 0:
                this.form.userid = info.userid;
                this.isLoading = false;
                break;
              default:
                this.$bvToast.toast("Request failed", {
                  title: `status code ${r.data.gkstatus}`,
                  variant: "danger",
                  solid: true
                });
                this.isLoading = false;
            }
          }
        })
        .catch(e => {
          console.log(e);
          this.isLoading = false;
        });
    },
    /* Check if user's password is valid */
    validatePwd() {
      this.isLoading = true;
      axios
        .post(
          `${this.gkCoreUrl}/users?userloginstatus`,
          {
            username: this.userName,
            userpassword: this.currentPwd
          },
          { headers: { gktoken: this.authToken } }
        )
        .then(r => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                if (this.userAnswer == this.answer) {
                  this.changePwd();
                } else {
                  this.$bvToast.toast("Invalid Captcha", {
                    variant: "danger",
                    solid: true
                  });
                  this.isLoading = false;
                }
                break;
              case 4:
                this.$bvToast.toast(
                  "Invalid current Password, Please try again",
                  {
                    solid: true,
                    variant: "danger"
                  }
                );
                this.isLoading = false;
                break;
              default:
                this.$bvToast.toast(`Failed with gkstatus ${r.data.gkstatus}`, {
                  solid: true,
                  variant: "danger"
                });
                this.isLoading = false;
            }
          }
        })
        .catch(e => {
          this.$bvToast.toast(e.message, {
            solid: true,
            variant: "danger"
          });
          this.isLoading = false;
        });
    },
    /* Proceed to changing user's password on successful validation */
    changePwd() {
      axios
        .put(
          `${this.gkCoreUrl}/users`,
          {
            userid: this.form.userid,
            username: this.userName,
            userpassword: this.form.userpassword
          },
          {
            headers: { gktoken: this.authToken }
          }
        )
        .then(r => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast(
                  `Password Change Successful for ${this.userName}`,
                  {
                    title: "Success",
                    variant: "success",
                    solid: true
                  }
                );
                this.isLoading = false;
                // send event to close the window
                this.$emit("close-pwd");
                break;
              default:
                this.$bvToast.toast(
                  `Failed to update password for ${this.userName}`,
                  {
                    title: `gkstatus ${r.data.gkstatus}`,
                    variant: "danger",
                    solid: true
                  }
                );
                this.isLoading = false;
            }
          }
        })
        .catch(e => {
          this.$bvToast.toast(e.message, {
            variant: "danger",
            solid: true
          });
          this.isLoading = false;
        });
    }
  },
  mounted() {
    this.getUserInfo();
  }
};
</script>
