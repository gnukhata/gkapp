<template>
  <section class="m-2">
    <b-input-group class="mb-3 w-75 mx-auto">
      <template #prepend>
        <b-button v-b-modal.add-cc variant="warning"
          ><b-icon icon="cash"></b-icon> Add Cost Center</b-button
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
      :items="costCenters"
      :fields="fields"
      striped
      sort-direction="asc"
      head-variant="dark"
      class="mx-auto rtable"
      hover
      fixed
      outlined
      small
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching List... </strong>
        </div>
      </template>
      <template #cell(manage)="data">
        <!-- edit cost center button -->
        <b-button
          @click="showEditCostCenter(data.item.id)"
          size="sm"
          class="mr-1"
          variant="light"
          ><b-icon icon="pencil-square" variant="dark"></b-icon
        ></b-button>
        <!-- delete cost center button -->
        <b-button @click="confirm(data.item)" size="sm" variant="light"
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
      id="edit-cc"
      title="Edit Cost Center"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <cost-center-edit
        :id="ccId"
        @modified="getCostCenterList"
      ></cost-center-edit>
    </b-modal>
  </section>
</template>

<script>
import axios from 'axios';
import CostCenterCreate from './CostCenterCreate.vue';
import CostCenterEdit from './CostCenterEdit.vue';
export default {
  components: { CostCenterCreate, CostCenterEdit },
  name: 'Godowns',
  data() {
    return {
      loading: false,
      searchText: '',
      fields: [
        { key: 'name', sortable: true },
        { key: 'sanctioned_amount', sortable: true },
        { key: 'manage' },
      ],
      costCenters: [],
      ccId: '',
    };
  },
  computed: {},
  methods: {
    confirm(info) {
      this.$bvModal
        .msgBoxConfirm(`Confirm deletion of cost center ${info.name} ?`, {
          centered: true,
          okVariant: 'danger',
        })
        .then((r) => {
          if (r) {
            this.deleteCostCenter(info);
          }
        });
    },
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
              obj.manage = null;
              return obj;
            });
            this.costCenters = u;
          } else {
            this.$bvToast.toast('Failed to fetch cost center items', {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'failed',
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    deleteCostCenter(info) {
      axios
        .delete('/projects', {
          data: {
            projectcode: info.id,
          },
        })
        .then((r) => {
          if (r.status == 200)
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast(`${info.name} Deleted`, {
                  variant: 'success',
                  title: 'Success',
                  solid: true,
                });
                axios.post('/log', {
                  activity: `cost center delete: ${info.name}`,
                });
                this.getCostCenterList();
                break;
              case 1:
                this.$bvToast.toast('Duplicate Entry', {
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
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
    showEditCostCenter(id) {
      this.ccId = id;
      this.$bvModal.show('edit-cc');
    },
  },
  mounted() {
    this.getCostCenterList();
  },
};
</script>
