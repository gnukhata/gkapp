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
          <div style="font-size: 20px" class="font-weight-normal mt-1 ml-2">
            GNUKhata
          </div>
        </div>
      </template>
      <hr class="m-0" />
      <template>
        <!-- <div class="ml-2 mr-2">
               <b-input size="sm" placeholder="search"></b-input>
               </div> -->
        <b-nav class="text-small text-dark col">
          <!-- master -->
          <h6 v-b-toggle.master class="text-center ml-3 mr-3 mt-3">
            <b-icon
              :icon="collapsed.master ? 'caret-down-fill' : 'caret-right-fill'"
              class="text-right"
            ></b-icon>
            Master
          </h6>
          <b-collapse v-model="collapsed.master" id="master">
            <b-nav-item
              class="mr-3"
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-Invoice',
                  wfId: -1,
                },
              }"
              ><b-icon icon="wrench"></b-icon> Workflow</b-nav-item
            >
          </b-collapse>

          <!-- Admin -->
          <h6 v-b-toggle.admin class="text-center ml-3 mt-2 ">
            <b-icon
              :icon="collapsed.admin ? 'caret-down-fill' : 'caret-right-fill'"
            ></b-icon>
            Administration
          </h6>
          <b-collapse v-model="collapsed.admin" id="admin">
            <b-nav-item to="/orgprofile">
              <b-icon icon="building"></b-icon> Organisation Profile
            </b-nav-item>

            <b-nav-item to="/users">
              <b-icon icon="people"></b-icon> Manage Users
            </b-nav-item>
            <b-nav-item to="/logs"
              ><b-icon icon="server"></b-icon> Audit Logs</b-nav-item
            >
            <b-nav-item to="/accounts/-1/-1/-1">
              <b-icon icon="files-alt"></b-icon> Accounts
            </b-nav-item>
            <b-nav-item to="/budgets/cash/-1">
              <b-icon icon="file-ruled"></b-icon> Budget
            </b-nav-item>
            <b-nav-item
              :to="{
                name: 'Billwise',
                params: { custType: 3, custName: '-1' },
              }"
            >
              <b-icon icon="clipboard"></b-icon> Adjust Bills
            </b-nav-item>

            <b-nav-item to="/uom">
              <b-icon icon="thermometer"></b-icon> Unit of measurement
            </b-nav-item>
            <b-nav-item to="/closebooks">
              <b-icon icon="journals"></b-icon> Close Books / Roll Over
            </b-nav-item>
          </b-collapse>

          <!-- Inventory -->
          <h6 v-b-toggle.inv class="text-center ml-3 mt-2">
            <b-icon
              :icon="collapsed.inv ? 'caret-down-fill' : 'caret-right-fill'"
            ></b-icon>
            Inventory
          </h6>
          <b-collapse v-model="collapsed.inv" id="inv">
            <b-nav-item to="/godowns"
              ><b-icon icon="building"></b-icon> Godowns</b-nav-item
            >
            <b-nav-item to="/costcenter">
              <b-icon icon="cash-stack"></b-icon> Cost Center
            </b-nav-item>

            <b-nav-item to="/categories">
              <b-icon icon="tags"></b-icon> Categories
            </b-nav-item>
          </b-collapse>

          <!-- Reports -->
          <h6 v-b-toggle.reports class="ml-3 mr-5 mt-2">
            <b-icon
              :icon="collapsed.reports ? 'caret-down-fill' : 'caret-right-fill'"
              class="text-right"
            ></b-icon>
            Reports
          </h6>
          <b-collapse v-model="collapsed.reports" id="reports">
            <b-nav-item to="/product-register">
              <b-icon icon="box-seam"></b-icon> Product Register
            </b-nav-item>
            <b-nav-item to="/cost-center-statement">
              <b-icon icon="cash"></b-icon> Cost Center Statement
            </b-nav-item>
            <b-nav-item to="/registers">
              <b-icon icon="receipt"></b-icon> View Registers
            </b-nav-item>
            <b-nav-item to="/stock-on-hand">
              <b-icon icon="receipt"></b-icon> Stock On Hand
            </b-nav-item>
            <b-nav-item to="/categorywise-stock-on-hand">
              <b-icon icon="tag"></b-icon>Categorywise Stock On Hand
            </b-nav-item>

            <b-nav-item to="/product-list">
              <b-icon icon="box"></b-icon> Product List
            </b-nav-item>
            <b-nav-item to="/contact-list">
              <b-icon icon="people"></b-icon> Contact List
            </b-nav-item>
            <b-nav-item to="/profit-loss">
              <b-icon icon="graph-up"></b-icon> Profit & Loss
            </b-nav-item>
            <b-nav-item to="/cash-flow">
              <b-icon icon="wallet"></b-icon> Cash Flow
            </b-nav-item>
            <b-nav-item to="/trial-balance">
              <b-icon icon="wallet"></b-icon> Trial Balance
            </b-nav-item>
            <b-nav-item to="/ledger">
              <b-icon icon="journals"></b-icon> Ledger
            </b-nav-item>
            <b-nav-item to="/balance-sheet">
              <b-icon icon="journals"></b-icon> Balance Sheet
            </b-nav-item>
          </b-collapse>
          <!-- Help -->
          <h6 v-b-toggle.help class="text-center ml-3 mt-2 mr-5">
            <b-icon
              :icon="collapsed.help ? 'caret-down-fill' : 'caret-right-fill'"
            ></b-icon>
            Help
          </h6>
          <b-collapse v-model="collapsed.help" id="help">
            <b-nav-item to="/about" class="mr-3">
              <b-icon icon="info-circle"></b-icon> About
            </b-nav-item>
          </b-collapse>
        </b-nav>
      </template>
    </b-sidebar>
  </section>
</template>
<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      opened: false,
      collapsed: {},
    }; // master: false,
    // admin: false,
    // reports: false,
  },
};
</script>
<style>
.nav-link {
  font-size: 0.9em;
  margin-left: 1em;
}
</style>
