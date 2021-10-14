<template>
  <section class="container-fluid mt-2">
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-container fluid v-if="activeWorkflow.index === null">
      <b-card-group role="tab" deck class="mt-5">
        <b-card
          tabindex="0"
          v-for="(tab, tabName, index) in options.tabs"
          v-on:keyup.enter="setActiveWorkflow(index, tabName, tab.icon)"
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
          <b-card-header ref="leftHeader" class="px-2">
            <!-- Drop down 1: Worflow selection -->
            <b-dropdown
              :variant="activeWorkflow.color"
              class="mr-3"
              dropright
              @hide="onDropdownHide"
              id="main-menu"
              ref="mainMenu"
            >
              <template #button-content>
                <div
                  class="d-inline-block text-truncate float-left mr-1"
                  style="max-width: 150px"
                >
                  <b-icon :icon="activeWorkflow.icon"></b-icon>
                  {{
                    activeWorkflow.name.includes('-')
                      ? activeWorkflow.tabName
                      : activeWorkflow.name
                  }}
                </div>
              </template>
              <b-dropdown-item
                v-for="(tab, tabName, index1) in options.tabs"
                :key="index1"
                @click.prevent="setActiveWorkflow(index1, tabName, tab.icon)"
                :link-class="{ 'p-0': tab.tabs }"
              >
                <!-- Option with Sub Menu -->
                <b-dropdown
                  v-if="tab.tabs"
                  id="sub-menu"
                  @show="onDropdownShow"
                  @hide="onDropdownHide"
                  variant="outline"
                  :toggle-class="['border-0', 'p-0']"
                  style="width: 100%"
                  class=""
                  dropleft
                  no-flip
                >
                  <template #button-content>
                    <b-icon :icon="tab.icon"></b-icon> {{ tabName }}
                  </template>
                  <b-dropdown-item
                    v-for="(tab2, tabName2, index2) in tab.tabs"
                    :key="index2"
                    @click.prevent="
                      setActiveWorkflow(
                        index2,
                        { parent: tabName, child: tabName2 },
                        tab2.icon
                      )
                    "
                  >
                    <b-icon :icon="tab2.icon"></b-icon> {{ tabName2 }}
                  </b-dropdown-item>
                </b-dropdown>
                <!-- Option without Sub Menu -->
                <span v-else>
                  <b-icon :icon="tab.icon"></b-icon> {{ tabName }}
                </span>
              </b-dropdown-item>
            </b-dropdown>
            <!-- Drop down 2: Filter -->
            <b-button
              class="float-right px-1"
              variant="link"
              @click="isSettingsOpen = !isSettingsOpen"
            >
              <b-icon class="align-middle" font-scale="0.9" icon="gear"></b-icon
              ><span class="sr-only">Filter</span>
            </b-button>
            <print-helper
              class="float-right px-0"
              :style="{ 'font-size': '0.75rem' }"
              :contentId="`list-${activeWorkflow.tabName}`"
              variant="link"
            ></print-helper>
            <b-button
              class="float-right px-1"
              variant="link"
              @click="isFilterOpen = !isFilterOpen"
            >
              <b-icon class="align-middle" font-scale="0.9" icon="funnel"></b-icon
              ><span class="sr-only">Filter</span>
            </b-button>
            <!-- Table Column Chooser -->
            <b-collapse v-model="isSettingsOpen">
              <b-card
                no-body
                class="float-right w-100 mt-2"
                :style="{
                  'max-width': '450px',
                }"
                id="list-settings"
              >
                <b-card-body class="p-2">
                  <b>List Settings</b>
                  <hr class="mx-0 my-1" />
                  <div class="container">
                    <b-row>
                      <b-col class="px-1">
                        <autocomplete
                          v-model="listSettings.columns[0]"
                          :options="activeTabOptions.options.columns"
                          placeholder="Column 1"
                          textField="label"
                        >
                        </autocomplete>
                      </b-col>
                      <b-col class="px-0">
                        <autocomplete
                          v-model="listSettings.columns[1]"
                          :options="activeTabOptions.options.columns"
                          placeholder="Column 2"
                          textField="label"
                        >
                        </autocomplete>
                      </b-col>
                      <b-col class="px-1">
                        <autocomplete
                          v-model="listSettings.columns[2]"
                          :options="activeTabOptions.options.columns"
                          placeholder="Column 3"
                          textField="label"
                        >
                        </autocomplete>
                      </b-col>
                    </b-row>
                  </div>
                  <b-button
                    class="float-right px-1 mt-2"
                    size="sm"
                    variant="success"
                    @click.prevent="updateListSettings"
                    >Save</b-button
                  >
                </b-card-body>
              </b-card>
            </b-collapse>
            <!-- Filter menu Collapsable card -->
            <b-collapse v-model="isFilterOpen">
              <b-card
                no-body
                class="float-right w-100 mt-2"
                :style="{
                  'max-width': '450px',
                }"
                id="list-filter"
              >
                <b-card-body class="p-2">
                  <b>Filter By</b>
                  <hr class="mx-0 my-1" />
                  <div class="my-2 ml-1">
                    <b-form-checkbox-group
                      id="checkbox-group-2"
                      v-model="filters.active"
                      name="flavour-2"
                    >
                      <b-form-checkbox
                        v-for="(filter, findex) in activeTabOptions.filterBy
                          .value"
                        :key="findex"
                        :value="findex"
                      >
                        <b-icon
                          v-if="filter.icon"
                          font-scale="0.75"
                          :variant="
                            filter.icon.variant ? filter.icon.variant : ''
                          "
                          :icon="filter.icon.name"
                          class="mr-1"
                        ></b-icon>
                        {{ filter.text }}
                      </b-form-checkbox>
                    </b-form-checkbox-group>
                    <b-button
                      @click="resetFilter"
                      title="Reset Filter"
                      class="py-0 px-1"
                      size="sm"
                      variant="primary"
                    >
                      <b-icon icon="arrow-clockwise"></b-icon>
                    </b-button>
                  </div>
                  <b-form-group
                    label="Date Range"
                    label-size="sm"
                    v-if="activeTabOptions.filterBy.range.length"
                  >
                    <div class="px-3">
                      <b-row>
                        <b-col class="px-1">
                          <b-input-group>
                            <b-form-input
                              class="px-1"
                              size="sm"
                              v-model="filters.range.from"
                              type="text"
                              placeholder="YYYY-MM-DD"
                              autocomplete="off"
                            ></b-form-input>
                            <b-input-group-append>
                              <b-form-datepicker
                                button-only
                                v-model="filters.range.from"
                                size="sm"
                                right
                                :min="yearStart"
                                :max="yearEnd"
                                locale="en-IN"
                              ></b-form-datepicker>
                            </b-input-group-append>
                          </b-input-group>
                        </b-col>
                        <b-col class="px-1">
                          <b-input-group>
                            <b-form-input
                              class="px-1"
                              size="sm"
                              v-model="filters.range.to"
                              type="text"
                              placeholder="YYYY-MM-DD"
                              autocomplete="off"
                            ></b-form-input>
                            <b-input-group-append>
                              <b-form-datepicker
                                button-only
                                v-model="filters.range.to"
                                size="sm"
                                right
                                :min="filters.range.from"
                                :max="yearEnd"
                                locale="en-IN"
                              ></b-form-datepicker>
                            </b-input-group-append>
                          </b-input-group>
                        </b-col>
                      </b-row>
                    </div>
                  </b-form-group>
                </b-card-body>
              </b-card>
            </b-collapse>
          </b-card-header>
          <!-- Worflow Data List -->

          <!-- Workflow Data List Start -->
          <div
            v-for="(tab, tabName) in allTabs"
            :key="tabName"
            :class="{ 'd-none': activeWorkflow.tabName !== tabName }"
          >
            <b-table
              striped
              small
              head-variant="dark"
              class="text-small print-table-border-dark"
              tbody-tr-class="bs-row"
              responsive=""
              fixed
              :sticky-header="`${listHeight}px`"
              :fields="activeTabOptions.fields"
              :items="activeTabOptions.data"
              :style="{ 'min-height': `${listHeight}px` }"
              selectable
              select-mode="single"
              @row-selected="setSelectedEntity"
              :ref="`list-${tabName}`"
              :id="`list-${tabName}`"
              :filter="
                activeTabOptions.data.length &&
                activeWorkflow.tabName === tabName
                  ? 'a'
                  : null
              "
              :filter-function="filterTable"
              sort-by="dateObj"
              :sort-desc="true"
            >
              <template #cell(dateObj)="data"> {{ data.item.date }} </template>
            </b-table>

            <!-- Add New Workflow Data Item -->
            <b-button
              :to="tab.createNewPath"
              class="btn shadow position-absolute"
              :style="{ bottom: '30px', right: '30px', zIndex: 2 }"
              id="add-item"
            >
              <b-icon icon="plus-circle"></b-icon>
            </b-button>
          </div>
          <!-- Workflow Data List End -->
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
          class="ml-md-2"
          v-if="
            selectedEntity &&
              selectedEntity.id &&
              activeWorkflow.name.includes('Transactions')
          "
          header-class="p-2 d-flex align-items-center justify-content-between"
        >
          <template #header v-if="selectedEntity !== null">
            <b-button
              @click.prevent="unsetSelectedEntity"
              class="d-md-none float-left"
              size="sm"
              ><b-icon icon="arrow-left"></b-icon
            ></b-button>
            <h5 class="ml-3 mb-0">
              <b-icon :icon="selectedEntity.icon"></b-icon>
              {{ selectedEntity.noteName }} :
              <br class="d-none d-lg-inline-block" />
              {{ selectedEntity.no }}
            </h5>
            <print-helper
              contentId="transaction-profile-wrapper"
              variant="link"
            ></print-helper>
          </template>
          <b-card-body
            class="px-0"
            :style="{ height: rightPaneHeight + 'px', overflowY: 'auto' }"
            v-if="selectedEntity !== null"
          >
            <div id="transaction-profile-wrapper">
              <report-header class="mb-4"> </report-header>
              <transaction-profile
                :name="activeWorkflow.tabName"
                :id="selectedEntity.id"
                :pdata="profileData"
                :onUpdate="onSelectedEntityUpdate"
              >
              </transaction-profile>
            </div>
          </b-card-body>
        </b-card>
        <!-- Body -->
        <!-- <div :style="{ height: listHeight + 'px', overflowY: 'auto' }"></div> -->
      </b-col>
    </b-row>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

