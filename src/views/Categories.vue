<template>
  <section class="m-2">
    <b-input-group class="mb-3 container-sm gksearch">
      <template #prepend>
        <b-button variant="outline-primary" to="/categories/add"
          ><b-icon icon="tag"></b-icon> Add Category</b-button
        >
      </template>
      <b-form-input
        type="text"
        placeholder="Search Categories"
        v-model="searchText"
      ></b-form-input> </b-input-group
    ><b-table
      :filter="searchText"
      :fields="['categoryname', 'parentcategory']"
      :items="allCategories"
      striped
      sort-direction="asc"
      head-variant="dark"
      class="mx-auto"
      hover
      fixed
      outlined
      small
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong> Fetching Categories ... </strong>
        </div>
      </template>
      <!-- <template #cell()="data">
           <b-button
           @click="showEditUOM(data.item.uom_id)"
           title="click to edit UOM"
           variant="dark"
           size="sm"
           >
           {{ data.item.unit_name }}
           </b-button>
           </template> -->
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'Categories',
  data() {
    return {
      searchText: '',
      loading: false,
      allCategories: [],
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    /* Fetch all categories from api and assign it to allCategories */
    getAllCategories() {
      this.loading = true;
      axios
        .get(`${this.gkCoreUrl}/categories`, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200) {
            this.allCategories = r.data.gkresult;
          } else {
            this.$bvToast.toast('Failed to fetch categories', {
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
    this.getAllCategories();
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
