<template>
  <section class="container-fluid mt-2">
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <b-container
      fluid
      v-if="activeWorkflow.index === null"
    >
      <b-card-group
        role="tab"
        deck
        class="mt-5"
      >
        <b-card
          tabindex="0"
          v-for="(tab, tabName, index) in options.tabs"
          @keyup.enter="setActiveWorkflow(index, tabName, tab.icon)"
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
            />
          </b-card-text>
          <b-card-text class="mt-4">
            {{ tabName }}
          </b-card-text>
        </b-card>
      </b-card-group>
    </b-container>
    <b-row
      v-else
      no-gutters
    >
      <!-- Left Pane: Workflow Selection & Corresponding Data list -->
      <b-col
        cols="12"
        md="4"
        lg="3"
        ref="col-left"
        class="d-none d-md-block d-block"
      >
        <b-card no-body>
          <b-overlay
            :show="isLoading"
            blur
            no-wrap
            rounded="lg"
          />
          <!-- Workflow Selection & Filter -->
          <b-card-header
            ref="leftHeader"
            class="px-2"
          >
            <div
              class="d-flex justify-content-between align-items-center"
            >
              <b-form-input
                size="sm"
                v-model="search"
                placeholder="Search"
              />
              <b-dropdown
                split
                :split-to="getFormPath()"
                size="sm"
                class="ml-2"
                variant="success"
              >
                <template #button-content>
                  <b-icon icon="plus" />
                </template>
                <b-dropdown-item-button
                  v-if="activeWorkflow.tabName !== 'Contacts' && activeWorkflow.tabName !== 'Business'"
                  @click="toggleFlag(); isSortingOpen = !isSortingOpen"
                >
                  <b-icon icon="sort-down" /> Sort
                </b-dropdown-item-button>
                <b-dropdown-item-button
                  v-if="activeWorkflow.tabName !== 'Contacts'"
                  @click="toggleFlag(); isFilterOpen = !isFilterOpen"
                >
                  <b-icon icon="funnel" /> Filter
                </b-dropdown-item-button>
                <b-dropdown-item-button
                  @click="printPage(`list-${activeWorkflow.tabName}`, fileName.list)"
                >
                  <b-icon icon="printer" /> Print
                </b-dropdown-item-button>
                <b-dropdown-item-button
                  v-if="
                    activeWorkflow.name === 'Business'
                      || activeWorkflow.name === 'Transactions-Invoice'
                      || activeWorkflow.name === 'Transactions-TransferNote'
                  "
                  @click="exportAsSpreadsheet"
                >
                  <b-icon icon="file-earmark-spreadsheet" /> Export
                </b-dropdown-item-button>
              </b-dropdown>
            </div>
            <div class="d-block w-100">
              <div class="d-none">
                <b-button-group
                  class="float-right"
                  :class="{'mt-2': isSortingOpen}"
                >
                  <print-helper
                    class="px-md-1 px-2"
                    :content-id="`list-${activeWorkflow.tabName}`"
                    :font-scale="1"
                    icon-name="file-earmark-arrow-down"
                    variant="outline-dark"
                    :file-name="fileName.list"
                    :toggle-flag="toggleFlag"
                    title="Download Pdf"
                    :message-from-parent="parentMessage"
                  />
                  <!-- product / service spreadsheet -->
                  <gk-file-download
                    variant="outline-dark"
                    v-if="activeWorkflow.name === 'Business'"
                    file-suffix="ProductServiceList"
                    class="px-1"
                    :font-scale="1"
                    :url="
                      `/spreadsheet?pslist&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`
                    "
                    title="Download Product Service List"
                    :toggle-flag="toggleFlag"
                    :message-from-parent="parentMessage"
                  />
                  <!-- Invoice spreadsheet -->
                  <gk-file-download
                    variant="outline-dark"
                    v-if="
                      activeWorkflow.name == 'Transactions-Invoice' &&
                        filters.active.length == 1 &&
                        filters.active[0] == 0
                    "
                    file-suffix="InvoiceList"
                    class="px-1"
                    :font-scale="1"
                    :url="
                      `/spreadsheet?invoice-list&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}&fromdate=${this.filters.range.from}&todate=${this.filters.range.to}&flag=0&type=invoice_list`
                    "
                    title="Download All Invoice List"
                    :toggle-flag="toggleFlag"
                    :message-from-parent="parentMessage"
                  />
                  <!-- Cancelled Invoice spreadsheet -->
                  <gk-file-download
                    variant="outline-dark"
                    v-if="
                      activeWorkflow.name == 'Transactions-Invoice' &&
                        filters.active.length == 1 &&
                        filters.active[0] == 3
                    "
                    file-suffix="CancelledInvoiceList"
                    class="px-1"
                    :font-scale="1"
                    :url="
                      `/spreadsheet?invoice-cancelled&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}&fromdate=${this.filters.range.from}&todate=${this.filters.range.to}&flag=0&type=invoice_list`
                    "
                    title="Download Cancelled Invoice Spreadsheet"
                    :toggle-flag="toggleFlag"
                    :message-from-parent="parentMessage"
                  />
                  <!-- Credit Invoice Spreadsheet -->
                  <gk-file-download
                    variant="outline-dark"
                    v-if="
                      activeWorkflow.name == 'Transactions-Invoice' &&
                        filters.active.length == 1 &&
                        filters.active[0] == 4
                    "
                    file-suffix="CreditInvoiceList"
                    class="px-1"
                    title="Download Credit Invoice Spreadsheet"
                    :font-scale="1"
                    :url="
                      `/spreadsheet?invoice-outstanding&fromdate=${dateReverse(
                        this.filters.range.from,
                      )}&todate=${dateReverse(
                        this.filters.range.to,
                      )}&inoutflag=15&orderflag=1&typeflag=4`
                    "
                    :toggle-flag="toggleFlag"
                    :message-from-parent="parentMessage"
                  />
                  <!-- Transfer Note Spreadsheet -->
                  <gk-file-download
                    variant="outline-dark"
                    v-if="activeWorkflow.name == 'Transactions-TransferNote'"
                    file-suffix="TransferNoteList"
                    class="px-1"
                    :font-scale="1"
                    :url="
                      `/spreadsheet?transfer-notes&startdate=${this.dateReverse(
                        this.filters.range.from,
                      )}&enddate=${this.dateReverse(this.filters.range.to)}`
                    "
                    title="Download Transfer Notes Spreadsheet"
                    :toggle-flag="toggleFlag"
                    :message-from-parent="parentMessage"
                  />
                  <!-- Unbilled Delivery Note Spreadsheet -->
                  <gk-file-download
                    variant="outline-dark"
                    v-if="
                      activeWorkflow.name == 'Transactions-DeliveryNote' &&
                        filters.active.length == 1 &&
                        filters.active[0] == 4
                    "
                    file-suffix="UnbilledDeliveryNote"
                    class="px-1"
                    title="Download Unbilled Delivery Note Spreadsheet"
                    :font-scale="1"
                    :url="
                      `/spreadsheet?delivery-challan-unbilled&inputdate=${this.filters.range.to}&inout=9&del_unbilled_type=All`
                    "
                    :toggle-flag="toggleFlag"
                    :message-from-parent="parentMessage"
                  />
                  <!-- Cancelled Delivery Note Spreadsheet -->
                  <gk-file-download
                    variant="outline-dark"
                    v-if="
                      activeWorkflow.name == 'Transactions-DeliveryNote' &&
                        filters.active.length == 1 &&
                        filters.active[0] == 3
                    "
                    file-suffix="CancelledDeliveryNote"
                    class="px-1"
                    title="Download Cancelled Delivery Note Spreadsheet"
                    :font-scale="1"
                    :url="
                      `/spreadsheet?delivery-challan-cancelled&inputdate=${this.filters.range.to}&inout=15&del_cancelled_type=All`
                    "
                    :toggle-flag="toggleFlag"
                    :message-from-parent="parentMessage"
                  />
                </b-button-group>
              </div>
              <!-- Table Column Chooser -->
              <b-collapse v-model="isSortingOpen">
                <b-card
                  no-body
                  class="float-right w-100 mt-2"
                  :style="{
                    'max-width': '450px',
                  }"
                  id="list-sort"
                >
                  <b-card-body class="p-2">
                    <b v-translate>Sorting Options</b>
                    <hr class="mx-0 mt-0 mb-2">
                    <div class="container">
                      <b-row>
                        <b-col class="px-1">
                          <b-form-select
                            v-model="sortByColumn"
                            text-field="label"
                            :options="[
                              {label: 'Default', value: 'id'},
                              ...activeTabOptions.options.columns,
                            ]"
                            placeholder="Field"
                          />
                        </b-col>
                        <b-col class="px-0">
                          <b-form-select
                            v-model="sortDesc"
                            :options="[
                              {text: 'Ascending', value: false},
                              {text: 'Descending', value: true},
                            ]"
                            placeholder="Order"
                          />
                        </b-col>
                      </b-row>
                    </div>
                    <hr class="mx-0 my-2">
                    <b-button
                      @click="resetSorting"
                      class="mx-1 pr-3"
                      size="sm"
                      variant="secondary"
                    >
                      <b-icon icon="arrow-clockwise" />
                      Reset
                    </b-button>
                    <b-button
                      class="mx-1 pr-3"
                      size="sm"
                      variant="danger"
                      @click="isSortingOpen = false"
                    >
                      <b-icon icon="x" />
                      Close
                    </b-button>
                  </b-card-body>
                </b-card>
              </b-collapse>
              <!-- Filter menu Collapsable card -->
              <b-collapse v-model="isFilterOpen">
                <b-card
                  no-body
                  class="w-100 mt-2"
                  id="list-filter"
                >
                  <b-card-body class="p-2">
                    <b v-translate> Filter By </b>
                    <hr class="mx-0 my-1">
                    <div class="my-2 ml-1">
                      <b-form-checkbox-group
                        id="checkbox-group-2"
                        v-model="filters.active"
                        name="flavour-2"
                      >
                        <b-form-checkbox
                          v-for="(filter, findex) in activeTabOptions.filterBy.value"
                          :key="findex"
                          :value="findex"
                        >
                          {{ filter.text }}
                        </b-form-checkbox>
                      </b-form-checkbox-group>
                      <b-form-checkbox
                        v-if="activeWorkflow.tabName === 'Voucher'"
                        v-model="allSelected"
                        aria-describedby="flavours"
                        aria-controls="flavours"
                        @change="toggleAll"
                      >
                        All
                      </b-form-checkbox>
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
                              />
                              <b-input-group-append>
                                <b-form-datepicker
                                  button-only
                                  v-model="filters.range.from"
                                  size="sm"
                                  right
                                  :min="yearStart"
                                  :max="yearEnd"
                                  locale="en-IN"
                                />
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
                              />
                              <b-input-group-append>
                                <b-form-datepicker
                                  button-only
                                  v-model="filters.range.to"
                                  size="sm"
                                  right
                                  :min="filters.range.from"
                                  :max="yearEnd"
                                  locale="en-IN"
                                />
                              </b-input-group-append>
                            </b-input-group>
                          </b-col>
                        </b-row>
                      </div>
                    </b-form-group>
                    <hr class="mx-0 mb-2">
                    <div>
                      <b-button
                        @click="resetFilter"
                        class="mx-1 pr-3"
                        size="sm"
                        variant="secondary"
                      >
                        <b-icon icon="arrow-clockwise" />
                        Reset
                      </b-button>
                      <b-button
                        @click="(isFilterOpen = false) && resetFilter"
                        class="mx-1 pr-3"
                        size="sm"
                        variant="danger"
                      >
                        <b-icon icon="x" />
                        Close
                      </b-button>
                    </div>
                  </b-card-body>
                </b-card>
              </b-collapse>
            </div>
          </b-card-header>
          <!-- Worflow Data List -->

          <!-- Workflow Data List Start -->
          <div
            v-for="(tab, tabName) in allTabs"
            :key="tabName"
            :class="{'d-none': activeWorkflow.tabName !== tabName}"
          >
            <b-table
              class="text-small print-table-border-dark"
              thead-class="d-none"
              tbody-tr-class="bs-row"
              responsive=""
              :sticky-header="`${listHeight}px`"
              :fields="activeTabOptions.fields"
              :items="activeTabOptions.data"
              :style="{'min-height': `${listHeight}px`}"
              selectable
              select-mode="single"
              @row-selected="setSelectedEntity"
              :ref="`list-${tabName}`"
              :id="`list-${tabName}`"
              :filter="
                activeTabOptions.data.length &&
                  activeWorkflow.tabName === tabName
                  ? (search || ' ')
                  : null
              "
              :filter-function="customFilter"
              :sort-by="sortByColumn"
              :sort-desc="sortDesc"
            >
              <!-- Contact list -->
              <template #cell(custname)="data">
                <div class="clearfix">
                  <div class="w-50 float-left">
                    <span v-if="data.item.custname">
                      {{ data.item.custname }}
                      <br>
                    </span>
                  </div>
                  <div class="w-50 float-right text-right">
                    <h5 class="mt-1">
                      {{ `₹${data.item.balance}` }}
                    </h5>
                  </div>
                </div>
              </template>
              <template #cell(dateObj)="data">
                <div class="clearfix">
                  <div class="w-50 float-left">
                    <span v-if="data.item.text1">
                      {{ data.item.text1 }}
                      <br>
                    </span>
                    <h6>
                      <b-badge
                        pill
                        variant="info"
                      >
                        {{ data.item.no }}
                      </b-badge>
                    </h6>
                  </div>
                  <div class="w-50 float-right text-right text-muted ">
                    {{ data.item.date }}
                  </div>
                  <br>
                  <div class="w-50 float-right text-right">
                    <h5 class="mt-1">
                      {{ data.item.text2?.toString().replace(/\s/g, "") }}
                    </h5>
                  </div>
                </div>
              </template>
            </b-table>
          </div>
          <!-- Workflow Data List End -->
        </b-card>
      </b-col>
      <!-- Right Pane: Selected Workflow item's Data  -->
      <b-col
        cols="12"
        md="8"
        lg="9"
        ref="col-right"
        class="d-none d-md-block"
      >
        <!-- Customer / Supplier profile -->
        <b-card
          no-body
          :style="{height: '100%', overflowY: 'auto'}"
          class="ml-md-2"
          v-if="
            selectedEntity &&
              !selectedEntity.gsflag &&
              activeWorkflow.name === 'Contacts'
          "
        >
          <template
            #header
            v-if="selectedEntity !== null"
          >
            <b-button
              @click.prevent="unsetSelectedEntity"
              class="d-md-none"
            >
              <b-icon icon="arrow-left" />
            </b-button>
            <h5 class="m-2 d-inline-block">
              <b-icon
                class="mr-1"
                :icon="selectedEntity.icon"
              />
              {{ selectedEntity.custname }}'s Profile
            </h5>
          </template>
          <b-card-body
            class="p-0"
            :style="{height: rightPaneHeight + 'px', overflowY: 'auto'}"
            v-if="selectedEntity !== null"
          >
            <contact-profile
              :customer="selectedEntity"
              :key="selectedEntity.custid"
              :on-update="onSelectedEntityUpdate"
            />
          </b-card-body>
        </b-card>
        <!-- Goods / Services Profile -->
        <b-card
          no-body
          :style="{height: '100%', overflowY: 'auto'}"
          class="ml-md-2"
          v-if="
            selectedEntity &&
              selectedEntity.gsflag &&
              activeWorkflow.name === 'Business'
          "
        >
          <template
            #header
            v-if="selectedEntity !== null"
          >
            <b-button
              @click.prevent="unsetSelectedEntity"
              class="d-md-none"
            >
              <b-icon icon="arrow-left" />
            </b-button>
            <h5 class="m-2 d-inline-block">
              <b-icon
                class="mr-1"
                :icon="selectedEntity.icon"
              />
              {{ selectedEntity.productdesc }} Details
            </h5>
          </template>
          <b-card-body
            class="p-0"
            :style="{height: rightPaneHeight + 'px', overflowY: 'auto'}"
            v-if="selectedEntity !== null"
          >
            <business-profile
              :name="selectedEntity"
              :key="selectedEntity.srno"
              :on-update="onSelectedEntityUpdate"
            />
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
          <template
            #header
            v-if="selectedEntity !== null"
          >
            <b-button
              @click.prevent="unsetSelectedEntity"
              class="d-md-none float-left"
              size="sm"
            >
              <b-icon icon="arrow-left" />
            </b-button>
            <h5 class="ml-3 mb-0">
              <b-icon
                class="mr-1"
                :icon="selectedEntity.icon"
              />
              {{ selectedEntity.noteName }} :
              <br class="d-none d-lg-inline-block">
              {{ selectedEntity.no }}
            </h5>
            <div v-if="usePrintTriplicate">
              <b-button
                class="float-right"
                v-b-toggle.p-collapse
                size="sm"
                variant="link"
              >
                <b-icon
                  aria-hidden="true"
                  class="align-middle"
                  icon="printer"
                />
                <span class="sr-only">Print</span>
              </b-button>
              <div class="clearfix" />
              <b-collapse id="p-collapse">
                <print-helper
                  content-id="transaction-profile-wrapper"
                  variant="link"
                  text-mode="Original"
                  :page-title="getInvoiceTitle('orginal')"
                  file-name="Tax_Invoice_For_Recipient"
                  :message-from-parent="printMessage"
                />
                <print-helper
                  content-id="transaction-profile-wrapper"
                  variant="link"
                  text-mode="Duplicate"
                  :page-title="getInvoiceTitle('duplicate')"
                  file-name="Tax_Invoice_For_Transporter"
                  :message-from-parent="printMessage"
                />
                <print-helper
                  content-id="transaction-profile-wrapper"
                  variant="link"
                  text-mode="Triplicate"
                  :page-title="getInvoiceTitle('triplicate')"
                  file-name="Tax_Invoice_For_Supplier"
                  :message-from-parent="printMessage"
                />
              </b-collapse>
            </div>
            <print-helper
              v-else
              content-id="transaction-profile-wrapper"
              variant="link"
              :page-title="selectedEntity.noteName"
              :file-name="selectedEntity.noteName"
              :message-from-parent="printMessage"
            />
          </template>
          <b-card-body
            class="px-0"
            :style="{height: rightPaneHeight + 'px', overflowY: 'auto'}"
            v-if="selectedEntity !== null"
          >
            <div id="transaction-profile-wrapper">
              <report-header class="mb-4" />
              <transaction-profile
                :name="activeWorkflow.tabName"
                :id="selectedEntity.id"
                :pdata="profileData"
                :on-update="onSelectedEntityUpdate"
              />
            </div>
          </b-card-body>
        </b-card>
        <!-- Body -->
      </b-col>
    </b-row>
  </section>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import { isNavigationFailure, NavigationFailureType } from 'vue-router';

