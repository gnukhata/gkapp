<template>
  <section class="m-2">
    <!-- login banner -->
    <b-alert
      :show="gkConfig().conf.login_banner.show"
      :variant="gkConfig().conf.login_banner.variant"
      class="mb-2 mx-auto"
      style="max-width:35em"
      v-html="gkConfig().conf.login_banner.content"
    >
    </b-alert>
    <!-- User Login -->
    <b-card
      v-if="!userAuthToken"
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
          <b-button
            variant="link"
            class="p-0 float-right"
            @click="showForm.resetPwd = true"
          >
            <small><translate>Forgot Password?</translate></small>
          </b-button>
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
          <b-button
            @click="showForm.createUser = true"
            variant="dark"
            class="m-1"
          >
            <b-icon class="mr-1" icon="person-plus"></b-icon>
            <translate> Create User</translate>
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
    <!-- Org selection -->
    <b-card v-else class="mt-3">
      <div class="d-flex justify-content-between">
        <span class="h6 underline"
          >Welcome {{ form.name || userName || '' }}!</span
        >
        <b-button @click="onLogout" class="float-right" size="sm"
          >Logout</b-button
        >
      </div>
      <div class="clearfix"></div>
      <hr />
      <b-row>
        <b-col>
          <div class="mb-2">
            <h5 class="d-inline-block">
              Organisations <span> ({{ orgs.length }}) </span>
            </h5>
            <b-button
              size="sm"
              :disabled="showForm.createOrg"
              @click="showForm.createOrg = true"
              class="float-right"
              >Create Org</b-button
            >
          </div>
          <b-table
            head-variant="dark"
            small
            bordered
            striped
            :items="orgs"
            :fields="orgFields"
            responsive
            :sticky-header="true"
            v-if="isOrgLoading || orgs.length"
            :busy="isOrgLoading"
            id="org-table"
          >
            <template #table-busy>
              <div class="text-center">
                <b-spinner class="align-middle" type="grow"></b-spinner>
                <strong> <translate>Fetching List...</translate> </strong>
              </div>
            </template>
            <template #cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template #cell(year)="data">
              <v-select
                :reduce="(option) => option.index"
                :options="data.item.yearData"
                v-model="data.item.selected"
              >
                <template #selected-option="{ yend, ystart }">
                  <div class="text-truncate">{{ ystart }}</div>
                  <div>to</div>
                  <div class="text-truncate">{{ yend }}</div>
                </template>
              </v-select>
            </template>
            <template #cell(action)="data">
              <b-button size="sm" @click="orgLogin(data.item)"> Open </b-button>
            </template>
            <template #cell(role)="data">
              {{ userRoles[data.value] }}
            </template>
          </b-table>
          <b v-else>You are not part of any organisations yet</b>
        </b-col>
        <b-col>
          <h5 class="mb-3">
            Invitations <span> ({{ invitedOrgs.length }}) </span>
          </h5>
          <b-table
            head-variant="dark"
            small
            bordered
            striped
            :items="invitedOrgs"
            :fields="invOrgFields"
            responsive
            v-if="isOrgLoading || invitedOrgs.length"
            :busy="isOrgLoading"
          >
            <template #table-busy>
              <div class="text-center">
                <b-spinner class="align-middle" type="grow"></b-spinner>
                <strong> <translate>Fetching List...</translate> </strong>
              </div>
            </template>
            <template #cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template #cell(role)="data">
              {{ userRoles[data.value] }}
            </template>
            <template #cell(action)="data">
              <div class="d-flex">
                <b-button
                  @click="onAcceptInvite(data.index, data.item.name)"
                  size="sm"
                  class="p-1 mx-1"
                  variant="success"
                >
                  <b-icon scale="0.9" icon="check-circle"></b-icon>
                </b-button>
                <b-button
                  @click="onRejectInvite(data.index, data.item.name)"
                  size="sm"
                  class="p-1"
                  variant="danger"
                >
                  <b-icon scale="0.9" icon="trash"></b-icon>
                </b-button>
              </div>
            </template>
          </b-table>
          <b v-else>No invitations pending</b>
        </b-col>
      </b-row>
    </b-card>
    <b-modal
      size="lg"
      v-model="showForm.createOrg"
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
    <b-modal
      size="lg"
      v-model="showForm.resetPwd"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <reset-password :onSuccess="onPwdReset"></reset-password>
    </b-modal>
    <b-modal
      size="lg"
      v-model="showForm.createUser"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <create-user :onSuccess="onUserCreate"></create-user>
    </b-modal>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Captcha from '@/components/Captcha.vue';
