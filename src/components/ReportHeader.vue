<template>
  <section class="d-none d-print-block">
    <div class="text-center">
      <h3>{{ orgName }}</h3>
    </div>
    <slot> </slot>
    <div class="text-center">
      <small>
        Printed by User: <b>{{ userName }}</b> <i>on</i> {{ new Date() }}
      </small>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'ReportHeader',
  computed: {
    ...mapState(['orgName', 'userName']),
  },
};
</script>
