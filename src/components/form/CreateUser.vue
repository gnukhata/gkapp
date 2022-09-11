<template>
  <section>
    <!-- Create user -->
    <b-card
      :header="$gettext('Add User')"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <b-form ref="createForm" @submit.prevent="addUser">
        <b-overlay :show="isLoading" blur no-wrap></b-overlay>
        <b-form-group
          :label="$gettext('Name')"
          label-align="right"
          label-cols="4"
          label-size="sm"
          :state="valid.username"
          invalid-feedback="Username not unique"
        >
          <b-form-input
            v-model="form.username"
            required
            type="text"
            trim
            debounce="500"
            size="sm"
            :state="valid.username"
            min="3"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          :label="$gettext('Password')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <password size="sm" v-model="form.userpassword"></password>
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
            v-model="form.userquestion"
          ></security-questions>
        </b-form-group>
        <b-form-group
          label-cols="4"
          label-size="sm"
          label-align="right"
          :label="$gettext('Answer')"
        >
          <b-form-input
            v-model.trim="form.useranswer"
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
import Password from '@/components/Password.vue';
import SecurityQuestions from '@/components/SecurityQuestions.vue';
import { STATUS_CODES } from '@/js/enum.js';
export default {
  components: { SecurityQuestions, Password },
  name: 'CreateUser',
  data() {
    return {
      isLoading: false,
      cnfPassword: '',
      form: {
        username: '',
        userpassword: '',
        userquestion: '',
        useranswer: '',
      },
      valid: {
        username: null,
      },
    };
  },
  props: {
    onSuccess: {
      type: Function,
      required: false,
      default: () => {},
      note: 'on success callback, used to close the popup',
    },
  },
  computed: {
    _username() {
      return this.form.username;
    },
    ...mapState(['gkCoreUrl', 'authToken']),
    pwdMatch() {
      if (this.cnfPassword == '') {
        return null;
      }

      if (this.form.userpassword === this.hashedPassword(this.cnfPassword)) {
        return true;
      } else {
        return false;
      }
    },
  },
  watch: {
    _username(val) {
      this.checkUserName(val);
    },
  },
  methods: {
    checkUserName(query) {
      const self = this;
      axios.get(`/gkusers?type=unique_check&username=${query}&check_legacy=true`).then((resp) => {
        if (query === self.form.username) {
          if (resp.data.gkstatus === STATUS_CODES['Success']) {
            self.valid.username = resp.data.gkresult;
          } else {
            self.valid.username = false;
          }
        }
      });
    },
    /* Create User */
    addUser() {
      this.isLoading = true;
      // If selected role is godown incharge, add selected godown id's to the submitted form

      axios
        .post(`/gkusers`, this.form)
        .then((resp) => {
          switch (resp.data.gkstatus) {
            case STATUS_CODES['Success']:
              {
                this.$bvToast.toast(
                  `${this.form.username} created successfully`,
                  {
                    title: 'Success',
                    variant: 'success',
                    solid: true,
                  }
                );
                // Add user created log to server
                const payload = {
                  activity: `user ${this.form.username} created`,
                };
                axios.post(`/log`, payload, {
                  headers: {
                    usertoken: resp.data.token,
                  },
                });
                // refresh users list in USerManagement.vue
                this.onSuccess({
                  token: resp.data.token,
                  username: this.form.username,
                });
              }
              break;
            case STATUS_CODES['DuplicateEntry']:
              this.$bvToast.toast(
                `Username ${this.form.username} already exists`,
                {
                  variant: 'danger',
                  solid: true,
                }
              );
              break;
            case STATUS_CODES['ConnectionFailed']:
              this.$bvToast.toast('Connection Failed', {
                variant: 'danger',
                solid: true,
              });
              break;
          }
        })
        .catch(() => {
          this.$bvToast.toast(
            'Connection failed with status code ' + resp.status,
            {
              variant: 'danger',
              solid: true,
            }
          );
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>
