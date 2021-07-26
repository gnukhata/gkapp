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
              @click="isFilterOpen = !isFilterOpen"
            >
              <b-icon icon="funnel"></b-icon><span class="sr-only">Filter</span>
            </b-button>
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
                    <b-form-radio-group
                      id="filter-form-item"
                      v-model="filter.value.props"
                      :options="activeTabOptions.filterBy.value"
                      value-field="props"
                      size="sm"
                      class="d-inline-block"
                    ></b-form-radio-group>
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
                              v-model="filter.range.from"
                              type="text"
                              placeholder="YYYY-MM-DD"
                              autocomplete="off"
                            ></b-form-input>
                            <b-input-group-append>
                              <b-form-datepicker
                                button-only
                                v-model="filter.range.from"
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
                              v-model="filter.range.to"
                              type="text"
                              placeholder="YYYY-MM-DD"
                              autocomplete="off"
                            ></b-form-input>
                            <b-input-group-append>
                              <b-form-datepicker
                                button-only
                                v-model="filter.range.to"
                                size="sm"
                                right
                                :min="filter.range.from"
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
          <div
            v-for="(tab, tabName) in allTabs"
            :key="tabName"
            :class="{ 'd-none': activeWorkflow.tabName !== tabName }"
          >
            <!-- Sort Bar Start -->
            <div class="px-3">
              <b-row>
                <b-col
                  class="p-1"
                  v-for="(sortBy, index4) in tab.sortBy"
                  :key="index4"
                >
                  <b-button
                    @click="callSortData(tab.data, sortBy.props)"
                    block
                    size="sm"
                    class="py-0 px-1 text-left"
                  >
                    {{ sortBy.text }}
                    <span
                      class="float-right"
                      v-if="sort.props.key === sortBy.props.key"
                    >
                      <span v-if="sortBy.props.isAsc">▲</span>
                      <span v-else>▼</span>
                    </span>
                  </b-button>
                </b-col>
              </b-row>
            </div>
            <!-- Sort bar End -->
            <!-- Workflow Data List Start -->
            <b-list-group
              :style="{ height: listHeight + 'px', overflowY: 'auto' }"
              :data-name="`workflow-list-${tabName}`"
            >
              <b-list-group-item
                button
                class="data-list"
                v-for="(item, index3) in processedData"
                :key="index3"
                @click.prevent="setSelectedEntity(item, index3)"
              >
                <div
                  class="py-0"
                  :style="{ height: '45px', 'line-height': '45px' }"
                  v-if="activeWorkflow.name.includes('Transactions')"
                >
                  <b-row>
                    <b-col class="px-0">
                      <small>{{ item.date }}</small>
                    </b-col>
                    <b-col class="px-1 text-truncate">
                      <span>
                        <b-icon
                          v-if="item.deletedFlag"
                          font-scale="0.75"
                          variant="danger"
                          icon="x-circle"
                          class="mr-1"
                        ></b-icon>
                        <b-icon font-scale="0.75" :icon="item.icon"></b-icon>
                      </span>
                      <small> {{ item.text1 }} </small>
                    </b-col>
                    <b-col
                      v-if="item.text2"
                      class="px-0 text-truncate text-right"
                      :title="item.text2"
                      :class="{ 'text-overline-danger': item.onCreditFlag }"
                    >
                      <small>{{ item.text2 }}</small>
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
              id="add-item"
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
          class="ml-md-3"
          v-if="
            selectedEntity &&
              selectedEntity.id &&
              activeWorkflow.name.includes('Transactions')
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
              {{ selectedEntity.noteName }} : {{ selectedEntity.no }}
            </h5>
          </template>
          <b-card-body
            class="px-0"
            :style="{ height: rightPaneHeight + 'px', overflowY: 'auto' }"
            v-if="selectedEntity !== null"
          >
            <transaction-profile
              :name="activeWorkflow.tabName"
              :id="selectedEntity.id"
              :pdata="profileData"
              :onUpdate="onSelectedEntityUpdate"
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
import axios from 'axios';
import { mapState } from 'vuex';
import ContactProfile from '@/components/ContactProfile';
import BusinessProfile from '@/components/BusinessProfile.vue';
import TransactionProfile from '@/components/workflow/profile/Transaction.vue';
// import HeroBar from '@/components/HeroBar'

