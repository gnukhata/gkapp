<template>
  <section class="m-2">
    <!-- <b-alert
      v-if="gkConfig.notice"
      show
      variant="dark"
      class="mb-2 gkcard mx-auto"
      style="max-width: 35em"
    >
      Demo User:
      <b>Username - admin , Password - admin</b>
      <br />
    </b-alert> -->

    <b-card
      v-if="!orgs.length"
      class="shadow mx-auto"
      style="max-width: 35em"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Login
      </template>
      <b-form @submit.prevent="userLogin">
        <!--Username area-->
        <b-form-group
          :label="$gettext('Username')"
          label-cols="4"
          label-size="sm"
          label-align="right"
        >
          <b-form-input
            v-model.trim="form.name"
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
            v-model="form.pwd"
            :password-hint="false"
            :placeholder="$gettext('Password')"
            size="sm"
          ></password>
          <router-link class="float-right" to="/resetpassword">
            <small><translate>Forgot Password?</translate></small>
          </router-link>
        </b-form-group>

        <!--Captcha question -->
        <b-form-group
          :label="$gettext('Question')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <captcha v-model="captcha.answer"></captcha>
        </b-form-group>

        <!-- captcha answer -->
        <b-form-group
          :label="$gettext('Answer')"
          label-cols="4"
          label-size="sm"
          label-align="right"
        >
          <b-form-input
            v-model="captcha.userAnswer"
            type="number"
            no-wheel
            :placeholder="$gettext('Enter the Answer')"
            required
            size="sm"
          ></b-form-input>
        </b-form-group>
        <b-button-group size="sm" class="row float-right">
          <b-button variant="dark" class="m-1" @click="switchServer">
            <b-icon class="mr-1" icon="cloud"></b-icon>
            <translate> Change Server</translate>
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
    </b-card>

    <b-card v-else class="mt-3">
      <span class="h3 underline">Welcome {{ this.form.name }}!</span>
      <b-button @click="onLogout" class="float-right" size="sm"
        >Logout</b-button
      >
      <div class="clearfix"></div>
      <hr />
      <b-row>
        <b-col>
          <div class="mb-2">
            <h5 class="d-inline-block">Your Organisations</h5>
            <b-button size="sm" :disabled="showCreateOrgForm" @click="showCreateOrgForm = true" class="float-right"
              >Create Org</b-button
            >
          </div>
          <b-table-lite
            head-variant="dark"
            small
            bordered
            striped
            :items="orgs"
            :fields="orgFields"
          >
            <template #cell(year)="data">
              <v-select
                :reduce="(option) => option.index"
                :options="data.item.data"
                v-model="data.item.selected"
              ></v-select>
            </template>
            <template #cell(action)="data">
              <b-button size="sm" @click="orgLogin(data.item)"> Open </b-button>
            </template>
            <template #cell(role)="data">
              {{ userRoles[data.value] }}
            </template>
          </b-table-lite>
        </b-col>
        <b-col>
          <h5 class="mb-3">Invitations</h5>

          <b-table-lite
            head-variant="dark"
            small
            bordered
            striped
            :items="invitedOrgs"
            :fields="invOrgFields"
            class="text-center"
          >
            <template #cell(role)="data">
              {{ userRoles[data.value] }}
            </template>
            <template #cell(action)="">
              <div>
                <b-button size="sm" disabled class="mx-1"> Accept </b-button>
                <b-button size="sm" disabled> Reject </b-button>
              </div>
            </template>
          </b-table-lite>
        </b-col>
      </b-row>
    </b-card>
    <b-modal
      size="lg"
      v-model="showCreateOrgForm"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <create-organisation :inOverlay="true" :onSave="onOrgCreate">
      </create-organisation>
    </b-modal>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Captcha from '../components/Captcha.vue';
