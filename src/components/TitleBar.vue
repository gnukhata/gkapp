<template>
  <section class="bg-light d-lg-none d-print-none fixed-bottom">
    <div class="d-flex mt-2 mb-1 justify-content-around">
      <b-button size="sm" @click="$router.go(-1)" variant="dark">
        <b-icon icon="chevron-left"></b-icon>
      </b-button>
      <b-button size="sm" @click="$reload" variant="dark">
        <b-icon icon="arrow-clockwise"></b-icon>
      </b-button>
      <b-button @click="$router.go(1)" variant="dark" size="sm">
        <b-icon icon="chevron-right"></b-icon>
      </b-button>
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
