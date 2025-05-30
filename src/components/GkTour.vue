<template>
  <div v-if="showTour">
    <b-popover
      :show="show"
      :target="target"
      :title="title"
      :placement="placement"
      :variant="variant"
      :custom-class="customClass"
      triggers="manual"
    >
      <slot></slot>
      <slot name="footer">
        <div class="mt-4 float-right">
          <div v-if="isLastStep">
            <b-button
              size="sm"
              class="mb-2 ml-2"
              variant="success"
              @click="goToNextStep"
            >
              Finish Tour
            </b-button>
          </div>
          <div v-else>
            <b-button
              size="sm"
              class="mb-2"
              variant="dark"
              @click="skipTour"
            >
              Skip Tour
            </b-button>
            <b-button
              size="sm"
              class="mb-2 ml-2"
              variant="success"
              @click="goToNextStep"
            >
              Next
            </b-button>
          </div>
        </div>
      </slot>
    </b-popover>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'GkTour',
  props: {
    target: {
      type: String,
      note: 'String used to represent the target for the current step of the tour',
    },
    title: {
      type: String,
      note: 'Popover title',
    },
    placement: {
      type: String,
      default: "right",
      required: false,
      note: "Popover placement",
    },
    variant: {
      type: String,
      default: 'warning',
      required: false,
      note: 'Popover variant',
    },
    customClass: {
      type: String,
      default: 'shadow',
      required: false,
      note: 'Popover custom-class',
    },
  },
  computed: {
    ...mapState('tour', ['showTour', 'currentStep', 'isLastStep']),
    show() {
      // Convert target element name in kebab-case to camelCase
      const stepToShow = this.target.replace(/-./g, x => x[1].toUpperCase());
      // If current tour step is for the given target element return true
      return this.currentStep === stepToShow;
    },
  },
  methods: {
    ...mapMutations('tour', ['goToNextStep', 'skipTour']),
  },
};
</script>
