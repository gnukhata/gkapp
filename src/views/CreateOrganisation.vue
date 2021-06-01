<!--
  ToDo:
  * Add validation for the fields (Password, Date)
  * Check accessibility
-->
<template>
  <div class="d-flex justify-content-center mt-3 mx-3">
    <div class="card shadow" :style="{ 'min-width': '350px' }">
      <div class="card-header bg-primary text-light">Create Organisation</div>
      <div class="card-body px-2 px-sm-4">
        <b-form @submit.prevent="onSubmit">
          <b-form-group
            label-size="md"
            id="input-group-1"
            label="Name"
            label-for="input-1"
            label-cols="3"
          >
            <b-form-input
              size="md"
              id="input-1"
              type="text"
              placeholder="Organisation Name"
              v-model="orgName"
              required
            >
            </b-form-input>
          </b-form-group>
          <b-form-group
            label-size="md"
            label="Type"
            v-slot="{ ariaDescribedby }"
            label-cols="3"
          >
            <b-form-radio-group
              size="md"
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
            label="Financial Year"
            label-size="md"
            label-class="mb-2"
            class="mb-0 mt-4"
            label-cols="3"
          >
            <div class="row">
              <div class="col-sm-6 pr-sm-1">
                <b-form-group
                  label-size="md"
                  id="input-group-3"
                  label="From"
                  label-for="date-1"
                  label-class="label-on-input"
                >
                  <b-input-group class="mb-3">
                    <b-form-input
                      size="md"
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
                        size="md"
                        v-model="yearStart"
                        button-only
                        right
                        locale="en-GB"
                        @context="setYearEnd"
                        aria-controls="date-1"
                      >
                      </b-form-datepicker>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </div>
              <div class="col-sm-6 pl-sm-1">
                <b-form-group
                  label-size="md"
                  id="input-group-4"
                  label="To"
                  label-for="date-2"
                  label-class="label-on-input"
                >
                  <b-input-group class="mb-3">
                    <b-form-input
                      size="md"
                      id="date-2"
                      v-model="yearEnd"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      autocomplete="off"
                      required
                    ></b-form-input>
                    <b-input-group-append>
                      <b-form-datepicker
                        size="md"
                        v-model="yearEnd"
                        button-only
                        right
                        locale="en-GB"
                        aria-controls="date-2"
                      >
                      </b-form-datepicker>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </div>
            </div>
          </b-form-group>
          <b-form-group
            label-size="md"
            id="input-group-5"
            label="Admin User"
            label-for="input-2"
            label-cols="3"
          >
            <b-form-input
              size="md"
              id="input-2"
              type="text"
              placeholder="Enter Admin Username"
              v-model="userName"
              required
            >
            </b-form-input>
          </b-form-group>
          <b-form-group
            label-size="md"
            id="input-group-6"
            label="Password"
            label-for="password-1"
            label-cols="3"
            :state="isPasswordValid"
            :invalid-feedback="passwordFeedback"
            :valid-feedback="passwordFeedback"
          >
            <b-row>
              <b-col sm="6" class="mb-1 mb-sm-0 pr-sm-1">
                <b-form-input
                  size="md"
                  id="password-1"
                  type="password"
                  placeholder=""
                  v-model.lazy="userPassword"
                  label-cols="1"
                  :state="isPasswordValid"
                  required
                >
                </b-form-input>
              </b-col>
              <b-col sm="6" class="mt-2 mt-sm-0 pl-sm-1">
                <b-form-group
                  label="Confirmation"
                  label-class="label-on-input"
                  class="position-relative mb-2"
                >
                  <b-form-input
                    size="md"
                    id="password-2"
                    type="password"
                    placeholder=""
                    v-model.lazy="confirmPassword"
                    label-cols="1"
                    :state="arePasswordsSame"
                    required
                  >
                  </b-form-input>
                </b-form-group>
              </b-col>
            </b-row>
          </b-form-group>
          <b-form-group
            label-size="md"
            id="input-group-7"
            label="Password Recovery"
            label-class="mb-2"
            class="mb-0"
            label-cols="3"
          >
            <b-form-group
              label-size="md"
              id="input-group-8"
              label="Question"
              label-for="input-3"
              label-class="label-on-input"
              class="position-relative"
            >
              <!-- <b-form-input
                     size="md"
                     id="input-3"
                     type="text"
                     placeholder=""
                     v-model="securityQuestion"
                     required
                     >
                   </b-form-input> -->
              <security-questions
                v-model="securityQuestion"
              ></security-questions>
            </b-form-group>
            <b-form-group
              label-size="md"
              id="input-group-9"
              label="Answer"
              label-for="input-4"
              label-class="label-on-input"
              class="position-relative"
            >
              <b-form-input
                size="md"
                id="input-4"
                type="text"
                placeholder=""
                v-model="securityAnswer"
                isVal
                required
              >
              </b-form-input>
            </b-form-group>
          </b-form-group>
          <b-form-group
            label-size="md"
            id="input-group-1"
            label="Captcha"
            label-for="captcha-1"
            label-cols="3"
          >
            <template #label>
              <captcha width="70" v-model="answer"></captcha>
            </template>
            <!-- <b-col> -->
            <b-form-input
              size="md"
              class="mt-1"
              id="captcha-1"
              v-model="userAnswer"
              type="text"
              placeholder="Captcha Answer"
              required
            >
            </b-form-input>
          </b-form-group>
          <small>* All fields are required</small>
          <!-- <hr /> -->
          <div class="float-right">
            <b-button
              size="sm"
              class="mr-2"
              variant="danger"
              :to="{ name: 'Login' }"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle"
                icon="arrow-left"
              ></b-icon>
              <span class="align-middle"> Back</span>
            </b-button>
            <b-button
              size="sm"
              type="submit"
              class="mr-2"
              variant="primary"
              :disabled="allFieldsValid"
            >
              <b-spinner v-if="isLoading" small></b-spinner>
              <b-icon
                v-else
                aria-hidden="true"
                class="align-middle"
                icon="plus-square"
              ></b-icon>
              <span class="align-middle"> Create &amp; Login</span>
            </b-button>
          </div>
          <div class="clearfix"></div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import passwordStrength from "check-password-strength";
