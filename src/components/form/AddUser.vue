<template>
  <section class="m-2">
    <!-- Create user -->
    <b-card
      header="Add User"
      header-bg-variant="dark"
      header-text-variant="light"
      class="gkcard mx-auto"
    >
      <b-form ref="createForm" @submit.prevent="addUser">
        <b-overlay :show="isLoading" blur no-wrap></b-overlay>
        <b-form-group
          label="Name"
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
            Username must be minimum 3 characters
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group
          label="Role"
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
            Select Godowns
          </caption>
          <b-thead head-variant="dark">
            <b-tr>
              <b-th>Select</b-th>
              <b-th>Name</b-th>
              <b-th>State</b-th>
              <b-th>Address</b-th>
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
          label="Password"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <password size="sm" v-model="newUser.userpassword"></password>
        </b-form-group>
        <b-form-group
          label="Confirm Password"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input :state="pwdMatch" v-model="cnfPassword" size="sm">
          </b-form-input>
          <b-form-invalid-feedback
            >Passwords do not match</b-form-invalid-feedback
          >
        </b-form-group>
        <b-form-group
          label-size="sm"
          label-cols="4"
          label-align="right"
          label="Question"
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
          label="Answer"
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
            <b-icon type="submit" icon="person-plus"></b-icon>
            Create User</b-button
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

      if (this.newUser.userpassword === this.cnfPassword) {
        return true;
      } else {
        return false;
      }
    },
    validateName() {
      // remove spaces in username
      this.newUser.username = this.newUser.username.split(' ').join('');
      // username should be atleast three characters
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
      console.log('fetching godowns');
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
        console.log(list);
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
    // getPasswordHint(pwdStrength) {
    //   const available = pwdStrength.contains.map((item) => item.message);
    //   let hint = this.options.pwdFieldTypes
    //     .filter((item) => !available.includes(item))
    //     .reduce((prev, cur) => {
    //       return `${prev} ${cur},`;
    //     }, "");
    //   if (available.length < 4) {
    //     hint = `Require atleast 1 ${hint}.`;
    //   }
    //   if (pwdStrength.length < 8) {
    //     hint += " Must be minimum 8 characters long";
    //   }
    //   return hint;
    // },
  },
};
</script>
