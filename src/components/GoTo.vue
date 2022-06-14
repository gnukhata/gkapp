<template>
  <b-modal
    hide-footer
    hide-header
    header-bg-variant="dark"
    header-text-variant="light"
    v-model="searchMenu"
    @hide="$store.commit('toggleSearchMenu', false)"
  >
    <b-row cols="2">
      <div class="col-10">
        <v-select
          @input="navigate"
          :options="finalRoutes"
          v-model="selectedUrl"
          placeholder="Search Menu"
          label="name"
        ></v-select>
      </div>
      <div class="col-1 mt-1" role="button">
        <BIcon
          scale="1.3x"
          variant="danger"
          icon="x-circle-fill"
          @click="$store.commit('toggleSearchMenu', false)"
          title="close"
        />
      </div>
    </b-row>
  </b-modal>
</template>

<script>
import routes from '../router/index';
import { mapState } from 'vuex';

export default {
  name: 'GoTo',
  data() {
    return {
      selectedUrl: '',
      finalRoutes: [],
      keysPressed: {},
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
      this.keysPressed[event.key] = true;

      if (this.keysPressed.Control && this.keysPressed.Home) {
        // Left shift+CONTROL pressed!
        this.keysPressed = {}; // reset key map
        this.$store.commit('toggleSearchMenu', !this.searchMenu);
      }
    });

    window.addEventListener('keydown', (event) => {
      this.keysPressed[event.key] = false;
      this.keysPressed = {};
    });
  },
  mounted() {
    this.filterRoutes();
  },
};
</script>
