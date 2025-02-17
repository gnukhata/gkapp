import html2pdf from 'html2pdf.js';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['orgName']),
  },
  methods: {
    splitTable(contentDom) {
      let pages = [];
      let pageHeight = window.innerWidth > window.innerHeight ? 1600 : 1500;
      let thead = contentDom.querySelector('thead');
      let tbody = contentDom.querySelector('tbody');
      let rows = Array.from(tbody.children);

      let tableCount = Math.ceil(
        (rows.length * rows[0].offsetHeight) / pageHeight
      );
      let rowCount = Math.floor(pageHeight / rows[0].offsetHeight);
      let rowIterator = 0;
      for (let i = 0; i < tableCount; i++) {
        let table = contentDom.cloneNode();
        table.id += `-${i}`;
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
    printPage(elementId, pageTitle, printStyles) {
      let tableFlag = false;
      let contentDom = document.getElementById(elementId);
      if (!contentDom) {
        this.$bvToast.toast(
          this.$gettext(
            'Unable to print the page. Please contact Admin if problem persists.'
          ),
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
        `GNUKhata`,
        `scrollbars=1,resizable=1,width=${2480},height=${3508}`
      );

      let printContent = '';

      tableFlag = contentDom.tagName === 'TABLE';

      if (tableFlag) {
        let tables = this.splitTable(contentDom);
        tables.forEach((table) => {
          printContent += table.outerHTML;
        });
      } else {
        printContent += contentDom.outerHTML;
      }

      printContent += pageTitle;

      let links = '';
      let linkDoms = Array.from(document.getElementsByTagName('link'));
      if (linkDoms.length) {
        linkDoms.forEach((link) => {
          links += link.outerHTML;
        });
      }

      let styles = '';
      let styleDoms = Array.from(document.getElementsByTagName('style'));
      if (styleDoms.length) {
        styleDoms.forEach((style) => {
          styles += style.innerHTML;
        });
      }
      // styles for printing table row bg
      styles += printStyles;

      styles += `
        @media print {
          *{
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
						border: inherit;
						font-size: 1em;
            }
          ${printStyles}
        }
        .d-print-none{
          display: none;
        }
				body {
					margin-top: 1%
				}
      `;

      printWindow.document.open();
      printWindow.document.write(
        `<!DOCTYPE html><html><head>${links}<style>${styles}</style></head>`
      );
      printWindow.document.write(`<body>${printContent}</body>`);
      printWindow.document.write(`</html>`);
      printWindow.document.close();

      printWindow.print();
    },
    downloadPdf(fileName) {
      let dateString = new Date().toISOString().split('.')[0];
      let date = dateString
        .split('T')[0]
        .split('-')
        .reverse()
        .join('_');
      let time = dateString.split('T')[1];
      let timeStamp = `${date}_${time}`;
      let _fileName = `${this.orgName}_${fileName}_${timeStamp}.pdf`;
      const element = document.querySelector('.table');

      html2pdf()
        .from(element)
        .set({
          filename: _fileName + '.pdf',
          page: { format: 'a4', orientation: 'portrait' } // Set page size and orientation
        })
        .save();
    },
  },
}