export default {
  name: 'Workflow',
  components: { ContactProfile, BusinessProfile, TransactionProfile },
  props: {
    wfName: {
      type: String,
      validator: function(value) {
        return (
          [
            'Contacts',
            'Business',
            'Transactions',
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
      isLoading: true,
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
      isFilterOpen: false,
      selectedEntity: null,
      selectedEntityIndex: 0,
      filter: {
        value: {
          props: {},
        },
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
          Contacts: {
            icon: 'person-lines-fill',
            color: 'primary',
            data: [],
            key: 'custname',
            uidKey: 'custid',
            createNewPath: {
              name: 'Contact_Details',
              params: { mode: 'create' },
            },
            filterBy: {
              value: [
                {
                  text: 'All', // text -> Display text for this filter
                  props: {}, // the properties required to perform the filter
                },
                {
                  text: 'Customers',
                  props: { key: 'csflag', value: true },
                },
                {
                  text: 'Suppliers',
                  props: { key: 'csflag', value: false },
                },
              ],
              range: [],
            },
            sortBy: [
              {
                text: 'Name',
                props: { key: 'custname', isAsc: true },
              },
            ],
          },
          Business: {
            icon: 'box-seam',
            color: 'warning',
            data: [],
            key: 'productdesc',
            uidKey: 'productcode',
            createNewPath: {
              name: 'Business_Details',
              params: { mode: 'create' },
            },
            filterBy: {
              value: [
                {
                  text: 'All',
                  props: {},
                },
                {
                  text: 'Product',
                  props: { key: 'gsflag', value: 7 },
                },
                {
                  text: 'Service',
                  props: { key: 'gsflag', value: 19 },
                },
              ],
              range: [],
            },
            sortBy: [
              {
                text: 'Name',
                props: { key: 'productdesc', isAsc: true },
              },
            ],
          },
          Transactions: {
            icon: 'receipt',
            color: 'success',
            data: [],
            key: 'custname',
            uidKey: 'invid',
            createNewPath: {
              name: 'Invoice',
              params: {
                mode: 'create',
                invid: 0,
              },
            },
            tabs: {
              Invoice: {
                icon: 'receipt',
                color: 'success',
                data: [],
                key: 'custname',
                uidKey: 'invid',
                createNewPath: {
                  name: 'Invoice',
                  params: {
                    mode: 'create',
                    invid: 0,
                  },
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                    {
                      text: 'Sale',
                      props: { key: 'csflag', value: 3 },
                    },
                    {
                      text: 'Purchase',
                      props: { key: 'csflag', value: 19 },
                    },
                    {
                      text: 'Cancelled',
                      props: { key: 'deletedFlag', value: true },
                    },
                    {
                      text: 'On Credit',
                      props: { key: 'onCreditFlag', value: true },
                    },
                    {
                      text: 'Editable',
                      props: { key: 'rectifyFlag', value: true },
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'Name',
                    props: { key: 'custname', isAsc: true },
                  },
                  {
                    text: 'Amount',
                    props: { key: 'netamt', isAsc: true },
                  },
                ],
              },
              DebitCreditNote: {
                icon: 'receipt',
                color: 'success',
                data: [],
                key: 'custname',
                uidKey: 'drcrid',
                createNewPath: {
                  name: 'Debit_Credit_Note',
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                    {
                      text: 'Sale',
                      props: { key: 'csflag', value: 3 },
                    },
                    {
                      text: 'Purchase',
                      props: { key: 'csflag', value: 19 },
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'Name',
                    props: { key: 'custname', isAsc: true },
                  },
                  {
                    text: 'Amount',
                    props: { key: 'totreduct', isAsc: true },
                  },
                ],
              },
              CashMemo: {
                icon: 'receipt',
                color: 'success',
                data: [],
                key: 'custname',
                uidKey: 'invid',
                createNewPath: {
                  name: 'Cash_Memo',
                  params: {},
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'No.',
                    props: { key: 'invoiceno', isAsc: true },
                  },
                ],
              },
              DeliveryNote: {
                icon: 'receipt',
                color: 'success',
                data: [],
                key: 'custname',
                uidKey: 'dcid',
                createNewPath: {
                  name: 'Delivery_Note',
                  params: {
                    mode: 'create',
                    invid: 0,
                  },
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                    {
                      text: 'Sale',
                      props: { key: 'csflag', value: 3 },
                    },
                    {
                      text: 'Purchase',
                      props: { key: 'csflag', value: 19 },
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'Name',
                    props: { key: 'custname', isAsc: true },
                  },
                  {
                    text: 'No.',
                    props: { key: 'dcno', isAsc: true },
                  },
                ],
              },
              PurchaseSalesOrder: {
                icon: 'receipt',
                color: 'success',
                data: [],
                key: 'custname',
                uidKey: 'orderid',
                createNewPath: {
                  name: 'Purchase_Sales_Order',
                  params: {},
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                    {
                      text: 'Sale',
                      props: { key: 'csflag', value: 3 },
                    },
                    {
                      text: 'Purchase',
                      props: { key: 'csflag', value: 19 },
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'Name',
                    props: { key: 'customer', isAsc: true },
                  },
                  {
                    text: 'No.',
                    props: { key: 'orderno', isAsc: true },
                  },
                ],
              },
              RejectionNote: {
                icon: 'receipt',
                color: 'success',
                data: [],
                key: 'custname',
                uidKey: 'rnid',
                createNewPath: {
                  name: 'Rejection_Note',
                  params: {},
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                    {
                      text: 'Sale',
                      props: { key: 'inout', value: 15 },
                    },
                    {
                      text: 'Purchase',
                      props: { key: 'inout', value: 9 },
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'No.',
                    props: { key: 'rnno', isAsc: true },
                  },
                ],
              },
              TransferNote: {
                icon: 'receipt',
                color: 'success',
                data: [],
                key: 'custname',
                uidKey: 'transfernoteid',
                createNewPath: {
                  name: 'Transfer_Note',
                  params: {},
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'No.',
                    props: { key: 'transfernoteno', isAsc: true },
                  },
                ],
              },
              Voucher: {
                icon: 'receipt',
                color: 'success',
                data: [],
                uidKey: 'vouchercode',
                createNewPath: {
                  name: 'Create_Voucher',
                  params: {
                    type: 'receipt',
                    customer: '-1',
                  },
                },
                filterBy: {
                  value: [
                    {
                      text: 'All',
                      props: {},
                    },
                    {
                      text: 'Receipt',
                      props: { key: 'vouchertype', value: 'receipt' },
                    },
                    {
                      text: 'Payment',
                      props: { key: 'vouchertype', value: 'payment' },
                    },
                    {
                      text: 'Purchase',
                      props: { key: 'vouchertype', value: 'purchase' },
                    },
                    {
                      text: 'Sales',
                      props: { key: 'vouchertype', value: 'sales' },
                    },
                    {
                      text: 'Journal',
                      props: { key: 'vouchertype', value: 'journal' },
                    },
                    {
                      text: 'Contra',
                      props: { key: 'vouchertype', value: 'contra' },
                    },
                    {
                      text: 'Cancelled',
                      props: { key: 'deletedFlag', value: true },
                    },
                  ],
                  range: [
                    {
                      from: {
                        text: 'From Date',
                      },
                      to: {
                        text: 'To Date',
                      },
                      props: {
                        key: 'dateObj',
                        min: this.yearStart,
                        max: this.yearEnd,
                      },
                    },
                  ],
                },
                sortBy: [
                  {
                    text: 'Date',
                    props: { key: 'dateObj', isAsc: true },
                  },
                  {
                    text: 'Dr',
                    props: { key: 'drAmount', isAsc: true },
                  },
                  {
                    text: 'Cr',
                    props: { key: 'crAmount', isAsc: true },
                  },
                ],
              },
            },
            filterBy: {
              value: [
                {
                  text: 'All',
                  props: {},
                },
                {
                  text: 'Sale',
                  props: { key: 'csflag', value: 3 },
                },
                {
                  text: 'Purchase',
                  props: { key: 'csflag', value: 19 },
                },
              ],
              range: [
                {
                  from: {
                    text: 'From Date',
                  },
                  to: {
                    text: 'To Date',
                  },
                  props: {
                    key: 'dateObj',
                    min: this.yearStart,
                    max: this.yearEnd,
                  },
                },
              ],
            },
            sortBy: [
              {
                text: 'Date',
                props: { key: 'dateObj', isAsc: true },
              },
              {
                text: 'Name',
                props: { key: 'custname', isAsc: true },
              },
              {
                text: 'Amount',
                props: { key: 'netamt', isAsc: true },
              },
            ],
          },
          Reports: {
            icon: 'journals',
            color: 'danger',
            data: [],
            key: '',
            uidKey: '',
            filterBy: {
              value: [],
              range: [],
            },
            sortBy: [],
          },
        },
      },
    };
  },
  watch: {
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
        this.updateListHeight();
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
    /**
     * processedData()
     *
     * Description: When the filter and sort object values are altered,
     * this method runs the filter and sort methods on the data list
     * of the current workflow page, and updates the left pane of cards.
     *
     */
    processedData: function() {
      let data = this.activeTabOptions.data;
      // console.log(this.filter)
      if (this.filter.value.props.key !== undefined) {
        data = this.filterByValue(
          data,
          this.filter.value.props.key,
          this.filter.value.props.value
        );
      }

      if (this.filter.range.props.key !== undefined) {
        // console.log("date filter")
        // console.log(this.filter.range.from);
        // console.log(this.filter.range.to);
        data = this.filterByRange(
          data,
          this.filter.range.props.key,
          Date.parse(this.filter.range.from), // converting date "yyyy-mm-dd" into a format that can be compared with logical operators
          Date.parse(this.filter.range.to)
        );
      }
      if (this.sort.props.key !== undefined) {
        data = this.sortData(data, this.sort.isAscending, this.sort.props.key);
      }
      return data;
    },
    ...mapState(['authToken', 'gkCoreUrl', 'userName', 'yearStart', 'yearEnd']),
  },
  methods: {
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
    /**
     * filterByValue(data, key, value)
     *
     * Description: This is a visibility filter, that returns an array of data list that match a certain key value
     *
     * e.g. Display all data items that have (csflag === 19), that is purchase
     */
    filterByValue(data, key, value) {
      return data.filter((item) => item[key] === value);
    },
    filterByRange(data, key, from, to) {
      return data.filter((item) => item[key] >= from && item[key] <= to);
    },
    resetFilter() {
      this.filter = {
        value: {
          props: {},
        },
        range: {
          props: {},
          from: this.yearStart,
          to: this.yearEnd,
        },
        isActive: false,
      };

      //sets the first filter in the filter array, which should be "all" ( used to display every item )
      if (this.activeTabOptions.filterBy.value.length) {
        this.filter.value.props = Object.assign(
          {},
          this.activeTabOptions.filterBy.value[0].props
        );
      }

      // sets the first sortBy in the sortBy array
      if (this.activeTabOptions.sortBy.length) {
        this.sort.props = Object.assign(
          {},
          this.activeTabOptions.sortBy[0].props
        );
      }

      if (this.activeTabOptions.filterBy.range.length) {
        this.filter.range.props = Object.assign(
          {},
          this.activeTabOptions.filterBy.range[0].props
        );
      }
    },
    /**
     * setActiveWorkflow(index, name, icon)
     *
     * Description: As the name suggests it stores the details about the active workflow.
     * Also initializes the filters and sorts, after that.
     */
    setActiveWorkflow(index, name, icon, skipUpdate) {
      let color, tabName;
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
      if (!skipUpdate) {
        this.updateUrl();
      }
    },
    setSelectedEntity(entity, index, skipUpdate) {
      // remove selected class from the last selected item
      let activeListContainerDom = document.querySelector(
        `div[data-name="workflow-list-${this.activeWorkflow.tabName}"]`
      );
      let selectedDom = activeListContainerDom.querySelector(
        `button:nth-child(${this.selectedEntityIndex + 1})`
      );
      if (selectedDom) selectedDom.classList.remove('selected-data-list');

      this.selectedEntity = entity;
      this.selectedEntityIndex = index;
      if (this.$refs['col-left'])
        this.$refs['col-left'].classList.remove('d-block');
      if (this.$refs['col-right'])
        this.$refs['col-right'].classList.add('d-block');
      if (!skipUpdate) {
        this.updateUrl();
      }

      // set selected class
      selectedDom = activeListContainerDom.querySelector(
        `button:nth-child(${index + 1})`
      );
      selectedDom.classList.add('selected-data-list');
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
      let selectedDom = document
        .querySelector(
          `div[data-name="workflow-list-${this.activeWorkflow.tabName}"]`
        )
        .querySelector(`button:nth-child(${this.selectedEntityIndex + 1})`);
      if (selectedDom) selectedDom.classList.remove('selected-data-list');
      this.selectedEntity = null;
      this.selectedEntityIndex = null;
      this.$refs['col-left'].classList.add('d-block');
      this.$refs['col-right'].classList.remove('d-block');
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
    // fetch customers, suppliers, products, services list
    loadList() {
      // stores the map of invoice id to corresponding invoice array indexes
      // used for quickly updating rectifyflag in invoice data array

      const requests = [
        axios.get('/customersupplier?qty=custall').catch((error) => {
          return error;
        }),
        axios.get('/customersupplier?qty=supall').catch((error) => {
          return error;
        }),
        axios.get('/products').catch((error) => {
          return error;
        }),
        axios
          .get(
            `/invoice?type=list&flag=0&fromdate=${this.yearStart}&todate=${this.yearEnd}`
          )
          .catch((error) => {
            return error;
          }),
        axios.get('/billwise?type=all').catch((error) => {
          return error;
        }),
        axios.get('/delchal?delchal=all').catch((error) => {
          return error;
        }),
        //sale
        axios.get('/invoice?cash=all&inoutflag=15').catch((error) => {
          return error;
        }),
        //purchase
        axios.get('/invoice?cash=all&inoutflag=9').catch((error) => {
          return error;
        }),
        axios.get('/transfernote?type=all').catch((error) => {
          return error;
        }),
        axios.get('/purchaseorder').catch((error) => {
          return error;
        }),
        axios.get('/drcrnote?drcr=all').catch((error) => {
          return error;
        }),
        axios.get('/rejectionnote?type=all').catch((error) => {
          return error;
        }),
        axios
          .get(
            `/transaction?searchby=date&from=${this.yearStart}&to=${this.yearEnd}`
          )
          .catch((error) => {
            return error;
          }),
        axios
          .get(
            `/invoice?type=listdeleted&flag=0&fromdate=${this.yearStart}&todate=${this.yearEnd}`
          )
          .catch((error) => {
            return error;
          }),
        axios.get('/report?type=deletedvoucher').catch((error) => {
          return error;
        }),
      ];

      const self = this;
      return Promise.all([...requests]).then((resp) => {
        self.isLoading = false;

        let contacts = [];
        let invoiceMap = {};
        let custSupMap = {}; // customer/suppliername : isCustomer

        // Customer List
        if (resp[0].status === 200) {
          contacts = resp[0].data.gkresult.map((item) => {
            custSupMap[item.custname] = true;
            return Object.assign({ csflag: true, icon: 'person-fill' }, item);
          });
        } else {
          console.log(resp[0].message);
        }

        // Supplier List
        if (resp[1].status === 200) {
          contacts.push(
            ...resp[1].data.gkresult.map((item) => {
              custSupMap[item.custname] = false;
              return Object.assign(
                { csflag: false, icon: 'briefcase-fill' },
                item
              );
            })
          );
          self.options.tabs['Contacts'].data = self.sortData(
            contacts,
            'asc',
            'custid'
          );
        } else {
          console.log(resp[1].message);
        }

        // Products & Services List
        if (resp[2].status === 200) {
          self.options.tabs[
            'Business'
          ].data = resp[2].data.gkresult.map((item) =>
            Object.assign({ icon: item.gsflag === 7 ? 'box' : 'headset' }, item)
          );
        } else {
          console.log(resp[2].message);
        }

        const transactionTab = self.options.tabs['Transactions'].tabs;

        // Invoices
        if (resp[3].status === 200) {
          self.options.tabs['Transactions'].data = resp[3].data.gkresult.map(
            (item, index) => {
              invoiceMap[item.invid] = index;
              return Object.assign(
                {
                  id: item.invid,
                  no: item.invoiceno,
                  noteName: `${
                    item.csflag === 3 ? 'Sale' : 'Purchase'
                  } Invoice`,
                  date: item.invoicedate,
                  text1: item.custname,
                  text2: `₹ ${item.netamt}`,
                  icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                  onCreditFlag: false,
                  rectifyFlag: false, // can be rectified or not
                  deletedFlag: false,
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  dateObj: Date.parse(
                    item.invoicedate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                item
              );
            }
          );
          transactionTab['Invoice'].data =
            self.options.tabs['Transactions'].data;
        } else {
          console.log(resp[3].message);
        }

        // Invoice in credit
        if (resp[4].status === 200) {
          let data = transactionTab['Invoice'].data;
          if (resp[4].data.gkstatus === 0 && data.length) {
            let index = '';
            resp[4].data.invoices.forEach((inv) => {
              index = invoiceMap[inv.invid];
              if (index >= 0) {
                data[index].onCreditFlag = true;
                data[index].rectifyFlag =
                  inv.balanceamount === inv.invoicetotal; // can be rectified or not
              }
            });
          }
        } else {
          console.log(resp[4].message);
        }

        // Delivery Note
        if (resp[5].status === 200) {
          if (resp[5].data.gkstatus === 0) {
            transactionTab['DeliveryNote'].data = resp[5].data.gkresult.map(
              (item) => {
                return Object.assign(
                  {
                    id: item.dcid,
                    no: item.dcno,
                    noteName: `Delivery Note`,
                    text1: item.custname,
                    text2: item.dcno,
                    icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                    // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                    date: item.dcdate,
                    dateObj: Date.parse(
                      item.dcdate
                        .split('-')
                        .reverse()
                        .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                    ),
                  },
                  item
                );
              }
            );
          }
        } else {
          console.log(resp[5].message);
        }

        // Cash Memo Sale
        if (resp[6].status === 200) {
          if (resp[6].data.gkstatus === 0) {
            transactionTab['CashMemo'].data = resp[6].data.gkresult.map(
              (item) => {
                return Object.assign(
                  {
                    id: item.invid,
                    no: item.invoiceno,
                    noteName: `Cash Memo`,
                    text1: item.invoiceno,
                    icon: 'cash-stack',
                    // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                    date: item.invoicedate,
                    dateObj: Date.parse(
                      item.invoicedate
                        .split('-')
                        .reverse()
                        .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                    ),
                  },
                  item
                );
              }
            );
          }
        } else {
          console.log(resp[6].message);
        }

        // Cash Memo Purchase
        if (resp[7].status === 200) {
          if (resp[7].data.gkstatus === 0) {
            let cmPurchase = resp[7].data.gkresult.map((item) => {
              return Object.assign(
                {
                  id: item.invid,
                  no: item.invoiceno,
                  noteName: `Cash Memo`,
                  text1: item.invoiceno,
                  icon: 'basket3',
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  date: item.invoicedate,
                  dateObj: Date.parse(
                    item.invoicedate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                item
              );
            });
            if (cmPurchase.length) {
              transactionTab['CashMemo'].data.push(...cmPurchase);
            }
          }
        } else {
          console.log(resp[7].message);
        }

        // Transfer Notes
        if (resp[8].status === 200) {
          if (resp[8].data.gkstatus === 0) {
            transactionTab['TransferNote'].data = resp[8].data.gkresult.map(
              (item) => {
                return Object.assign(
                  {
                    icon: 'truck',
                    // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                    date: item.transfernotedate,
                    dateObj: Date.parse(
                      item.transfernotedate
                        .split('-')
                        .reverse()
                        .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                    ),
                    id: item.transfernoteid,
                    no: item.transfernoteno,
                    noteName: 'Transfer Note',
                    text1: item.transfernoteno,
                  },
                  item
                );
              }
            );
          }
        } else {
          console.log(resp[8].message);
        }

        // Purchase Sales Order
        if (resp[9].status === 200) {
          if (resp[9].data.gkstatus === 0) {
            transactionTab[
              'PurchaseSalesOrder'
            ].data = resp[9].data.gkresult.map((item) => {
              return Object.assign(
                {
                  id: item.orderid,
                  no: item.orderno,
                  noteName: `${
                    custSupMap[item.customer] ? 'Sale' : 'Purchase'
                  } Order`,
                  text1: item.customer,
                  text2: item.orderno,
                  csflag: custSupMap[item.customer] ? 3 : 19,
                  icon: custSupMap[item.customer] ? 'cash-stack' : 'basket3',
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  date: item.orderdate,
                  dateObj: Date.parse(
                    item.orderdate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                item
              );
            });
          }
        } else {
          console.log(resp[9].message);
        }

        // Debit Credit Note
        if (resp[10].status === 200) {
          if (resp[10].data.gkstatus === 0) {
            transactionTab['DebitCreditNote'].data = resp[10].data.gkresult.map(
              (item) => {
                return Object.assign(
                  {
                    id: item.drcrid,
                    no: item.drcrno,
                    noteName: `${
                      item.dctypeflag === 3 ? 'Credit' : 'Debit'
                    } Note`,
                    text1: item.custname,
                    text2: `₹ ${item.totreduct}`,
                    icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                    // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                    date: item.drcrdate,
                    dateObj: Date.parse(
                      item.drcrdate
                        .split('-')
                        .reverse()
                        .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                    ),
                  },
                  item
                );
              }
            );
          }
        } else {
          console.log(resp[10].message);
        }

        // Rejection Note
        if (resp[11].status === 200) {
          if (resp[11].data.gkstatus === 0) {
            transactionTab['RejectionNote'].data = resp[11].data.gkresult.map(
              (item) => {
                return Object.assign(
                  {
                    id: item.rnid,
                    no: item.rnno,
                    noteName: `Rejection Note`,
                    text1: item.rnno,
                    icon: item.inout === 15 ? 'cash-stack' : 'basket3',
                    // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                    date: item.rndate,
                    dateObj: Date.parse(
                      item.rndate
                        .split('-')
                        .reverse()
                        .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                    ),
                  },
                  item
                );
              }
            );
          }
        } else {
          console.log(resp[11].message);
        }

        // Vouchers
        if (resp[12].status === 200) {
          if (resp[12].data.gkstatus === 0) {
            transactionTab['Voucher'].data = resp[12].data.gkresult.map(
              (item) => {
                let drAccount = Object.keys(item.drs)[0];
                let drAmount = parseFloat(item.drs[drAccount]).toFixed(2);
                let crAccount = Object.keys(item.crs)[0];
                let crAmount = parseFloat(item.crs[crAccount]).toFixed(2);
                return Object.assign(
                  {
                    id: item.vouchercode,
                    no: item.vouchernumber,
                    noteName: `${item.vouchertype[0].toUpperCase()}${item.vouchertype.slice(
                      1
                    )} Voucher`,
                    text1: `${drAmount} (${drAccount})`,
                    text2: `${crAmount} (${crAccount})`,
                    drAmount: drAmount,
                    crAmount: crAmount,
                    icon: 'cash-stack',
                    // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                    date: item.voucherdate,
                    dateObj: Date.parse(
                      item.voucherdate
                        .split('-')
                        .reverse()
                        .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                    ),
                  },
                  item
                );
              }
            );
          }
        } else {
          console.log(resp[12].message);
        }

        if (resp[13].data.gkstatus === 0) {
          const deletedInv = resp[13].data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.invid,
                no: item.invoiceno,
                noteName: `${item.csflag === 3 ? 'Sale' : 'Purchase'} Invoice`,
                date: item.invoicedate,
                text1: item.custname,
                text2: `₹ ${item.netamt}`,
                icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                onCreditFlag: false,
                rectifyFlag: false, // can be rectified or not
                deletedFlag: true,
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                dateObj: Date.parse(
                  item.invoicedate
                    .split('-')
                    .reverse()
                    .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                ),
              },
              item
            );
          });
          transactionTab['Invoice'].data.push(...deletedInv);
        }

        // Vouchers
        if (resp[14].status === 200) {
          if (resp[14].data.gkstatus === 0) {
            let deletedVouchers = resp[14].data.gkresult.map((item) => {
              let drAccount = Object.keys(item.drs)[0];
              let drAmount = parseFloat(item.drs[drAccount]).toFixed(2);
              let crAccount = Object.keys(item.crs)[0];
              let crAmount = parseFloat(item.crs[crAccount]).toFixed(2);
              return Object.assign(
                {
                  id: item.vouchercode,
                  no: item.vouchernumber,
                  noteName: `${item.vouchertype[0].toUpperCase()}${item.vouchertype.slice(
                    1
                  )} Voucher`,
                  text1: `${drAmount} (${drAccount})`,
                  text2: `${crAmount} (${crAccount})`,
                  drAmount: drAmount,
                  crAmount: crAmount,
                  icon: 'cash-stack',
                  deletedFlag: true,
                  // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                  date: item.voucherdate,
                  dateObj: Date.parse(
                    item.voucherdate
                      .split('-')
                      .reverse()
                      .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                  ),
                },
                item
              );
            });
            transactionTab['Voucher'].data.push(...deletedVouchers);
          }
        } else {
          console.log(resp[12].message);
        }
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
  },
  mounted() {
    this.updateListHeight();
    // this.loadList('custall')
    // this.loadList('supall')
    // this.psList()
    this.isPreloading = true;
    let self = this;
    this.loadList()
      .then(() => {
        self.isPreloading = false;
        let tab, index;
        if (self.wfName.includes('-')) {
          let name = self.wfName.split('-');
          tab = self.options.tabs[name[0]].tabs[name[1]];
          index = Object.keys(self.options.tabs[name[0]]).indexOf(name[1]);
          self.setActiveWorkflow(
            index,
            { parent: name[0], child: name[1] },
            tab.icon,
            true
          );
        } else {
          tab = self.options.tabs[self.wfName];
          index = Object.keys(self.options.tabs).indexOf(self.wfName);
          self.setActiveWorkflow(index, this.wfName, tab.icon, true);
        }
        if (self.wfId) {
          let wfId = parseInt(self.wfId);
          let key = tab.uidKey;
          let entityIndex = tab.data.findIndex((item) => item[key] === wfId);
          if (entityIndex >= 0) {
            self.$nextTick().then(() => {
              self.setSelectedEntity(tab.data[entityIndex], entityIndex, true);
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
        self.isPreloading = false;
      });
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
