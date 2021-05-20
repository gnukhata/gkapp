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
        {{ specs }}
        <br />
        {{ taxes }}
        <b-form-group description="* required" label="Name">
          <b-form-input
            required
            placeholder="Category name"
            type="text"
          ></b-form-input>
        </b-form-group>
        <b-form-group description="* Optional" label="Sub Category Of">
          <b-form-select>
            <b-form-select-option
              v-for="category in allCategories"
              :key="category.srno"
              :value="category.categorycode"
              >{{ category.categoryname }} ({{ category.subcount }})
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
        <!-- add tax & spec buttons -->
        <b-button-group size="sm" class="mb-1">
          <b-button
            variant="dark"
            class="mr-1"
            v-if="specs.length < 1"
            @click="specs.push(spec)"
            ><b-icon icon="plus"></b-icon> Add Spec</b-button
          >
          <b-button
            variant="dark"
            v-if="taxes.length < 1"
            @click="taxes.push(tax)"
            ><b-icon icon="plus"></b-icon> Add Tax</b-button
          >
        </b-button-group>
        <!-- Spec table -->
        <b-table class="w-100" :items="specs" head-variant="light">
          <template #cell(spec_name)="data">
            <b-form-input
              v-model="specs[data.index].spec_name"
              type="text"
              placeholder="Name"
              required
            >
            </b-form-input>
          </template>
          <template #cell(type)="data">
            <b-form-select v-model="specs[data.index].type" :options="specType">
            </b-form-select>
          </template>
          <template #cell(edit)="data">
            <b-button-group size="sm">
              <b-button
                title="Add"
                variant="dark"
                class="mr-1"
                @click="specs.push(spec)"
              >
                <b-icon icon="plus"></b-icon
              ></b-button>
              <!-- delete spec -->
              <b-button
                title="delete"
                variant="danger"
                @click="specs.splice(data.index, 1)"
              >
                <b-icon icon="trash"></b-icon>
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <!-- Tax -->
        <b-table class="w-100" :items="taxes" head-variant="light">
          <template #cell(tax_name)="data">
            <b-form-input
              :title="data"
              type="number"
              placeholder="%"
              no-wheel
            ></b-form-input>
          </template>
          <template #cell(type)>
            <b-form-select :options="taxType"> </b-form-select>
          </template>

          <template #cell(edit)="data">
            <b-button-group size="sm">
              <b-button
                title="Add"
                variant="dark"
                class="mr-1"
                @click="taxes.push(tax)"
              >
                <b-icon icon="plus"></b-icon
              ></b-button>
              <!-- delete spec -->
              <b-button
                title="delete"
                variant="danger"
                @click="taxes.splice(data.index, 1)"
              >
                <b-icon icon="trash"></b-icon>
              </b-button>
            </b-button-group>
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
      spec: { type: '', spec_name: '', edit: '' },
      specs: [],
      tax: { type: '', tax_name: '', edit: '' },
      taxes: [],

      specType: [
        { value: 0, text: 'Text' },
        { value: 1, text: 'Number' },
        { value: 2, text: 'Date' },
      ],
      taxType: [
        { value: 0, text: 'GST' },
        { value: 1, text: 'CESS' },
      ],
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
