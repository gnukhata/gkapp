<template>
  <section>
    <!-- Headings -->
    <report-header>
      <div class="text-center">
        GST R1 Summary
        <div>
          {{ fromDate }} to
          {{ toDate }}
        </div>
      </div>
    </report-header>

    <!-- R1 Tables (only shown if they have atleast one entry) -->
    <b-overlay
      :show="isLoading"
      spinner-type="grow"
    >
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="light"
          small
          hover
          outlined
          :fields="summaryTableFields"
          :items="summary.consolidated"
          responsive="sm"
        >
          <template #cell(summary_label)="data">
            {{ data.value }}
            <b-button
              class="ml-3"
              variant="link"
              sm
              @click="$bvModal.show(data.item.summary_type)"
              v-if="data.item.invoice_count > 0"
            >
              Details
              <b-icon
                icon="chevron-right"
              />
            </b-button>
            <b-modal
              hide-footer
              size="xl"
              v-if="data.item.invoice_count > 0"
              :id="data.item.summary_type"
              :title="'GST R1 - Detailed Report'"
            >
              <r1-detailed
                :fd="fd"
                :td="td"
                :type="data.item.summary_type"
              />
            </b-modal>
          </template>
        </b-table>
      </div>
      <!-- HSN -->
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
        header="HSN Summary"
        header-class="font-weight-bold"
        v-if="summary.hsn?.b2b?.product_entries || summary.hsn?.b2c?.product_entries"
      >
        <h5 class="my-1">
          B2B Summary
          <b-button-group
            size="sm"
          >
            <b-button
              class="ml-3"
              variant="link"
              sm
              @click="$bvModal.show('hsn_b2b')"
            >
              Details
              <b-icon
                icon="chevron-right"
              />
            </b-button>
            <b-modal
              hide-footer
              size="xl"
              id="hsn_b2b"
              :title="'GST R1 - Detailed Report'"
            >
              <r1-detailed
                :fd="fd"
                :td="td"
                type="hsn_b2b"
              />
            </b-modal>
          </b-button-group>
        </h5>
        <dl
          class="row"
        >
          <dt class="col-sm-3">
            Product Entries:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2b.product_entries }}
          </dd>
          <dt class="col-sm-3">
            Taxable Value:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2b.taxable_value }}
          </dd>
          <dt class="col-sm-3">
            IGST:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2b.igst || '0.00' }}
          </dd>
          <dt class="col-sm-3">
            CGST:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2b.sgst || '0.00' }}
          </dd>
          <dt class="col-sm-3">
            SGST:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2b.sgst || '0.00' }}
          </dd>
          <dt class="col-sm-3">
            Total Value:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2b.total_value }}
          </dd>
        </dl>
        <hr class="mx-1 my-4">
        <h5 class="my-1">
          B2C Summary
          <b-button-group
            size="sm"
          >
            <b-button
              class="ml-3"
              variant="link"
              sm
              @click="$bvModal.show('hsn_b2c')"
            >
              Details
              <b-icon
                icon="chevron-right"
              />
            </b-button>
            <b-modal
              hide-footer
              size="xl"
              id="hsn_b2c"
              :title="'GST R1 - Detailed Report'"
            >
              <r1-detailed
                :fd="fd"
                :td="td"
                type="hsn_b2c"
              />
            </b-modal>
          </b-button-group>
        </h5>
        <dl
          class="row"
        >
          <dt class="col-sm-3">
            Product Entries:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2c.product_entries }}
          </dd>
          <dt class="col-sm-3">
            Taxable Value:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2c.taxable_value }}
          </dd>
          <dt class="col-sm-3">
            IGST:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2c.igst || '0.00' }}
          </dd>
          <dt class="col-sm-3">
            CGST:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2c.sgst || '0.00' }}
          </dd>
          <dt class="col-sm-3">
            SGST:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2c.sgst || '0.00' }}
          </dd>
          <dt class="col-sm-3">
            Total Value:
          </dt>
          <dd class="col-sm-3">
            {{ summary.hsn.b2c.total_value }}
          </dd>
        </dl>
      </b-card>
      <div class="clearfix" />
      <!-- JSON -->
      <div class="mt-4 d-print-none">
        <h3 class="d-inline-block text-secondary ml-3">
          GSTR-1 JSON:
        </h3>

        <div class="float-right">
          <b-button
            @click="copyJsonToClipboard"
            size="sm"
            variant="link"
          >
            <b-icon icon="files" />
          </b-button>
          <b-link
            class="display-inline-block p-1"
            :href="jsonDownloadLink"
            :download="jsonExportFileName"
            :disabled="isLoading"
          >
            <b-icon icon="cloud-download" />
          </b-link>
        </div>
      </div>
      <b-overlay :show="isLoading">
        <div class="position-relative d-print-none">
          <b-toast
            no-close-button
            variant="success"
            id="clipboard-toast"
            auto-hide-delay="1000"
            static
            class="position-absolute"
            style="right:0"
          >
            JSON copied to clipboard!
          </b-toast>
          <b-form-textarea
            id="textarea"
            v-model="jsonStr"
            rows="10"
            max-rows="20"
            readonly
          />
        </div>
      </b-overlay>
      <br>
      <br>
      <br>
    </b-overlay>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import ReportHeader from '@/components/ReportHeader.vue';
