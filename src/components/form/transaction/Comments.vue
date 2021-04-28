<template>
  <b-card
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
    v-if="config"
  >
    <div class="p-2 p-md-3">
      <div>
        <b>Invoice Comments</b>
        <b-button
          variant="primary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            class="float-right"
          ></b-icon>
        </b-button>
      </div>
      <div
        class="mt-3"
        :class="{ 'd-md-block': true, 'd-none': !isCollapsed }"
      >
        <b-form-group>
          <b-form-textarea
            size="sm"
            id="input-27"
            v-model="form.narration"
            rows="4"
            max-rows="5"
            trim
          ></b-form-textarea>
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'Comments',
  props: {
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isCollapsed: false,
      form: {
        narration: '',
      }
    }
  },
};
</script>