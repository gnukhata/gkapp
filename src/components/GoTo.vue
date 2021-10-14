<template>
  <b-modal
    hide-footer
    header-bg-variant="dark"
    header-text-variant="light"
    v-model="searchMenu"
    ref="goto-modal"
  >
    <template #modal-header>
      <div><b-icon icon="search"></b-icon> Search Menu</div>
    </template>
    <b-form ref="gotoform" class="mb-5" @submit.prevent="navigate">
      <autocomplete
        ref="gksearch"
        v-model="selectedUrl"
        placeholder="Select / Search Menu"
        :options="finalRoutes"
        textField="name"
        valueField="path"
        @input="navigate"
      ></autocomplete>
      <div class="mt-3 text-center">
        <span class="text-muted">Press <kbd>ESC</kbd> to exit </span>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
import Autocomplete from './Autocomplete.vue';
import routes from '../router/index';
import { mapState } from 'vuex';

export default {
  name: 'GoTo',
  components: { Autocomplete },
  data() {
    return {
      selectedUrl: '',
      finalRoutes: [],
    };
  },
  computed: {
    ...mapState(['searchMenu']),
  },
  methods: {
    navigate() {
      if (this.selectedUrl !== null) {
        this.$router.push(this.selectedUrl);
        this.selectedUrl = null;
        this.$store.commit('toggleSearchMenu', false);
      }
    },
    // remove dynamic routes
    filterRoutes() {
      const re = new RegExp(':');
      this.finalRoutes = routes.options.routes.filter((route) => {
        if (!re.test(route.path)) {
          return route;
        }
      });
    },
  },
  created() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Home') {
        this.$store.commit('toggleSearchMenu', !this.searchMenu);
      }
    });
  },
  mounted() {
    this.filterRoutes();
  },
};
</script>
