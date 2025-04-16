<template>
  <b-card no-body>
    <template #header>
      <h5 class="my-2">
        Contact Person Details
      </h5>
    </template>
    <b-card-body>
      <contact-item
        :mode="mode"
        :type="type"
      />
    </b-card-body>
  </b-card>
</template>

<script>
import ContactItem from "../components/form/ContactItem.vue";
export default {
  name: "ContactDetails",
  components: {
    ContactItem,
  },
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ["create", "edit"].indexOf(value) !== -1;
      },
      required: true,
    },
    type: {
      type: String,
      validator: function (value) {
        return ["customer", "supplier"].indexOf(value) !== -1;
      },
      required: false,
      default: null,
    },
  },
  data() {
    return {};
  },
};
</script>
