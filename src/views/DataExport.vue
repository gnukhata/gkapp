<template>
  <div class="m-2">
    <b-card
      class="gkcard mx-auto"
      :header="this.$gettext('Export Company Data')"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <b-card-body>
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
        <gk-file-download
          :url="
            `/data?export&yearstart=${this.yearStart}&yearend=${this.yearEnd}`
          "
          :fileName="`GNUKhata-DataExport`"
          icon="cloud-download"
          name="Export"
          variant="dark"
          :add-date="true"
        ></gk-file-download>
        <b-alert class="mt-3" show variant="warning">
          <b-icon icon="exclamation-octagon" scale="1.1x" class="mt-2"></b-icon>
          <b v-translate> Note</b>:
          <translate
            >The current exported spreadsheet currenly contains list of accounts
            & vouchers data only</translate
          >
        </b-alert>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import GkFileDownload from '@/components/GkFileDownload.vue';
import { mapState } from 'vuex';
export default {
  name: 'DataExport',
  components: { GkFileDownload },
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