import Password from '../components/Password.vue';
import CreateOrganisation from '@/views/CreateOrganisation.vue';
export default {
  components: { Password, Captcha, CreateOrganisation },
  name: 'SelectOrg',
  data() {
    return {
      isLoading: false,
      showCreateOrgForm: false,
      form: {
        name: '',
        pwd: '',
      },
      captcha: {
        answer: null,
        userAnswer: null,
      },
      orgs: [],
      invitedOrgs: [],
      orgFields: ['name', 'role', 'year', 'action'],
      invOrgFields: ['name', 'role', 'action'],
      selectedOrg: null,
      userRoles: {
        '-1': 'Admin',
        0: 'Manager',
        1: 'Operator',
        2: 'Internal Auditor',
        3: 'Godown In Charge',
      },
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'userAuthToken']),
  },
  created() {
    if (
      localStorage.getItem('gkCoreUrl') == null ||
      localStorage.getItem('gkCoreUrl') == 'null'
    ) {
      this.$router.push('/server-setup');
    } else {
      //   this.fetchOrgs();
    }
  },
  methods: {
    onOrgCreate(success) {
      if(success) {
        this.showCreateOrgForm = false;
        this.fetchUserOrgs();
      }
    },
    onLogout() {
      this.$store.dispatch('setSessionStates', {
        userAuth: false,
        userAuthToken: null,
      });
      this.orgs = [];
      this.invitedOrgs = [];
    },
    initOrgs(orgs) {
      this.orgs = [];
      this.invitedOrgs = [];
      for (let orgName in orgs) {
        orgs[orgName];
        orgs[orgName].reverse();
        let orgData = {
          name: orgName,
          type: orgs[orgName][0].orgtype,
          data: orgs[orgName].map((org, index) => {
            return {
              index,
              code: org.orgcode,
              label: `${org.yearstart} - ${org.yearend}`,
              ystart: org.yearstart,
              yend: org.yearend,
            };
          }),
          role: orgs[orgName][0].userrole,
          selected: 0,
        };
        if (orgs[orgName][0].invitestatus) {
          this.orgs.push(orgData);
        } else {
          this.invitedOrgs.push(orgData);
        }
      }
    },

    // to save to local storage on login
    // orgChoice -> orgname (orgtype)
    // orgArray -> [orgname, orgtype]
    // orgCodeChoice -> orgcode
    // save org year start and year end

    userLogin() {
      if (this.captcha.answer == this.captcha.userAnswer) {
        let payload = {
          username: this.form.name,
          userpassword: this.form.pwd,
        };
        axios
          .post(`${this.gkCoreUrl}/login?type=user`, payload)
          .then((resp) => {
            switch (resp.data.gkstatus) {
              case 0:
                this.$bvToast.toast(`Welcome ${this.form.name}`, {
                  title: 'Login Success!',
                  autoHideDelay: 3000,
                  variant: 'success',
                });
                // console.log(resp.data);
                // set the user auth status
                this.$store.dispatch('setSessionStates', {
                  userAuth: true,
                  userAuthToken: resp.data.token,
                  user: { username: payload.username },
                });
                this.initOrgs(resp.data.gkresult);
                break;
              case 2:
                this.$bvToast.toast(`Invalid login details`, {
                  title: 'Login Error!',
                  autoHideDelay: 3000,
                  variant: 'danger',
                });
                break;
              case 5:
                // Username was not unique but exists in the old users table, so try loggin in the old way
                this.$router.push('/select-org');
                break;
              default:
                this.$bvToast.toast(`Internal Server Error`, {
                  title: 'Login Error!',
                  autoHideDelay: 3000,
                  variant: 'danger',
                });
            }
          });
      }
    },
    orgLogin(orgData) {
      const userAuthToken = localStorage.getItem('userAuthToken');
      let selectedYear = orgData.data[orgData.selected];
      let payload = {
        orgcode: selectedYear.code,
      };
      // TODO: here instead of sending the username and password, send the new user auth token
      axios
        .post(`${this.gkCoreUrl}/login?type=org`, payload, {
          headers: {
            gktoken: userAuthToken,
          },
        })
        .then((resp) => {
          switch (resp.data.gkstatus) {
            case 0:
              axios.defaults.baseURL = this.gkCoreUrl;
              axios.defaults.headers = { gktoken: resp.data.token };

              // Initiate vuex store
              this.$store.dispatch('setSessionStates', {
                auth: true,
                orgCode: selectedYear.code,
                orgName: `${orgData.name} (${orgData.type})`,
                authToken: resp.data.token,
                user: { username: this.form.name },
                orgYears: {
                  yearStart: selectedYear.ystart
                    .split('-')
                    .reverse()
                    .join('-'),
                  yearEnd: selectedYear.yend
                    .split('-')
                    .reverse()
                    .join('-'),
                },
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
              break;
            case 2:
              this.$bvToast.toast(`Invalid login details`, {
                title: 'Login Error!',
                autoHideDelay: 3000,
                variant: 'danger',
              });
              break;
            case 5:
              this.$router.push('/select-org');
              break;
            default:
              this.$bvToast.toast(`Internal Server Error`, {
                title: 'Login Error!',
                autoHideDelay: 3000,
                variant: 'danger',
              });
          }
        });
    },
    fetchUserOrgs() {
      const userAuthStatus = localStorage.getItem('userAuthenticated');
      const userAuthToken = localStorage.getItem('userAuthToken');
      if (userAuthStatus === 'true') {
        axios
          .get(`${this.gkCoreUrl}/gkusers?type=get_user_orgs`, {
            headers: {
              gktoken: userAuthToken,
            },
          })
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              this.initOrgs(resp.data.gkresult);
            }
          });
      }
    }
  },
  mounted() {
    this.fetchUserOrgs();
  },
};
</script>
