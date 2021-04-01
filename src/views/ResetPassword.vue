<template>
  <section class="m-2">
    <b-card
      header="Password Reset"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mx-auto"
      style="max-width: 40em"
    >
      <b-form @submit.prevent="changePassword">
        <!-- username -->
        <b-form-group label="Username" tooltip>
          <b-form-input
            @blur="getQuestion"
            v-model="form.username"
            type="text"
            required
            :state="isValidUser"
          ></b-form-input>
          <!-- This will only be shown if the preceding input has an invalid state -->
          <b-form-invalid-feedback>
            Invalid Username
          </b-form-invalid-feedback>
        </b-form-group>
        <!-- security question -->
        <b-form-group label="Security Question" tooltip>
          <b-overlay :show="isLoading">
            <b-form-input
              v-model="form.userquestion"
              type="text"
              disabled
            ></b-form-input>
            <template #overlay>
              <div class="text-center">
                <b-icon
                  icon="cloud-arrow-down"
                  font-scale="2"
                  animation="throb"
                >
                </b-icon>
                <br />
                <small>
                  Getting Security Question
                </small>
              </div>
            </template>
          </b-overlay>
        </b-form-group>
        <!-- Answer  -->
        <b-form-group label="Answer">
          <b-form-input v-model="form.useranswer" required></b-form-input>
        </b-form-group>
        <!--New Password -->
        <b-form-group label="New Password">
          <b-form-input v-model="form.userpassword" required></b-form-input>
        </b-form-group>
        <!-- Confirm Password -->
        <b-form-group label="Confirm Password">
          <b-form-input
            :state="matchingPwd"
            required
            v-model="password2"
          ></b-form-input>
          <b-form-invalid-feedback>
            passwords does not match
          </b-form-invalid-feedback>
        </b-form-group>
        <!-- submit  button -->
        <b-button
          :disabled="!matchingPwd"
          type="submit"
          variant="info"
          class="float-right"
          ><b-icon v-if="!submitting" icon="key-fill"></b-icon
          ><b-spinner v-if="submitting" small></b-spinner> Reset
          Password</b-button
        >
      </b-form>
    </b-card>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'ResetPassword',
  data() {
    return {
      isLoading: false,
      submitting: false,
      isValidUser: null,
      password2: '',
      uid: Number,
      form: {
        username: '',
        userquestion: '',
        useranswer: '',
        userpassword: '',
      },
    };
  },
  computed: {
    ...mapState(['orgCode']),
    matchingPwd() {
      if (this.form.userpassword == this.password2) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    getQuestion() {
      this.isLoading = true;
      axios
        .get(
          `/forgotpassword?username=${this.form.username}&orgcode=${this.orgCode}`
        )
        .then((r) => {
          if (r.status == 200) {
            let usr = r.data.gkresult;
            switch (r.data.gkstatus) {
              case 0:
                this.form.userquestion = usr.userquestion;
                this.uid = usr.userid;
                this.isValidUser = true;
                break;
              default:
                this.$bvToast.toast('Invalid Username', {
                  variant: 'danger',
                  solid: true,
                });
                this.form.userquestion = '';
                this.isValidUser = false;
            }
          } else {
            console.log(r.status);
          }
          this.isLoading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.isLoading = false;
        });
    },
    /* Check the given security answer & validate it. If it's valid, show password change inputs*/
    changePassword() {
      this.submitting = true;
      axios
        .put(`/forgotpassword`, {
          userid: this.uid,
          userpassword: this.form.userpassword,
          useranswer: this.form.useranswer,
        })
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvModal
                  .msgBoxOk(
                    'Password Change Successful, Press ok to redirect to login page',
                    {
                      title: 'Success',
                      headerTextVariant: 'light',
                      headerBgVariant: 'success',
                      okVariant: 'dark',
                    }
                  )
                  .then((res) => {
                    if (res == true) {
                      this.$router.push('/');
                    }
                  });
                break;
              default:
                this.$bvToast.toast('Invalid answer, Please try again', {
                  variant: 'danger',
                  solid: true,
                });
                this.submitting = false;
            }
          } else {
            this.$bvToast.toast('Failed with Status code ' + r.status, {
              variant: 'danger',
              solid: true,
            });
            this.submitting = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.submitting = false;
        });
    },
  },
};
</script>
