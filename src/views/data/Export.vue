<template>
  <div class="m-2">
    <b-card
      class="gkcard mx-auto"
      :header="this.$gettext('Export Company Data')"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <b-card-body>
        <b-form required @submit.prevent="check">
          <div v-translate>
            This menu will enable you to export organisation data, that is, all
            its accounts and records in these accounts in two formats:

            <ul class="mt-2">
              <li>Microsoft Excel Open XML Spreadsheet (.xslx) [legacy]</li>
              <li>Json (.json)</li>
            </ul>
            Click on any of the available "Export" buttons to start the export.
            Please do not reload or close the window while the export process is
            on. A download window will pop up when export is done. You can open
            or save the file.
          </div>
          <br />
          <!-- Export buttons -->
          <b-button-group>
            <gk-file-download
              :url="
                `/export/xlsx?yearstart=${this.yearStart}&yearend=${this.yearEnd}`
              "
              :fileName="`GNUKhata-DataExport`"
              name="Export (Legacy)"
              variant="dark"
              :add-date="true"
              :addTimeStamp="true"
              class="mr-1"
              :messageFromParent="parentMessage"
            ></gk-file-download>
            <gk-file-download
              :url="`/export/json`"
              fileExtn="json"
              icon="file-earmark-code"
              name="Export (Json)"
              variant="dark"
              :add-date="true"
              fileSuffix="Export"
              :addTimeStamp="true"
							:commonParams="false"
              :messageFromParent="parentMessage"
            ></gk-file-download>
          </b-button-group>
          <b-alert class="mt-3" show variant="warning">
            <b-icon
              icon="exclamation-octagon"
              scale="1.1x"
              class="mt-2"
            ></b-icon>
            <b v-translate> Note</b>:
            <translate>
              The current exported spreadsheet currenly contains list of
              accounts & vouchers data only
            </translate>
          </b-alert>
        </b-form>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import GkFileDownload from '@/components/GkFileDownload.vue';
import { mapState } from 'vuex';
export default {
  name: 'Export',
  components: { GkFileDownload },
  data() {
    return {
      parentMessage: '',
      fileName: '',
      url: '',
    };
  },
  computed: {
    ...mapState(['orgName', 'yearStart', 'yearEnd']),
  },
};
</script>
