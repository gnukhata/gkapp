<template>
  <section class="m-1">
    <!-- Manage Users -->
    <!-- {{ userList }} -->
    <b-card
      header="Manage Users"
      header-bg-variant="dark"
      header-text-variant="light"
      style="max-width: 40em"
      class="mx-auto"
    >
      <template #header>
        <div class="d-flex">
          <div class="mr-auto">Manage Users</div>
          <div>
            <b-icon
              icon="question-circle"
              v-b-popover.click.blur="{
                variant: 'dark',
                content:
                  'Allows to add / delete / modify user details in an organisation',
              }"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-form @submit.prevent="confirm('update')">
        <b-overlay :show="isLoading" blur no-wrap></b-overlay>
        <!-- Select user -->
        <b-form-group label="Select User">
          <b-form-select v-model="form.userid" @change="getUserName">
            <b-form-select-option
              v-for="user in userList"
              :key="user.userid"
              :value="user.userid"
              >{{ user.username }}</b-form-select-option
            >
          </b-form-select>
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
        <!-- user godowns -->
        <!-- <b-form-group v-if="form.userrole === 3" label="User's Godowns"> -->
        <!-- {{ userGodowns }} -->
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
              <!-- <b-td>{{ godown.checked }}</b-td> -->
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
          <b-button class="mr-1" variant="success" v-b-modal.create-user>
            <b-icon icon="person-plus"></b-icon>
            New User</b-button
          >
          <b-button type="submit" class="mr-1" variant="warning">
            <b-icon icon="cloud-arrow-up"></b-icon>
            Update user</b-button
          >
          <b-button variant="danger" @click="confirm('delete')">
            <b-icon icon="x-circle"></b-icon>
            Delete User</b-button
          >
        </b-button-group>
      </b-form>
    </b-card>
    <b-modal
      id="create-user"
      title="Add User"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <add-user @refreshUsers="getUsers"></add-user>
    </b-modal>
  </section>
</template>

<script>
import axios from "axios";
import AddUser from "@/components/form/AddUser.vue";
import { mapState } from "vuex";

export default {
  name: "UserManagement",
  components: { AddUser },
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
      form: {
        username: "",
        userid: Number,
        userrole: "",
        userquestion: "",
        useranswer: "",
      },
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
    },
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
            headerTextVariant: "light",
          })
          .then((r) => {
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
            okTitle: "Update",
          })
          .then((r) => {
            if (r) {
              this.updateUser();
            }
          });
      }
    },
    getUsers() {
      this.isLoading = true;
      axios
        .get("/users")
        .then((r) => {
          if (r.status == 200) {
            this.userList = r.data.gkresult;
            this.isLoading = false;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getUserName() {
      for (let i in this.userList) {
        if (this.userList[i].userid == this.form.userid) {
          this.form.username = this.userList[i].username;
          this.form.userrole = this.userList[i].userrole;
          if (this.form.userrole === 3) {
            this.getUserGodowns(this.userList[i].userid);
          }
          break;
        }
      }
    },
    /**
     * get all godowns & filter the one's which user is incharge
     */
    getUserGodowns(id) {
      this.isLoading = true;
      console.log("fetching user godowns", id);
      const ug = axios.get(`/godown?type=byuser&userid=${id}`);
      const ag = axios.get("/godown");
      Promise.all([ug, ag])
        .then((val) => {
          let userGodowns = val[0].data.gkresult;
          let allGodowns = val[1].data.gkresult;
          let i, u;
          for (i in allGodowns) {
            //
            for (let u in userGodowns) {
              //
              if (userGodowns[u].goid === allGodowns[i].goid) {
                allGodowns[i].checked = "accepted";
              }
            }
          }
          this.userGodowns = allGodowns.reverse();
          this.isLoading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(
            "Failed to fetch godown info, Please refresh the page",
            {
              variant: "danger",
              solid: true,
            }
          );
          this.isLoading = false;
        });
    },
    updateUser() {
      this.isLoading = true;
      axios.put("/users?editdata", this.form).then((r) => {
        if (r.status == 200)
          switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast(
                `user ${this.form.username} updated successfully`,
                {
                  title: "Success",
                  variant: "success",
                  solid: true,
                }
              );
              // Add delete user log to server
              const payload = {
                activity: `user ${this.form.username} details updated`,
              };
              axios.post(`${this.gkCoreUrl}/log`, payload, {
                headers: { gktoken: this.authToken },
              });
              this.isLoading = false;
              this.getUsers();
              break;
            case 1:
              this.$bvToast.toast(
                `Username ${this.form.username} already exists`,
                {
                  title: "Duplicate Entry",
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
      });
    },
    delUser() {
      this.isLoading = true;
      axios
        .delete("/users", {
          headers: {
            gktoken: this.authToken,
          },
          data: {
            userid: this.form.userid,
          },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.$bvToast.toast(`${this.form.username} removed successfully`, {
              title: "Delete Success",
              variant: "success",
              solid: true,
            });
            // Add delete user log to server
            const payload = {
              activity: `user ${this.form.username} deleted`,
            };
            axios.post(`${this.gkCoreUrl}/log`, payload, {
              headers: { gktoken: this.authToken },
            });
            this.isLoading = false;
            this.getUsers();
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: "danger",
            solid: true,
          });
          this.isLoading = false;
        });
    },
    resetForm() {
      this.form = {
        userid: "",
        username: "",
        userrole: "",
      };
    },
  },
  mounted() {
    this.getUsers();
  },
};
</script>

<style>
</style>