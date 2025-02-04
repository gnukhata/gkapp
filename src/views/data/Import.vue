<template>
  <section class="container-fluid mt-2">
    <b-form @submit.prevent="check">
      <b-card no-body>
        <template #header>
          <h5 class="my-2">
            Import Data
          </h5>
        </template>
        <b-card-body v-translate>
          <h4>
            Supported Imports
          </h4>
          <ul>
            <li>Tally (.xlsx)</li>
            <li>GNUKhata Legacy (.xlsx)</li>
            <li>GNUKhata New (.json)</li>
          </ul>
          <h4 class="mt-4">
            Import Instructions
          </h4>
          <ul>
            <li>
              <router-link to="/data/import/help/tally">
                Tally & GNUKhata
              </router-link>
            </li>
            <li>
              <router-link to="/data/import/help/json">
                JSON
              </router-link>
            </li>
          </ul>
          <hr class="mx-2 my-4">
          <!-- Export buttons -->
          <b-form-file
            required
            v-model="file"
            accept=".json, .xlsx"
            size="sm"
            class="col-5"
          />
          <div>
            <b-button
              type="submit"
              variant="success"
              class="mt-2"
              size="sm"
            >
              <b-icon icon="download" />&nbsp;
              <translate>Import Data</translate>
            </b-button>
          </div>
        </b-card-body>
      </b-card>
    </b-form>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'Import',
  data() {
    return {
      file: [],
      file_str: null,
    };
  },
  methods: {
    check() {
      const f = this.file;
      if (f.type === 'application/json') {
        this.upload('json');
      } else if (
        f.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        this.upload('xlsx');
      }
    },

    upload() {
      // create a form object as api demands it
      let fd = new FormData();
      fd.append('gkfile', this.file);

      axios
        .post(`/import/overwrite-organisation`, fd, { headers: { gktoken: this.authToken } })
        .then((r) => {
          switch (r.data.gkstatus) {
          case 0:
            this.$bvToast.toast(this.$gettext('Import Successful'), {
              variant: 'success',
              solid: true,
            });
            this.logOut();
            break;
          case 1:
            this.$bvToast.toast('Duplicate Entry, organisation with same name and financial year already exists.', {
              variant: 'warning',
              solid: true,
            });
            break;
          case 2:
            this.$bvToast.toast('Unauthorised Access', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 3:
            this.$bvToast.toast('Data error', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 4:
            this.$bvToast.toast('No Privilege', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 5:
            this.$bvToast.toast('Integrity error', {
              variant: 'danger',
              solid: true,
            });
            break;
          }
        });
    },
  },
  computed: {
    ...mapState(['orgName', 'yearStart', 'yearEnd', 'authToken']),
  },
};
</script>
