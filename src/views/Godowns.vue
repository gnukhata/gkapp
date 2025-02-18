<template>
  <section>
    <b-row>
      <!-- List Section -->
      <b-col
        md="4"
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
            <template #cell(goname)="data">
              <div class="p-2">
                <h6>
                  {{ data.value }}
                </h6>
                <div>
                  {{ data.item.state }}
                </div>
              </div>
            </template>
          </b-table>
          <b-pagination
            class="mt-3"
            v-if="items.length > perPage"
            v-model="currentPage"
            :total-rows="items.length"
            :per-page="perPage"
            align="center"
            limit="4"
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
                Godown
              </h5>
              <b-button-group
                size="sm"
                class="float-right"
                v-if="viewMode === 'details'"
              >
                <b-button
                  :disabled="defaultGodown == selectedItem.goid || selectedItem.godownstatus == 'Active'"
                  variant="danger"
                  @click="confirmDelete"
                  v-if="selectedItem"
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
                  :disabled="defaultGodown == selectedItem.goid"
                >
                  Edit
                </b-button>
              </b-button-group>
            </div>
          </template>
          <template v-if="viewMode === 'details'">
            <dl
              class="row"
              v-if="selectedItem?.goname"
            >
              <dt class="col-sm-3">
                Name
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.goname }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.goaddr"
            >
              <dt class="col-sm-3">
                Address
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.goaddr }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.state"
            >
              <dt class="col-sm-3">
                State
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.state }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.contactname"
            >
              <dt class="col-sm-3">
                Contact
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.contactname }}
                <span v-if="selectedItem?.designation"> ({{ selectedItem?.designation }})</span>
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.gocontact"
            >
              <dt class="col-sm-3">
                Contact No.
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.gocontact }}
              </dd>
            </dl>
          </template>
          <template v-else-if="viewMode === 'edit'">
            <b-form @submit.prevent="saveEdit">
              <b-form-group
                label="Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Godown Name"
                  v-model="form.goname"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                v-if="isIndia"
                label="State"
                label-cols-md="4"
                label-class="required"
              >
                <v-select
                  v-model="form.state"
                  :options="options.states"
                  required
                  label="name"
                />
              </b-form-group>
              <b-form-group
                label="Address"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-textarea
                  v-model="form.goaddr"
                  size="sm"
                  rows="2"
                  max-rows="3"
                  required
                />
              </b-form-group>
              <b-form-group
                label="Contact Person"
                label-cols-md="4"
              >
                <b-form-input
                  size="sm"
                  placeholder="Contact Person"
                  v-model="form.contactname"
                  trim
                />
              </b-form-group>
              <b-form-group
                label="Contact Number"
                label-cols-md="4"
                invalid-feedback="Require 10 digit number"
              >
                <b-form-input
                  size="sm"
                  id="go-input-5"
                  type="tel"
                  pattern="^\+?\d{0,13}"
                  no-wheel
                  v-model="form.gocontact"
                />
              </b-form-group>
              <b-button-group size="sm">
                <b-button
                  variant="success"
                  type="submit"
                  class="mr-1"
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
                label="Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Godown Name"
                  v-model="form.goname"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                v-if="isIndia"
                label="State"
                label-cols-md="4"
                label-class="required"
              >
                <v-select
                  v-model="form.state"
                  :options="options.states"
                  required
                  label="name"
                />
              </b-form-group>
              <b-form-group
                label="Address"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-textarea
                  v-model="form.goaddr"
                  size="sm"
                  rows="2"
                  max-rows="3"
                  required
                />
              </b-form-group>
              <b-form-group
                label="Contact Person"
                label-cols-md="4"
              >
                <b-form-input
                  size="sm"
                  placeholder="Contact Person"
                  v-model="form.contactname"
                  trim
                />
              </b-form-group>
              <b-form-group
                label="Contact Number"
                label-cols-md="4"
                invalid-feedback="Require 10 digit number"
              >
                <b-form-input
                  size="sm"
                  id="go-input-5"
                  type="tel"
                  pattern="^\+?\d{0,13}"
                  no-wheel
                  v-model="form.gocontact"
                />
              </b-form-group>
              <b-button-group size="sm">
                <b-button
                  type="submit"
                  class="mr-1"
                  variant="success"
                >
                  Save
                </b-button>
                <b-button
                  @click="viewMode = 'details'"
                  variant="dark"
                >
                  Cancel
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
import { mapGetters, mapState } from 'vuex';
export default {
  name: 'Godowns',
  data() {
    return {
      search: "",
      defaultGodown: null,
      selectedItem: null,
      viewMode: "details", // "details", "edit", "add"
      isMobile: false,
      showDetail: false,
      currentPage: 1,
      perPage: 12,
      items: [],
      options: {
        states: [],
      },
      fields: [
        {
          key: 'goname',
          sortable: true,
        },
      ],
      form: {
        goid: null,
        goname: null,
        goaddr: null,
        state: null,
        gocontact: null,
        contactname: null,
        designation: null,
      },
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => item.goname.toLowerCase().includes(this.search.toLowerCase()));
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredItems.slice(start, start + this.perPage);
    },
    ...mapGetters('global', ['isIndia']),
    ...mapState(['gkCoreUrl', 'authToken', 'yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    showDetails(item) {
      this.selectedItem = item;
      this.viewMode = "details";
      if (this.isMobile) this.showDetail = true;
    },
    clearForm() {
      this.form = {};
    },
    editItem() {
      this.viewMode = "edit";
      let selectedItems = this.selectedItem;
      delete selectedItems.srno;
      delete selectedItems.godownstatus;
      this.form = {...selectedItems};
    },
    showAddForm() {
      this.viewMode = "add";
      if (this.isMobile) this.showDetail = true;
      this.clearForm();
    },
    addItem() {
      this.isLoading = true;
      this.$axios
        .post(`/godown`, this.form)
        .then(() => {
          this.$bvToast.toast(
            `Godown ${this.form.goname} Created Successfully`,
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
              activity: `godown created: ${this.form.goname}`,
            },
          );
          this.$refs.editingForm.reset();
          this.clearForm();
          this.getItems();
          this.viewMode = "details";
        });
    },
    handleResize() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) this.showDetail = false;
    },
    getStates() {
      this.isLoading = true;
      return this.$axios
        .get(`/state`)
        .then((resp) => {
          this.options.states = resp.map((item) => {
            const name = Object.values(item)[0];
            return name;
          });
        });
    },
    /*
     * Method to fetch godowns.
     */
    getItems() {
      this.isLoading = true;
      return this.$axios
        .get(`/godown`)
        .then((resp) => {
          this.items = resp;
          this.loading = false;
        })
    },
    /*
    * Update godown details
    */
    saveEdit() {
      this.isLoading = true;
      this.$axios
        .put("/godown", this.form)
        .then(() => {
          this.$bvToast.toast(
            `${this.form.goname} updated successfully`,
            {
              variant: 'success',
              solid: true,
            }
          );
          this.clearForm();
          this.getItems();
          // Create log
          this.$axios.post(
            `/log`,
            {
              activity: `godown updated: ${this.form.goname}`,
            },
          );
        })
      this.viewMode = "details";
    },
    confirmDelete() {
      this.$bvModal
        .msgBoxConfirm(`Delete godown ${this.selectedItem.goname} ?`, {
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
     * This method deletes godown. It takes goid as value
     */
    deleteItem() {
      this.isLoading = true;
      this.$axios
        .delete("/godown", { data: { goid: this.selectedItem.goid }})
        .then(() => {
          this.$axios.post(
            `/log`,
            {
              activity: `godown deleted: ${this.selectedItem.goname}`,
            },
          );
          this.gk_toast(
            'Success',
            `${this.selectedItem.goname} deleted`,
            'success'
          );
          this.getItems().then( () => {
            this.selectedItem = this.items[0] || null;
          })
        });
    },
  },
  mounted() {
    this.getStates()
    this.getItems().then( () => {
      this.handleResize();
      window.addEventListener("resize", this.handleResize);
      this.selectedItem = this.items[0] || null;
    })
    this.defaultGodown = this.$store.getters['global/getDefaultGodown'];
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
