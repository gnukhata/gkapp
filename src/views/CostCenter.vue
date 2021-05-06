<template>
  <section class="m-2">
    <b-input-group class="mb-3 w-75 mx-auto">
      <template #prepend>
        <b-button v-b-modal.add-cc variant="warning"
          ><b-icon icon="building"></b-icon> Add Cost Center</b-button
        >
      </template>
      <b-form-input
        type="text"
        placeholder="Search Cost Center List"
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
      fixed
      outlined
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching Cost Center... </strong>
        </div>
      </template>
      <template #cell(edit)="data">
        <b-button size="sm" class="mr-1" variant="light"
          ><b-icon icon="pencil-square" variant="dark"></b-icon
        ></b-button>
        <b-button size="sm" variant="light"
          ><b-icon icon="trash-fill" variant="danger"></b-icon
        ></b-button>
      </template>
    </b-table>
    <b-modal
      id="add-cc"
      title="Add Cost Center"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <cost-center-create @created="getCostCenterList"></cost-center-create>
    </b-modal>
    <b-modal
      id="edit-godown"
      title="Edit Godown"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
    </b-modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import CostCenterCreate from './CostCenterCreate.vue';
export default {
  components: { CostCenterCreate },
  name: 'Godowns',
  data() {
    return {
      searchText: '',
      fields: [
        { key: 'name', sortable: true },
        { key: 'sanctioned_amount', sortable: true },
        { key: 'edit' },
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
    getCostCenterList() {
      this.loading = true;
      axios
        .get(`/projects`)
        .then((r) => {
          if (r.status == 200) {
            let u = r.data.gkresult.map((data) => {
              let obj = {};
              obj.id = Object.values(data)[0];
              obj.name = Object.values(data)[1];
              obj.sanctioned_amount = Object.values(data)[2];
              obj.edit = null;
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
    showGodownInfo(id) {
      this.godownId = id;
      this.$bvModal.show('edit-godown');
    },
  },
  mounted() {
    this.getCostCenterList();
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
