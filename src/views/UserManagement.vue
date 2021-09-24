<template>
  <section class="mt-2 mr-3 ml-3">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <!-- <b-input-group-text>Username</b-input-group-text> -->
        <b-button
          @click="$router.push('/users/add')"
          variant="outline-primary"
          v-b-modal.create-user
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
      class="table-border-dark"
      hover
      outlined
      striped
      small
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching All Users ... </strong>
        </div>
      </template>
      <!-- data.item.edit is userid -->
      <template #cell(user)="data">
        <b-link
          @click="$router.push(`/users/${data.item.userid}`)"
          title="click to edit contact"
          variant="dark"
          size="sm"
          >{{ data.item.user }}</b-link
        >
      </template>
      <template #cell(action)="data">
        <b-icon
          icon="pencil-square"
          class="mr-1"
          @click="$router.push('/users/' + data.item.userid)"
          role="button"
        ></b-icon>
        <b-icon
          v-if="data.item.roleid !== -1"
          icon="trash"
          variant="danger"
          class="ml-1"
          role="button"
          @click="confirm(data.item)"
        ></b-icon>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

export default {
  name: 'UserManagement',
  data() {
    return {
      fields: [
        {
          key: 'user',
          sortable: true,
        },
        {
          key: 'role',
          sortable: true,
        },
        {
          key: 'action',
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
    confirm(obj) {
      this.$bvModal
        .msgBoxConfirm(`Delete user ${obj.user} ?`, {
          centered: true,
          size: 'md',
          okVariant: 'danger',
          okTitle: 'Delete',
          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        // delete user is confirmed
        .then((r) => {
          if (r) {
            this.deleteUser(obj.user, obj.userid);
            return;
          }
        });
    },
    getUsers() {
      this.isLoading = true;
      axios
        .get('/users')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let usr = r.data.gkresult.map((data) => {
              return {
                user: data.username,
                role: data.userrolename,
                roleid: data.userrole,
                userid: data.userid,
              };
            });
            this.userList = usr;
            this.isLoading = false;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    deleteUser(name, id) {
      this.isLoading = true;
      axios
        .delete('/users', {
          headers: {
            gktoken: this.authToken,
          },
          data: {
            userid: id,
          },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.$bvToast.toast(`${name} removed successfully`, {
              title: 'Delete Success',
              variant: 'success',
              solid: true,
            });

            // Add delete user log to server
            const payload = {
              activity: `user ${this.name} deleted`,
            };
            axios.post(`${this.gkCoreUrl}/log`, payload, {
              headers: { gktoken: this.authToken },
            });
            // refresh user list
            this.getUsers();
            this.isLoading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: 'danger',
            solid: true,
          });
          this.isLoading = false;
        });
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