import ContactConf from '../js/config/workflow/contacts.js';
import BusinessConf from '../js/config/workflow/business.js';
import TransactionConf from '../js/config/workflow/transactions.js';

import ContactProfile from '@/components/ContactProfile';
import BusinessProfile from '@/components/BusinessProfile.vue';
import TransactionProfile from '@/components/workflow/profile/Transaction.vue';
import ReportHeader from '@/components/ReportHeader.vue';
import PrintHelper from '@/components/PrintHelper.vue';

import Autocomplete from '../components/Autocomplete.vue';

export default {
  name: 'Workflow',
  components: {
    ContactProfile,
    BusinessProfile,
    TransactionProfile,
    ReportHeader,
    PrintHelper,
    Autocomplete,
  },
  props: {
    wfName: {
      type: String,
      validator: function(value) {
        return (
          [
            'Contacts',
            'Business',
            'Reports',
            'Transactions-Invoice',
            'Transactions-DebitCreditNote',
            'Transactions-CashMemo',
            'Transactions-DeliveryNote',
            'Transactions-PurchaseSalesOrder',
            'Transactions-RejectionNote',
            'Transactions-TransferNote',
            'Transactions-Voucher',
          ].indexOf(value) !== -1
        );
      },
      required: true,
    },
    wfId: {
      type: [Number, String],
      required: true,
      default: null,
    },
  },
  data() {
    return {
      leftHeaderHeight: {
        min: 63,
        max: 0,
      },
      listHeight: 0,
      tabChoice: 0,
      isPreloading: false,
      isLoading: false,
      isSubMenuOpen: false,
      activeWorkflow: {
        index: null,
        icon: '',
        name: '',
      },
      customerList: [],
      supplierList: [],
      products: [],
      services: [],
      isPageFresh: true,
      isFilterOpen: false,
      isSettingsOpen: false,
      listSettings: {
        columns: [null, null, null],
      },
      selectedEntity: null,
      selectedEntityIndex: 0,
      filters: {
        active: [],
        range: {
          props: {},
          from: null,
          to: null,
        },
        isActive: false,
      },
      sort: {
        props: {},
        isAscending: true,
      },
      options: {
        /**
         * tabs: Contains the meta data based on which the left and right pane are rendered.
         *       Contains different workflow items, their data list, filter options, sortBy options, etc
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
          Contacts: ContactConf,
          Business: BusinessConf,
          Transactions: TransactionConf,
        }, // Reports: {
        //   icon: 'journals',
        //   color: 'danger',
        //   data: [],
        //   key: '',
        //   uidKey: '',
        //   filterBy: {
        //     value: [],
        //     range: [],
        //   },
        //   fields: [],
        //   initListColumns: () => {},
        //   loadList: async () => {
        //     return new Promise((resolve) => {
        //       resolve();
        //     }).then(() => {
        //       return [];
        //     });
        //   },
        // },
      },
    };
  },
  watch: {
    wfName: function(wfname) {
      // Run when visiting a workflow page using URL, when already in a workflow page
      if (this.activeWorkflow.name !== wfname) {
        this.autoSetActiveWorkflow();
      }
    },
    isFilterOpen: function(isOpen) {
      let self = this;
      window.setTimeout(() => {
        if (isOpen) {
          if (self.leftHeaderHeight.max === 0) {
            self.leftHeaderHeight.max = self.$refs.leftHeader.offsetHeight;
          }
        } else {
          self.leftHeaderHeight.max = 0;
        }
        // this.updateListHeight();
      }, 650);
    },
  },
  computed: {
    // data required by the transaction profile page
    profileData: (self) => {
      let data = {};
      let entity = self.selectedEntity;
      switch (self.activeWorkflow.tabName) {
        case 'Invoice':
          data = {
            onCreditFlag: entity.onCreditFlag,
            rectifyFlag: entity.rectifyFlag,
            cancelFlag: !!entity.cancelflag,
            deletedFlag: entity.deletedFlag,
          };
          break;
        case 'CashMemo':
          break;
        case 'DebitCreditNote':
          break;
        case 'DeliveryNote':
          break;
        case 'PurchaseSalesOrder':
          break;
        case 'RejectionNote':
          break;
        case 'Voucher':
          data = self.selectedEntity;
          break;
      }
      return data;
    },
    allTabs: (self) => {
      let tabs = {};
      const transactionTabs = self.options.tabs['Transactions'].tabs;
      for (let tab in self.options.tabs) {
        tabs[tab] = self.options.tabs[tab];
      }
      for (let tab2 in transactionTabs) {
        tabs[tab2] = transactionTabs[tab2];
      }
      return tabs;
    },
    activeTabOptions: (self) => {
      // debugger;
      if (self.activeWorkflow.name.includes('-')) {
        const name = self.activeWorkflow.name.split('-');
        return self.options.tabs[name[0]].tabs[name[1]];
      }
      return self.options.tabs[self.activeWorkflow.name];
    },
    // headerHeight is the height of the top nav bar
    headerHeight: () => document.getElementById('app-header').offsetHeight,

    rightPaneHeight: (self) =>
      window.innerHeight - (self.headerHeight + self.leftHeaderHeight.min + 41), // 41 is the remaining vertical space in the screen

    ...mapState(['yearStart', 'yearEnd', 'orgCode']),
  },
  methods: {
    /**
     * updateListSettings
     *
     * Description: Updates the left pane column config to localhost for persistence
     */
    updateListSettings() {
      // debugger;
      let colMap = this.activeTabOptions.options.columnMap;
      let sortBy = this.listSettings.columns
        .filter((column) => {
          return column;
        })
        .map((column) => {
          return colMap[column];
        });
      if (sortBy.length) {
        // this.activeTabOptions.sortBy = sortBy;
        this.activeTabOptions.setListColumns(sortBy).then((resp) => {
          if (resp.gkstatus === 0) {
            this.$bvToast.toast('Update column config success!', {
              variant: 'success',
              solid: true,
            });
          } else {
            this.$bvToast.toast('Update column config failure!', {
              variant: 'danger',
              solid: true,
            });
          }
        });
      }
    },
    updateListHeight() {
      // listHeight is the height that the left pane data list should be, (Total screen height - (top nav bar height - leftpane top bar height))
      this.listHeight =
        window.innerHeight -
        (this.headerHeight +
          70 +
          (this.isFilterOpen
            ? this.leftHeaderHeight.max
            : this.leftHeaderHeight.min)); // 70 is the sum of sortable heading height + remaining vertical space in the screen
    },
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
      return sorted;
    },
    resetFilter() {
      this.filters = {
        active: [],
        range: {
          props: {},
          from: this.yearStart,
          to: this.yearEnd,
        },
        isActive: false,
      };

      //sets the first filter in the filter array, which should be "all" ( used to display every item )
      if (this.activeTabOptions.filterBy.value.length) {
        this.filters.active = [0];
      }

      // sets the first sortBy in the sortBy array
      // if (this.activeTabOptions.sortBy.length) {
      //   this.sort.props = Object.assign(
      //     {},
      //     this.activeTabOptions.sortBy[0].props
      //   );
      // }

      // if (this.activeTabOptions.filterBy.range.length) {
      //   this.filter.range.props = Object.assign(
      //     {},
      //     this.activeTabOptions.filterBy.range[0].props
      //   );
      // }
    },
    filterByValue(data, filters) {
      return filters.reduce(
        (acc, filter) =>
          filter ? acc || data[filter.key] === filter.value : true,
        false
      );
    },
    filterByRange(data, key, from, to) {
      return data[key] >= from && data[key] <= to;
    },
    filterTable(row) {
      let result;
      // console.log(this.filter)
      const self = this;
      if (this.filters.active.length) {
        let filters = this.filters.active.map((filterIndex) =>
          filterIndex >= 0
            ? self.activeTabOptions.filterBy.value[filterIndex].props || null
            : null
        );
        result = this.filterByValue(row, filters);
      }

      if (this.filters.range.props.key !== undefined) {
        // console.log("date filter")
        // console.log(this.filter.range.from);
        // console.log(this.filter.range.to);
        result =
          result &&
          this.filterByRange(
            row,
            this.filters.range.props.key,
            Date.parse(this.filters.range.from), // converting date "yyyy-mm-dd" into a format that can be compared with logical operators
            Date.parse(this.filters.range.to)
          );
      }
      // if (this.sort.props.key !== undefined) {
      //   data = this.sortData(data, this.sort.isAscending, this.sort.props.key);
      // }
      return result;
    },
    /**
     * setActiveWorkflow(index, name, icon)
     *
     * Description: As the name suggests it stores the details about the active workflow.
     * Also initializes the filters and sorts, after that.
     */
    setActiveWorkflow(index, name, icon, skipUpdate) {
      let color, tabName;
      let activeWorkflow = name.parent
        ? this.options.tabs[name.parent].tabs[name.child]
        : this.options.tabs[name];
      if (name.parent && name.child) {
        tabName = name.child;
        color = this.options.tabs[name.parent].tabs[name.child].color;
        name = `${name.parent}-${name.child}`;
      } else {
        if (name === 'Transactions') {
          return;
        }
        color = this.options.tabs[name].color;
        tabName = name;
      }
      this.activeWorkflow = {
        index,
        name,
        icon,
        color: color,
        tabName,
      };
      this.isFilterOpen = false;
      this.leftHeaderHeight.max = 0;
      this.resetFilter();
      this.unsetSelectedEntity();
      if (!skipUpdate) {
        this.updateUrl();
      }
      const self = this;
      if (!activeWorkflow.data.length) {
        this.isLoading = true;
        activeWorkflow.initListColumns(this.orgCode);
        this.$nextTick(() => {
          self.listSettings.columns = activeWorkflow.fields.map((col) => {
            return col.key;
          });
        });
        return activeWorkflow
          .loadList(this.yearStart, this.yearEnd)
          .then((resp) => {
            activeWorkflow.data = resp;
            self.isLoading = false;
            // select first item only if wfId = -1, i.e. nothing is selected
            if (parseInt(self.wfId) > -1) {
              this.selectFirstListItem();
            }
            return true;
          })
          .catch((e) => {
            console.log(e.message);
            self.isLoading = false;
          });
      } else {
        // select first item only if wfId = -1, i.e. nothing is selected
        if (parseInt(self.wfId) > -1) {
          this.selectFirstListItem();
        }
      }
    },
    /** Sets the active workflow based on the URL props */
    autoSetActiveWorkflow() {
      let self = this;
      let tab, index;
      let setActiveWorkflow;
      if (this.wfName.includes('-')) {
        let name = this.wfName.split('-');
        tab = this.options.tabs[name[0]].tabs[name[1]];
        index = Object.keys(this.options.tabs[name[0]]).indexOf(name[1]);
        setActiveWorkflow = this.setActiveWorkflow(
          index,
          { parent: name[0], child: name[1] },
          tab.icon,
          true
        );
      } else {
        tab = this.options.tabs[this.wfName];
        index = Object.keys(this.options.tabs).indexOf(this.wfName);
        setActiveWorkflow = this.setActiveWorkflow(
          index,
          this.wfName,
          tab.icon,
          true
        );
      }
      if (window.innerWidth > 752) {
        if (setActiveWorkflow) {
          setActiveWorkflow.then(() => {
            self.initSelectedEntity(tab);
          });
        } else {
          this.initSelectedEntity(tab);
        }
      }
    },
    selectFirstListItem() {
      if (window.innerWidth > 752) {
        const self = this;
        this.$forceUpdate();
        this.$nextTick().then(() => {
          if (self.$refs[`list-${self.activeWorkflow.tabName}`]) {
            self.$refs[`list-${self.activeWorkflow.tabName}`][0].selectRow(0);
          }
        });
      }
    },
    setSelectedEntity(entity) {
      // remove selected class from the last selected item
      // if (selectedDom) selectedDom.classList.remove('selected-data-list');

      if (!entity[0]) return;

      this.selectedEntity = entity[0];
      if (this.$refs['col-left'])
        this.$refs['col-left'].classList.remove('d-block');
      if (this.$refs['col-right'])
        this.$refs['col-right'].classList.add('d-block');
      if (!this.isPageFresh) {
        this.updateUrl();
      } else {
        this.isPageFresh = false;
        let table = document.querySelector(
          `#list-${this.activeWorkflow.tabName}`
        );
        let selectedRow = table.querySelector(
          `tr:nth-child(${this.selectedEntityIndex + 1})`
        );
        selectedRow.scrollIntoView({ block: 'center' });
      }
    },
    /** Update the URL based on current entity selected */
    updateUrl() {
      let url = window.location.href.split('#')[0];
      let wfName = this.activeWorkflow.name;
      let key = this.activeTabOptions.uidKey;
      let wfId = this.selectedEntity ? this.selectedEntity[key] || -1 : -1;
      url += `#/workflow/${wfName}/${wfId}`;
      history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
      // instead of creating a new history instances for every entity selected
    },
    unsetSelectedEntity() {
      const self = this;
      if (this.$refs['col-left']) {
        this.$refs['col-left'].classList.add('d-block');
      }
      if (this.$refs['col-right']) {
        this.$refs['col-right'].classList.remove('d-block');
      }
      this.$forceUpdate();
      this.$nextTick().then(() => {
        if (self.$refs[`list-${self.activeWorkflow.tabName}`]) {
          self.$refs[`list-${self.activeWorkflow.tabName}`][0].clearSelected();
        }
      });
    },
    /** Description: A callback to update the left pane list, based on the changes in the right pane
     *
     * params: updatedData - The rightpane's data from gkcore after update
     */
    onSelectedEntityUpdate(updatedData) {
      switch (this.activeWorkflow.name) {
        case 'Transactions':
          {
            if (updatedData.gkstatus === 0) {
              // if the invoice exists after update, gkstatus will be 0
              this.selectedEntity.onCreditFlag = !updatedData.gkresult
                .billentrysingleflag;
            } else {
              // If the invoice was deleted as an update, then gkstatus will be 3 or something else
              this.activeTabOptions.data.splice(this.selectedEntityIndex, 1);
              this.unsetSelectedEntity();
            }
          }
          break;
        case 'Transactions-Voucher':
          {
            if (updatedData.type === 'delete') {
              this.displayToast(
                `Voucher Delete success!`,
                `${this.selectedEntity.noteName} : ${this.selectedEntity.no}, deleted successfully.`,
                'success'
              );
              let id = this.selectedEntity.id;
              let index = this.activeTabOptions.data.findIndex(
                (voucher) => voucher.id === id
              );
              this.unsetSelectedEntity();
              this.activeTabOptions.data.splice(index, 1);
            }
          }
          break;
        case 'Transactions-DeliveryNote': {
          if (updatedData.type === 'delete') {
            this.displayToast(
              `Delivery Note Delete success!`,
              `Delivery Note : ${this.selectedEntity.no}, deleted successfully.`,
              'success'
            );
            let id = this.selectedEntity.id;
            let index = this.activeTabOptions.data.findIndex(
              (delNote) => delNote.id === id
            );
            this.unsetSelectedEntity();
            this.activeTabOptions.data.splice(index, 1);
          }
        }
      }
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
    // fetch products & services list
    psList() {
      this.isLoading = true;
      axios
        .get('/products')
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
    onDropdownHide(event) {
      // console.log(`${event.componentId} is closing`);
      if (event.componentId === 'sub-menu') {
        this.isSubMenuOpen = false;
        this.$refs.mainMenu.hide();
      }
      if (this.isSubMenuOpen) {
        event.preventDefault();
      }
    },
    onDropdownShow(event) {
      if (event.componentId === 'sub-menu') {
        this.isSubMenuOpen = true;
      }
    },
    initSelectedEntity(tab) {
      const self = this;
      self.$forceUpdate();
      self.$nextTick().then(() => {
        let table = self.$refs[`list-${self.activeWorkflow.tabName}`][0];
        let wfId = parseInt(self.wfId);
        let key = tab.uidKey;
        // table.sortedItems will have the filtered and sorted items
        let entityIndex =
          parseInt(self.wfId) >= 0
            ? table.sortedItems.findIndex((item) => item[key] === wfId)
            : 0;
        if (entityIndex >= 0) {
          self.selectedEntityIndex = entityIndex;
          table.clearSelected();
          table.selectRow(entityIndex);
        }
      });
    },
  },
  mounted() {
    this.updateListHeight();
    this.autoSetActiveWorkflow();
  },
};
</script>
<style scoped>
.bg-light-gray {
  background-color: #f1f1f1;
}

.data-list {
  padding: 0;
}
.data-list > div {
  padding: 0.75rem 1.25rem;
}
.text-overline-danger {
  text-decoration: overline;
  text-decoration-color: #dc3545;
}

#add-item {
  opacity: 0.55;
}

#add-item:hover {
  opacity: 1;
}

.selected-data-list {
  border: 2px solid black;
  background-color: #f3f3f3;
}
</style>
