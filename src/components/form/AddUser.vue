<template>
  <!-- Create user -->
  <b-form @submit.prevent="addUser">
    <b-overlay :show="isLoading" blur no-wrap></b-overlay>

    <b-form-group label="Name">
      <b-form-input
        :state="validateName"
        v-model="newUser.username"
        required
        type="text"
        trim
      ></b-form-input>
      <b-form-invalid-feedback id="input-live-feedback">
        Username must be greater than 3 characters
      </b-form-invalid-feedback>
    </b-form-group>
    <b-form-group label="Select Role">
      <b-form-select v-model="newUser.userrole" :options="roles" required>
      </b-form-select>
    </b-form-group>
    <b-form-group label="Password">
      <b-form-input
        required
        type="password"
        v-model="newUser.userpassword"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Security Question">
      <b-form-input
        v-model="newUser.userquestion"
        required
        type="text"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Answer">
      <b-form-input
        v-model="newUser.useranswer"
        required
        type="text"
      ></b-form-input>
    </b-form-group>
    <slot name="modal-footer">
      <b-button
        type="submit"
        class="float-right"
        variant="success"
        v-b-modal.create-user
      >
        <b-icon type="submit" icon="person-plus"></b-icon>
        Create User</b-button
      >
    </slot>
  </b-form>
</template>

<script>
import { mapState } from "vuex";
// import passwordStrength from "check-password-strength";

export default {
  name: "AddUser",
  data() {
    return {
      isLoading: false,
      newUser: {
        username: "",
        userpassword: "",
        userrole: Number,
        userquestion: "",
        useranswer: "",
      },
      roles: [
        {
          value: -1,
          text: "Admin",
        },
        {
          value: 0,
          text: "Manager",
        },
        {
          value: 1,
          text: "Operator",
        },
        {
          value: 2,
          text: "Internal Auditor",
        },
        {
          value: 3,
          text: "Godown In Charge",
        },
      ],
    };
  },
  computed: {
    ...mapState(["gkCoreUrl", "authToken"]),
    validateName() {
      // remove spaces in username
      this.newUser.username = this.newUser.username.split(" ").join("");
      // username should be atleast three characters
      if (this.newUser.username.length <= 2) {
        return false;
      } else {
        return true;
      }
    },
    // pwdStrength: () =>
    //   this.newUser.userpassword !== "" && this.newUser.userpassword !== null
    //     ? passwordStrength(this.newUser.userpassword)
    //     : { value: "Empty" },
    // isPasswordValid: self =>
    //   self.pwdStrength.value === "Empty"
    //     ? null
    //     : self.pwdStrength.value === "Strong",
    // passwordFeedback() {
    //   let text = "";
    //   if (this.userPassword) {
    //     switch (this.pwdStrength.value) {
    //       case "Strong":
    //         text = "Password is Strong.";
    //         break;
    //       case "Medium":
    //         text = this.getPasswordHint(this.pwdStrength);
    //         break;
    //       case "Weak":
    //         text = this.getPasswordHint(this.pwdStrength);
    //         break;
    //       default:
    //         if (this.userPassword.length < 8) {
    //           text = "is-danger";
    //         } else {
    //           text = "is-success";
    //         }
    //     }
    //   }
    //   return text;
    // }
  },
  methods: {
    addUser() {
      this.isLoading = true;
      if (this.newUser.userrole !== 3) {
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
                  this.$bvToast.toast(
                    `${this.newUser.username} created successfully`,
                    {
                      title: "Success",
                      variant: "success",
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
                  this.$emit("refreshUsers");
                  this.isLoading = false;
                  break;
                case 1:
                  this.$bvToast.toast(
                    `Username ${this.newUser.username} already exists`,
                    {
                      variant: "danger",
                      solid: true,
                    }
                  );
                  this.isLoading = false;
                  break;
                case 2:
                  this.$bvToast.toast("Unauthorised access", {
                    variant: "danger",
                    solid: true,
                  });
                  this.isLoading = false;
                  break;
                case 3:
                  this.$bvToast.toast("Connection Failed", {
                    variant: "danger",
                    solid: true,
                  });
                  this.isLoading = false;
                  break;
                case 4:
                  this.$bvToast.toast("Bad Privilege", {
                    variant: "danger",
                    solid: true,
                  });
                  this.isLoading = false;
                case 5:
                  this.$bvToast.toast("Action Disallowed", {
                    variant: "danger",
                    solid: true,
                  });
                  this.isLoading = false;
                  break;
              }
            } else {
              this.$bvToast.toast(
                "Connection failed with status code " + r.status,
                {
                  variant: "danger",
                  solid: true,
                }
              );
              this.isLoading = false;
            }
          });
      } else {
        this.$bvToast.toast(
          "Creating godown incharge role is not yet implemented",
          {
            title: "Alert",
            variant: "warning",
            solid: true,
          }
        );
        this.isLoading = false;
      }
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

<style></style>
