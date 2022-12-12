<template>
  <section class="mt-2 mr-3 ml-3">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <!-- <b-input-group-text>Username</b-input-group-text> -->
        <b-button
          translate
          @click="$router.push('/users/invite')"
          variant="outline-primary"
          v-b-modal.create-user
        >
          <b-icon class="mr-1" icon="person-plus"></b-icon>
          <translate>Invite User</translate>
        </b-button>
      </template>
      <b-form-input
        type="text"
        :placeholder="$gettext('Search Users')"
        v-model="searchText"
      ></b-form-input>
    </b-input-group>
    <!-- Toolbar -->
    <gk-toolbar>
      <gk-file-download
        file-suffix="UserList"
        :url="
          `/spreadsheet?user-list&fystart=${dateReverse(
            this.yearStart
          )}&fyend=${dateReverse(this.yearEnd)}&orgname=${this.orgName}`
        "
      ></gk-file-download>
    </gk-toolbar>
    <!-- <b-table
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
          <strong><translate> Fetching All Users ...</translate></strong>
        </div>
      </template>
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
    </b-table> -->
    <b-row>
      <b-col>
        <h5 class="mb-3">Users</h5>
        <b-table-lite
          head-variant="dark"
          class="table-border-dark"
          hover
          outlined
          striped
          small
          :fields="userFields"
          :items="userList"
        ></b-table-lite>
      </b-col>
      <b-col>
        <h5 class="mb-3">Invitations</h5>
        <b-table-lite
          head-variant="dark"
          class="table-border-dark"
          hover
          outlined
          striped
          small
          :fields="invitedUserFields"
          :items="invitedUsers"
          v-if="invitedUsers.length"
        >
          <template #cell(action)="data">
            <b-icon
              v-if="data.item.status === true"
              icon="pencil-square"
              class="mr-1"
              role="button"
            ></b-icon>
            <b-icon
              v-if="data.item.roleid !== -1"
              icon="trash"
              variant="danger"
              class="ml-1"
              role="button"
              @click="onCancelInvite(data.item)"
            ></b-icon>
          </template>
        </b-table-lite>
        <b v-else>No pending invitations</b>
      </b-col>
    </b-row>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
import { STATUS_CODES } from '@/js/enum';

export default {
  components: { GkToolbar, GkFileDownload },
  name: 'UserManagement',
  data() {
    return {
      fields: [
        {
          key: this.$gettext('user'),
          sortable: true,
        },
        {
          key: this.$gettext('role'),
          sortable: true,
        },
        {
          key: this.$gettext('action'),
        },
      ],
      userList: [],
      invitedUsers: [],
      userFields: [{ key: 'name', label: 'User' }, 'role', 'action'],
      invitedUserFields: [
        { key: 'name', label: 'User' },
        'role',
        'status',
        'action',
      ],
      searchText: '',
      isLoading: false,
      selectedUserId: '',
    };
  },
  computed: {
    ...mapState(['authToken', 'gkCoreUrl', 'orgName', 'yearStart', 'yearEnd']),
  },
  methods: {
    onCancelInvite(userData) {
      this.$bvModal
        .msgBoxConfirm(`Cancel invite for user: ${userData.name} ?`, {
          centered: true,
          size: 'md',
          okVariant: 'danger',

          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        // delete user is confirmed
        .then((r) => {
          if (r) {
            this.cancelInvite(userData.name, userData.userid);
            return;
          }
        });
    },
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
        .get('/organisation/gkusers')
        .then((resp) => {
          if (resp.status == 200 && resp.data.gkstatus == 0) {
            // let usr = resp.data.gkresult.map((data) => {
            //   return {
            //     user: data.username,
            //     role: data.userrolename,
            //     roleid: data.userrole,
            //     userid: data.userid,
            //   };
            // });
            this.userList = [];
            this.invitedUsers = [];
            resp.data.gkresult.forEach((item) => {
              if (item.invitestatus === true) {
                this.userList.push({
                  name: item.username,
                  role: item.userrolename,
                  userid: item.userid,
                });
              } else {
                this.invitedUsers.push({
                  name: item.username,
                  role: item.userrolename,
                  userid: item.userid,
                  status: item.invitestatus,
                });
              }
            });
            // this.userList = usr;
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    cancelInvite(name, id) {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
        data: {
          userid: id,
        },
      };
      axios.delete('/userorg?type=delete_invite', config).then((resp) => {
        switch (resp.data.gkstatus) {
          case STATUS_CODES['Success']:
            this.$bvToast.toast(`Invite for ${name} cancelled successfully`, {
              variant: 'success',
            });
            this.getUsers();
            break;
          case STATUS_CODES['UnauthorisedAccess']:
            this.$bvToast.toast(`Please check login status`, {
              variant: 'warning',
            });
            break;
          case STATUS_CODES['ActionDisallowed']:
            this.$bvToast.toast(
              `User does not have the ability to cancel invites. Please contact admin.`,
              {
                variant: 'warning',
              }
            );
            break;
          case STATUS_CODES['ConnectionFailed']:
          default:
            this.$bvToast.toast(
              `Could not cancel invite, please contact admin`,
              {
                variant: 'danger',
              }
            );
        }
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
