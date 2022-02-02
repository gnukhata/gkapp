<template>
  <section class="container-fluid">
    <div class="text-center mb-2 d-none d-print-block">
      <h3>{{ orgName }}</h3>
      <i><translate>Audit Logs</translate></i>
    </div>
    <div class="d-flex justify-content-center mt-3 mb-3 d-print-none">
      <b-form-input
        class="border border-secondary container-sm gksearch"
        type="text"
        placeholder="Search Logs"
        v-model="searchText"
      ></b-form-input>
    </div>
    <b-table
      stacked="sm"
      small
      hover
      striped
      fixed
      head-variant="dark"
      bordered
      :items="log"
      :busy="isLoading"
      :filter="searchText"
      :fields="fields"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> <translate>Fetching Logs ...</translate> </strong>
        </div>
      </template>
      <template #cell(username)="data">
        <b-link @click="$router.push(`/users/${data.item.userid}`)">{{
          data.item.username
        }}</b-link>
      </template>
    </b-table>
  </section>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'Logs',
  data() {
    return {
      log: [],
      isLoading: true,
      searchText: '',
      fields: [
        { key: 'activity', sortable: true },
        { key: 'time', label: this.$gettext('Date / Time'), sortable: true },
        { key: 'username', label: this.$gettext('User'), sortable: true },
      ],
    };
  },
  computed: {
    ...mapState(['orgName']),
  },
  methods: {
    getLogs() {
      axios
        .get('/log')
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.log = r.data.gkresult.reverse();
                this.isLoading = false;
                break;
              case 2:
                this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                  title: this.$gettext('Error'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast(
                  this.$gettext('You have no permission to access'),
                  {
                    title: this.$gettext('Error'),
                    variant: 'danger',
                    solid: true,
                  }
                );
                break;
              default:
                console.log(r.data.gkstatus);
            }
          }
        })
        .catch((e) => {
          console.log(e);
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  mounted() {
    this.getLogs();
  },
};
</script>
