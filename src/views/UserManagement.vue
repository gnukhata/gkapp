<template>
  <section class="m-2">
    <b-card
      header="Manage Users"
      header-bg-variant="primary"
      header-text-variant="light"
      style="max-width: 40em"
      class="mx-auto"
    >
      <b-overlay :show="isLoading" blur no-wrap></b-overlay>
      <!-- {{ userList }} -->
      <b-form-group label="Select User">
        <b-form-select>
          <template #first>
            <b-form-select-option value="null" disabled>
              -- Select User --
            </b-form-select-option>
          </template>
          <b-form-select-option
            v-for="user in userList"
            :key="user.userid"
            :value="user.userid"
            >{{ user.username }}</b-form-select-option
          >
        </b-form-select>
      </b-form-group>
      <b-form-group label="Name">
        <b-form-input></b-form-input>
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
          Add User</b-button
        >
        <b-button class="mr-1" variant="warning">
          <b-icon icon="cloud-arrow-up"></b-icon>
          Update user</b-button
        >
        <b-button variant="danger">
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
      ok-title="Add"
      ok-variant="success"
    >
      <b-form>
        <b-form-group label="Name">
          <b-form-input required></b-form-input>
        </b-form-group>
        <b-form-group label="Select Role">
          <b-form-select :options="roles" required>
            <template #first>
              <b-form-select-option value="null" disabled>
                -- Select Role --
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
        <b-form-group label="New Password">
          <b-form-input required type="password"></b-form-input>
        </b-form-group>
        <b-form-group label="Confirm Password">
          <b-form-input required type="password"></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>
  </section>
</template>

<script>
import axios from "axios";

export default {
  name: "UserManagement",
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
    };
  },
  methods: {
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
  },
  mounted() {
    this.getUsers();
  },
};
</script>

<style>
</style>