<template>
  <section class="container-fluid mt-2">
    <b-container fluid v-if="activeWorkflow.index === null">
      <b-card-group deck class="mt-5">
        <b-card
          v-for="(tab, tabName, index) in options.tabs"
          :key="index"
          @click.prevent="setActiveWorkflow(index, tabName, tab.icon)"
          class="text-center"
          footer-text-variant="white"
          footer-tag="footer"
          :footer-bg-variant="tab.color"
          :border-variant="tab.color"
          style="width: 20em"
        >
          <b-card-text>
            <b-icon
              scale="4"
              :variant="tab.color"
              class="mt-4"
              :icon="tab.icon"
            ></b-icon>
          </b-card-text>
          <b-card-text class="mt-4">{{ tabName }}</b-card-text>
        </b-card>
      </b-card-group>
    </b-container>
    <b-row v-else no-gutters>
      <!-- Left Pane: Workflow Selection & Corresponding Data list -->
      <b-col
        cols="12"
        md="4"
        lg="3"
        ref="col-left"
        class="d-none d-md-block d-block"
      >
        <b-card no-body>
          <b-overlay :show="isLoading" blur no-wrap rounded="lg"></b-overlay>
          <!-- Workflow Selection & Filter -->
          <b-card-header class="px-2">
            <!-- Drop down 1: Worflow selection -->
            <b-dropdown :variant="activeWorkflow.color" class="mr-3" dropright>
              <template #button-content>
                <b-icon :icon="activeWorkflow.icon"></b-icon>
                {{ activeWorkflow.name }}
              </template>
              <b-dropdown-item
                v-for="(tab, tabName, index1) in options.tabs"
                :key="index1"
                @click.prevent="setActiveWorkflow(index1, tabName, tab.icon)"
              >
                <b-icon :icon="tab.icon"></b-icon> {{ tabName }}
              </b-dropdown-item>
            </b-dropdown>
            <!-- Drop down 2: Filter -->
            <b-dropdown
              class="float-right"
              variant="link"
              toggle-class="text-decoration-none"
              dropleft
              no-caret
            >
              <template #button-content>
                <b-icon icon="funnel"></b-icon
                ><span class="sr-only">Filter</span>
              </template>
              <b-dropdown-form form-class="px-2">
                <b-form-checkbox
                  v-model="filter.isActive"
                  name="filter-apply-button"
                  switch
                  size="sm"
                >
                  Apply Filters
                </b-form-checkbox>
                <hr />
                <b-form-group
                  label="Type"
                  label-for="filter-form-item"
                  @submit.stop.prevent
                >
                  <b-form-radio-group
                    id="filter-form-item"
                    v-model="filter.props"
                    :options="activeTabOptions.filters"
                    value-field="props"
                    size="sm"
                    stacked
                  ></b-form-radio-group>
                </b-form-group>
              </b-dropdown-form>
            </b-dropdown>
          </b-card-header>
          <!-- Worflow Data List -->
          <div
            v-for="(tab, tabName, index1) in options.tabs"
            :key="index1"
            :class="{ 'd-none': activeWorkflow.index !== index1 }"
          >
            <!-- Sort Bar Start -->
            <b-container>
              <b-row>
                <b-col
                  class="p-1"
                  v-for="(sortby, index4) in tab.sortby"
                  :key="index4"
                >
                  <b-button
                    @click="callSortData(tab.data, sortby.props)"
                    block
                    size="sm"
                    class="py-0 px-1 text-left"
                  >
                    {{ sortby.text }}
                    <span
                      class="float-right"
                      v-if="sort.props.key === sortby.props.key"
                    >
                      <span v-if="sortby.props.isAsc">▲</span>
                      <span v-else>▼</span>
                    </span>
                  </b-button>
                </b-col>
              </b-row>
            </b-container>
            <!-- Sort bar End -->
            <!-- Workflow Data List Start -->
            <b-list-group
              :style="{ height: listHeight + 'px', overflowY: 'auto' }"
            >
              <b-list-group-item
                @click.prevent="setSelectedEntity(item)"
                button
                v-for="(item, index3) in processedData"
                :key="index3"
                class="data-list"
              >
                <div
                  v-if="activeWorkflow.name === 'Transactions'"
                  :class="{
                    'bg-light-yellow': item.rectifyFlag,
                    'bg-light-green': !item.rectifyFlag,
                  }"
                >
                  <b-row>
                    <b-col cols="4" class="px-0">
                      <small>{{ item.invoicedate }}</small>
                    </b-col>
                    <b-col cols="4" class="px-1 text-truncate">
                      <b-icon font-scale="0.75" :icon="item.icon"></b-icon>
                      <small> {{ item[tab.key] }} </small>
                    </b-col>
                    <b-col cols="4" class="px-0 text-truncate text-right">
                      <small>{{ "₹ " + item.invoicetotal }}</small>
                    </b-col>
                  </b-row>
                </div>
                <div v-else>
                  <b-icon :icon="item.icon"></b-icon>
                  {{ item[tab.key] }}
                </div>
              </b-list-group-item>
            </b-list-group>
            <!-- Workflow Data List End -->
            <!-- Add New Workflow Data Item -->
            <b-button
              :to="tab.createNewPath"
              class="btn shadow position-absolute"
              :style="{ bottom: '30px', right: '30px', zIndex: 2 }"
            >
              <b-icon icon="plus-circle"></b-icon>
            </b-button>
          </div>
        </b-card>
      </b-col>
      <!-- Right Pane: Selected Workflow item's Data  -->
      <b-col cols="12" md="8" lg="9" ref="col-right" class="d-none d-md-block">
        <!-- Customer / Supplier profile -->
        <b-card
          no-body
          border-variant="dark"
          :style="{ height: '100%', overflowY: 'auto' }"
          class="ml-md-2 border-0"
          v-if="
            selectedEntity &&
            !selectedEntity.gsflag &&
            activeWorkflow.name === 'Contacts'
          "
        >
          <template #header v-if="selectedEntity !== null">
            <b-button @click.prevent="unsetSelectedEntity" class="d-md-none"
              ><b-icon icon="arrow-left"></b-icon
            ></b-button>
            <h5 class="m-2 d-inline-block">
              <b-icon :icon="selectedEntity.icon"></b-icon>
              {{ selectedEntity.custname }}'s Profile
            </h5>
          </template>
          <b-card-body
            class="p-0"
            style="height: 400px"
            v-if="selectedEntity !== null"
          >
            <contact-profile
              :customer="selectedEntity"
              :key="selectedEntity.custid"
            ></contact-profile>
          </b-card-body>
        </b-card>
        <!-- Goods / Services Profile -->
        <b-card
          no-body
          border-variant="dark"
          :style="{ height: '100%', overflowY: 'auto' }"
          class="ml-md-2 border-0"
          v-if="
            selectedEntity &&
            selectedEntity.gsflag &&
            activeWorkflow.name === 'Business'
          "
        >
          <code class="m-3"> </code>
          <template #header v-if="selectedEntity !== null">
            <b-button @click.prevent="unsetSelectedEntity" class="d-md-none"
              ><b-icon icon="arrow-left"></b-icon
            ></b-button>
            <h5 class="m-2 d-inline-block">
              <b-icon :icon="selectedEntity.icon"></b-icon>
              {{ selectedEntity.productdesc }} Details
            </h5>
          </template>
          <b-card-body
            class="p-0"
            style="height: 400px"
            v-if="selectedEntity !== null"
          >
            <business-profile
              :name="selectedEntity"
              :key="selectedEntity.srno"
            ></business-profile>
          </b-card-body>
        </b-card>
        <!-- Invoices Profile -->
        <b-card
          no-body
          border-variant="dark"
          class="ml-md-3"
          v-if="
            selectedEntity &&
            selectedEntity.invoiceno &&
            activeWorkflow.name === 'Transactions'
          "
        >
          <template #header v-if="selectedEntity !== null">
            <b-button
              @click.prevent="unsetSelectedEntity"
              class="d-md-none"
              size="sm"
              ><b-icon icon="arrow-left"></b-icon
            ></b-button>
            <h5 class="m-2 d-inline-block">
              <b-icon :icon="selectedEntity.icon"></b-icon>
              {{ selectedEntity.csflag === 3 ? "Sale" : "Purchase" }} Invoice :
              {{ selectedEntity.invoiceno }}
            </h5>
          </template>
          <b-card-body
            class="px-0"
            :style="{ height: (listHeight + 26) + 'px', overflowY: 'auto' }"
            v-if="selectedEntity !== null"
          >
            <transaction-profile
              :invid="selectedEntity.invid"
            ></transaction-profile>
          </b-card-body>
        </b-card>
        <!-- Body -->
        <!-- <div :style="{ height: listHeight + 'px', overflowY: 'auto' }"></div> -->
      </b-col>
    </b-row>
  </section>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import ContactProfile from "@/components/ContactProfile";
