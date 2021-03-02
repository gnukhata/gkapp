<template>
  <section class="m-1">
    <!-- Manage Users -->
    <b-card
      header="Manage Users"
      header-bg-variant="primary"
      header-text-variant="light"
      style="max-width: 40em"
      class="mx-auto"
    >
      <b-overlay :show="isLoading" blur no-wrap></b-overlay>
      {{ userList }}
      <b-form-group label="Select User">
        <b-form-select v-model="form.userid" @change="getUserName">
          <!-- <template #first>
            <b-form-select-option value="null" disabled>
              -- Select User --
            </b-form-select-option>
          </template> -->
          <b-form-select-option
            v-for="user in userList"
            :key="user.userid"
            :value="user.userid"
            >{{ user.username }}</b-form-select-option
          >
        </b-form-select>
      </b-form-group>
      <b-form-group label="User Role">
        <b-form-select v-model="form.userrole" @change="getUserName">
          <!-- <template #first>
            <b-form-select-option value="null" disabled>
              -- Select User --
            </b-form-select-option>
          </template> -->
          <b-form-select-option
            v-for="role in roles"
            :key="role.value"
            :value="role.value"
            >{{ role.text }}</b-form-select-option
          >
        </b-form-select>
      </b-form-group>
      <b-form-group label="Name">
        <b-form-input v-model="form.username"></b-form-input>
      </b-form-group>
      <b-form-group label="New Password">
        <b-form-input type="password"></b-form-input>
      </b-form-group>
      <b-form-group label="Confirm Password">
        <b-form-input type="password"></b-form-input>
      </b-form-group>
      <b-button-group size="sm">
        <b-button class="mr-1" variant="success" v-b-modal.create-user>
          <b-icon icon="person-plus"></b-icon>
          New User</b-button
        >
        <b-button class="mr-1" variant="warning">
          <b-icon icon="cloud-arrow-up"></b-icon>
          Update user</b-button
        >
        <b-button variant="danger" @click="confirm('delete')">
          <b-icon icon="x-circle"></b-icon>
          Delete User</b-button
        >
      </b-button-group>
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
      isLoading: false,
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
        userid: "",
        userrole: "",
      },
    };
  },
  computed: {
    ...mapState(["authToken"]),
  },
  methods: {
    confirm(type) {
      if (type == "delete") {
        this.$bvModal
          .msgBoxConfirm(`Delete ${this.form.username} ?`, {
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
          break;
        }
      }
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