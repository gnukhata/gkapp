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
            <template #cell(account_name)="data">
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
                Bank
              </h5>
              <b-button-group
                size="sm"
                class="float-right"
                v-if="viewMode === 'details'"
              >
                <b-button
                  :disabled="defaultBank == selectedItem.id || selectedItem.bankstatus == 'Active'"
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
                  :disabled="defaultBank == selectedItem.id"
                >
                  Edit
                </b-button>
              </b-button-group>
            </div>
          </template>
          <template v-if="viewMode === 'details'">
            <dl
              class="row"
              v-if="selectedItem?.account_name"
            >
              <dt class="col-sm-3">
                Account Name
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.account_name }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.account_number"
            >
              <dt class="col-sm-3">
                Account no.
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.account_number }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.bank_name"
            >
              <dt class="col-sm-3">
                Bank Name
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.bank_name }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.branch_name"
            >
              <dt class="col-sm-3">
                Branch Name
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.branch_name }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.ifsc"
            >
              <dt class="col-sm-3">
                IFSC
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.ifsc }}
              </dd>
            </dl>
            <dl
              class="row"
              v-if="selectedItem?.opening_balance"
            >
              <dt class="col-sm-3">
                Opening Balance
              </dt>
              <dd class="col-sm-9">
                {{ selectedItem.opening_balance }}
              </dd>
            </dl>
          </template>
          <template v-else-if="viewMode === 'edit'">
            <b-form @submit.prevent="saveEdit">
              <b-form-group
                label="Account Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Account Name"
                  v-model="form.account_name"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                label="Bank Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Bank Name"
                  v-model="form.bank_name"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                label="Branch Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Branch Name"
                  v-model="form.branch_name"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                v-if="isIndia"
                label="IFSC"
                label-cols-md="4"
                label-class="required"
              >
                <gk-ifsc
                  size="sm"
                  v-model="form.ifsc"
                  :ifsc-code="form.ifsc"
                  @fill="ifscFill"
                />
              </b-form-group>
              <b-form-group
                label="Account no."
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Account number"
                  v-model="form.account_number"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                label-cols-md="4"
                label="Opening Balance"
              >
                <b-form-input
                  v-model="form.opening_balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  size="sm"
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
                label="Account Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Account Name"
                  v-model="form.account_name"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                label="Bank Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Bank Name"
                  v-model="form.bank_name"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                label="Branch Name"
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Branch Name"
                  v-model="form.branch_name"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                v-if="isIndia"
                label="IFSC"
                label-cols-md="4"
                label-class="required"
              >
                <gk-ifsc
                  size="sm"
                  v-model="form.ifsc"
                  @fill="ifscFill"
                />
              </b-form-group>
              <b-form-group
                label="Account no."
                label-cols-md="4"
                label-class="required"
              >
                <b-form-input
                  size="sm"
                  placeholder="Account number"
                  v-model="form.account_number"
                  trim
                  required
                />
              </b-form-group>
              <b-form-group
                label-cols-md="4"
                label="Opening Balance"
              >
                <b-form-input
                  v-model="form.opening_balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  size="sm"
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
 import GkIfsc from '../components/GkIfsc.vue';
 export default {
   name: 'Banks',
   components: { GkIfsc },
   data() {
     return {
       search: "",
       defaultBank: null,
       selectedItem: null,
       viewMode: "details", // "details", "edit", "add"
       isMobile: false,
       showDetail: false,
       currentPage: 1,
       perPage: 12,
       items: [],
       fields: [
         {
           key: 'account_name',
           sortable: true,
         },
       ],
       form: {
         id: null,
         account_name: null,
         bank_name: null,
         branch_name: null,
         contactname: null,
         designation: null,
       },
     };
   },
   computed: {
     filteredItems() {
       return this.items.filter(item => item.account_name.toLowerCase().includes(this.search.toLowerCase()));
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
       delete selectedItems.bankstatus;
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
           .post(`/bank`, this.form)
           .then(() => {
             this.isLoading = false;
             // Create log
             this.$axios.post(
               `/log`,
               {
                 activity: `bank created: ${this.form.account_name}`,
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
     /*
      * Method to fetch banks.
      */
     getItems() {
       this.isLoading = true;
       return this.$axios
                  .get(`/bank`)
                  .then((resp) => {
                    this.items = resp;
                    this.loading = false;
                  })
     },
     /*
      * Update bank details
      */
     saveEdit() {
       this.isLoading = true;
       this.$axios
           .put("/bank", this.form)
           .then(() => {
             this.clearForm();
             this.getItems().then( () => {
               this.selectedItem = this.items.find(item => item.id === this.selectedItem.id);
               console.log(this.selectedItem, this.items);
             });
             // Create log
             this.$axios.post(
               `/log`,
               {
                 activity: `bank updated: ${this.form.account_name}`,
               },
             );
           })
       this.viewMode = "details";
     },
     confirmDelete() {
       this.$bvModal
           .msgBoxConfirm(`Delete bank ${this.selectedItem.account_name} ?`, {
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
      * This method deletes bank. It takes bank id as value
      */
     deleteItem() {
       this.isLoading = true;
       this.$axios
           .delete("/bank", { data: { id: this.selectedItem.id }})
           .then(() => {
             this.$axios.post(
               `/log`,
               {
                 activity: `bank deleted: ${this.selectedItem.account_name}`,
               },
             );
             this.getItems().then( () => {
               this.selectedItem = this.items[0] || null;
             })
           });
     },
     ifscFill(data) {
       this.form = {...this.form, ...{bank_name: data.BANK, branch_name: data.BRANCH}}
     },
   },
   mounted() {
     this.getItems().then( () => {
       this.handleResize();
       window.addEventListener("resize", this.handleResize);
       this.selectedItem = this.items[0] || null;
     })
     this.defaultBank = this.$store.getters['global/getDefaultBank'];
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
