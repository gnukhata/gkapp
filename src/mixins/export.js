import axios from 'axios';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['orgName', 'orgType', 'yearStart', 'yearEnd']),
  },
  methods: {
    exportFile(url, metadata) {
      let fullUrl = url;
      const {
        filePath,
        fileName = 'GNUKhata',
        fileSuffix = '',
        fileExtn = 'xslx',
        addDate = true,
        addTimeStamp = false,
        commonParams = true,
      } = metadata ?? {};
      if (commonParams) {
        fullUrl = `${url}&fystart=${encodeURIComponent(this.dateReverse(this.yearStart))}&fyend=${encodeURIComponent(this.dateReverse(this.yearEnd))}&orgname=${encodeURIComponent(this.orgName)}&orgtype=${encodeURIComponent(this.orgType)}`;
      }
      const self = this;
      return axios
        .get(fullUrl, { responseType: 'blob' })
        .then((resp) => {
          if (resp.data.gkstatus === 0 || resp.data.gkstatus === undefined) {
            let blob = resp.data;
            if (filePath) {
              if (filePath.length) {
                filePath.forEach((path) => {
                  blob = blob[path];
                });
              }
            }
            let fileUrl = window.URL.createObjectURL(blob);
            let atag = document.createElement('a');
            atag.href = fileUrl;
            let _fileName = `${fileName}-${this.orgName}-${fileSuffix}`;
            if (addDate) {
              let date = self.dateReverse(self.currentDate());
              _fileName += `-${date}`;
            }
            if (addTimeStamp) {
              let tStamp = new Date().toISOString().substr(11);
              _fileName += `-${tStamp}`;
            }
            atag.download = `${_fileName}.${fileExtn}`;
            atag.style.display = 'none';
            document.body.appendChild(atag);
            atag.click();
          } else {
            self.gk_toast(
              'File Download failed',
              `Failed with status code ${resp.data.gkstatus}`
            );
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
