<template>
  <b-button @click.prevent="onPrint" class="m-1" size="sm" variant="primary">
    <b-icon aria-hidden="true" class="align-middle" icon="printer"></b-icon>
  </b-button>
</template>

<script>
export default {
  name: 'PrintHelper',
  props: {
    contentId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      input: '',
      date: '',
      valid: null,
      notValidText: '',
    };
  },
  computed: {},
  watch: {},
  methods: {
    onPrint() {
      const self = this;
      this.$emit('before-print');
      let printWindow = window.open(
        '',
        `Print ${this.name} - GNUKhata`,
        'scrollbars=1,resizable=1'
      );
      let contentDom = document.getElementById(this.contentId);
      if (!contentDom) {
        this.$bvToast.toast(
          'Unable to print the page. Please contact Admin if problem persists.',
          {
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          }
        );
        return;
      }
      let printContent = contentDom.innerHTML;
      let styles = '';
      document.getElementsByTagName('style').forEach((style) => {
        styles += style.innerHTML;
      });
      // styles for printing table row bg
      styles +=
        '@media print {*{ color-adjust: exact;  -webkit-print-color-adjust: exact; print-color-adjust: exact; }}';

      printWindow.document.open();
      printWindow.document.write(`<html><head><style>${styles}</style></head>`);
      printWindow.document.write(`<body>${printContent}</body>`);
      printWindow.document.write(`</html>`);
      printWindow.document.close();

      printWindow.print();
      printWindow.onafterprint = () => {
        self.$emit('after-print');
        printWindow.close();
      };
    },
  },
};
</script>
