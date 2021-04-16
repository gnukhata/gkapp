<template>
  <section class="m-2">
    <b-form>
      <b-card
        style="max-width: 40em"
        class="mx-auto"
        header="Add Category"
        header-bg-variant="dark"
        header-text-variant="light"
      >
        <b-form-group description="* required" label="Name">
          <b-form-input
            required
            placeholder="Category name"
            type="text"
          ></b-form-input>
        </b-form-group>
        <b-form-group description="* Optional" label="Sub Category Of">
          <b-form-select>
            <b-form-select-option disabled> None</b-form-select-option>
            <b-form-select-option
              v-for="category in allCategories"
              :key="category.srno"
              :value="category.categorycode"
              >{{ category.categoryname }}
            </b-form-select-option>
          </b-form-select>
          <autocomplete></autocomplete>
        </b-form-group>
        <!-- Spec card -->
        <b-table :items="specs" head-variant="dark">
          <template #cell(spec_name)="data">
            <b-form-input
              :title="data"
              type="text"
              placeholder="Name"
            ></b-form-input>
          </template>
          <template #cell(type)="data">
            <b-form-select :title="data">
              <b-form-select-option>Text</b-form-select-option>
              <b-form-select-option value="">Number</b-form-select-option>
              <b-form-select-option>Date</b-form-select-option>
            </b-form-select>
          </template>
          <template #cell(edit)>
            <b-button
              :title="edit"
              variant="dark"
              @click="
                specs.push({ spec_name: 'category', type: 'any', edit: '' })
              "
            >
              +</b-button
            >
          </template>
        </b-table>
        <!-- Tax card -->
        <b-table :items="taxes" head-variant="dark">
          <template #cell(tax_name)="data">
            <b-form-input
              :title="data"
              type="text"
              placeholder="Name"
            ></b-form-input>
          </template>
          <template #cell(type)="data">
            <b-form-select :title="data">
              <b-form-select-option>GST</b-form-select-option>
              <b-form-select-option>CESS</b-form-select-option>
            </b-form-select>
          </template>

          <template #cell(edit)>
            <b-button
              :title="edit"
              variant="dark"
              @click="
                specs.push({ spec_name: 'category', type: 'any', edit: '' })
              "
            >
              +</b-button
            >
          </template>
        </b-table>
      </b-card>
    </b-form>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
export default {
  components: { Autocomplete },
  name: 'AddCategory',
  data() {
    return {
      allCategories: [],
      specs: [{ spec_name: 'category', type: 'any', edit: '' }],
      taxes: [{ tax_name: 'category', type: 'any', edit: '' }],
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
