<template>
  <b-button
    :disabled="disabled"
    :label="name"
    :title="title"
    :size="size"
    :variant="variant"
    @click.prevent="onFileDownload"
    class="d-print-none"
    :aria-label="`${this.title}`"
  >
    <b-overlay
      :spinner-variant="variant"
      spinner-type="grow"
      spinner-small
      :show="loading"
    >
      <b-icon
        aria-hidden="true"
        :icon="icon"
        :font-scale="fontScale"
      />
      {{ name }}
    </b-overlay>
  </b-button>
</template>

<script>
import { mapState } from 'vuex';
import exportHelper from '@/mixins/export.js';

export default {
  name: 'GkFileDownload',
  mixins: [exportHelper],
  data() {
    return {
      loading: false,
    };
  },
  props: {
    messageFromParent: {
      type: String,
      required: true,
    },
    toggleFlag: Function,
    fileName: {
      type: String,
      required: false,
      default: `GNUKhata`,
    },
    fileExtn: {
      type: String,
      default: 'xlsx',
      note: 'Extension of the file to be downloaded, e.g. xlsx or jpeg',
    },
    addDate: {
      type: Boolean,
      required: false,
      default: true,
      note: 'Flag to add current date to the file name during download',
    },
    addTimeStamp: {
      type: Boolean,
      required: false,
      default: false,
      note: 'Flag to add time stamp to the file name during download',
    },
    url: {
      type: String,
      required: true,
      note: 'The Get URL to download the file from',
    },
    filePath: {
      type: Array,
      required: false,
      note: 'The path to tranverse to get the file after download',
    },
    fontScale: {
      type: Number,
      required: false,
      default: 1,
      note: 'The font scale of the icon used',
    },
    icon: {
      type: String,
      default: 'file-earmark-spreadsheet',
      note: 'Icon name',
    },
    name: {
      type: String,
      default: '',
      note: 'Button Name',
    },
    variant: {
      type: String,
      default: 'link',
    },
    disabled: {
      type: Boolean,
      default: false,
      note: 'Prop to disable the download button',
    },
    size: {
      type: String,
      default: 'sm',
    },
    title: {
      type: String,
      default: 'Download',
    },
    fileSuffix: {
      type: String,
      default: '',
    },
    commonParams: {
      type: [String, Boolean],
      default: true,
      note:
        'Some url params are common for all spreadsheet downloads. This prop if set to true, Adds common request params: fystart, fyend, orgname to url',
    },
  },
  computed: {
    ...mapState(['orgName', 'orgType', 'yearStart', 'yearEnd']),
  },
  methods: {
    onFileDownload() {
      this.loading = true;
      if (this.messageFromParent == "toggleFlagTrue") {
        this.toggleFlag();
      }
      let metadata = {
        filePath: this.filePath,
        fileName: this.fileName,
        fileSuffix: this.fileSuffix,
        fileExtn: this.fileExtn,
        addDate: this.addDate,
        addTimeStamp: this.addTimeStamp,
        commonParams: this.commonParams,
      }
      this.exportFile(this.url, metadata)
        .finally(() => { this.loading = false });
    },
  },
};
</script>