import R1Detailed from './R1Detailed.vue';
export default {
  components: { ReportHeader, R1Detailed },
  name: 'R1Summary',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      list: { b2b: [], b2cl: [], b2cs: [], cdnr: [], cdnur: [], hsn1: [] },
      search: null,
      params: null,
      gstData: {},
      jsonExportFileName: null,
      summaryTableFields: [
        {
          key: 'summary_label',
          label: 'Particulars',
        },
        {
          key: 'invoice_count',
          label: 'Count',
        },
        {
          key: 'taxable_value',
          label: 'Taxable',
        },
        {
          key: 'tax',
          label: 'Tax',
        },
        {
          key: 'total_value',
          label: 'Total Value',
        },
      ],
      summary: {
        consolidated: [],
        b2b: [{}],
        b2cs: [{}],
        b2cl: [{}],
        cdnr: [{}],
        cdnur: [{}],
        hsn: {},
      },
    };
  },
  props: {
    td: {
      type: String,
    },
    fd: {
      type: String,
    },
    gstin: {
      type: String,
    },
  },
  computed: {
    jsonStr: function() {
      return typeof this.gstData === 'object'
        ? JSON.stringify(this.gstData, null, 4)
        : JSON.stringify({}, null, 2);
    },
    jsonDownloadLink: function() {
      let link = '';
      if (typeof this.gstData === 'object') {
        link = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(this.gstData)
        )}`;
      }
      return link;
    },
    spreadSheetUrl: function() {
      return `/spreadsheet?gstr1&start=${this.fd}&end=${this.td}`;
    },
    fromDate: function() {
      return this.fd ? this.dateReverse(this.fd) : '';
    },
    toDate: function() {
      return this.td ? this.dateReverse(this.td) : '';
    },
    ...mapState(['orgName', 'orgAddress']),
  },
  watch: {
    fd: function() {
      return this.getGstR1List();
    },
    td: function() {
      return this.getGstR1List();
    },
  },
  methods: {
    copyJsonToClipboard() {
      navigator.clipboard.writeText(this.jsonStr);
      this.$bvToast.show('clipboard-toast');
    },
    jsonFileName() {
      this.jsonExportFileName = `GSTR1_${this.gstin}_${this.fd.replaceAll("-","")}-${this.td.replaceAll("-","")}.json`;
    },
    go(report) {
      this.$router.push(`/gst/r1/${report}/${this.fd}&${this.td}`);
    },
    generateSummary() {
      this.summary.consolidated = [];
      const summaryTypes = ["b2b", "b2cs", "b2cl", "cdnr", "cdnur"];
      summaryTypes.forEach(this.generateConsolidatedSummary);
      this.hsnSummary("b2b");
      this.hsnSummary("b2c");
    },
    /**
     * Generates consolidated summary
     */
    generateConsolidatedSummary(summaryType) {
      let documentList = this.list[summaryType] || []
      let summary = {}

      summary = documentList.reduce(
        (acc, item) => {
          acc.invoice_count++;
          acc.taxable_value += parseFloat(item.taxable_value);
          acc.tax +=
            parseFloat(item.taxable_value) * (parseFloat(item.rate) * 0.01);
          return acc;
        },
        {
          invoice_count: 0,
          taxable_value: 0,
          tax: 0,
        }
      );
      this.summary.consolidated.push({
        summary_type: summaryType,
        summary_label: summaryType.toUpperCase(),
        invoice_count: summary.invoice_count,
        taxable_value: summary.taxable_value.toFixed(2),
        tax: summary.tax.toFixed(2),
        total_value: (summary.tax + summary.taxable_value).toFixed(2),
      });
    },

    hsnSummary(transaction_type) {
      const hsn = this.list.hsn1[transaction_type];

      if (hsn?.length) {
        let o = {
          product_entries: hsn.length,
        };
        let [totVal, sgstVal, igstVal] = [0, 0, 0, 0];
        for (let i in hsn) {
          // add total values
          totVal += parseFloat(hsn[i].taxableamt);
          // SGST values
          sgstVal += parseFloat(hsn[i].SGSTamt);
          // IGST values
          igstVal += parseFloat(hsn[i].IGSTamt);
        }
        o['taxable_value'] = totVal.toFixed(2);
        o['sgst'] = sgstVal.toFixed(2);
        o['igst'] = igstVal.toFixed(2);
        o['total_value'] = (totVal+sgstVal*2+igstVal).toFixed(2);

        this.summary['hsn'][transaction_type] = o;
      } else {
        this.summary['hsn'][transaction_type] = {
          product_entries: 0,
          taxable_value: 0,
          total_value: 0,
          igst: 0,
          sgst: 0,
        };
      }
    },
    /**
     * get GST R1 list
     */
    getGstR1List() {
      this.isLoading = true;
      this.$axios
        .get(`/gst/returns/r1?start=${this.fd}&end=${this.td}`)
        .then((resp) => {
          this.list = resp.data.gkdata;
          this.gstData = resp.data.json;
          this.generateSummary();
          this.isLoading = false;
        });
    },
  },
  mounted() {
    this.getGstR1List();
    this.jsonFileName();
  },
};
</script>

<style>
#textarea {
  font-size: 0.8em;
}
</style>
