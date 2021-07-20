<template>
  <section class="mt-2 mr-3 ml-3">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <!-- <b-input-group-text>Username</b-input-group-text> -->
        <b-button variant="outline-primary" @click="$router.push('/uom/add')"
          ><b-icon icon="thermometer"></b-icon> Add Unit</b-button
        >
      </template>
      <b-form-input
        type="text"
        placeholder="Search Units"
        v-model="searchText"
      ></b-form-input>
    </b-input-group>
    <b-alert
      dismissible
      variant="dark"
      class="container text-dark d-print-none"
      :show="true"
    >
      Valid GST Units are marked
      <b-badge variant="success">green</b-badge> If not mapped, Units will be
      marked in <b-badge variant="warning">Yellow</b-badge>
    </b-alert>
    <b-table
      :filter="searchText"
      :fields="fields"
      :items="uomList"
      class="mx-auto"
      head-variant="dark"
      hover
      fixed
      outlined
      small
      striped
      :busy="isLoading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching All Units ... </strong>
        </div>
      </template>
      <template #cell(unit_name)="data">
        <b-icon
          icon="circle-fill"
          class="d-print-none"
          :variant="subUnitStatus(data.item)"
        ></b-icon>
        <b-link
          @click="$router.push('/uom/' + data.item.uom_id)"
          title="click to edit UOM"
          :variant="subUnitStatus(data.item)"
          size="sm"
        >
          {{ data.item.unit_name }}
        </b-link>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'UOM',
  data() {
    return {
      uomList: [],
      fields: [
        {
          key: 'unit_name',
          sortable: true,
        },
        {
          key: 'description',
        },
      ],
      selectedUomId: '',
      searchText: '',
      isLoading: false,
      selectedUserId: '',
    };
  },
  computed: {
    ...mapState(['authToken', 'gkCoreUrl']),
  },
  methods: {
    getUOM() {
      this.isLoading = true;
      axios
        .get('/unitofmeasurement?qty=all')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let usr = r.data.gkresult.map((data) => {
              let obj = {};
              obj.unit_name = Object.values(data)[1];
              obj.description = Object.values(data)[2];
              obj.uom_id = Object.values(data)[0];
              obj.subunitof = Object.values(data)[3];
              obj.sysunit = Object.values(data)[4];
              return obj;
            });
            this.uomList = usr;
            this.isLoading = false;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    /* As per Indian GST laws, A custom unit should be mapped to a officially valid unit */
    subUnitStatus(item) {
      if (item.sysunit === 1) {
        return 'success';
      } else if (item.sysunit === 0 && item.subunitof == null) {
        return 'warning';
      } else {
        return 'success';
      }
    },
    showEditUOM(id) {
      this.selectedUomId = id;
      this.$bvModal.show('edit-uom');
    },
  },
  mounted() {
    this.getUOM();
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
