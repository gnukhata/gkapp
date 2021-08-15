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
    name: {
      type: String,
      required: false,
      default: 'Page'
    },
    printStyles: {
      type: String,
      required: false,
      default: 'Page',
      note: 'Custom styles as string if sent will be added to the HTML page, before printing'
    }
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
      let printContent = contentDom.outerHTML;
      let styles = '';
      document.getElementsByTagName('style').forEach((style) => {
        styles += style.innerHTML;
      });
      // styles for printing table row bg
      styles += this.printStyles;
      
      styles +=
        `@media print {
          *{ 
            color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            -webkit-print-color-adjust: exact !important; 
          }
          ${this.printStyles}  
        }`;


      printWindow.document.open();
      printWindow.document.write(`<html><head><style>${styles}</style></head>`);
      printWindow.document.write(`<body class="px-5">${printContent}</body>`);
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
