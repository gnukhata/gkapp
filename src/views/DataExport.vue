<template>
  <div class="m-2">
    <b-card
      class="gkcard mx-auto"
      :header="this.$gettext('Data Export Wizard')"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <b-card-body>
        <h3><translate>Export Company Data</translate></h3>
        <translate
          >This will enable you to export organisation data, that is, all its
          accounts and records in these accounts in a spreadsheet (xslx) format.
          Click on the "Export" button to start the export. Please do not reload
          or close the window while the export process is on. A download window
          will pop up when export is done. You can save the spreadsheet or open
          it for editing.</translate
        >
        <br />
        <br />
        <gk-file-downloader
          :url="
            `/data?export&yearstart=${this.yearStart}&yearend=${this.yearEnd}`
          "
          :fileName="`GNUKhata-DataExport`"
          icon="cloud-download"
          name="Export"
          variant="dark"
          :add-date="true"
        ></gk-file-downloader>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import GkFileDownloader from '@/components/GkFileDownloader.vue';
import { mapState } from 'vuex';
export default {
  name: 'DataExport',
  components: { GkFileDownloader },
  data() {
    return {
      fileName: '',
      url: '',
    };
  },
  computed: {
    ...mapState(['orgName', 'yearStart', 'yearEnd']),
  },
};
</script>
