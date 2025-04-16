<template>
  <b-card no-body>
    <template #header>
      <h5 class="my-2">
        Business Item Details
      </h5>
    </template>
    <b-card-body>
      <business-item :mode="mode" />
    </b-card-body>
  </b-card>
</template>

<script>
import BusinessItem from '../components/form/BusinessItem.vue';
export default {
  name: 'BusinessDetails',
  components: { BusinessItem },
  props: {
    mode: {
      type: String,
      validator: function(value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
  },
  data() {
    return {};
  },
};
</script>