import ContactConf from '../js/config/workflow/contacts.js';
import BusinessConf from '../js/config/workflow/business.js';
import TransactionConf from '../js/config/workflow/transactions.js';

import ContactProfile from '@/components/ContactProfile';
import BusinessProfile from '@/components/BusinessProfile.vue';
import TransactionProfile from '@/components/workflow/profile/Transaction.vue';
import ReportHeader from '@/components/ReportHeader.vue';
import PrintHelper from '@/components/PrintHelper.vue';

import GkFileDownload from '@/components/GkFileDownload.vue';

import printMixin from '@/mixins/print.js';
import exportMixin from '@/mixins/export.js';

export default {
  name: 'Workflow',
  components: {
    ContactProfile,
    BusinessProfile,
    TransactionProfile,
    ReportHeader,
    PrintHelper,
    GkFileDownload,
  },
  mixins: [printMixin, exportMixin],
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
      validator: function() {
        return true;
      },
    },
    wfType: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      allSelected: false,
      parentMessage: 'toggleFlagTrue',
      printMessage: 'toggleFlagPrintTrue',
      leftHeaderHeight: {
        min: 63,
        max: 0,
      },
      listHeight: 0,
      tabChoice: 0,
      isPreloading: false,
      isLoading: false,
      isSubMenuOpen: false,
      isSortingOpen: false,
      activeWorkflow: {
        index: null,
        icon: '',
        name: '',
        id: -1,
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
      search: '',
      sortByColumn: 'id',
      sortDesc: true,
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
        },
      },
    };
  },
  watch: {
    'filters.active': {
      handler() {
        this.updateIndeterminate();
      },
      deep: true,
    },
    wfName: function(wfname) {
      // Run when visiting a workflow page using URL, when already in a workflow page
      if (this.activeWorkflow.name !== wfname) {
        this.autoSetActiveWorkflow();
      }
    },
    wfType() {
      this.autoSetActiveWorkflow(true);
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
      }, 650);
    },
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    invoiceTitleText: (self) => (
      (self.isGstEnabled || self.isVatEnabled)
        ? 'Tax Invoice'
        : 'Invoice'
    ),
    usePrintTriplicate: (self) =>
      ['Invoice', 'CashMemo', 'DeliveryNote'].indexOf(
        self.activeWorkflow.tabName
      ) > -1,
    fileName: (self) => {
      return {
        list: `${self.activeWorkflow.name}-List`,
        profile: `${self.activeWorkflow.name}-Profile`,
      };
    },
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
        data = {
          cancelledFlag: entity.cancelledFlag,
          unbilledFlag: entity.unbilledFlag,
          invLinkedFlag: entity.invLinkedFlag,
        };
        break;
      case 'PurchaseSalesOrder':
        break;
      case 'TransferNote':
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
      if (self.activeWorkflow.name.includes('-')) {
        const name = self.activeWorkflow.name.split('-');
        return self.options.tabs[name[0]].tabs[name[1]];
      }
      return self.options.tabs[self.activeWorkflow.name];
    },
    // headerHeight is the height of the top nav bar
    headerHeight: () => document.getElementById('app-header').offsetHeight,

    rightPaneHeight: (self) =>
      window.innerHeight - (self.headerHeight + self.leftHeaderHeight.min + 55), // 55 is the remaining vertical space in the screen

    ...mapState(['yearStart', 'yearEnd', 'orgCode', 'orgName']),
  },
  methods: {
    getFormPath() {
      const formPath = this.activeTabOptions.createNewPath;
      if (this.wfType) {
        formPath.query = { type: this.wfType };
      }
      return formPath;
    },
    getInvoiceTitle(invoiceType) {
      const _invoiceType = invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1);
      return (
        `<div class="text-center">
          ${this.invoiceTitleText} - ${_invoiceType} for Recipient
        </div>`
      );
    },
    toggleAll() {
      if (this.allSelected) {
        this.filters.active = this.activeTabOptions.filterBy.value.map((_, index) => index);
      } else {
        this.filters.active = [];
      }
    },
    updateIndeterminate() {
      const allSelected = this.filters.active.length === this.activeTabOptions.filterBy.value.length;
      this.allSelected = allSelected;
    },
    toggleFlag() {
      this.isFilterOpen = false;
      this.isSortingOpen = false;
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
    resetSorting() {
      this.sortByColumn = 'id',
      this.sortDesc = true;
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

      //sets the props object, which contains the key's value to perform the range filter
      if (this.activeTabOptions.filterBy.range.length) {
        this.filters.range.props = Object.assign(
          {},
          this.activeTabOptions.filterBy.range[0].props || {}
        );
      }
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
    customFilter(row, filter) {
      let hasSearchTerm = true;
      let withinDateRange = true;
      let hasSelectedItem = true;
      if (filter && filter !== ' ') {
        const rowString = Object.values(row).join('').toLowerCase();
        const filterString = filter.toLowerCase();
        hasSearchTerm = rowString.includes(filterString);
      }
      if (row.noteName !== 'Transfer Note' && row.noteName !== 'Cash Memo') {
        const self = this;
        if (this.filters.active.length) {
          let filters = this.filters.active.map((filterIndex) =>
            filterIndex >= 0
              ? self.activeTabOptions.filterBy.value[filterIndex].props || null
              : null
          );
          hasSelectedItem = this.filterByValue(row, filters);
        }
      }
      if (this.filters.range.props.key !== undefined) {
        withinDateRange = this.filterByRange(
          row,
          this.filters.range.props.key,
          // Convert "yyyy-mm-dd" to a format that can be compared with logical operators
          Date.parse(this.filters.range.from),
          Date.parse(this.filters.range.to)
        );
      }
      const includeRow = hasSearchTerm && hasSelectedItem && withinDateRange;
      return includeRow;
    },
    /**
     * setActiveWorkflow(index, name, icon)
     *
     * Description: As the name suggests it stores the details about the active workflow.
     * Also initializes the filters and sorts, after that.
     */
    setActiveWorkflow(index, name, icon, skipUpdate, reset) {
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
      this.isFilterOpen = false;
      this.leftHeaderHeight.max = 0;
      this.unsetSelectedEntity();
      this.activeWorkflow = {
        index,
        name,
        icon,
        color: color,
        tabName,
        id: skipUpdate ? this.activeWorkflow.id : -1,
      };
      this.resetFilter();
      const self = this;
      if (reset) {
        activeWorkflow.data = [];
      }
      if (!activeWorkflow.data.length) {
        this.isLoading = true;
        activeWorkflow.initListColumns(this.orgCode);
        this.$nextTick(() => {
          self.listSettings.columns = activeWorkflow.fields.map((col) => {
            return col.key;
          });
        });
        return activeWorkflow
          .loadList({
            wfType: this.wfType,
            yearStart: this.yearStart,
            yearEnd: this.yearEnd
          })
          .then((resp) => {
            activeWorkflow.data = resp;
            self.isLoading = false;
            if (parseInt(self.activeWorkflow.id) == -1) {
              self.selectFirstListItem();
              self.updateUrl();
            }
            return true;
          })
          .catch((e) => {
            console.error(e);
            self.isLoading = false;
          });
      } else {
        // select first item only if wfId = -1, i.e. nothing is selected
        if (parseInt(self.activeWorkflow.id) == -1) {
          self.selectFirstListItem();
          self.updateUrl();
        }
      }
    },
    /** Sets the active workflow based on the URL props */
    autoSetActiveWorkflow(reset=false) {
      let self = this;
      let tab, index;
      let setActiveWorkflow;
      this.activeWorkflow.id = this.wfId || -1;
      if (this.wfName.includes('-')) {
        let name = this.wfName.split('-');
        tab = this.options.tabs[name[0]].tabs[name[1]];
        index = Object.keys(this.options.tabs[name[0]]).indexOf(name[1]);
        setActiveWorkflow = this.setActiveWorkflow(
          index,
          { parent: name[0], child: name[1] },
          tab.icon,
          true,
          reset,
        );
      } else {
        tab = this.options.tabs[this.wfName];
        index = Object.keys(this.options.tabs).indexOf(this.wfName);
        setActiveWorkflow = this.setActiveWorkflow(
          index,
          this.wfName,
          tab.icon,
          true,
          reset,
        );
      }
      if (!this.is_mobile() || parseInt(this.wfId) !== -1) {
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
      if (!this.is_mobile()) {
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
      if (!entity[0]) return;

      this.selectedEntity = entity[0];
      if (this.$refs['col-left'])
        this.$refs['col-left'].classList.remove('d-block');
      if (this.$refs['col-right'])
        this.$refs['col-right'].classList.add('d-block');
      let key = this.activeTabOptions.uidKey;
      let wfId = this.selectedEntity ? this.selectedEntity[key] || -1 : -1;
      this.activeWorkflow.id = wfId;
      this.updateUrl();
      if (this.isPageFresh) {
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
      if (url != window.location.href) {
        this.$router.replace({
          name: 'Workflow',
          params: { wfName: wfName, wfId: wfId },
          query: { type: this.wfType },
        })
        .catch((err) => {
          // Ignore NavigationDuplicated error
          // For more details, refer https://stackoverflow.com/a/66861102
          if (isNavigationFailure(err, NavigationFailureType.duplicated)) {
            return;
          }
        });
      }
    },
    unsetSelectedEntity() {
      const self = this;
      this.selectedEntity = null;
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
      case 'Transactions-DeliveryNote':
        {
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
        break;
      case 'Contacts':
        {
          if (updatedData.type === 'update') {
            Object.assign(this.selectedEntity, updatedData.data);
          } else if (updatedData.type === 'delete') {
            let id = this.selectedEntity.custid;
            let index = this.activeTabOptions.data.findIndex(
              (item) => item.custid === id
            );
            this.displayToast(
              `Contact Delete success!`,
              `Contact : ${this.selectedEntity.custname}, deleted successfully.`,
              'success'
            );
            this.unsetSelectedEntity();
            this.activeTabOptions.data.splice(index, 1);
          }
        }
        break;
      case 'Business': {
                         if (updatedData.type === 'update') {
                           Object.assign(this.selectedEntity, updatedData.data);
                         } else if (updatedData.type === 'delete') {
                           this.displayToast(
                             `Business Item Delete success!`,
                             `Business Item : ${this.selectedEntity.productdesc}, deleted successfully.`,
                             'success'
                           );
                           let id = this.selectedEntity.productcode;
                           let index = this.activeTabOptions.data.findIndex(
                             (item) => item.productcode === id
                           );
                           this.unsetSelectedEntity();
                           this.activeTabOptions.data.splice(index, 1);
                         }
                       }
                       break;
      case 'Transactions-Invoice': {
        if (updatedData.gkstatus === 3) {
          // if the invoice cancel after update, gkstatus will be 3
          this.selectedEntity.deletedFlag = true;
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
        .get('/product')
        .then((res) => {
          this.filterProducts(res.data.gkresult);
          this.isLoading = false;
        })
        .catch((error) => {
          console.error(error);
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
            ? table?.sortedItems.findIndex((item) => item[key] === wfId)
            : 0;
        if (entityIndex >= 0) {
          self.selectedEntityIndex = entityIndex;
          table.clearSelected();
          table.selectRow(entityIndex);
        }
      });
    },
    exportAsSpreadsheet() {
      let url = '/spreadsheet';
      const wfName = this.activeWorkflow.name;
      if (wfName === 'Business') {
        url += `?pslist&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`;
      } else if (wfName === 'Transactions-Invoice') {
        if (this.filters.active.length == 1) {
          if (this.filters.active[0] == 1) {
            url += `?invoice-outstanding&fromdate=${this.dateReverse(this.filters.range.from,)}&todate=${this.dateReverse(this.filters.range.to,)}&inoutflag=15&orderflag=1&typeflag=4`;
          }
          if (this.filters.active[0] == 2) {
            url += `?invoice-cancelled&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}&fromdate=${this.filters.range.from}&todate=${this.filters.range.to}&flag=0&type=invoice_list`;
          }
        } else {
          url += `?invoice-list&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}&fromdate=${this.filters.range.from}&todate=${this.filters.range.to}&flag=0&type=invoice_list`;
        }
      } else if (wfName === 'Transactions-TransferNote') {
        url += `?transfer-notes&startdate=${this.dateReverse(this.filters.range.from,)}&enddate=${this.dateReverse(this.filters.range.to)}`;
      }
      this.exportFile(url);
    },
  },
  mounted() {
    this.updateListHeight();
    this.autoSetActiveWorkflow();
  },
  destroyed() {
    this.options.tabs['Contacts'].data = [];
    this.options.tabs['Business'].data = [];
    this.options.tabs['Transactions'].tabs['Invoice'].data = [];
    this.options.tabs['Transactions'].tabs['DebitCreditNote'].data = [];
    this.options.tabs['Transactions'].tabs['CashMemo'].data = [];
    this.options.tabs['Transactions'].tabs['DeliveryNote'].data = [];
    this.options.tabs['Transactions'].tabs['PurchaseSalesOrder'].data = [];
    this.options.tabs['Transactions'].tabs['TransferNote'].data = [];
    this.options.tabs['Transactions'].tabs['Voucher'].data = [];
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

.selected-data-list {
  border: 2px solid black;
  background-color: #f3f3f3;
}
</style>
