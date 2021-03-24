<template>
  <section class="mt-2 mr-3 ml-3">
    <div>
      <b-input-group class="mb-3 w-75 mx-auto">
        <template #prepend>
          <!-- <b-input-group-text>Username</b-input-group-text> -->
          <b-button variant="outline-primary" v-b-modal.create-uom
            ><b-icon icon="thermometer"></b-icon> Add UOM</b-button
          >
        </template>
        <b-form-input
          type="text"
          placeholder="Search UOM"
          v-model="searchText"
        ></b-form-input>
      </b-input-group>
      <b-table
        :filter="searchText"
        :fields="['unit_name', 'description']"
        :items="uomList"
        class="mx-auto table"
        head-variant="dark"
        hover
        fixed
        outlined
        small
        :busy="isLoading"
      >
        <template #cell(unit_name)="data">
          <b-button
            @click="showEditUOM(data.item.uom_id)"
            title="click to edit UOM"
            variant="dark"
            size="sm"
          >
            {{ data.item.unit_name }}
          </b-button>
        </template>
      </b-table>
      <b-modal
        id="create-uom"
        title="Add Unit Of Measurement (UOM)"
        header-bg-variant="dark"
        header-text-variant="light"
        hide-footer
      >
        <add-uom @refresh="getUOM"></add-uom>
      </b-modal>
      <b-modal
        id="edit-uom"
        title="Edit UOM"
        header-bg-variant="dark"
        header-text-variant="light"
        hide-footer
      >
        <edit-uom :id="selectedUomId"></edit-uom>
      </b-modal>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import AddUOM from '@/components/form/AddUOM.vue';
import EditUOM from '../components/form/EditUOM.vue';
export default {
  name: 'UOM',
  components: {
    'add-uom': AddUOM,
    'edit-uom': EditUOM,
  },
  data() {
    return {
      uomList: [],
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
.table {
  width: 70%;
}
</style>
