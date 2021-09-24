<template>
  <b-modal
    hide-footer
    header-bg-variant="dark"
    header-text-variant="light"
    v-model="toggleModal"
    ref="goto-modal"
  >
    <template #modal-header>
      <div><b-icon icon="search"></b-icon> Search GNUKhata</div>
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
export default {
  name: 'GoTo',
  components: { Autocomplete },
  data() {
    return {
      toggleModal: false,
      selectedUrl: '',
      finalRoutes: [],
    };
  },
  methods: {
    navigate() {
      this.$router.push(this.selectedUrl);
      this.selectedUrl = '';
      this.toggleModal = false;
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
        this.toggleModal = !this.toggleModal;
      }
    });
  },
  mounted() {
    this.filterRoutes();
  },
};
</script>
