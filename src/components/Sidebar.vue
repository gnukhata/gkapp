<template>
  <section>
    <b-button
      size="lg"
      class="d-print-none p-0 mr-2 mt-1 bordered"
      variant="light"
      title="Open Sidebar"
      :lazy="true"
      v-b-toggle.sidebar
    >
      <b-icon icon="list"></b-icon>
    </b-button>
    <b-sidebar width="15em" v-model="opened" id="sidebar" shadow backdrop>
      <template #title>
        <div class="d-flex">
          <img
            src="../../public/img/gk.svg"
            width="30px"
            height="30px"
            class="ml-4 mt-1"
            alt="GNUKhata Logo"
          />
          <div style="font-size: 0.8em" class="font-weight-normal mt-1 ml-1">
            <translate> GNUKhata </translate>
          </div>
        </div>
        <!-- <b-badge class="m-0" variant="danger" pill>{{ app_version }}</b-badge> -->
      </template>
      <hr class="m-0" />
      <template>
        <!-- <div class="ml-2 mr-2">
               <b-input size="sm" placeholder="search"></b-input>
               </div> -->
        <b-nav class="text-small text-dark col">
          <div
            v-if="userRole == -1"
            role="button"
            @click="$store.commit('toggleSearchMenu', !searchMenu)"
            class="text-center mr-5 ml-3 mt-3"
          >
            <b-icon icon="search"></b-icon>
            Search Menu
          </div>
          <!-- master -->
          <div v-if="userRole == -1">
            <h6 v-b-toggle.master class="text-center mr-5 ml-3 mt-3">
              <b-icon
                :icon="
                  collapsed.master ? 'caret-down-fill' : 'caret-right-fill'
                "
                class="text-right"
              ></b-icon>
              <translate>Workflow</translate>
            </h6>
            <b-collapse v-model="collapsed.master" id="master">
              <!-- Transactions -->
              <h6 v-b-toggle.invoice class="ml-4">
                <b-icon
                  :icon="
                    collapsed.invoice ? 'caret-down-fill' : 'caret-right-fill'
                  "
                ></b-icon>
                <translate>Transactions</translate>
              </h6>
              <b-collapse v-model="collapsed.invoice" id="invoice">
                <div class="ml-3">
                  <b-nav-item
                    :to="{
                      name: 'Workflow',
                      params: {
                        wfName: 'Transactions-Invoice',
                        wfId: -1,
                      },
                    }"
                    ><b-icon icon="receipt"></b-icon
                    ><translate> Invoice</translate>
                  </b-nav-item>
                  <b-nav-item to="/workflow/Transactions-DebitCreditNote/-1">
                    <b-icon icon="receipt"></b-icon
                    ><translate> Debit/Credit Note </translate>
                  </b-nav-item>
                  <b-nav-item to="/workflow/Transactions-CashMemo/-1">
                    <b-icon icon="receipt"></b-icon
                    ><translate> Cash Memo</translate>
                  </b-nav-item>
                  <b-nav-item to="/workflow/Transactions-DeliveryNote/-1">
                    <b-icon icon="receipt"></b-icon
                    ><translate> Delivery Note</translate>
                  </b-nav-item>
                  <b-nav-item to="/workflow/Transactions-PurchaseSalesOrder/-1">
                    <b-icon icon="receipt"></b-icon
                    ><translate> Purchase/Sales Order</translate>
                  </b-nav-item>
                  <b-nav-item to="/workflow/Transactions-RejectionNote/-1">
                    <b-icon icon="receipt"></b-icon
                    ><translate> Rejection Note</translate>
                  </b-nav-item>
                  <b-nav-item to="/workflow/Transactions-TransferNote/-1">
                    <b-icon icon="receipt"></b-icon
                    ><translate> Transfer Note</translate>
                  </b-nav-item>
                  <b-nav-item to="/workflow/Transactions-Voucher/-1">
                    <b-icon icon="receipt"></b-icon
                    ><translate> Voucher</translate>
                  </b-nav-item>
                </div>
              </b-collapse>
              <b-nav-item to="/workflow/Contacts/-1">
                <b-icon icon="person-lines-fill"></b-icon
                ><translate> Contacts</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Business/-1">
                <b-icon icon="box"></b-icon><translate> Business</translate>
              </b-nav-item>
            </b-collapse>
          </div>
          <!-- Admin -->
          <div v-if="userRole == -1 || userRole == 0">
            <h6 v-b-toggle.admin class="text-center ml-3 mt-2 ">
              <b-icon
                :icon="collapsed.admin ? 'caret-down-fill' : 'caret-right-fill'"
              ></b-icon>
              <translate>Administration</translate>
            </h6>
            <b-collapse v-model="collapsed.admin" id="admin">
              <b-nav-item to="/users">
                <b-icon icon="people"></b-icon
                ><translate> Manage Users</translate>
              </b-nav-item>
              <b-nav-item to="/logs"
                ><b-icon icon="server"></b-icon
                ><translate> Audit Logs</translate></b-nav-item
              >
              <b-nav-item to="/accounts/-1/-1/-1">
                <b-icon icon="files-alt"></b-icon
                ><translate> Accounts</translate>
              </b-nav-item>
              <b-nav-item to="/budgets/cash/-1">
                <b-icon icon="file-ruled"></b-icon
                ><translate> Budget</translate>
              </b-nav-item>
              <b-nav-item
                :to="{
                  name: 'Billwise',
                  params: { custType: 3, custName: '-1' },
                }"
              >
                <b-icon icon="clipboard"></b-icon
                ><translate> Adjust Bills</translate>
              </b-nav-item>

              <b-nav-item to="/closebooks">
                <b-icon icon="journals"></b-icon
                ><translate> Close Books / Roll Over</translate>
              </b-nav-item>
              <b-nav-item to="/bank-recon">
                <b-icon icon="journals"></b-icon
                ><translate> Bank Reconciliation</translate>
              </b-nav-item>
              <!-- <b-nav-item to="/data/export"> -->
              <!--   <b-icon icon="file-arrow-down"></b-icon> -->
              <!--   <translate> Export Data</translate> -->
              <!-- </b-nav-item> -->
              <!-- <b-nav-item to="/data/import"> -->
              <!--   <b-icon icon="file-arrow-up"></b-icon> -->
              <!--   <translate> Import Data</translate> -->
              <!-- </b-nav-item> -->
              <b-nav-item to="/settings">
                <b-icon icon="gear"></b-icon> <translate> Settings</translate>
              </b-nav-item>
            </b-collapse>
          </div>

          <!-- Inventory -->
          <h6 v-b-toggle.inv class="text-center ml-3 mt-2">
            <b-icon
              :icon="collapsed.inv ? 'caret-down-fill' : 'caret-right-fill'"
            ></b-icon>
            <translate>Inventory</translate>
          </h6>
          <b-collapse v-model="collapsed.inv" id="inv">
            <b-nav-item to="/godowns"
              ><b-icon icon="building"></b-icon
              ><translate> Godowns</translate></b-nav-item
            >
            <b-nav-item v-if="userRole == -1 || 0" to="/costcenter">
              <b-icon icon="cash-stack"></b-icon
              ><translate> Cost Center</translate>
            </b-nav-item>

            <b-nav-item v-if="userRole == -1 || 0" to="/categories">
              <b-icon icon="tags"></b-icon><translate> Categories</translate>
            </b-nav-item>

            <b-nav-item v-if="userRole == -1 || 0" to="/uom">
              <b-icon icon="thermometer"></b-icon
              ><translate> Unit of measurement</translate>
            </b-nav-item>
          </b-collapse>

          <!-- Reports -->
          <!-- only admin role can access reports -->
          <div v-if="userRole == -1">
            <h6 v-b-toggle.reports class="ml-3 mr-5 mt-2">
              <b-icon
                :icon="
                  collapsed.reports ? 'caret-down-fill' : 'caret-right-fill'
                "
                class="text-right"
              ></b-icon>
              <translate>Reports</translate>
            </h6>
            <b-collapse v-model="collapsed.reports" id="reports">
              <b-nav-item to="/product-register">
                <b-icon icon="box-seam"></b-icon
                ><translate> Product Register</translate>
              </b-nav-item>
              <b-nav-item to="/cost-center-statement">
                <b-icon icon="cash"></b-icon
                ><translate> Cost Center Statement</translate>
              </b-nav-item>
              <b-nav-item to="/registers">
                <b-icon icon="receipt"></b-icon
                ><translate> View Registers</translate>
              </b-nav-item>
              <b-nav-item to="/stock-on-hand">
                <b-icon icon="receipt"></b-icon
                ><translate> Stock On Hand</translate>
              </b-nav-item>
              <b-nav-item to="/categorywise-stock-on-hand">
                <b-icon icon="tag"></b-icon
                ><translate> Categorywise Stock On Hand</translate>
              </b-nav-item>
              <b-nav-item to="/profit-loss">
                <b-icon icon="graph-up"></b-icon
                ><translate v-if="orgType == 'Profit Making'">
                  Profit & Loss</translate
                >
                <translate v-else> Income & Expenditure</translate>
              </b-nav-item>
              <b-nav-item to="/cash-flow">
                <b-icon icon="wallet"></b-icon><translate> Cash Flow</translate>
              </b-nav-item>
              <b-nav-item to="/trial-balance">
                <b-icon icon="wallet"></b-icon>
                <translate> Trial Balance</translate>
              </b-nav-item>
              <b-nav-item to="/ledger">
                <b-icon icon="journals"></b-icon><translate> Ledger</translate>
              </b-nav-item>
              <b-nav-item to="/balance-sheet">
                <b-icon icon="journals"></b-icon>
                <translate v-if="orgType == 'Profit Making'">
                  Balance Sheet</translate
                >
                <translate v-else> Statement Of Affairs</translate>
              </b-nav-item>
            </b-collapse>
          </div>
          <!-- GST -->
          <div v-if="userRole == -1 || 0">
            <h6 v-b-toggle.gst class="ml-3 mr-5 mt-2">
              <b-icon
                :icon="collapsed.gst ? 'caret-down-fill' : 'caret-right-fill'"
                class="text-right"
              ></b-icon>
              GST <b-badge pill>WIP</b-badge>
            </h6>
            <b-collapse v-model="collapsed.gst" id="gst">
              <div class="ml-3">
                <small v-if="!gstinValid">
                  * Update
                  <b><i>Administration -> Organisation Profile </i></b> with a
                  valid GSTIN to access the GST reports
                </small>
              </div>
              <b-nav-item :disabled="!gstinValid" to="/gst/r1">
                <b-icon icon="file-earmark"></b-icon
                ><translate> R1 Report</translate>
              </b-nav-item>
              <b-nav-item :disabled="!gstinValid" to="/gst/3b">
                <b-icon icon="file-earmark"></b-icon
                ><translate> 3B Report</translate>
              </b-nav-item>
              <b-nav-item to="/gst/news">
                <b-icon icon="newspaper"></b-icon
                ><translate> GST News</translate
                ><b-icon
                  v-if="newGstNews"
                  icon="bell-fill"
                  variant="warning"
                  class="ml-1 pt-1"
                  animation="pulse"
                ></b-icon>
              </b-nav-item>
            </b-collapse>
          </div>
          <!-- Help -->
          <h6 v-b-toggle.help class="text-center ml-3 mt-2 mr-5">
            <b-icon
              :icon="collapsed.help ? 'caret-down-fill' : 'caret-right-fill'"
            ></b-icon>
            <translate> Help</translate>
          </h6>
          <b-collapse v-model="collapsed.help" id="help">
            <b-nav-item to="/about" class="mr-3">
              <b-icon icon="info-circle"></b-icon><translate> About</translate>
            </b-nav-item>
            <b-nav-item
              class="mr-3"
              target="_blank"
              href="https://gnukhata.org"
            >
              <b-icon icon="globe"></b-icon><translate> Website</translate>
            </b-nav-item>
            <b-nav-item
              class="mr-3"
              target="_blank"
              href="https://gitlab.com/gnukhata"
            >
              <b-icon icon="code"></b-icon><translate> Source Code</translate>
            </b-nav-item>
            <b-nav-item class="mr-3" to="/report-bug">
              <b-icon icon="bug"></b-icon><translate> Report Bug</translate>
            </b-nav-item>

            <b-nav-item
              class="mr-3"
              target="_blank"
              href="https://gnukhata.org/faq"
            >
              <b-icon icon="question-circle"></b-icon
              ><translate> FAQ</translate>
            </b-nav-item>
          </b-collapse>
        </b-nav>
        <hr />
        <b-alert
          class="m-2"
          :show="gkConfig.sidebar_banner.show"
          :variant="gkConfig.sidebar_banner.variant"
          v-html="gkConfig.sidebar_banner.content"
        ></b-alert>
      </template>
    </b-sidebar>
  </section>
</template>
<script>
import { mapState } from 'vuex';
export default {
  name: 'Sidebar',
  data() {
    return {
      opened: false,
      collapsed: {},
    };
  },
  computed: {
    ...mapState([
      'searchMenu',
      'newGstNews',
      'orgGstin',
      'orgType',
      'userRole',
    ]),
    gstinValid: (self) => !!self.orgGstin,
  },
};
</script>
<style>
.nav-link {
  font-size: 0.9em;
  margin-left: 1em;
}
.nav-link > svg {
  margin-right: 0.2em;
}
</style>
