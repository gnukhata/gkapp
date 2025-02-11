<template>
  <section class="m-2">
    <!-- User Login -->

    <b-row
      v-if="!userAuthToken"
      align-h="center"
    >
      <b-col
        cols
        lg="5"
      >
        <b-card
          class="shadow"
          header-bg-variant="light"
          header-class="p-0"
          body-class="mr-3  "
        >
          <template #header>
            <svg version="1.1" viewBox="0 0 118.7 41.38" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient id="a" x1="89.703" x2="120.53" y1="-66.581" y2="-57.054" gradientTransform="matrix(1.4363 0 0 1.2115 -36.593 193.54)" gradientUnits="userSpaceOnUse"><stop stop-color="#69f" offset="0"/><stop stop-color="#00ffe7" offset="1"/></linearGradient><filter id="b" x="-.16162" y="-.15774" width="1.3232" height="1.3178" color-interpolation-filters="sRGB"><feFlood flood-color="rgb(255,255,255)" in="SourceGraphic" result="flood"/><feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="3.000000"/><feOffset dx="0.000000" dy="0.000000" in="blur" result="offset"/><feComposite in="flood" in2="offset" operator="in" result="comp1"/><feComposite in="SourceGraphic" in2="comp1" result="comp2"/></filter></defs><g transform="matrix(3.1505 0 0 3.1505 -328.72 -363.41)"><g><rect x="104.34" y="115.35" width="37.676" height="13.134" ry="0" fill="url(#a)" style="paint-order:markers stroke fill"/><g transform="matrix(.2088 0 0 .2088 118.13 -92.84)" filter="url(#b)"><path d="m24 1005.5c-9.806 0-17.75 7.9753-17.75 17.781s7.944 17.75 17.75 17.75c8.6891 0 15.903-6.2558 17.438-14.5h-19.531v4.1562h12.531c-2.324 3.2653-6.1212 5.4063-10.438 5.4063-7.0879 0-12.844-5.7246-12.844-12.812 0-7.088 5.7558-12.844 12.844-12.844 4.6014 0 8.6409 2.4243 10.906 6.0625h5.4688c-2.6656-6.4427-8.9751-11-16.375-11zm-2.0938 14.438v4.2188h19.781c0.14391-1.4074-0.04454-2.968-0.28125-4.2188z" fill="#ff7f2a"/><g fill="#000080" stroke="#fff"><g stroke-width=".21049"><rect x="1.4006" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="1.4006" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="1.4006" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="1.4006" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-7.2026" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="7.2026" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="7.2026" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-13.552" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-13.552" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-13.552" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="13.552" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-19.354" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-19.354" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/></g><rect transform="scale(-1,1)" x="-19.354" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009" stroke-width=".21"/><g stroke-width=".21049"><rect x="19.98" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="19.98" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-25.782" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-25.782" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="25.782" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="25.782" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-31.8" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="31.8" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="31.8" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="31.8" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-37.602" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="37.896" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="37.896" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-43.698" y="1042.4" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect transform="scale(-1,1)" x="-43.698" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="43.698" y="1045.3" width="2.901" height="2.901" rx=".94598" ry="1.009"/><rect x="43.698" y="1048.2" width="2.901" height="2.901" rx=".94598" ry="1.009"/></g></g></g></g></g></svg>
          </template>
          <!-- login banner -->
          <b-alert
            :show="gkConfig.login_banner.show"
            :variant="gkConfig.login_banner.variant"
            class="mb-2 mx-auto"
            v-html="gkConfig.login_banner.content"
          />
          <b-form @submit.prevent="preUserLogin">
            <!--Username area-->
            <b-form-group
              :label="$gettext('Username')"
              label-cols="3"
              label-align="right"
              label-size="sm"
            >
              <b-form-input
                v-model.trim="form.name"
                size="sm"
                type="text"
                :placeholder="$gettext('Enter Username')"
                required
              />
            </b-form-group>
            <!-- Password area -->
            <b-form-group
              :label="$gettext('Password')"
              label-cols="3"
              label-align="right"
              label-size="sm"
            >
              <password
                v-model="form.pwd"
                :password-hint="false"
                :placeholder="$gettext('Password')"
                size="sm"
                class="mb-0"
              />
              <b-button
                variant="link"
                class="float-right p-0"
                @click="showForm.resetPwd = true"
              >
                <small><translate>Forgot Password?</translate></small>
              </b-button>
            </b-form-group>

            <!--Captcha question -->
            <!-- only shown if captcha is enabled in gkapp config -->
            <div v-if="gkConfig.login_captcha">
              <b-form-group
                :label="$gettext('Question')"
                label-cols="3"
                label-size="sm"
                label-align="right"
              >
                <captcha v-model="captcha.answer" />
              </b-form-group>

              <!-- captcha answer -->
              <b-form-group
                :label="$gettext('Answer')"
                label-cols="3"
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
                />
              </b-form-group>
            </div>
            <b-button-group
              size="sm"
              class="row float-right"
            >
              <b-button
                variant="dark"
                class="m-1"
                @click="switchServer"
                :disabled="isOrgLoading"
              >
                <b-icon
                  class="mr-1"
                  icon="cloud"
                />
                <translate> Change Server</translate>
              </b-button>
              <b-button
                @click="showForm.createUser = true"
                variant="dark"
                class="m-1"
                :disabled="isOrgLoading"
              >
                <b-icon
                  class="mr-1"
                  icon="person-plus"
                />
                <translate> Create User</translate>
              </b-button>
              <b-button
                :disabled="isOrgLoading"
                class="m-1"
                variant="success"
                type="submit"
              >
                <b-spinner
                  class="mr-1"
                  v-if="isOrgLoading"
                  small
                />
                <b-icon
                  class="mr-1"
                  v-else
                  icon="box-arrow-in-right"
                />
                <translate> Login</translate>
              </b-button>
            </b-button-group>
          </b-form>
        </b-card>
      </b-col>
    </b-row>
    <!-- Org selection -->
    <div
      v-else
    >
      <b-container>
        <b-overlay
          :show="isLoading"
          variant="secondary"
          no-wrap
          blur
        />
        <div class="d-flex justify-content-between">
          <h1 class="display-4">
            Welcome {{ form.name || userName || '' }}!
          </h1>
        </div>
        <div class="clearfix" />
        <b-row
          v-if="invitedOrgs.length"
        >
          <b-col
            cols
            sm="12"
          >
            <b-card
              class="my-2"
            >
              <h5 class="mb-3">
                You have pending invitations,
              </h5>
              <b-row>
                <b-col
                  cols
                  sm="12"
                  lg="8"
                >
                  <b-table
                    small
                    borderless
                    :items="invitedOrgs"
                    :fields="invOrgFields"
                    responsive
                    :busy="isOrgLoading"
                    thead-class="d-none"
                    class="ml-3 mb-0"
                  >
                    <template #table-busy>
                      <div class="text-center">
                        <b-spinner
                          class="align-middle"
                          type="grow"
                        />
                        <strong> <translate>Fetching List...</translate> </strong>
                      </div>
                    </template>
                    <template #cell(index)="data">
                      {{ data.index + 1 }}.
                    </template>
                    <template #cell(name)="data">
                      <b class="text-info">{{ data.value }}</b> as <b>{{ userRoles[data.item.role] }}</b>.
                      <b-button
                        @click="onAcceptInvite(data.index, data.item.name)"
                        size="sm"
                        class="mx-1 p-1 ml-2"
                        variant="light"
                      >
                        <b-icon
                          scale="0.9"
                          icon="check-circle"
                        />
                      </b-button>
                      <b-button
                        @click="onRejectInvite(data.index, data.item.name)"
                        size="sm"
                        class="p-1"
                        variant="light"
                      >
                        <b-icon
                          scale="0.9"
                          icon="trash"
                        />
                      </b-button>
                    </template>
                  </b-table>
                </b-col>
              </b-row>
            </b-card>
          </b-col>
        </b-row>
        <b-row>
          <b-col
            cols
            sm="12"
          >
            <div class="my-3">
              <b-row>
                <b-col
                  cols
                  sm="8"
                  class="pl-0"
                >
                  <b-form-group
                    v-if="orgs.length > 10"
                    class="col-lg-4 col-lg-offset-4 mb-0"
                  >
                    <b-input-group>
                      <b-form-input
                        class="rounded"
                        id="filter-input"
                        v-model="filter"
                        type="search"
                        placeholder="Type to Search"
                        size="sm"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>

                <b-col
                  cols
                  sm="4"
                >
                  <b-dropdown
                    split
                    text="Create Org"
                    size="sm"
                    variant="success"
                    :disabled="showForm.createOrg"
                    @click="showForm.createOrg = true"
                    class="float-right"
                  >
                    <b-dropdown-item
                      v-b-toggle.collapse-1
                    >
                      Import Organisation
                    </b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <div class="my-2">
                <b-form @submit.prevent="upload">
                  <b-collapse id="collapse-1">
                    <div class="row justify-content-center">
                      <div class="col-sm-9 col-lg-6">
                        <!-- Export buttons -->
                        <b-form-file
                          required
                          v-model="file"
                          accept=".json"
                          size="sm"
                        />
                      </div>
                      <div class="col-sm-3 col-lg-2">
                        <b-button
                          type="submit"
                          variant="dark"
                          class="text-center"
                          size="sm"
                        >
                          <b-icon
                            icon="upload"
                            class="mr-2"
                          />
                          <translate>Import</translate>
                        </b-button>
                      </div>
                    </div>
                  </b-collapse>
                </b-form>
              </div>
            </div>
            <b-table
              head-variant="light"
              :items="orgs"
              :fields="orgFields"
              :filter="filter"
              :per-page="orgCount"
              responsive
              outlined
              hover
              sort-icon-left
              v-if="isOrgLoading || orgs.length"
              :busy="isOrgLoading"
              id="org-table"
            >
              <template #table-busy>
                <div class="text-center">
                  <b-spinner
                    class="align-middle"
                    type="grow"
                  />
                  <strong> <translate>Fetching List...</translate> </strong>
                </div>
              </template>
              <template #cell(year)="data">
                <v-select
                  :reduce="(option) => option.index"
                  :options="data.item.yearData"
                  v-model="data.item.selected"
                >
                  <template #selected-option="{yend, ystart}">
                    <div class="text-truncate">
                      {{ ystart }}
                    </div>
                    <div>to</div>
                    <div class="text-truncate">
                      {{ yend }}
                    </div>
                  </template>
                </v-select>
              </template>
              <template #cell(action)="data">
                <b-button
                  size="sm"
                  variant="dark"
                  @click="orgLogin(data.item)"
                >
                  Open
                </b-button>
              </template>
              <template #cell(role)="data">
                {{ userRoles[data.value] }}
              </template>
            </b-table>
            <b v-else>You are not part of any organisations yet</b>
            <div
              v-if="orgs.length > 10"
              class="col text-center"
            >
              <b-button
                pill
                variant="outline-secondary"
                size="sm"
                @click="orgCount = orgCount ? '' : 10"
              >
                <span v-if="orgCount">
                  Show all ({{ orgs.length }})
                </span>
                <span v-else>
                  Show less
                </span>
              </b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <!-- create org modal -->
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
      <create-organisation
        :in-overlay="true"
        :on-save="onOrgCreate"
      />
    </b-modal>
    <!-- forgot password modal -->
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
      <reset-password :on-success="onPwdReset" />
    </b-modal>
    <!-- create user modal -->
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
      <create-user :on-success="onUserCreate" />
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
  name: 'SelectUserOrg',
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
      orgCount: 10,
      captcha: {
        answer: null,
        userAnswer: null,
      },
      filter: null,
      orgs: [],
      invitedOrgs: [],
      orgFields: [
        { label: 'Name', key: 'name', stickyColumn: true },
        'role',
        'action',
      ],
      invOrgFields: [
        { label: 'No.', key: 'index', stickyColumn: true },
        { label: 'Name', key: 'name', stickyColumn: true },
      ],
      selectedOrg: null,
      userRoles: {
        '-1': 'Admin',
        0: 'Manager',
        1: 'Operator',
        2: 'Internal Auditor',
        3: 'Godown In Charge',
      },
      file: [],
      file_str: null,
      json_info: null,
    };
  },
  computed: {
    ...mapState([
      'gkCoreUrl',
      'userAuthToken',
      'userAuthenticated',
      'userName',
    ]),
  },
  methods: {
    /*
     * Close Change password window on successful password change
     */
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
      console.log(">>", this.orgs.length);
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
      axios.post('/invite/reject', payload).then((resp) => {
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
      axios.post('/invite/accept', payload).then((resp) => {
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

    // perform checks before logging a user
    // if captcha is disabled, login the user directly
    // or verify the captcha & login the user or throw the error
    preUserLogin() {
      if (!this.gkConfig.login_captcha) {
        this.userLogin();
      } else {
        if (this.captcha.answer == this.captcha.userAnswer) {
          this.userLogin();
        } else {
          // Alert the user on captcha failure
          this.$bvToast.toast(this.$gettext(`Incorrect Answer`), {
            title: this.$gettext('Captcha failed'),
            autoHideDelay: 3000,
            appendToast: true,
            variant: 'danger',
            solid: true,
          });
        }
      }
    },
    userLogin() {
      let payload = {
        username: this.form.name,
        userpassword: this.form.pwd,
      };
      this.isOrgLoading = true;
      axios
        .post(`${this.gkCoreUrl}/login/user`, payload)
        .then((resp) => {
          switch (resp.data.gkstatus) {
          case 0:
            this.$bvToast.toast(`Welcome ${this.form.name}`, {
              title: 'Login Success!',
              autoHideDelay: 3000,
              variant: 'success',
            });
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
    },
    orgLogin(orgData) {
      const userAuthToken = this.userAuthToken;
      let selectedYear = orgData.yearData[orgData.selected];
      let payload = {
        orgcode: selectedYear.code,
      };
      this.isLoading = true;
      // TODO: here instead of sending the username and password, send the new user auth token
      axios
        .post(`${this.gkCoreUrl}/login/org`, payload, {
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
              // useful in consolidated final accounts
              sessionStorage.setItem(
                'orgArray',
                JSON.stringify([orgName, orgType])
              );
              sessionStorage.setItem('orgCodeChoice', selectedYear.code);

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
                this.$store.dispatch('initGstin'), // initialises org GSTIN
              ])
                .then(() => {
                  this.$store
                    .dispatch('global/initGlobalState', {
                      lang: this.$language,
                    })
                    .then(() => {
                      this.$store.commit('setUserRole', orgData.role);
                      this.$store.commit('setOrgType', orgType);
                      // visit the dashboard page
                      this.$router
                        .push('/dashboard')
                        .then(() => {
                          this.isLoading = false;
                        })
                        .catch((e) => {
                          console.error(e);
                          this.isLoading = false;
                        });
                    });
                })
                .catch((e) => {
                  console.error(e);
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
          if (resp.data.gkstatus) {
            this.isLoading = false;
          }
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    fetchUserOrgs() {
      const userAuthStatus = this.userAuthenticated;
      const userAuthToken = this.userAuthToken;
      if (userAuthStatus) {
        this.isOrgLoading = true;
        axios
          .get(`${this.gkCoreUrl}/gkuser/orgs`, {
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
    upload() {
      // create a form object as api demands it
      let fd = new FormData();
      fd.append('gkfile', this.file);

      axios
        .post(`/import/organisation`, fd, { headers: { gktoken: this.userAuthToken } })
        .then((r) => {
          switch (r.data.gkstatus) {
          case 0:
            this.$bvToast.toast(this.$gettext('Import Successful'), {
              variant: 'success',
              solid: true,
            });
            this.fetchUserOrgs();

            if (this.file.type == 'application/json') {
              this.json_info = r.data.gkresult;
              this.$bvModal.show('response-modal');
            }
            this.$emit('refresh');
            break;
          case 1:
            this.$bvToast.toast('Duplicate Entry', {
              variant: 'warning',
              solid: true,
            });
            break;
          case 2:
            this.$bvToast.toast('Unauthorised Access', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 3:
            this.$bvToast.toast('Data error', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 4:
            this.$bvToast.toast('No Privilege', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 5:
            this.$bvToast.toast('Integrity error', {
              variant: 'danger',
              solid: true,
            });
            break;
          }
        });
    },
  },
  mounted() {
    if (this.gkCoreUrl == null) {
      this.$router.push('/server-setup');
    } else {
      this.fetchUserOrgs();
    }
  },
};
</script>

<style>
#org-table .vs__selected {
  display: flex;
  flex-direction: column;
}
</style>
