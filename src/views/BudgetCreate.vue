<template>
  <div class="mt-4 mx-2 align-form-label-right" style="min-width: 300px">
    <budget-item mode="create"> </budget-item>
  </div>
</template>

<script>
import BudgetItem from '../components/form/BudgetItem.vue';

export default {
  name: 'BudgetCreate',
  components: { BudgetItem },
  props: {},
  data() {
    return {
    };
  },
  computed: {},
  watch: {},
};
</script>
