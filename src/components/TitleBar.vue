<template>
  <section class="mt-5 d-lg-none d-print-none">
    <div class="d-flex justify-content-center">
      <div>
        <b-button size="sm" @click="$router.go(-1)" variant="dark">
          <b-icon icon="chevron-left"></b-icon>
        </b-button>
      </div>
      <div class="ml-3 mr-3">
        <b-button size="sm" @click="$reload" variant="dark">
          <b-icon icon="arrow-clockwise"></b-icon>
        </b-button>
      </div>
      <div>
        <b-button @click="$router.go(1)" variant="dark" size="sm">
          <b-icon icon="chevron-right"></b-icon>
        </b-button>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'TitleBar',
  computed: {
    ...mapState(['userName']),
  },
};
</script>
