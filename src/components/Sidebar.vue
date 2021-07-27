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
    <b-sidebar width="250px" v-model="opened" id="sidebar" shadow backdrop>
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
        <b-nav class="text-small">
          <!-- <b-table :items="list"></b-table> -->
          <b-nav-item
            :to="{
              name: 'Workflow',
              params: {
                wfName: 'Transactions-Invoice',
                wfId: -1,
              },
            }"
            ><b-icon icon="wrench"></b-icon> Workflow</b-nav-item
          >
          <b-nav-item to="/orgprofile">
            <b-icon icon="building"></b-icon> Organisation Profile
          </b-nav-item>
          <b-nav-item to="/uom">
            <b-icon icon="thermometer"></b-icon> Unit of measurement
          </b-nav-item>
          <b-nav-item to="/users">
            <b-icon icon="people"></b-icon> Manage Users
          </b-nav-item>
          <b-nav-item to="/logs"
            ><b-icon icon="server"></b-icon> Audit Logs</b-nav-item
          >
          <b-nav-item
            :to="{
              name: 'Billwise',
              params: { custType: 3, custName: '-1' },
            }"
          >
            <b-icon icon="clipboard"></b-icon> Adjust Bills
          </b-nav-item>
          <b-nav-item to="/closebooks">
            <b-icon icon="journals"></b-icon> Close Books / Roll Over
          </b-nav-item>
          <b-nav-item to="/godowns"
            ><b-icon icon="building"></b-icon> Godowns</b-nav-item
          >
          <b-nav-item to="/costcenter">
            <b-icon icon="cash-stack"></b-icon> Cost Center
          </b-nav-item>
          <b-nav-item to="/categories">
            <b-icon icon="tags"></b-icon> Categories
          </b-nav-item>
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
          <b-nav-item to="/accounts/-1/-1/-1">
            <b-icon icon="files-alt"></b-icon> Accounts
          </b-nav-item>
          <b-nav-item to="/product-list">
            <b-icon icon="files-alt"></b-icon> Products List
          </b-nav-item>
          <b-nav-item to="/about">
            <b-icon icon="info-circle"></b-icon> About
          </b-nav-item>
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
    };
  },
};
</script>
