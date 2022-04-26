<template>
  <section class="m-2">
    <!-- Create user -->
    <b-card
      :header="$gettext('Add User')"
      header-bg-variant="dark"
      header-text-variant="light"
      class="gkcard mx-auto"
    >
      <b-form ref="createForm" @submit.prevent="addUser">
        <b-overlay :show="isLoading" blur no-wrap></b-overlay>
        <b-form-group
          :label="$gettext('Name')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            :state="validateName"
            v-model="newUser.username"
            required
            type="text"
            trim
            size="sm"
          ></b-form-input>
          <b-form-invalid-feedback id="input-live-feedback">
            <translate>Username must be minimum of 3 characters</translate>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group
          :label="$gettext('Role')"
          label-size="sm"
          label-align="right"
          label-cols="4"
        >
          <b-form-select
            v-model="newUser.userrole"
            :options="roles"
            required
            size="sm"
            @change="getGodowns"
          >
            <b-form-select-option disabled value="null"
              >-- Select Role --</b-form-select-option
            >
          </b-form-select>
        </b-form-group>
        <b-table-simple
          v-if="newUser.userrole === 3"
          hover
          small
          caption-top
          responsive
        >
          <caption>
            <v-translate>Select Godowns</v-translate>
          </caption>
          <b-thead head-variant="dark">
            <b-tr>
              <b-th v-translate>Select</b-th>
              <b-th v-translate>Name</b-th>
              <b-th v-translate>State</b-th>
              <b-th v-translate>Address</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="godown in allGodowns" :key="godown.goid">
              <b-td>
                <b-form-checkbox
                  value="accepted"
                  unchecked-value="not_accepted"
                  v-model="godown.checked"
                  switch
                >
                </b-form-checkbox>
              </b-td>
              <b-td>{{ godown.goname }}</b-td>
              <b-td>{{ godown.state }}</b-td>
              <b-td>{{ godown.goaddr }}</b-td>
              <!-- <b-td>{{ godown.checked }}</b-td> -->
            </b-tr>
          </b-tbody>
        </b-table-simple>
        <b-form-group
          :label="$gettext('Password')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <password size="sm" v-model="newUser.userpassword"></password>
        </b-form-group>
        <b-form-group
          :label="$gettext('Confirm Password')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input :state="pwdMatch" v-model="cnfPassword" size="sm">
          </b-form-input>
          <b-form-invalid-feedback
            ><translate
              >Passwords do not match</translate
            ></b-form-invalid-feedback
          >
        </b-form-group>
        <b-form-group
          label-size="sm"
          label-cols="4"
          label-align="right"
          :label="$gettext('Question')"
        >
          <security-questions
            size="sm"
            v-model="newUser.userquestion"
          ></security-questions>
        </b-form-group>
        <b-form-group
          label-cols="4"
          label-size="sm"
          label-align="right"
          :label="$gettext('Answer')"
        >
          <b-form-input
            v-model="newUser.useranswer"
            required
            type="text"
            size="sm"
          ></b-form-input>
        </b-form-group>
        <slot name="modal-footer">
          <b-button
            :disabled="!pwdMatch"
            size="sm"
            type="submit"
            class="float-right"
            variant="success"
          >
            <b-icon class="mr-1" type="submit" icon="person-plus"></b-icon>
            <translate>Create User</translate></b-button
          >
        </slot>
      </b-form>
    </b-card>
  </section>
</template>

<script>
// L292 & validateName computed property has some warnings. disable those
/* eslint-disable */
import { mapState } from 'vuex';
import axios from 'axios';
import Password from '../Password.vue';
import SecurityQuestions from '../SecurityQuestions.vue';
export default {
  components: { SecurityQuestions, Password },
  name: 'AddUser',
  data() {
    return {
      isLoading: false,
      allGodowns: [],
      cnfPassword: '',
      newUser: {
        username: '',
        userpassword: '',
        userrole: Number,
        userquestion: '',
        useranswer: '',
        golist: [],
      },
      roles: [
        {
          value: -1,
          text: 'Admin',
        },
        {
          value: 0,
          text: 'Manager',
        },
        {
          value: 1,
          text: 'Operator',
        },
        {
          value: 2,
          text: 'Internal Auditor',
        },
        {
          value: 3,
          text: 'Godown In Charge',
        },
      ],
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
    pwdMatch() {
      if (this.cnfPassword == '') {
        return null;
      }

      if (this.newUser.userpassword === this.hashedPassword(this.cnfPassword)) {
        return true;
      } else {
        return false;
      }
    },
    validateName() {
      // remove spaces in username
      this.newUser.username = this.newUser.username.split(' ').join('');
      // username should be atleast three characters
      if (this.newUser.username === '') {
        return null;
      }
      if (this.newUser.username.length <= 2) {
        return false;
      } else {
        return true;
      }
    },
  },
  methods: {
    /**
     * get all godowns in current organisation
     */
    getGodowns() {
      this.isLoading = true;
      axios
        .get(`${this.gkCoreUrl}/godown`, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let godowns = r.data.gkresult;
            for (let i in godowns) {
              godowns[i].checked = 'not_accepted';
            }
            this.allGodowns = godowns;
            this.isLoading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(
            'Failed to fetch godown info, Please reload the page',
            {
              title: e.message,
              variant: 'danger',
              solid: true,
            }
          );
          this.isLoading = false;
        });
    },
    /* Create User */
    addUser() {
      this.isLoading = true;
      // If selected role is godown incharge, add selected godown id's to the submitted form
      if (this.newUser.userrole == 3) {
        let list = [];
        for (let i in this.allGodowns) {
          if (this.allGodowns[i].checked === 'accepted') {
            list.push(this.allGodowns[i].goid);
          }
        }
        this.newUser.golist = list;
      }
      axios
        .post(`${this.gkCoreUrl}/users`, this.newUser, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                {
                  this.$bvToast.toast(
                    `${this.newUser.username} created successfully`,
                    {
                      title: 'Success',
                      variant: 'success',
                      solid: true,
                    }
                  );
                  // Add user created log to server
                  const payload = {
                    activity: `user ${this.newUser.username} created`,
                  };
                  axios.post(`${this.gkCoreUrl}/log`, payload, {
                    headers: { gktoken: this.authToken },
                  });
                  // refresh users list in USerManagement.vue
                  this.$emit('refreshUsers');
                  this.isLoading = false;
                  this.$refs.createForm.reset();
                }
                break;
              case 1:
                this.$bvToast.toast(
                  `Username ${this.newUser.username} already exists`,
                  {
                    variant: 'danger',
                    solid: true,
                  }
                );
                this.isLoading = false;
                break;
              case 2:
                this.$bvToast.toast('Unauthorised access', {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 3:
                this.$bvToast.toast('Connection Failed', {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 4:
                this.$bvToast.toast('Bad Privilege', {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 5:
                this.$bvToast.toast('Action Disallowed', {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
            }
          } else {
            this.$bvToast.toast(
              'Connection failed with status code ' + r.status,
              {
                variant: 'danger',
                solid: true,
              }
            );
            this.isLoading = false;
          }
        });
    },
  },
};
</script>
