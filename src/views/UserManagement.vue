<template>
  <section class="mt-2 mr-3 ml-3">
    <b-input-group class="mb-3 w-100 mx-auto">
      <template #prepend>
        <!-- <b-input-group-text>Username</b-input-group-text> -->
        <b-button variant="outline-primary" v-b-modal.create-user
          ><b-icon icon="person-plus"></b-icon> Add User</b-button
        >
      </template>
      <b-form-input
        type="text"
        placeholder="Search Users"
        v-model="searchText"
      ></b-form-input>
    </b-input-group>
    <b-table
      :filter="searchText"
      :items="userList"
      :fields="fields"
      :busy="isLoading"
      style="margin: auto"
      head-variant="dark"
      hover
      fixed
      outlined
      striped
      class="table"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching All Users ... </strong>
        </div>
      </template>
      <!-- data.item.edit is userid -->
      <template #cell(user)="data">
        <b-button
          @click="showEditUser(data.item.edit)"
          title="click to edit contact"
          variant="dark"
          size="sm"
          ><b-icon icon="person"></b-icon> {{ data.item.user }}</b-button
        >
        <!-- <b>{{ data.item.user }} </b> -->
        <!-- <b-icon
                 icon="pencil"
                 class="mr-1"
                 @click="showEditUser(data.item.edit)"
                 ></b-icon> -->
      </template>
      <template #cell(edit)="data">
        <b-icon
          icon="pencil-square"
          class="mr-1"
          scale="2x"
          @click="showEditUser(data.item.edit)"
        ></b-icon>
      </template>
    </b-table>
    <b-modal
      id="create-user"
      title="Add User"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <add-user @refreshUsers="getUsers"></add-user>
    </b-modal>
    <b-modal
      id="edit-user"
      title="Edit User"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <edit-user @refreshUsers="getUsers" :id="selectedUserId"></edit-user>
    </b-modal>
  </section>
</template>

<script>
import axios from 'axios';
import AddUser from '@/components/form/AddUser.vue';
import EditUser from '@/components/form/EditUser.vue';
import { mapState } from 'vuex';

export default {
  name: 'UserManagement',
  components: { AddUser, EditUser },
  data() {
    return {
      fields: [
        {
          key: 'user',
          sortable: true,
        },
        {
          key: 'role',
        },
      ],
      userList: [],
      searchText: '',
      isLoading: false,
      selectedUserId: '',
    };
  },
  computed: {
    ...mapState(['authToken', 'gkCoreUrl']),
  },
  methods: {
    getUsers() {
      this.isLoading = true;
      axios
        .get('/users')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let usr = r.data.gkresult.map((data) => {
              let obj = {};
              obj.user = Object.values(data)[1];
              obj.role = Object.values(data)[3];
              obj.edit = Object.values(data)[0]; // user id
              return obj;
            });
            this.userList = usr;
            this.isLoading = false;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    showEditUser(id) {
      this.selectedUserId = id;
      this.$bvModal.show('edit-user');
    },
  },
  mounted() {
    this.getUsers();
  },
};
</script>
<style scoped>
table {
  width: 70%;
}
@media all and (max-width: 600px) {
  table {
    width: 100%;
  }
}
</style>