import BusinessProfile from "@/components/BusinessProfile.vue";
import TransactionProfile from "@/components/TransactionProfile.vue";
// import HeroBar from '@/components/HeroBar'

export default {
  name: "Workflow",
  components: { ContactProfile, BusinessProfile, TransactionProfile },
  data() {
    return {
      tabChoice: 0,
      isLoading: true,
      activeWorkflow: {
        index: null,
        icon: "",
        name: "",
      },
      customerList: [],
      supplierList: [],
      products: [],
      services: [],
      isFullPage: true,
      selectedEntity: null,
      filter: {
        props: {},
        property: {},
        isActive: false,
      },
      sort: {
        props: {},
        isAscending: true,
      },
      options: {
        /**
         * tabs: Contains the meta data based on which the left and right pane are rendered. 
         *       Contains different workflow items, their data list, filter options, sortby options, etc
         * 
         * Explanation for the fields:
         * icon             ->  icon associated with the workflow, used in workflow cards and dropdown
         * color            ->  the color associated with the workflow, used in workflow cards and dropdown
         * data             ->  the list of data associated with the workflow, listed in the left pane
         * createNewPath    ->  the vue router path object for creating a new workflow item
         * filters          ->  array of filter options, can be found by clicking the funnel icon in the left pane
         * sortBy           ->  array of sorting options, can be found in the left pane just above the data list cards
         */
        tabs: {
          Contacts: {
            icon: "person-lines-fill",
            color: "primary",
            data: [],
            key: "custname",
            createNewPath: { name: "Contact_Details", params: { mode: "create" } },
            filters: [
              {
                text: "All", // text -> Display text for this filter
                props: {}, // the properties required to perform the filter
              },
              {
                text: "Customers",
                props: { key: "csflag", value: true },
              },
              {
                text: "Suppliers",
                props: { key: "csflag", value: false },
              },
            ],
            sortby: [
              {
                text: "Name",
                props: { key: "custname", isAsc: true },
              },
            ],
          },
          Business: {
            icon: "box-seam",
            color: "warning",
            data: [],
            key: "productdesc",
            createNewPath: { name: "Business_Details", params: { mode: "create" } },
            filters: [
              {
                text: "All",
                props: {},
              },
              {
                text: "Product",
                props: { key: "gsflag", value: 7 },
              },
              {
                text: "Service",
                props: { key: "gsflag", value: 19 },
              },
            ],
            sortby: [
              {
                text: "Name",
                props: { key: "productdesc", isAsc: true },
              },
            ],
          },
          Transactions: {
            icon: "receipt",
            color: "success",
            data: [],
            key: "custname",
            createNewPath: { name: "Invoice" },
            filters: [
              {
                text: "All",
                props: {},
              },
              {
                text: "Sale",
                props: { key: "csflag", value: 3 },
              },
              {
                text: "Purchase",
                props: { key: "csflag", value: 19 },
              },
            ],
            sortby: [
              {
                text: "Date",
                props: { key: "invoicedate", isAsc: true },
              },
              {
                text: "Name",
                props: { key: "custname", isAsc: true },
              },
              {
                text: "Amount",
                props: { key: "invoicetotal", isAsc: true },
              },
            ],
          },
          Reports: {
            icon: "journals",
            color: "danger",
            data: [],
            filters: [],
            sortby: [],
          },
        },
      },
    };
  },
  computed: {
    activeTabOptions: (self) => self.options.tabs[self.activeWorkflow.name],
    // headerHeight is the height of the top nav bar
    headerHeight: () => document.getElementById("app-header").offsetHeight,
    // listHeight is the height that the left pane data list should be, (Total screen height - (top nav bar height - leftpane top bar height))
    listHeight: (self) => window.innerHeight - (self.headerHeight + 125),
    /**
     * processedData()
     * 
     * Description: When the filter and sort object values are altered,
     * this method runs the filter and sort methods on the data list
     * of the current workflow page, and updates the left pane of cards.
     * 
     */
    processedData: function () {
      let data = this.options.tabs[this.activeWorkflow.name].data;
      if (this.filter.isActive === true) {
        // console.log(this.filter)
        if (this.filter.props.key !== undefined) {
          data = this.showByFilter(
            data,
            this.filter.props.key,
            this.filter.props.value
          );
        }

      }
      if (this.sort.props.key !== undefined) {
        data = this.sortData(
          data,
          this.sort.isAscending,
          this.sort.props.key
        );
      }
      return data;
    },
    ...mapState(["authToken", "gkCoreUrl", "userName"]),
  },
  methods: {
    callSortData(data, props) {
      // this.sort.isActive = true;
      if (this.sort.props.key === props.key) {
        props.isAsc = !props.isAsc;
      }
      this.sort.props.key = props.key;
      this.sort.isAscending = props.isAsc;
    },
    sortData(data, isAscending, sortBy) {
      let sorted = [];
      if (data.length) {
        let isString = isNaN(data[0][sortBy]);
        let min = isAscending ? -1 : 1;
        let max = min === 1 ? -1 : 1;
        if (isString) {
          sorted = data.sort((A, B) => {
            let a = A[sortBy].toLowerCase(),
              b = B[sortBy].toLowerCase();
            if (a < b) {
              return min;
            }
            if (a > b) {
              return max;
            }
            return 0;
          });
        } else {
          sorted = data.sort((A, B) => {
            return max * (A[sortBy] - B[sortBy]);
          });
        }
      }
      return sorted.slice();
    },
    /**
     * showByFilter(data, showBy, value)
     * 
     * Description: This is a visibility filter, that returns an array of data list that match a certain key value
     * 
     * e.g. Display all data items that have (csflag === 19), that is purchase
     */
    showByFilter(data, showBy, value) {
      return data.filter((item) => item[showBy] === value);
    },
    /**
     * setActiveWorkflow(index, name, icon)
     * 
     * Description: As the name suggests it stores the details about the active workflow.
     * Also initializes the filters and sorts, after that.
     */
    setActiveWorkflow(index, name, icon) {
      this.activeWorkflow = {
        index,
        name,
        icon,
        color: this.options.tabs[name].color,
      };

      this.filter = {
        props: {},
        property: {},
        isActive: false,
      };

      //sets the first filter in the filter array, which should be "all" ( used to display every item )
      if (this.activeTabOptions.filters.length) {
        this.filter.props = Object.assign(
          {},
          this.activeTabOptions.filters[0].props
        );
      }

      // sets the first sortby in the sortby array
      if (this.activeTabOptions.sortby.length) {
        this.sort.props = Object.assign(
          {},
          this.activeTabOptions.sortby[0].props
        );
      }
    },
    setSelectedEntity(entity) {
      this.selectedEntity = entity;
      this.$refs["col-left"].classList.remove("d-block");
      this.$refs["col-right"].classList.add("d-block");
    },
    unsetSelectedEntity() {
      this.selectedEntity = null;
      this.$refs["col-left"].classList.add("d-block");
      this.$refs["col-right"].classList.remove("d-block");
    },
    // fetch customers, suppliers, products, services list
    loadList() {
      let config = {
        headers: {
          gktoken: this.authToken,
        },
      };

      // stores the map of invoice id to corresponding invoice array indexes
      // used for quickly updating rectifyflag in invoice data array
      let invoiceMap = {};

      const requests = [
        axios.get("/customersupplier?qty=custall", config).catch((error) => {
          return error;
        }),
        axios.get("/customersupplier?qty=supall", config).catch((error) => {
          return error;
        }),
        axios.get("/products", config).catch((error) => {
          return error;
        }),
        axios.get("/invoice?inv=all", config).catch((error) => {
          return error;
        }),
        // oncredit sale
        axios
          .get("/invoice?type=rectifyinvlist&invtype=15", config)
          .catch((error) => {
            return error;
          }),
        // oncredit purchase
        axios
          .get("/invoice?type=rectifyinvlist&invtype=9", config)
          .catch((error) => {
            return error;
          }),
      ];

      const self = this;
      Promise.all([...requests]).then(
        ([resp1, resp2, resp3, resp4, resp5, resp6]) => {
          self.isLoading = false;

          let contacts = [];

          // Customer List
          if (resp1.status === 200) {
            contacts = resp1.data.gkresult.map((item) =>
              Object.assign({ csflag: true, icon: "person-fill" }, item)
            );
          } else {
            console.log(resp1.message);
          }

          // Supplier List
          if (resp2.status === 200) {
            contacts.push(
              ...resp2.data.gkresult.map((item) =>
                Object.assign({ csflag: false, icon: "briefcase-fill" }, item)
              )
            );
            self.options.tabs["Contacts"].data = self.sortData(
              contacts,
              "asc",
              "custid"
            );
          } else {
            console.log(resp2.message);
          }

          // Products & Services List
          if (resp3.status === 200) {
            self.options.tabs[
              "Business"
            ].data = resp3.data.gkresult.map((item) =>
              Object.assign(
                { icon: item.gsflag === 7 ? "box" : "headset" },
                item
              )
            );
          } else {
            console.log(resp3.message);
          }

          // Invoices
          if (resp4.status === 200) {
            self.options.tabs["Transactions"].data = resp4.data.gkresult.map(
              (item, index) => {
                invoiceMap[item.invid] = index;
                return Object.assign(
                  {
                    icon: item.csflag === 3 ? "cash-stack" : "bag-fill",
                    rectifyFlag: false,
                  },
                  item
                );
              }
            );
          } else {
            console.log(resp4.message);
          }

          // Invoices for OnCredit Sale
          if (resp5.status === 200) {
            if (resp5.data.gkstatus === 0) {
              if (self.options.tabs["Transactions"].data.length) {
                let data = self.options.tabs["Transactions"].data;
                let index = "";
                resp5.data.invoices.forEach((inv) => {
                  index = invoiceMap[inv.invid];
                  data[index].rectifyFlag = true;
                });
              }
            }
          } else {
            console.log(resp5.message);
          }

          // Invoices for OnCredit Purchase
          if (resp6.status === 200) {
            if (resp6.data.gkstatus === 0) {
              if (self.options.tabs["Transactions"].data.length) {
                let data = self.options.tabs["Transactions"].data;
                let index = "";
                resp6.data.invoices.forEach((inv) => {
                  index = invoiceMap[inv.invid];
                  data[index].rectifyFlag = true;
                });
              }
            }
          } else {
            console.log(resp6.message);
          }
        }
      );
    },
    // fetch products & services list
    psList() {
      this.isLoading = true;
      axios
        .get("/products", {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.filterProducts(res.data.gkresult);
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // filter products & services list & store them seperately
    filterProducts(allProducts) {
      for (const i in allProducts) {
        if (allProducts[i].gsflag === 7) {
          this.products.push(allProducts[i]);
        } else {
          this.services.push(allProducts[i]);
        }
      }
    },
  },
  mounted() {
    // this.loadList('custall')
    // this.loadList('supall')
    // this.psList()
    this.loadList();
  },
};
</script>
<style scoped>
.data-list {
  padding: 0;
}
.data-list > div {
  padding: 0.75rem 1.25rem;
}
.bg-light-green {
  background-color: #e3ffe5 !important;
}
.bg-light-yellow {
  background-color: #fff1c6 !important;
}
</style>