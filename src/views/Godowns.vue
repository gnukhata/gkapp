<template>
  <section class="m-2">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <b-button
          @click="$router.push('/godowns/add')"
          variant="warning"
          size="sm"
          ><b-icon icon="building"></b-icon> Add Godown</b-button
        >
      </template>
      <b-form-input
        type="text"
        placeholder="Search Godowns"
        v-model="searchText"
      ></b-form-input>
    </b-input-group>

    <b-table
      :filter="searchText"
      :items="allGodowns"
      :fields="fields"
      striped
      sort-direction="asc"
      head-variant="dark"
      class="mx-auto"
      hover
      outlined
      small
      responsive
      fixed
      stacked="sm"
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching Godowns... </strong>
        </div>
      </template>
      <template #cell(godown_name)="data">
        <b-link
          variant="dark"
          @click="$router.push(`/godowns/${data.item.goid}`)"
        >
          {{ data.item.godown_name }}</b-link
        >
      </template>
    </b-table>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Godown from '../components/form/Godown.vue';
import GodownEdit from './GodownEdit.vue';
export default {
  name: 'Godowns',
  components: { Godown, GodownEdit },
  data() {
    return {
      searchText: '',
      fields: [
        { key: 'godown_name', sortable: true },
        { key: 'state', sortable: true },
        { key: 'address', sortable: true },
        { key: 'contact_person', sortable: true },
        { key: 'contact_number', sortable: true },
      ],
      loading: false,
      allGodowns: [],
      godownId: Number,
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    /* Fetch all categories from api and assign it to allGodowns */
    getGodownsList() {
      this.loading = true;
      axios
        .get(`${this.gkCoreUrl}/godown`, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200) {
            let u = r.data.gkresult.map((data) => {
              let obj = {};
              obj.goid = Object.values(data)[2];
              obj.godown_name = Object.values(data)[3];
              obj.state = Object.values(data)[6];
              obj.address = Object.values(data)[4];
              obj.contact_person = Object.values(data)[7];
              obj.contact_number = Object.values(data)[5];
              return obj;
            });
            this.allGodowns = u;
          } else {
            this.$bvToast.toast('Failed to fetch godowns', {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
      this.loading = false;
    },
  },
  mounted() {
    this.getGodownsList();
  },
};
</script>
<style scoped>
table {
  width: 70%;
}
@media all and (max-width: 600px) {
  table {
    width: 90%;
  }
}
</style>
