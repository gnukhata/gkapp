<template>
  <b-modal
    title="Search Menu"
    hide-footer
    header-bg-variant="dark"
    header-text-variant="light"
    v-model="toggleModal"
    ref="goto-modal"
  >
    <b-form ref="gotoform" class="mb-5" @submit.prevent="navigate">
      <div class="d-flex justify-content-center">
        <div class="mr-1">
          <autocomplete
            v-model="selectedUrl"
            placeholder="Search Menu"
            :options="finalRoutes"
            textField="name"
            valueField="path"
          ></autocomplete>
        </div>
        <div>
          <b-button size="sm" variant="dark" type="submit"> Go!</b-button>
        </div>
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
      if (event.key === 'OS') {
        this.toggleModal = !this.toggleModal;
      }
    });
  },
  mounted() {
    this.filterRoutes();
  },
};
</script>
