<template>
  <section>
    <b-row>
      <!-- List Section -->
      <b-col
        md="3"
        class="mb-4 mb-md-0 pr-md-0"
        v-if="!showDetail"
      >
        <b-card
          no-body
          class="list-card"
        >
          <b-card-header class="d-flex justify-content-between align-items-center px-2 py-3">
            <b-form-input
              v-model="search"
              placeholder="Search..."
              class="w-75"
              size="sm"
            />
            <b-button
              variant="success"
              @click="showAddForm"
              size="sm"
            >
              Add
            </b-button>
          </b-card-header>
          <b-table
            class="text-small print-table-border-dark"
            tbody-tr-class="bs-row"
            responsive=""
            thead-class="d-none"
            selectable
            select-mode="single"
            :per-page="perPage"
            :items="paginatedItems"
            :fields="fields"
            hover
            small
            @row-clicked="showDetails"
          >
            <template #cell(description)="data">
              <div class="px-2">
                <div class="clearfix">
                  <div class="w-75 float-left">
                    <div>
                      {{ data.value }}
                      <b-badge
                        pill
                        variant="secondary"
                        v-if="data.item?.sysunit != 0"
                        class="ml-1"
                      >
                        GST
                      </b-badge>
                    </div>
                  </div>
                  <div class="w-25 float-right text-right">
                    <h6>
                      {{ data.item.unitname }}
                    </h6>
                  </div>
                </div>
                <div
                  v-if="data.item.conversionrate"
                  class="text-muted"
                >
                  (1 {{ data.item.subunitofname }} x {{ data.item.conversionrate }})
                </div>
              </div>
            </template>
          </b-table>
          <b-pagination
            class="mt-3"
            v-model="currentPage"
            :total-rows="items.length"
            :per-page="perPage"
            align="center"
            limit="2"
          />
        </b-card>
      </b-col>

      <!-- Detail Section -->
      <b-col
        md="8"
        v-if="!isMobile || showDetail"
        class="px-md-2"
      >
        <b-card>
          <template #header>
            <div>
              <h5 class="float-left my-1">
                Unit of Measurement
              </h5>
              <b-button-group
                size="sm"
                class="float-right"
                v-if="viewMode === 'details'"
              >
                <b-button
                  variant="danger"
                  @click="confirmDelete"
                  v-if="selectedItem"
                  :disabled="selectedItem?.sysunit != 0"
                >
                  Delete
                </b-button>
                <b-button
                  variant="dark"
                  @click="showDetail = false"
                  class="ml-1"
                  v-if="isMobile"
                >
                  Back
                </b-button>
                <b-button
                  variant="dark"
                  @click="editItem"
                  class="ml-1"
                  v-if="selectedItem"
                  :disabled="selectedItem?.sysunit != 0"
                >
                  Edit
                </b-button>
              </b-button-group>
            </div>
          </template>
          <template v-if="viewMode === 'details'">
            <dl
              class="row"
              v-if="selectedItem?.unitname"
            >
              <dt class="col-sm-3">
                Name
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.unitname }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.description"
            >
              <dt class="col-sm-3">
                Description
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.description }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.subunitof"
            >
              <dt class="col-sm-3">
                Sub-unit of
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.subunitofname }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.conversionrate"
            >
              <dt class="col-sm-3">
                Conversion Rate
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.conversionrate }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.uqcname"
            >
              <dt class="col-sm-3">
                UQC
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.uqcname }}
              </dd>
            </dl>
          </template>

          <template v-else-if="viewMode === 'edit'">
            <b-form @submit.prevent="saveEdit">
              <b-form-group
                :label="$gettext('Name')"
                label-align="left"
                label-cols-md="4"
                label-class="required"
                tooltip
              >
                <b-form-input
                  v-model="form.unitname"
                  type="text"
                  required
                  size="sm"
                />
              </b-form-group>
              <b-form-group
                label-align="left"
                label-cols-md="4"
                :label="$gettext('Description')"
                label-class="required"
                tooltip
              >
                <b-form-input
                  v-model="form.description"
                  type="text"
                  required
                  size="sm"
                />
              </b-form-group>
              <b-form-group
                label-align="left"
                label-cols-md="4"
                label-class="required"
                :label="$gettext('UQC')"
              >
                <v-select
                  v-model="form.uqc"
                  :options="options.uqc"
                  :reduce="(uqc) => uqc.value"
                  :placeholder="$gettext('Select UQC')"
                  size="sm"
                >
                  <template #search="{attributes, events}">
                    <input
                      class="vs__search"
                      :required="!form.uqc"
                      v-bind="attributes"
                      v-on="events"
                    >
                  </template>
                </v-select>
              </b-form-group>
              <b-form-group
                label-align="left"
                label-cols-md="4"
                :label="$gettext('Sub Unit of')"
                description="optional"
              >
                <v-select
                  v-model="form.subunitof"
                  :options="options.uom"
                  :reduce="(uom) => uom.value"
                  :placeholder="$gettext('Select Parent Unit')"
                  @input="updateConversionRate(form.subunitof)"
                  size="sm"
                />
              </b-form-group>
              <b-form-group
                :label="$gettext('Conversion Rate')"
                label-align="left"
                label-cols-md="4"
              >
                <b-form-input
                  v-model="form.conversionrate"
                  type="number"
                  no-wheel
                  placeholder="0.00"
                  step="0.01"
                  size="sm"
                  :required="Boolean(form?.subunitof)"
                />
              </b-form-group>
              <b-button-group
                size="sm"
              >
                <b-button
                  type="submit"
                  class="mr-1"
                  variant="success"
                >
                  Save
                </b-button>
                <b-button
                  variant="dark"
                  @click="viewMode = 'details'"
                >
                  Cancel
                </b-button>
              </b-button-group>
            </b-form>
          </template>

          <template v-else-if="viewMode === 'add'">
            <b-form
              ref="editingForm"
              @submit.prevent="addItem"
            >
              <b-form-group
                :label="$gettext('Name')"
                label-align="left"
                label-cols-md="4"
                label-class="required"
                tooltip
              >
                <b-form-input
                  v-model="form.unitname"
                  type="text"
                  size="sm"
                  required
                />
              </b-form-group>
              <b-form-group
                label-align="left"
                label-cols-md="4"
                :label="$gettext('Description')"
                label-class="required"
                tooltip
              >
                <b-form-input
                  v-model="form.description"
                  type="text"
                  size="sm"
                  required
                />
              </b-form-group>
              <b-form-group
                label-align="left"
                label-cols-md="4"
                :label="$gettext('UQC')"
                label-class="required"
              >
                <v-select
                  v-model="form.uqc"
                  :options="options.uqc"
                  :reduce="(uqc) => uqc.value"
                  :placeholder="$gettext('Select UQC')"
                  size="sm"
                >
                  <template #search="{attributes, events}">
                    <input
                      class="vs__search"
                      :required="!form.uqc"
                      v-bind="attributes"
                      v-on="events"
                    >
                  </template>
                </v-select>
              </b-form-group>
              <b-form-group
                label-align="left"
                label-cols-md="4"
                :label="$gettext('Sub Unit Of')"
                description="*optional"
              >
                <v-select
                  v-model="form.subunitof"
                  :options="options.uom"
                  :reduce="(uom) => uom.value"
                  :placeholder="$gettext('Select Parent Unit')"
                  size="sm"
                />
              </b-form-group>
              <b-form-group
                label-align="left"
                label-cols-md="4"
                :label="$gettext('Conversion Rate')"
                v-if="form.subunitof"
              >
                <b-form-input
                  v-model="form.conversionrate"
                  type="number"
                  required
                  step="0.01"
                  placeholder="0.00"
                  size="sm"
                />
              </b-form-group>
              <b-button-group
                size="sm"
              >
                <b-button
                  type="submit"
                  variant="success"
                >
                  Save
                </b-button>
              </b-button-group>
            </b-form>
          </template>
        </b-card>
      </b-col>
    </b-row>
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'UOM',
  data() {
    return {
      search: "",
      selectedItem: null,
      viewMode: "details", // "details", "edit", "add"
      isMobile: false,
      showDetail: false,
      currentPage: 1,
      perPage: 18,
      uomType: {}, // uom name to systemunit flag map
      items: [],
      options: {
        uom: [],
        uqc: [],
      },
      fields: [
        {
          key: 'description',
          sortable: true,
        },
      ],
      form: {
        unitname: null,
        description: null,
        subunitof: null,
        uomid: null,
        conversionrate: null,
        uqc: null,
      },
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => item.unitname.toLowerCase().includes(this.search.toLowerCase()));
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredItems.slice(start, start + this.perPage);
    },
    ...mapState(['authToken', 'gkCoreUrl']),
  },
  methods: {
    showDetails(item) {
      this.selectedItem = item;
      this.viewMode = "details";
      if (this.isMobile) this.showDetail = true;
    },
    updateConversionRate(val) {
      if (!val) {
        this.form.conversionrate = null;
      }
    },
    clearForm() {
      this.form = {};
    },
    editItem() {
      this.viewMode = "edit";
      this.form = this.selectedItem;
    },
    showAddForm() {
      this.viewMode = "add";
      if (this.isMobile) this.showDetail = true;
      this.clearForm();
    },
    addItem() {
      this.isLoading = true;
      this.$axios
        .post(`/unitofmeasurement`, this.form)
        .then(() => {
          this.$bvToast.toast(
            `UOM ${this.form.unitname} Created Successfully`,
            {
              variant: 'success',
              solid: true,
            }
          );
          this.isLoading = false;
          // Create log
          this.$axios.post(
            `/log`,
            {
              activity: `uom created: ${this.form.unitname}`,
            },
          );
          this.$refs.editingForm.reset();
          this.clearForm();
          this.getUOM();
          this.viewMode = "details";
        });
    },
    handleResize() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) this.showDetail = false;
    },
    /*
     * Get the list of units from the server & assign it to uomList.
     */
    getUOM() {
      this.isLoading = true;
      return this.$axios
        .get(`/unitofmeasurement`)
        .then((resp) => {
          let uomList = [],
              uqcList = [];
          resp.forEach((data) => {
            let obj = {
              label: `${data.unitname} - ${data.description}`,
              value: data.uomid,
            };
            uomList.push(obj);
            if (data.sysunit === 1) {
              uqcList.push(obj);
            }
          });
          this.options.uom = uomList;
          this.options.uqc = uqcList;
          let uomMap = {};
          resp.forEach((uom) => {
            uomMap[uom.uomid] = uom.unitname;
            this.uomType[uom.unitname] = uom.sysunit;
          });
          this.items = resp.map((data) => {
            return {
              unitname: data.unitname,
              description: data.description,
              uomid: data.uomid,
              subunitof: data.subunitof,
              subunitofname: uomMap[data.subunitof],
              uqc: data.uqc,
              uqcname: data.sysunit ? data.unitname : uomMap[data.uqc],
              sysunit: data.sysunit,
              conversionrate: data.conversionrate,
            };
          });
          this.isLoading = false;
        })
    },

    /* As per Indian GST laws, A custom unit should be mapped to a officially valid unit */
    subUnitStatus(item) {
      if (item.sysunit === 1) {
        return 'success';
      }
      return 'warning';
    },
    showEditUOM(id) {
      this.selectedUomId = id;
      this.$bvModal.show('edit-uom');
    },
    /*
     * Update UOM details
     */
    saveEdit() {
      this.isLoading = true;
      this.$axios
        .put("/unitofmeasurement", this.form)
        .then(() => {
          this.$bvToast.toast(
            `${this.form.unitname} updated successfully`,
            {
              variant: 'success',
              solid: true,
            }
          );
          this.clearForm();
          this.getUOM();
          // Create log
          this.$axios.post(
            `/log`,
            {
              activity: `uom updated: ${this.form.unitname}`,
            },
          );
        })
      this.viewMode = "details";
    },
    confirmDelete() {
      this.$bvModal
        .msgBoxConfirm(`Delete unit ${this.selectedItem.unitname} ?`, {
          centered: true,
          size: 'sm',
          buttonSize: "sm",
          okVariant: 'danger',
          okTitle: 'Delete',
          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        .then((resp) => {
          if (resp) {
            this.deleteItem();
          }
        });
    },
    /*
     * This method deletes UOM. It takes uomid as value
     */
    deleteItem() {
      this.isLoading = true;
      this.$axios
        .delete("/unitofmeasurement", { data: { uomid: this.selectedItem.uomid }})
        .then(() => {
          this.gk_toast(
            'Success',
            `${this.selectedItem.unitname} deleted`,
            'success'
          );
          this.$axios.post(
            `/log`,
            {
              activity: `uom deleted: ${this.selectedItem.unitname}`,
            },
          );
          this.getUOM().then(() => {
            this.selectedItem = this.items[0] || null;
          });
          this.isLoading = false;
        });
    },
  },
  mounted() {
    this.getUOM().then( () => {
      this.handleResize();
      window.addEventListener("resize", this.handleResize);
      this.selectedItem = this.items[0] || null;
    })
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style scoped>
.list-card {
  position: relative;
}
@media all and (max-width: 600px) {
  table {
    width: 100%;
  }
}
</style>
