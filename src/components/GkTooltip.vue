<template>
  <b-icon
    v-b-popover.hover="helpContent"
    tabindex="0"
    role="link"
    :variant="variant"
    :icon="icon"
  ></b-icon>
</template>

<script>
export default {
  name: 'GkTooltip',
  props: {
    helpTitle: {
      type: String,
      default: 'Help',
      note: 'title of help popover (optional)',
    },
    helpBody: {
      type: String,
      default: 'Fill text here',
      required: true,
      note: 'body of help popover (required)',
    },
    icon: {
      type: String,
      default: 'question-circle',
      required: false,
      note: 'Icon for tooltip',
    },
    variant: {
      type: String,
      default: 'dark',
      required: false,
      note: 'Tooltip variant',
    },
  },
  computed: {
    helpContent() {
      let o = {
        html: true,
        placement: 'auto',
        variant: 'dark',
        content: this.helpBody,
      };
      if (this.helpTitle !== null) {
        o['title'] = this.helpTitle;
      }
      return o;
    },
  },
};
</script>
