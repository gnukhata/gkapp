<template>
  <b-button
    @click.prevent="printordownloadaction"
    size="sm"
    :variant="variant"
  >
    <b-icon
      aria-hidden="true"
      class="align-middle"
      :icon="iconName"
      :font-scale="fontScale"
      :class="{'d-none': textMode}"
    />
    <span :class="{'sr-only': !textMode}">{{ textMode || 'Print' }}</span>
  </b-button>
</template>

<script>
import { mapState } from 'vuex';
import printMixin from '@/mixins/print.js';

export default {
  name: 'PrintHelper',
  mixins: [printMixin],
  props: {
    messageFromParent: {
      type: String,
      required: true,
    },
    toggleFlag: Function,
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
    fontScale: {
      type: Number,
      required: false,
      default: 1,
      note: 'Font scale of the print icon',
    },
    textMode: {
      type: [Boolean, String],
      required: false,
      default: false,
      note:
        'A mode, where the button uses text instead of icon. The text to be displayed is sent via the prop, when text mode needs to be enabled',
    },
    iconName: {
      type: String,
      required: false,
      default: 'printer',
      note: 'Icon name',
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
    printordownloadaction() {
      if(this.iconName === 'printer') {
        this.onPrint();
      } else {
        this.onDownload();
      }
    },
    onPrint() {
      if (this.messageFromParent == "toggleFlagTrue") {
        this.toggleFlag();
      }
      this.printPage(this.contentId, this.pageTitle, this.printStyles);
    },
    onDownload() {
      this.downloadPdf(this.fileName);
    },
  },
};
</script>
