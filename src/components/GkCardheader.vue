<template>
  <div class="d-flex">
    <div class="mr-auto text-light">{{ name }}</div>
    <div v-b-popover.click="helpContent">
      <b-icon variant="light" icon="question-circle"></b-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GkCardHeader',
  props: {
    name: {
      type: String,
      required: true,
      note: 'name of header (required)',
    },
    helpTitle: {
      type: String,
      default: null,
      note: 'title of help popover (optional)',
    },
    helpBody: {
      type: String,
      default: null,
      required: true,
      note: 'body of help popover (required)',
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
        o.title = this.helpTitle;
      }
      return o;
    },
  },
};
</script>
