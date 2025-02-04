<template>
  <section class="container-fluid mt-2">
    <b-form
      required
      @submit.prevent="check"
    >
      <b-card no-body>
        <template #header>
          <h5 class="my-2">
            Export Data
          </h5>
        </template>
        <b-card-body>
          <div v-translate>
            You can export your organisation data in two formats:
            <ul class="mt-2">
              <li>Microsoft Excel Open XML Spreadsheet (.xslx) [legacy]</li>
              <li>Json (.json)</li>
            </ul>
            Click on any of the available "Export" buttons to start the export.
            Please do not reload or close the window while the export process
            is going on. A download window will pop up when export is done.
            You can open or save the file.
          </div>
          <br>
          <!-- Export buttons -->
          <b-button-group size="sm">
            <gk-file-download
              :url="
                `/export/xlsx?yearstart=${this.yearStart}&yearend=${this.yearEnd}`
              "
              :file-name="`GNUKhata-DataExport`"
              name="Export (Legacy)"
              variant="success"
              :add-date="true"
              :add-time-stamp="true"
              class="mr-1"
              :message-from-parent="parentMessage"
            />
            <gk-file-download
              :url="`/export/json`"
              file-extn="json"
              icon="file-earmark-code"
              name="Export (JSON)"
              variant="success"
              :add-date="true"
              file-suffix="Export"
              :add-time-stamp="true"
              :common-params="false"
              :message-from-parent="parentMessage"
            />
          </b-button-group>
          <b-alert
            class="mt-3"
            show
            variant="warning"
          >
            <b-icon
              icon="exclamation-octagon"
              scale="1.1x"
              class="mt-2"
            />
            <b v-translate> Note</b>:
            <translate>
              The current exported spreadsheet currenly contains list of
              accounts & vouchers data only
            </translate>
          </b-alert>
        </b-card-body>
      </b-card>
    </b-form>
  </section>
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
