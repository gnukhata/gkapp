<template>
  <section>
    <h2 class="my-4 text-muted display-5">
      USER MANAGEMENT
    </h2>
    <div class="d-flex d-print-none justify-content-between align-items-center mb-2">
      <!-- Search Field -->
      <div>
        <b-input-group size="sm">
          <b-form-input
            size="sm"
            v-model="search"
            placeholder="Search Table"
            style="align-self:center"
          />
        </b-input-group>
      </div>
      <!-- Export and Print Buttons -->
      <div>
        <b-button-group
          size="sm"
        >
          <gk-file-download
            file-suffix="UserList"
            :url="
              `/spreadsheet?user-list&fystart=${dateReverse(
                this.yearStart,
              )}&fyend=${dateReverse(this.yearEnd)}&orgname=${this.orgName}`
            "
            :message-from-parent="parentMessage"
            file-extn="xlsx"
            variant="dark"
            title="Export XLSX"
            name="Export XLSX"
          />
          <b-button
            v-b-modal="'invite'"
            class="ml-2"
            variant="success"
          >
            Invite User
            <b-modal
              id="invite"
              hide-footer
            >
              <invite-user
                @user-invited="userInvited"
              />
            </b-modal>
          </b-button>
        </b-button-group>
      </div>
    </div>
    <b-table
      head-variant="light"
      hover
      outlined
      small
      responsive="sm"
      :filter="search"
      :fields="fields"
      :items="userList"
    >
      <template #cell(status)="data">
        <div>
          <b-badge
            pill
            v-if="data.value"
            variant="primary"
          >
            Accepted
          </b-badge>
          <b-badge
            pill
            v-else
            variant="secondary"
          >
            Pending
          </b-badge>
        </div>
      </template>
      <template #cell(action)="data">
        <div>
          <b-button
            @click="confirmRemoveUser(data.item)"
            variant="danger"
            v-if="data.item.status"
            size="sm"
          >
            Remove User
          </b-button>
          <b-button
            @click="onCancelInvite(data.item)"
            variant="dark"
            size="sm"
            v-else
          >
            Delete Invitation
          </b-button>
        </div>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkFileDownload from '../components/GkFileDownload.vue';
import InviteUser from '../components/form/InviteUser.vue';
import { STATUS_CODES } from '@/js/enum';

export default {
  components: { GkFileDownload, InviteUser },
  name: 'UserManagement',
  data() {
    return {
      parentMessage: '',
      fields: [
        {
          key: "name",
          label: 'User',
          sortable: true,
          class: 'col-5',
        },
        {
          key: "role",
          sortable: true,
          class: 'col-3',
        },
        {
          key: "status",
          label: "Invitation Status",
          class: 'col-2',
          sortable: true,
        },
        {
          class: 'col-2',
          key: "action",
        },
      ],
      userList: [],
      search: '',
      isLoading: false,
      selectedUserId: '',
    };
  },
  computed: {
    ...mapState(['authToken', 'gkCoreUrl', 'orgName', 'yearStart', 'yearEnd']),
  },
  methods: {
    userInvited() {
      this.$bvModal.hide('invite');
      this.getUsers();
    },
    // remove a user from organisation
    removeUser(userID, userName) {
      this.isLoading = true;
      let payload = {
        headers: {
          gktoken: this.authToken,
          gkauthtoken: this.userAuthToken,
        },
        data: {
          userid: userID,
        },
      };
      axios
        .delete('/organisation/remove-user', payload)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case STATUS_CODES['Success']:
              this.gk_log(`user removed: ${userName}`);
              this.$bvToast.toast(this.$gettext('User is removed'), {
                title: 'Success',
                variant: 'success',
              });
              // refresh user list
              this.getUsers();
              break;
            case STATUS_CODES['BadPrivilege']:
              this.$bvToast.toast(
                this.$gettext('No privileges to delete the user'),
                {
                  title: 'Error',
                  variant: 'danger',
                }
              );
              break;
            case STATUS_CODES['ActionDisallowed']:
              this.$bvToast.toast(
                this.$gettext('User deletion is not allowed'),
                {
                  title: 'Error',
                  variant: 'danger',
                }
              );
              break;
            case STATUS_CODES['ConnectionFailed']:
              this.$bvToast.toast(this.$gettext('User deletion failed'), {
                title: 'error',
                variant: 'danger',
              });
              break;
            }
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e, {
            title: 'error',
            variant: 'danger',
          });
        });
      this.isLoading = false;
    },
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
    confirmRemoveUser(obj) {
      this.$bvModal
        .msgBoxConfirm(`Delete user: ${obj.name} ?`, {
          centered: true,
          size: 'sm',
          okVariant: 'danger',
          okTitle: 'Remove',
        })
        // remove user is confirmed
        .then((r) => {
          if (r) {
            this.removeUser(obj.userid, obj.name);
            return;
          }
        });
    },
    // get users who are part of the org
    getUsers() {
      this.isLoading = true;
      this.$axios
        .get('/organisation/gkusers')
        .then((resp) => {
          this.userList = [];
          resp.forEach((item) => {
            this.userList.push({
              name: item.username,
              role: item.userrolename,
              userid: item.userid,
              status: item.invitestatus,
            });
          });
        });
      this.isLoading = false;
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
      axios.delete('/invite', config).then((resp) => {
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
