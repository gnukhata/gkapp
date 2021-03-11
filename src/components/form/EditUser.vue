<template>
  <section class="m-1">
    <!-- Manage Users -->
    <b-form @submit.prevent="confirm('update')">
      <b-overlay :show="isLoading" blur no-wrap></b-overlay>
      <!-- username -->
      <b-form-group label="Name">
        <b-form-input
          :state="validateName"
          required
          v-model="form.username"
          trim
        ></b-form-input>
        <b-form-invalid-feedback id="userid-feedback">
          Username must be minimum 3 characters
        </b-form-invalid-feedback>
      </b-form-group>
      <!-- user role -->
      <b-form-group label="User Role">
        <b-form-select v-model="form.userrole">
          <template #first>
            <b-form-select-option value="null" disabled>
              -- Select User --
            </b-form-select-option>
          </template>
          <b-form-select-option
            v-for="role in roles"
            :key="role.value"
            :value="role.value"
            >{{ role.text }}</b-form-select-option
          >
        </b-form-select>
      </b-form-group>
      <!-- user godowns -->
      <b-table-simple
        v-if="form.userrole === 3"
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
          <b-tr v-for="godown in userGodowns" :key="godown.goid">
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
          </b-tr>
        </b-tbody>
      </b-table-simple>
      <!-- password -->
      <b-form-group label="New Password">
        <b-form-input
          v-model="form.userpassword"
          type="password"
        ></b-form-input>
      </b-form-group>
      <!-- Security question -->
      <b-form-group label="Security Question">
        <b-form-input v-model="form.userquestion" type="text"></b-form-input>
      </b-form-group>
      <!-- answer -->
      <b-form-group label="Answer">
        <b-form-input
          v-model="form.useranswer"
          type="text"
          :required="form.userquestion !== ''"
        ></b-form-input>
      </b-form-group>
      <b-button-group size="sm">
        <b-button type="submit" class="mr-1" variant="warning">
          <b-icon icon="cloud-arrow-up"></b-icon>
          Update user</b-button
        >
        <b-button
          variant="danger"
          :disabled="form.userrole === -1"
          @click="confirm('delete')"
        >
          <b-icon icon="x-circle"></b-icon>
          Delete User</b-button
        >
      </b-button-group>
    </b-form>
  </section>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "UserManagement",
  props: {
    id: Number
  },
  data() {
    return {
      userList: [],
      user: "",
      userGodowns: "",
      isLoading: false,
      isTableLoading: true,
      roles: [
        {
          value: -1,
          text: "Admin"
        },
        {
          value: 0,
          text: "Manager"
        },
        {
          value: 1,
          text: "Operator"
        },
        {
          value: 2,
          text: "Internal Auditor"
        },
        {
          value: 3,
          text: "Godown In Charge"
        }
      ],
      form: {
        username: "",
        userid: Number,
        userrole: "",
        userquestion: "",
        useranswer: ""
      }
    };
  },
  computed: {
    ...mapState(["authToken", "gkCoreUrl"]),
    validateName() {
      // remove spaces in username
      this.form.username = this.form.username.split(" ").join("");
      // username should be atleast three characters
      if (this.form.username.length < 3) {
        return false;
      } else {
        return true;
      }
    }
  },
  methods: {
    confirm(type) {
      if (type == "delete") {
        this.$bvModal
          .msgBoxConfirm(`Delete user ${this.form.username} ?`, {
            centered: true,
            size: "md",
            okVariant: "danger",
            okTitle: "Delete",
            headerBgVariant: "danger",
            headerTextVariant: "light"
          })
          .then(r => {
            if (r) {
              this.delUser();
            }
          });
      } else {
        this.$bvModal
          .msgBoxConfirm(`Update user ${this.form.username} ?`, {
            centered: true,
            size: "md",
            okVariant: "warning",
            okTitle: "Update"
          })
          .then(r => {
            if (r) {
              this.updateUser();
            }
          });
      }
    },
    getUserInfo() {
      this.isLoading = true;
      axios
        .get(`/user?userAllData&userid=${this.id}`)
        .then(r => {
          if (r.status == 200) {
            this.form.username = r.data.gkresult.username;
            this.form.userrole = r.data.gkresult.userrole;
            this.form.userid = r.data.gkresult.userid;
            this.isLoading = false;
            this.getUserGodowns(this.id);
          }
        })
        .catch(e => {
          console.log(e.message);
        });
    },
    // getUserName() {
    //   for (let i in this.userList) {
    //     if (this.userList[i].userid == this.form.userid) {
    //       this.form.username = this.userList[i].username;
    //       this.form.userrole = this.userList[i].userrole;
    //       if (this.form.userrole === 3) {
    //         this.getUserGodowns(this.userList[i].userid);
    //       }
    //       break;
    //     }
    //   }
    // },
    /**
     * get all godowns & filter the one's which user is incharge
     */
    getUserGodowns(id) {
      this.isLoading = true;
      console.log("fetching user godowns", id);
      const ug = axios.get(`/godown?type=byuser&userid=${id}`);
      const ag = axios.get("/godown");
      Promise.all([ug, ag])
        .then(val => {
          let userGodowns = val[0].data.gkresult;
          let allGodowns = val[1].data.gkresult;
          let i, u;
          for (i in allGodowns) {
            //
            for (u in userGodowns) {
              //
              if (userGodowns[u].goid === allGodowns[i].goid) {
                allGodowns[i].checked = "accepted";
              }
            }
          }
          this.userGodowns = allGodowns;
          this.isLoading = false;
        })
        .catch(e => {
          this.$bvToast.toast(
            "Failed to fetch godown info, Please refresh the page",
            {
              title: e.message,
              variant: "danger",
              solid: true
            }
          );
          this.isLoading = false;
        });
    },
    updateUser() {
      // If selected role is godown incharge, add selected godown id's to the submitted form
      if (this.form.userrole == 3) {
        let list = [];
        for (let i in this.userGodowns) {
          if (this.userGodowns[i].checked === "accepted") {
            list.push(this.userGodowns[i].goid);
          }
        }
        this.form.golist = list;
      }
      this.isLoading = true;
      axios.put("/users?editdata", this.form).then(r => {
        if (r.status == 200)
          switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast(
                `user ${this.form.username} updated successfully`,
                {
                  title: "Success",
                  variant: "success",
                  solid: true
                }
              );
              // Add delete user log to server
              const payload = {
                activity: `user ${this.form.username} details updated`
              };
              axios.post(`${this.gkCoreUrl}/log`, payload, {
                headers: { gktoken: this.authToken }
              });
              this.isLoading = false;
              this.$emit("refreshUsers");

              break;
            case 1:
              this.$bvToast.toast(
                `Username ${this.form.username} already exists`,
                {
                  title: "Duplicate Entry",
                  variant: "danger",
                  solid: true
                }
              );
              this.isLoading = false;
              break;
            case 2:
              this.$bvToast.toast("Unauthorised access", {
                variant: "danger",
                solid: true
              });
              this.isLoading = false;
              break;
            case 3:
              this.$bvToast.toast("Connection Failed", {
                variant: "danger",
                solid: true
              });
              this.isLoading = false;
              break;
            case 4:
              this.$bvToast.toast("Bad Privilege", {
                variant: "danger",
                solid: true
              });
              this.isLoading = false;
              break;
            case 5:
              this.$bvToast.toast("Action Disallowed", {
                variant: "danger",
                solid: true
              });
              this.isLoading = false;
              break;
          }
      });
    },
    delUser() {
      this.isLoading = true;
      axios
        .delete("/users", {
          headers: {
            gktoken: this.authToken
          },
          data: {
            userid: this.form.userid
          }
        })
        .then(r => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.$bvToast.toast(`${this.form.username} removed successfully`, {
              title: "Delete Success",
              variant: "success",
              solid: true
            });

            // Add delete user log to server
            const payload = {
              activity: `user ${this.form.username} deleted`
            };
            axios.post(`${this.gkCoreUrl}/log`, payload, {
              headers: { gktoken: this.authToken }
            });
            // refresh user list
            this.$emit("refreshUsers");
            this.isLoading = false;
          }
        })
        .catch(e => {
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: "danger",
            solid: true
          });
          this.isLoading = false;
        });
    },
    resetForm() {
      this.form = {
        userid: "",
        username: "",
        userrole: ""
      };
    }
  },
  mounted() {
    this.getUserInfo();
  }
};
</script>

<style></style>
