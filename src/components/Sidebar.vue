<template>
  <section>
    <b-button size="sm" class="ml-2" variant="light" v-b-toggle.sidebar-1>
      <b-icon icon="box-arrow-right"></b-icon>
    </b-button>
    <b-sidebar v-model="opened" id="sidebar-1" shadow>
      <div>
        General
      </div>
      <ul>
        <li>Company Info</li>
        <li>Unit of Measurement</li>
      </ul>
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
