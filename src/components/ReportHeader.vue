<template>
  <section :class="show ? '' : 'd-none d-print-block'">
    <div class="text-center">
      <h3>{{ orgName }}</h3>
    </div>
    <slot> </slot>
    <div class="text-center">
      <small v-if="!show">
        Printed by User: <b>{{ userName }}</b> <i>on</i> {{ new Date() }}
      </small>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  props: {
    show: {
      value: [String, Boolean],
      default: false,
    },
  },
  name: 'ReportHeader',
  computed: {
    ...mapState(['orgName', 'userName']),
  },
};
</script>
