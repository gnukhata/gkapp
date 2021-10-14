<template>
  <b-button @click.prevent="onPrint" class="m-1" size="sm" :variant="variant">
    <b-icon aria-hidden="true" class="align-middle" icon="printer"></b-icon>
  </b-button>
</template>

<script>
import { jsPDF } from 'jspdf';
import html2PDF from '../js/html2pdf.js';
import { mapState } from 'vuex';
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
      default: 'Page',
    },
    printStyles: {
      type: String,
      required: false,
      default: 'Page',
      note:
        'Custom styles as string if sent will be added to the HTML page, before printing',
    },
    variant: {
      type: String,
      required: false,
      default: 'primary',
      note: 'Button variant',
    },
    pageTitle: {
      type: String,
      required: false,
      default: '',
      note:
        'Title of the page to be displayed in header. Must be sent as HTML text. Used in place of slots',
    },
    fileName: {
      type: String,
      required: false,
      default: 'GNUKhata-PrintOut',
      note: 'Pdf file name',
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
  computed: {
    ...mapState(['orgName', 'userName']),
  },
  watch: {},
  methods: {
    splitTable() {
      const pdf = new jsPDF({
        format: 'a4',
      });
      // const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfContentWidth = pdfWidth - (25 + 25);
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let pageHeight = window.innerWidth > window.innerHeight ? 1600 : 1500;
      // console.log(`Page height: ${pageHeight}`);
      let contentDom = document.getElementById(this.contentId);

      let pages = [];
      let thead = contentDom.querySelector('thead');
      let tbody = contentDom.querySelector('tbody');
      let tAttributes = contentDom.attributes;
      let rows = Array.from(tbody.children);

      let tableCount = Math.ceil(
        (rows.length * rows[0].offsetHeight) / pageHeight
      );
      let rowCount = Math.floor(pageHeight / rows[0].offsetHeight);
      // console.log(
      //   `row count = ${rowCount}, page count = ${tableCount}, rows = ${rows.length}`
      // );
      let rowIterator = 0;
      for (let i = 0; i < tableCount; i++) {
        let table = document.createElement('table');
        tAttributes.forEach((attr) => {
          table.setAttribute(attr.name, attr.value);
        });
        table.appendChild(thead.cloneNode(true));
        let tbody2 = document.createElement('tbody');
        let j = 1;
        while (j < rowCount && rowIterator < rows.length) {
          tbody2.appendChild(rows[rowIterator++].cloneNode(true));
          j++;
        }
        table.appendChild(tbody2);

        pages.push(table);
      }
      return pages;
    },
    onPrint() {
      const self = this;
      let tableFlag = false;
      this.$emit('before-print');
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

      let printWindow = window.open(
        '',
        `Print ${this.name} - GNUKhata`,
        `scrollbars=1,resizable=1,width=${2480},height=${3508}`
      );

      let header = `
          <div class="text-center">
            <h3> ${this.orgName} </h3>
          </div>
          <div class="text-center">
            ${this.pageTitle}
          </div>
          <div class="text-center">
            <small>
              Printed by User: <b>${this.userName}</b> <i>on</i> ${new Date()}
            </small>
          </div>
      `;

      let printContent = '';

      printContent += header;

      tableFlag = contentDom.tagName === 'TABLE';

      if (tableFlag) {
        let tables = this.splitTable(contentDom);
        tables.forEach((table) => {
          printContent += table.outerHTML;
        });
      } else {
        printContent += contentDom.outerHTML;
      }

      let links = '';
      document.getElementsByTagName('link').forEach((link) => {
        links += link.outerHTML;
      });

      let styles = '';
      document.getElementsByTagName('style').forEach((style) => {
        styles += style.innerHTML;
      });
      // styles for printing table row bg
      styles += this.printStyles;

      styles += `
        @media print {
          *{
            color-adjust: exact !important;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
            ${this.printStyles}
        }
      `;

      printWindow.document.open();
      printWindow.document.write(
        `<html><head>${links}<style>${styles}</style></head>`
      );
      printWindow.document.write(`<body>${printContent}</body>`);
      printWindow.document.write(`</html>`);
      printWindow.document.close();

      printWindow.onload = function() {
        self.downloadPdf(
          tableFlag
            ? printWindow.document.body.querySelectorAll('table')
            : printWindow.document.body,
          printWindow
        );
      };
    },

    downloadPdf(element, pwindow) {
      html2PDF(element, {
        jsPDF: {
          format: 'a4',
        },
        imageType: 'image/jpeg',
        output: `${this.fileName}.pdf`,
        margin: {
          top: 25,
          right: 25,
          bottom: 25,
          left: 25,
        },
        success: (pdf) => {
          pdf.save(this.fileName);
          this.$emit('after-print');
          pwindow.close();
        },
      });
    },
  },
};
</script>