import Password from '@/components/Password.vue';
import CreateOrganisation from '@/components/form/CreateOrganisation.vue';
import ResetPassword from '@/components/form/ResetPassword.vue';
import CreateUser from '@/components/form/CreateUser.vue';
import { STATUS_CODES } from '@/js/enum';
export default {
  components: {
    Password,
    Captcha,
    CreateOrganisation,
    ResetPassword,
    CreateUser,
  },
  name: 'SelectOrg',
  data() {
    return {
      isLoading: false,
      isOrgLoading: false,
      showForm: {
        createOrg: false,
        resetPwd: false,
        createUser: false,
      },
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
      orgFields: [
        { label: 'No.', key: 'index', stickyColumn: true },
        { label: 'Name', key: 'name', stickyColumn: true },
        'role',
        // 'year',
        'action',
      ],
      invOrgFields: [
        { label: 'No.', key: 'index', stickyColumn: true },
        { label: 'Name', key: 'name', stickyColumn: true },
        'role',
        'action',
      ],
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
    ...mapState(['gkCoreUrl', 'userAuthToken', 'userName']),
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
    onPwdReset() {
      this.showForm.resetPwd = false;
    },
    onUserCreate({ token, username }) {
      this.showForm.createUser = false;
      this.$store.dispatch('setSessionStates', {
        userAuth: true,
        userAuthToken: token,
        user: { username },
      });
      this.fetchUserOrgs();
    },
    onOrgCreate(success) {
      if (success) {
        this.showForm.createOrg = false;
        this.fetchUserOrgs();
      }
    },
    onLogout() {
      this.$store.dispatch('setSessionStates', {
        userAuth: false,
        userAuthToken: null,
        finYears: [],
      });
      this.orgs = [];
      this.invitedOrgs = [];
      localStorage.removeItem('userName');
    },
    initOrgs(orgsData) {
      this.orgs = [];
      this.invitedOrgs = [];
      for (let orgName in orgsData) {
        // orgsData[orgName];
        orgsData[orgName].reverse(); // reverse the order of financial year data, so that the latest years come on top
        let orgData = {
          name: orgName,
          type: orgsData[orgName][0].orgtype,
          yearData: orgsData[orgName].map((org, index) => {
            return {
              index,
              code: org.orgcode,
              label: `${org.yearstart} - ${org.yearend}`,
              ystart: org.yearstart,
              yend: org.yearend,
            };
          }),
          role: orgsData[orgName][0].userrole,
          selected: 0,
        };
        if (orgsData[orgName][0].invitestatus) {
          this.orgs.push(orgData);
        } else {
          this.invitedOrgs.push(orgData);
        }
      }
    },
    onRejectInvite(index, name) {
      this.$bvModal
        .msgBoxConfirm(`Reject invitation to organisation: ${name} ?`, {
          centered: true,
          size: 'md',
          okVariant: 'danger',

          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        // delete user is confirmed
        .then((r) => {
          if (r) {
            this.rejectInvite(index);
            return;
          }
        });
    },
    rejectInvite(index) {
      let org = this.invitedOrgs[index];
      let payload = { orgcode: parseInt(org.yearData[org.selected].code) };
      axios.put('/userorg?type=reject_invite', payload).then((resp) => {
        switch (resp.data.gkstatus) {
          case STATUS_CODES['Success']:
            this.$bvToast.toast(
              `Invitation to ${org.name} organisation has been rejected successfully`,
              {
                autoHideDelay: 3000,
                variant: 'success',
              }
            );
            this.fetchUserOrgs();
            break;
          case STATUS_CODES['ActionDisallowed']:
            this.$bvToast.toast(
              `Please check the invitation status with the organisation`,
              {
                autoHideDelay: 3000,
                variant: 'warning',
              }
            );
            break;
          case STATUS_CODES['UnauthorisedAccess']:
            this.$bvToast.toast(`Please check your login status`, {
              autoHideDelay: 3000,
              variant: 'warning',
            });
            break;
          case STATUS_CODES['ConnectionFailed']:
          default:
            this.$bvToast.toast(
              `An issue has ocurred while trying to reject the invitation to ${org.name}. Please contact admin`,
              {
                autoHideDelay: 3000,
                variant: 'danger',
              }
            );
        }
      });
    },
    onAcceptInvite(index, name) {
      this.$bvModal
        .msgBoxConfirm(`Accept invitation to organisation: ${name} ?`, {
          centered: true,
          size: 'md',
          okVariant: 'success',

          headerBgVariant: 'success',
          headerTextVariant: 'light',
        })
        // delete user is confirmed
        .then((r) => {
          if (r) {
            this.acceptInvite(index);
            return;
          }
        });
    },
    acceptInvite(index) {
      let org = this.invitedOrgs[index];
      let payload = { orgcode: parseInt(org.yearData[org.selected].code) };
      axios.put('/userorg?type=accept_invite', payload).then((resp) => {
        switch (resp.data.gkstatus) {
          case STATUS_CODES['Success']:
            this.$bvToast.toast(
              `Invitation to ${org.name} organisation has been accepted successfully`,
              {
                autoHideDelay: 3000,
                variant: 'success',
              }
            );
            this.fetchUserOrgs();
            break;
          case STATUS_CODES['ActionDisallowed']:
            this.$bvToast.toast(
              `Please check the invitation status with the organisation`,
              {
                autoHideDelay: 3000,
                variant: 'warning',
              }
            );
            break;
          case STATUS_CODES['UnauthorisedAccess']:
            this.$bvToast.toast(`Please check your login status`, {
              autoHideDelay: 3000,
              variant: 'warning',
            });
            break;
          case STATUS_CODES['ConnectionFailed']:
          default:
            this.$bvToast.toast(
              `An issue has ocurred while trying to accept the invitation to ${org.name}. Please contact admin`,
              {
                autoHideDelay: 3000,
                variant: 'danger',
              }
            );
        }
      });
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
        this.isOrgLoading = true;
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
          })
          .finally(() => {
            this.isOrgLoading = false;
          });
      }
    },
    orgLogin(orgData) {
      const userAuthToken = localStorage.getItem('userAuthToken');
      let selectedYear = orgData.yearData[orgData.selected];
      let payload = {
        orgcode: selectedYear.code,
      };
      // TODO: here instead of sending the username and password, send the new user auth token
      axios
        .post(`${this.gkCoreUrl}/login?type=org`, payload, {
          headers: {
            gktoken: userAuthToken,
            gkusertoken: userAuthToken,
          },
        })
        .then((resp) => {
          switch (resp.data.gkstatus) {
            case 0:
              {
                axios.defaults.baseURL = this.gkCoreUrl;
                axios.defaults.headers = { gktoken: resp.data.token };

                // Initiate Custom states to localhost
                let orgName = orgData.name;
                let orgType = orgData.type;
                // Save org name for next login
                localStorage.setItem('orgChoice', `${orgName} (${orgType})`);
                // useful in consolidated final accounts
                localStorage.setItem(
                  'orgArray',
                  JSON.stringify([orgName, orgType])
                );
                localStorage.setItem('orgCodeChoice', selectedYear.code);

                // Initiate vuex store
                this.$store.dispatch('setSessionStates', {
                  auth: true,
                  orgCode: selectedYear.code,
                  orgName: `${orgName} (${orgType})`,
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
                  finYears: orgData.yearData,
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
                      // visit the dashboard page
                      this.$router.push('/dashboard').then(() => {
                        window.location.reload();
                      });
                    });
                });
              }
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
        this.isOrgLoading = true;
        axios
          .get(`${this.gkCoreUrl}/gkusers?type=get_user_orgs`, {
            headers: {
              gktoken: userAuthToken,
              gkusertoken: userAuthToken,
            },
          })
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              this.initOrgs(resp.data.gkresult);
            }
          })
          .finally(() => {
            this.isOrgLoading = false;
          });
      }
    },
  },
  mounted() {
    this.fetchUserOrgs();
  },
};
</script>

<style>
#org-table .vs__selected {
  display: flex;
  flex-direction: column;
}
</style>
