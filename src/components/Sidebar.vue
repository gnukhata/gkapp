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
      <b-icon icon="list" />
    </b-button>
    <b-sidebar
      width="15em"
      v-model="opened"
      id="sidebar"
      shadow
      backdrop
    >
      <template #title>
        <div class="d-flex">
          <img
            src="/img/gk.svg"
            width="30px"
            height="30px"
            class="ml-4 mt-1"
            alt="GNUKhata Logo"
          >
          <div
            style="font-size: 0.8em"
            class="font-weight-normal mt-1 ml-1"
          >
            <translate> GNUKhata </translate>
          </div>
        </div>
      </template>
      <hr class="m-0">
      <sidebar-nav />
      <hr>
      <sidebar-alert />
    </b-sidebar>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import SidebarNav from './SidebarNav.vue';
import SidebarAlert from './SidebarAlert.vue';
export default {
  name: 'Sidebar',
  components: { SidebarNav, SidebarAlert },
  data() {
    return {
      opened: false,
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
