<template>
  <section>
    <b-button
      size="sm"
      class="ml-2"
      variant="light"
      title="Open Sidebar"
      :lazy="true"
      v-b-toggle.sidebar-1
    >
      <b-icon icon="arrow-bar-right"></b-icon>
    </b-button>
    <b-sidebar v-model="opened" id="sidebar-1" title="MENU" shadow>
      <template>
        <b-dropdown-item to="/orgprofile"
          ><b-icon icon="building"></b-icon> Organisation
          Profile</b-dropdown-item
        >
        <b-dropdown-item to="/uom"
          ><b-icon icon="thermometer"></b-icon> Unit of measurement
        </b-dropdown-item>
        <b-dropdown-item to="/user_management"
          ><b-icon icon="people"></b-icon> Manage Users</b-dropdown-item
        >
        <b-dropdown-item to="/logs"
          ><b-icon icon="server"></b-icon> Audit Logs</b-dropdown-item
        >
        <b-dropdown-item
          :to="{
            name: 'Billwise',
            params: { custType: 3, custName: '-1' },
          }"
          ><b-icon icon="clipboard"></b-icon> Adjust Bills</b-dropdown-item
        >
        <b-dropdown-item to="/closebooks"
          ><b-icon icon="journals"></b-icon> Close Books / Roll
          Over</b-dropdown-item
        >
        <b-dropdown-item to="/godowns"
          ><b-icon icon="building"></b-icon> Godowns</b-dropdown-item
        >
        <b-dropdown-item to="/costcenter"
          ><b-icon icon="cash-stack"></b-icon> Cost Center</b-dropdown-item
        >
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
