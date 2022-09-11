<!--
  ToDo:
  * Add validation for the fields (Password, Date)
  * Check accessibility
-->
<template>
  <div class="align-form-label-right">
    <div v-if="showMenu" class="card shadow" :style="{ 'min-width': '350px' }">
      <div class="card-header bg-dark text-light">
        <translate> Create Organisation </translate>
      </div>
      <div class="card-body px-2 px-sm-4">
        <b-form @submit.prevent="onSubmit">
          <b-form-group
            label-size="md"
            id="input-group-1"
            label="Name"
            label-for="input-1"
            label-cols="3"
          >
            <template #label>
              <translate> Name </translate>
            </template>
            <b-form-input
              size="md"
              id="input-1"
              type="text"
              placeholder="Organisation Name"
              v-model.trim="orgName"
              required
            >
            </b-form-input>
          </b-form-group>
          <b-form-group label-size="md" label="Type" label-cols="3">
            <template #label>
              <translate> Type </translate>
            </template>
            <b-form-radio-group
              size="md"
              id="btn-radios-1"
              v-model="orgType"
              :options="options.orgType"
              button-variant="outline-dark"
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
            <template #label>
              <translate> Financial Year </translate>
            </template>
            <div class="row">
              <div class="col-sm-6 pr-sm-1">
                <b-form-group
                  label-size="md"
                  id="input-group-3"
                  label="From"
                  label-for="date-1"
                  label-class="label-on-input"
                >
                  <template #label>
                    <translate> From </translate>
                  </template>
                  <b-input-group class="mb-3">
                    <gk-date
                      @input="setYearEnd"
                      v-model="yearStart"
                      id="yst"
                    ></gk-date>
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
                  <template #label>
                    <translate> To </translate>
                  </template>
                  <b-input-group class="mb-3">
                    <gk-date v-model="yearEnd" id="ynd"></gk-date>
                  </b-input-group>
                </b-form-group>
              </div>
            </div>
          </b-form-group>
          <hr />

          <b-form-group
            label-size="md"
            id="input-group-1"
            label="Captcha"
            label-for="captcha-1"
            label-cols="3"
          >
            <template #label>
              <captcha width="90" v-model="answer"></captcha>
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
          <small> <translate> * All fields are required </translate> </small>
          <!-- <hr /> -->
          <div class="float-right">
            <!-- <b-button
              size="sm"
              class="mr-2"
              variant="danger"
              @click="$router.go(-1)"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle mr-1"
                icon="arrow-left"
              ></b-icon>
              <span class="align-middle"> <translate>Back</translate></span>
            </b-button> -->
            <b-button
              size="sm"
              type="submit"
              class="mr-2"
              variant="success"
            >
              <b-spinner v-if="isLoading" small></b-spinner>
              <b-icon
                v-else
                aria-hidden="true"
                class="align-middle mr-1"
                icon="plus-square"
              ></b-icon>
              <span class="align-middle">
                <translate>Create &amp; Login</translate>
              </span>
            </b-button>
          </div>
          <div class="clearfix"></div>
        </b-form>
      </div>
    </div>
    <b-alert class="mt-5" :show="!showMenu" variant="danger"
      ><b-icon icon="exclamation-triangle"></b-icon>
      <translate> Registrations are disabled on this server </translate>
    </b-alert>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import passwordStrength from 'check-password-strength';
import Captcha from '@/components/Captcha.vue';
import GkDate from '@/components/GkDate.vue';

