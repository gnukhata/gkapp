<template>
  <b-overlay
    :spinner-variant="variant"
    spinner-type="grow"
    spinner-small
    :show="loading"
  >
    <b-button
      :disabled="disabled"
      :label="name"
      :title="title"
      :size="size"
      :variant="variant"
      @click.prevent="onFileDownload"
    >
      <b-icon
        aria-hidden="true"
        class="align-middle"
        :icon="icon"
        :font-scale="fontScale"
      ></b-icon>
      {{ name }}
    </b-button>
  </b-overlay>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'GkFileDownload',
  data() {
    return {
      loading: false,
    };
  },
  props: {
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
    ...mapState(['orgName', 'yearStart', 'yearEnd']),
  },
  methods: {
    onFileDownload() {
      this.loading = true;
      if (this.commonParams) {
        // prettier-ignore
        this.url += `&fystart=${this.dateReverse(this.yearStart)}&fyend=${this.dateReverse(this.yearEnd)}&orgname=${this.orgName}`;
      }
      axios
        .get(this.url, { responseType: 'blob' })
        .then((resp) => {
          if (!resp.data.gkstatus || resp.data.gkstatus === 0) {
            let blob = resp.data;
            if (this.filePath) {
              if (this.filePath.length) {
                this.filePath.forEach((path) => {
                  blob = blob[path];
                });
              }
            }
            let fileUrl = window.URL.createObjectURL(blob);
            let atag = document.createElement('a');
            atag.href = fileUrl;
            let fileName = `${this.fileName}-${this.orgName}-${this.fileSuffix}`;
            if (this.addDate) {
              let date = this.dateReverse(this.currentDate());
              fileName += `-${date}`;
            }
            if (this.addTimeStamp) {
              let tStamp = new Date().toISOString().substr(11);
              fileName += `-${tStamp}`;
            }
            atag.download = `${fileName}.${this.fileExtn}`;
            atag.style.display = 'none';
            document.body.appendChild(atag);
            atag.click();
          }
          this.loading = false;
        })
        .catch((e) => {
          console.log(e);
          this.loading = false;
        });
    },
  },
};
</script>
