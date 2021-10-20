<template>
  <b-button variant="link" @click.prevent="onFileDownload">
    <b-icon
      aria-hidden="true"
      class="align-middle"
      icon="cloud-download"
      :font-scale="fontScale"
    ></b-icon>
  </b-button>
</template>

<script>
import axios from 'axios';
// import { mapState } from 'vuex';
export default {
  name: 'GkFileDownloader',
  props: {
    fileName: {
      type: String,
      required: false,
      default: `GNUKhata_${new Date().toISOString().substr(0, 10)}`,
    },
    fileExtn: {
      type: String,
      required: true,
      note: 'Extension of the file to be downloaded, e.g. xlsx or jpeg',
    },
    addDate: {
      type: Boolean,
      required: false,
      default: false,
      note: 'Flag to add current date to the file name during download',
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
  },
  data() {
    return {};
  },
  computed: {
    // ...mapState(['orgName', 'userName']),
  },
  watch: {},
  methods: {
    onFileDownload() {
      axios.get(this.url, { responseType: 'blob' }).then((resp) => {
        if (!resp.data.gkstatus || resp.data.gkstatus === 0) {
          let blob = resp.data;
          if (this.filePath) {
            if(this.filePath.length) {
              this.filePath.forEach((path) => {
                blob = blob[path];
              });
            }
          }
          let fileUrl = window.URL.createObjectURL(blob);
          let atag = document.createElement('a');
          atag.href = fileUrl;
          if (this.addDate) {
            let date = new Date().toISOString().substr(0, 10);
            atag.download = `${this.fileName}-${date}.${this.fileExtn}`;
          } else {
            atag.download = `${this.fileName}.${this.fileExtn}`;
          }
          atag.style.display = 'none';
          document.body.appendChild(atag);
          atag.click();
        }
      });
    },
  },
};
</script>