import Captcha from "../components/Captcha.vue";
import SecurityQuestions from "../components/SecurityQuestions.vue";

export default {
  name: "CreateOrganisation",
  components: { Captcha, SecurityQuestions },
  data() {
    return {
      // gkCoreUrl: 'https://satheerthan.site:6543', // 'http://localhost:6543',
      isLoading: false,
      options: {
        orgType: [
          { text: "Profit Making", value: 0 },
          { text: "Not For Profit", value: 1 }
        ],
        pwdFieldTypes: ["lowercase", "uppercase", "symbol", "number"]
      },
      orgName: "",
      orgType: 0,
      yearStart: null,
      yearEnd: null,
      userName: "",
      userPassword: "",
      confirmPassword: "",
      securityAnswer: "",
      securityQuestion: "",
      answer: null,
      userAnswer: null
    };
  },
  computed: {
    pwdStrength: self =>
      self.userPassword !== "" && self.userPassword !== null
        ? passwordStrength(self.userPassword)
        : { value: "Empty" },
    allFieldsValid: self => !self.isPasswordValid && !self.arePasswordsSame,
    isPasswordValid: self =>
      self.pwdStrength.value === "Empty"
        ? null
        : self.pwdStrength.value === "Strong",
    arePasswordsSame: self =>
      self.userPassword && self.confirmPassword
        ? self.userPassword === self.confirmPassword
        : null,
    passwordFeedback() {
      let text = "";
      if (this.userPassword) {
        switch (this.pwdStrength.value) {
          case "Strong":
            text = "Password is Strong.";
            break;
          case "Medium":
            text = this.getPasswordHint(this.pwdStrength);
            break;
          case "Weak":
            text = this.getPasswordHint(this.pwdStrength);
            break;
          default:
            if (this.userPassword.length < 8) {
              text = "is-danger";
            } else {
              text = "is-success";
            }
        }
      }
      return text;
    },
    ...mapState(["gkCoreUrl", "gkCoreTestUrl"])
  },
  methods: {
    setYearEnd() {
      // console.log('On date change')
      if (this.yearStart !== null && this.year !== "") {
        const from = this.yearStart.split("-"); // yyyy/mm/dd
        const to = new Date(`${parseInt(from[0]) + 1}/${from[1]}/${from[2]}`);
        let end = null;
        to.setDate(to.getDate() - 1);
        end = `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`;
        if (end.includes("NaN")) {
          this.yearEnd = null;
        } else {
          this.yearEnd = end;
        }
      } else {
        this.yearEnd = null;
      }
    },
    getPasswordHint(pwdStrength) {
      const available = pwdStrength.contains.map(item => item.message);
      let hint = this.options.pwdFieldTypes
        .filter(item => !available.includes(item))
        .reduce((prev, cur) => {
          return `${prev} ${cur},`;
        }, "");
      hint = hint.substring(0, hint.length - 1);
      if (available.length < 4) {
        hint = `Require atleast 1 ${hint}.`;
      }
      if (pwdStrength.length < 8) {
        hint += " Must be minimum 8 characters long";
      }
      return hint;
    },
    onSubmit() {
      if (this.userAnswer == this.answer) {
        this.isLoading = true;
        const payload = this.initPayload();
        axios
          .post("/organisations", payload)
          .then(response => {
            // console.log(response)
            this.isLoading = false;
            switch (response.data.gkstatus) {
              case 0:
                this.$store
                  .dispatch("setSessionStates", {
                    orgCode: response.data.orgcode,
                    authToken: response.data.token
                  })
                  .then(() => {
                    axios
                      .get("/organisation")
                      .then(response2 => {
                        if (response2.data.gkstatus === 0) {
                          this.$store.dispatch("setSessionStates", {
                            auth: true,
                            orgName: `${response2.data.gkdata.orgname} (${response2.data.gkdata.orgtype})`,
                            user: { username: payload.userdetails.username },
                            orgYears: {
                              yearStart: response2.data.gkdata.yearstart,
                              yearEnd: response2.data.gkdata.yearend
                            }
                          });
                          this.$router.push("/workflow/Transactions/-1");
                          this.$bvToast.toast(`Logged in Successfully!`, {
                            title: "Create Account Success!",
                            autoHideDelay: 3000,
                            variant: "success",
                            appendToast: true,
                            solid: true
                          });
                        } else {
                          this.$bvToast.toast(
                            `Unable to Login to Account, Please try again`,
                            {
                              title: "Login Error!",
                              autoHideDelay: 3000,
                              variant: "danger",
                              appendToast: true,
                              solid: true
                            }
                          );
                        }
                      })
                      .catch(error => {
                        this.$bvToast.toast(`Error: ${error.message}`, {
                          title: "Login Error!",
                          autoHideDelay: 3000,
                          variant: "danger",
                          appendToast: true,
                          solid: true
                        });
                      });
                  });
                break;
              case 1:
                this.$bvToast.toast(
                  `Duplicate Entry! Please Check the Organisation Name`,
                  {
                    title: "Create Account Error!",
                    autoHideDelay: 3000,
                    variant: "danger",
                    appendToast: true,
                    solid: true
                  }
                );
                break;
              default:
                this.$bvToast.toast(
                  `Unable to create account, Please try again`,
                  {
                    title: "Create Account Error!",
                    autoHideDelay: 3000,
                    variant: "danger",
                    appendToast: true,
                    solid: true
                  }
                );
            } // end switch
          })
          .catch(error => {
            this.$bvToast.toast(`Error: ${error.message}`, {
              title: "Create Account Error!",
              autoHideDelay: 3000,
              variant: "warning",
              appendToast: true,
              solid: true
            });
          })
          .then(() => {
            this.isLoading = false;
          });
        // console.log(this.initPayload())
      } else {
        // Alert the user on captcha failure
        this.$bvToast.toast(`Captcha is incorrect. Please try again`, {
          title: "Captcha Error!",
          autoHideDelay: 3000,
          variant: "warning",
          appendToast: true,
          solid: true
        });
        // Generate new captcha
        this.genCaptcha();
      }
    },
    initPayload() {
      console.log(this.orgType);
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
      };
    }
  },
  mounted() {
    this.yearStart = `${new Date().getFullYear()}-04-01`; // 1st of April, current year. YYYY-MM-DD
  }
};
</script>