export default {
  name: 'CreateOrganisation',
  components: { Captcha, GkDate },
  props: {
    onSave: {
      type: Function,
      required: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      // gkCoreUrl: 'https://satheerthan.site:6543', // 'http://localhost:6543',
      isLoading: false,
      options: {
        orgType: [
          { text: 'Profit Making', value: 0 },
          { text: 'Not For Profit', value: 1 },
        ],
        pwdFieldTypes: ['lowercase', 'uppercase', 'symbol', 'number'],
      },
      orgName: '',
      orgType: 0,
      yearStart: null,
      yearEnd: null,
      userName: '',
      userPassword: '',
      confirmPassword: '',
      securityAnswer: '',
      securityQuestion: '',
      answer: null,
      userAnswer: null,
      showMenu: true,
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl']),
    pwdStrength: (self) =>
      self.userPassword !== '' && self.userPassword !== null
        ? passwordStrength(self.userPassword)
        : { value: 'Empty' },
    isPasswordValid: (self) =>
      self.pwdStrength.value === 'Empty'
        ? null
        : self.pwdStrength.value === 'Strong',
    arePasswordsSame() {
      if (this.confirmPassword !== '') {
        return this.userPassword === this.hashedPassword(this.confirmPassword)
          ? true
          : false;
      }
      return null;
    },
  },
  methods: {
    checkRegistrationStatus() {
      axios.get('/organisations?registration-status').then((r) => {
        if (r.status === 200 && r.data.gkstatus == 5) {
          this.showMenu = false;
        }
      });
    },
    setYearEnd() {
      // console.log('On date change')
      if (this.yearStart !== null) {
        const from = this.yearStart.split('-'); // yyyy/mm/dd
        const to = new Date(`${parseInt(from[0]) + 1}/${from[1]}/${from[2]}`);
        let end = null;
        to.setDate(to.getDate() - 1);
        end = to.toISOString().substr(0, 10);
        if (end.includes('NaN')) {
          this.yearEnd = null;
        } else {
          this.yearEnd = end;
        }
      } else {
        this.yearEnd = null;
      }
    },
    // getPasswordHint(pwdStrength) {
    //   const available = pwdStrength.contains.map((item) => item.message);
    //   let hint = this.options.pwdFieldTypes
    //     .filter((item) => !available.includes(item))
    //     .reduce((prev, cur) => {
    //       return `${prev} ${cur},`;
    //     }, '');
    //   hint = hint.substring(0, hint.length - 1);
    //   if (available.length < 4) {
    //     hint = `Require atleast 1 ${hint}.`;
    //   }
    //   if (pwdStrength.length < 8) {
    //     hint += ' Must be minimum 8 characters long';
    //   }
    //   return hint;
    // },
    onSubmit() {
      if (this.userAnswer == this.answer) {
        this.isLoading = true;
        const payload = this.initPayload();
        const userAuthToken = localStorage.getItem('userAuthToken');
        // Create Organisation
        axios
          .post('/organisations', payload, {
            headers: {
              gktoken: userAuthToken,
              gkusertoken: userAuthToken,
            },
          })
          .then((response) => {
            // console.log(response)
            this.isLoading = false;
            switch (response.data.gkstatus) {
              case 0:
                {
                  this.$store
                    .dispatch('setSessionStates', {
                      orgCode: response.data.orgcode,
                      authToken: response.data.token,
                    })
                    .then(() => {
                      let log = {
                        activity: `Organisation created: ${payload.orgdetails.orgname}`,
                      };
                      axios.post('/log', log);
                    });
                }
                break;
              case 1:
                this.$bvToast.toast(
                  this.$gettext(
                    `Duplicate Entry! Please Check the Organisation Name`
                  ),
                  {
                    title: this.$gettext('Create Account Error!'),
                    autoHideDelay: 3000,
                    variant: 'danger',
                    appendToast: true,
                    solid: true,
                  }
                );
                break;
              default:
                this.$bvToast.toast(
                  this.$gettext(`Unable to create account, Please try again`),
                  {
                    title: this.$gettext('Create Account Error!'),
                    autoHideDelay: 3000,
                    variant: 'danger',
                    appendToast: true,
                    solid: true,
                  }
                );
            } // end switch
            this.onSave(response.data.gkstatus === 0);
          })
          .catch((error) => {
            this.$bvToast.toast(`Error: ${error.message}`, {
              title: this.$gettext('Create Account Error!'),
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
          })
          .then(() => {
            this.isLoading = false;
          });
        // console.log(this.initPayload())
      } else {
        // Alert the user on captcha failure
        this.$bvToast.toast(
          this.$gettext(`Captcha is incorrect. Please try again`),
          {
            title: this.$gettext('Captcha Error!'),
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          }
        );
        // Generate new captcha
        this.genCaptcha();
      }
    },
    initPayload() {
      return {
        orgdetails: {
          orgname: this.orgName,
          orgtype: this.options.orgType[this.orgType].text,
          yearstart: this.yearStart.split('-').join('/'),
          yearend: this.yearEnd.split('-').join('/'),
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
          invflag: 1,
          invsflag: 1,
          billflag: 1,
          avflag: 1,
          maflag: 0,
          avnoflag: 1,
          ainvnoflag: 1,
          modeflag: null,
        },
      };
    },
  },
  mounted() {
    this.checkRegistrationStatus();
    this.yearStart = `${new Date().getFullYear()}-04-01`; // 1st of April, current year. YYYY-MM-DD
  },
};
</script>
