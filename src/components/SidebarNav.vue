<template>
  <b-nav
    id="main-nav"
    class="bg-light text-dark flex-column"
    pills
    vertical
  >
    <div id="nav-body-wrapper" class="pl-2">
      <div
        v-if="userRole == -1"
        role="button"
        @click="$store.commit('toggleSearchMenu', !searchMenu)"
        class="my-3 mx-2"
      >
        <b-icon
          class="mr-1"
          icon="search"
        />
        Search Menu
      </div>
      <template v-if="userRole == -1">
        <!-- Sales -->
        <div
          v-b-toggle.sales
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="basket"
            />
            <translate>Sales</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="
              collapsed.sales ? 'chevron-compact-down' : 'chevron-compact-right'
            "
          />
        </div>
        <b-collapse
          v-model="collapsed.sales"
          id="sales"
        >
          <b-nav-item
            :active="isActiveWorkflow('Transactions-Invoice', 'sale')"
            :to="{
              name: 'Workflow',
              params: {
                wfName: 'Transactions-Invoice',
                wfId: -1,
              },
              query: {
                type: 'sale',
              },
            }"
          >
            <b-icon icon="receipt" />
            <translate>Sales Invoices</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Transactions-PurchaseSalesOrder', 'sale')"
            to="/workflow/Transactions-PurchaseSalesOrder/-1?type=sale"
          >
            <b-icon icon="receipt" />
            <translate>Sales Order</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Contacts', 'customer')"
            to="/workflow/Contacts/-1?type=customer"
          >
            <b-icon icon="person-lines-fill" />
            <translate>Customers</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Transactions-CashMemo')"
            to="/workflow/Transactions-CashMemo/-1"
          >
            <b-icon icon="receipt" />
            <translate>Point of Sales</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Transactions-DebitCreditNote', 'sale')"
            to="/workflow/Transactions-DebitCreditNote/-1?type=sale"
          >
            <b-icon icon="receipt" />
            <translate>Debit/Credit Note</translate>
          </b-nav-item>
        </b-collapse>
      </template>

      <template v-if="userRole == -1">
        <!-- Purchase -->
        <div
          v-b-toggle.purchases
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="basket2"
            />
            <translate>Purchases</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="
              collapsed.purchases ? 'chevron-compact-down' : 'chevron-compact-right'
            "
          />
        </div>
        <b-collapse
          v-model="collapsed.purchases"
          id="purchases"
        >
          <b-nav-item
            :active="isActiveWorkflow('Transactions-Invoice', 'purchase')"
            :to="{
              name: 'Workflow',
              params: {
                wfName: 'Transactions-Invoice',
                wfId: -1,
              },
              query: {
                type: 'purchase',
              },
            }"
          >
            <b-icon icon="receipt" />
            <translate>Purchase Invoices</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Transactions-PurchaseSalesOrder', 'purchase')"
            to="/workflow/Transactions-PurchaseSalesOrder/-1?type=purchase"
          >
            <b-icon icon="receipt" />
            <translate>Purchase Orders</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Contacts', 'supplier')"
            to="/workflow/Contacts/-1?type=supplier"
          >
            <b-icon icon="person-lines-fill" />
            <translate>Suppliers</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Transactions-DebitCreditNote', 'purchase')"
            to="/workflow/Transactions-DebitCreditNote/-1?type=purchase"
          >
            <b-icon icon="receipt" />
            <translate>Debit/Credit Note</translate>
          </b-nav-item>
        </b-collapse>
      </template>

      <template v-if="userRole == -1">
        <!-- Banking -->
        <div
          v-b-toggle.banking
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="bank"
            />
            <translate>Banking</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="
              collapsed.banking ? 'chevron-compact-down' : 'chevron-compact-right'
            "
          />
        </div>
        <b-collapse
          v-model="collapsed.banking"
          id="banking"
        >
          <b-nav-item
            :active="isActive('/bank-recon')"
            to="/bank-recon"
          >
            <b-icon icon="journals" />
            <translate>Reconciliation</translate>
          </b-nav-item>
        </b-collapse>
      </template>

      <template v-if="userRole == -1">
        <!-- Accounting -->
        <div
          v-b-toggle.accounting
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="journal-text"
            />
            <translate>Accounting</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="
              collapsed.accounting ? 'chevron-compact-down' : 'chevron-compact-right'
            "
          />
        </div>
        <b-collapse
          v-model="collapsed.accounting"
          id="accounting"
        >
          <b-nav-item
            :active="isActiveWorkflow('Transactions-DeliveryNote')"
            to="/workflow/Transactions-DeliveryNote/-1"
          >
            <b-icon icon="receipt" />
            <translate>Delivery Note</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActiveWorkflow('Transactions-Voucher')"
            to="/workflow/Transactions-Voucher/-1"
          >
            <b-icon icon="receipt" />
            <translate>Vouchers</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/accounts')"
            to="/accounts"
          >
            <b-icon icon="files-alt" />
            <translate>Chart of Accounts</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/sub-groups')"
            to="/sub-groups"
          >
            <b-icon icon="files-alt" />
            <translate>Account Groups</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/billwise/3/-1')"
            :to="{
              name: 'Billwise',
              params: {custType: 3, custName: '-1'},
            }"
          >
            <b-icon icon="clipboard" />
            <translate>Adjust Bills</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/closebooks')"
            to="/closebooks"
          >
            <b-icon icon="journals" />
            <translate>Close Books</translate>
          </b-nav-item>
        </b-collapse>
      </template>

      <template v-if="userRole == -1">
        <!-- Products and Services -->
        <div
          v-b-toggle.business
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="box"
            />
            <translate>Products and Services</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="
              collapsed.business ? 'chevron-compact-down' : 'chevron-compact-right'
            "
          />
        </div>
        <b-collapse
          v-model="collapsed.business"
          id="business"
        >
          <b-nav-item
            :active="isActiveWorkflow('Business')"
            to="/workflow/Business/-1"
          >
            <b-icon icon="box" />
            <translate>Products and Services</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/godowns')"
            to="/godowns"
          >
            <b-icon icon="building" />
            <translate>Godowns</translate>
          </b-nav-item>
          <b-nav-item
            v-if="userRole == -1 || 0"
            :active="isActive('/uom')"
            to="/uom"
          >
            <b-icon icon="thermometer" />
            <translate>Unit of measurement</translate>
          </b-nav-item>
        </b-collapse>
      </template>

      <template v-if="userRole == -1 || userRole == 0">
        <!-- Admin -->
        <div
          v-b-toggle.admin
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="gear"
            />
            <translate>Administration</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="collapsed.admin ? 'chevron-compact-down' : 'chevron-compact-right'"
          />
        </div>
        <b-collapse
          v-model="collapsed.admin"
          id="admin"
        >
          <b-nav-item to="/orgprofile">
            <b-icon icon="building" /> <translate>Organisation Profile</translate>
          </b-nav-item>
          <b-nav-item to="/users">
            <b-icon icon="people" /><translate>Manage Users</translate>
          </b-nav-item>
          <b-nav-item to="/logs">
            <b-icon icon="card-checklist" /><translate>Audit Logs</translate>
          </b-nav-item>
          <b-nav-item to="/data/import">
            <b-icon icon="download" /><translate>Import Data</translate>
          </b-nav-item>
          <b-nav-item to="/data/export">
            <b-icon icon="upload" /><translate>Export Data</translate>
          </b-nav-item>
          <b-nav-item to="/settings">
            <b-icon icon="gear" /> <translate>Settings</translate>
          </b-nav-item>
        </b-collapse>
      </template>

      <template v-if="userRole == -1">
        <!-- Reports -->
        <!-- only admin role can access reports -->
        <div
          v-b-toggle.reports
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="file-bar-graph"
            />
            <translate>Reports</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="
              collapsed.reports ? 'chevron-compact-down' : 'chevron-compact-right'
            "
          />
        </div>
        <b-collapse
          v-model="collapsed.reports"
          id="reports"
        >
          <b-nav-item
            :active="isActive('/product-register')"
            to="/product-register"
          >
            <b-icon icon="box-seam" />
            <translate>Product Register</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/registers')"
            to="/registers"
          >
            <b-icon icon="receipt" />
            <translate>View Registers</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/stock-on-hand')"
            to="/stock-on-hand"
          >
            <b-icon icon="receipt" />
            <translate>Stock On Hand</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/profit-loss')"
            to="/profit-loss"
          >
            <b-icon icon="graph-up" />
            <translate v-if="orgType == 'Profit Making'">
              Profit & Loss
            </translate>
            <translate v-else>
              Income & Expenditure
            </translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/cash-flow')"
            to="/cash-flow"
          >
            <b-icon icon="wallet" />
            <translate>Cash Flow</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/trial-balance')"
            to="/trial-balance"
          >
            <b-icon icon="wallet" />
            <translate>Trial Balance</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/ledger')"
            to="/ledger"
          >
            <b-icon icon="journals" />
            <translate>Ledger</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/balance-sheet')"
            to="/balance-sheet"
          >
            <b-icon icon="journals" />
            <translate v-if="orgType == 'Profit Making'">
              Balance Sheet
            </translate>
            <translate v-else>
              Statement Of Affairs
            </translate>
          </b-nav-item>
        </b-collapse>
      </template>

      <template v-if="isGstEnabled && (userRole == -1 || userRole == 0)">
        <!-- GST -->
        <div
          v-b-toggle.gst
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="cash-stack"
            />
            <span>GST<b-badge pill>WIP</b-badge></span>
          </div>
          <b-icon
            class="ml-1"
            :icon="collapsed.gst ? 'chevron-compact-down' : 'chevron-compact-right'"
          />
        </div>
        <b-collapse
          v-model="collapsed.gst"
          id="gst"
        >
          <div class="ml-3">
            <small v-if="!gstinValid">
              * Update
              <b><i>Administration -> Organisation Profile </i></b> with a
              valid GSTIN to access the GST reports
            </small>
          </div>
          <b-nav-item
            :disabled="!gstinValid"
            :active="isActive('/gst/r1')"
            to="/gst/r1"
          >
            <b-icon icon="file-earmark" />
            <translate>R1 Report</translate>
          </b-nav-item>
          <b-nav-item
            :active="isActive('/gst/news')"
            to="/gst/news"
          >
            <b-icon icon="newspaper" />
            <translate>GST News</translate>
            <b-icon
              v-if="newGstNews"
              icon="bell-fill"
              variant="warning"
              class="ml-1 pt-1"
              animation="pulse"
            />
          </b-nav-item>
        </b-collapse>
      </template>

      <template>
        <!-- Help -->
        <div
          v-b-toggle.help
          class="my-3 mx-2 d-flex justify-content-between"
        >
          <div>
            <b-icon
              class="mr-1"
              icon="exclamation-circle"
            />
            <translate>Help</translate>
          </div>
          <b-icon
            class="ml-1"
            :icon="collapsed.help ? 'chevron-compact-down' : 'chevron-compact-right'"
          />
        </div>
        <b-collapse
          v-model="collapsed.help"
          id="help"
        >
          <b-nav-item
            :active="isActive('/about')"
            to="/about"
            class="mr-3"
          >
            <b-icon icon="info-circle" />
            <translate>About</translate>
          </b-nav-item>
          <b-nav-item
            class="mr-3"
            target="_blank"
            href="https://gnukhata.org"
          >
            <b-icon icon="globe" />
            <translate>Website</translate>
          </b-nav-item>
          <b-nav-item
            class="mr-3"
            target="_blank"
            href="https://gitlab.com/gnukhata"
          >
            <b-icon icon="code" />
            <translate>Source Code</translate>
          </b-nav-item>
          <b-nav-item
            class="mr-3"
            :active="isActive('/report-bug')"
            to="/report-bug"
          >
            <b-icon icon="bug" />
            <translate>Report Bug</translate>
          </b-nav-item>

          <b-nav-item
            class="mr-3"
            target="_blank"
            href="https://gnukhata.org/faq"
          >
            <b-icon icon="question-circle" />
            <translate>FAQ</translate>
          </b-nav-item>
        </b-collapse>
      </template>
    </div>
  </b-nav>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
  name: 'SidebarNav',
  data() {
    return {
      collapsed: {},
    };
  },
  computed: {
    ...mapGetters('global', ['isGstEnabled']),
    ...mapState([
      'searchMenu',
      'newGstNews',
      'orgGstin',
      'orgType',
      'userRole',
    ]),
    gstinValid: (self) => !!self.orgGstin,
  },
  methods: {
    isActive(url, exactMatch=false) {
      const { path, fullPath } = this.$route;
      if (exactMatch) {
        return url === fullPath;
      }
      return url === path;
    },
    isActiveWorkflow(slug, type) {
      const { params, query } = this.$route;
      let isActiveRoute = slug === params.wfName;
      if (type) {
        isActiveRoute &&= query.type === type;
      }
      return isActiveRoute;
    },
  },
};
</script>

<style>
#main-nav {
  min-height: 100vh;
  border-right: 1px solid #d8d8d8;
}
@media (min-width: 1200px) {
  #main-nav {
    height: 100%;
  }
  #nav-body-wrapper {
    max-height: 100vh;
    overflow-y: auto;
  }
}
.nav-link {
  color: inherit;
  text-decoration: none;
}
.nav-link:hover {
  color: #000000;
}
</style>
