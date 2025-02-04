<template>
  <section>
    <h2 class="my-4 text-muted display-5">
      VIEW REGISTERS
    </h2>
    <b-overlay
      :show="loading"
      blur
    >
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          View Register: From {{ selected?.fromDate || fromDate }} to
          {{ selected?.toDate || toDate }}
        </b-alert>
        <b-form @submit.prevent="getRegisters">
          <!-- Select Register -->
          <b-row>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="Type"
                label-cols="auto"
              >
                <v-select
                  :options="[{label: 'Sale', code: 0}, {label: 'Purchase', code: 1}]"
                  v-model="registerType"
                  placeholder="Select Register Type"
                  :reduce="register => register.code"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <!-- Date -->
              <b-form-group
                label="From"
                label-cols="auto"
              >
                <gk-date
                  :format-output="true"
                  id="1"
                  required
                  v-model="fromDate"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="To"
                label-cols="auto"
              >
                <gk-date
                  :format-output="true"
                  id="2"
                  required
                  v-model="toDate"
                />
              </b-form-group>
            </b-col>
            <b-col
              cols
              lg="3"
            >
              <b-form-group
                label="Expanded Table"
                label-cols="auto"
              >
                <b-form-checkbox
                  switch
                  v-model="expandedTable"
                  class="d-inline-block mt-1"
                  size="lg"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-button-group
            size="sm"
          >
            <b-button
              @click="updateRoute"
              variant="success"
              type="submit"
              class="mr-2"
              :disabled="registerType == null"
            >
              Submit
            </b-button>
            <b-button
              @click="clear"
              variant="dark"
            >
              <translate>Clear</translate>
            </b-button>
          </b-button-group>
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <div v-if="report.length > 0">
      <div class="mt-4">
        <div class="d-flex d-print-none justify-content-between align-items-center mb-2">
          <!-- Search Field -->
          <div>
            <b-form-input
              type="text"
              class="d-print-none"
              placeholder="Search Table"
              v-model="search"
              size="sm"
              style="align-self:center"
            />
          </div>

          <!-- Export and Print Buttons -->
          <div>
            <gk-file-download
              :url="downloadUrl"
              :file-name="downloadFileName"
              variant="dark"
              title="Export XLSX"
              name="Export XLSX"
              file-extn=".xlsx"
              :message-from-parent="parentMessage"
            />
          </div>
        </div>
      </div>
      <b-table
        caption-top
        :filter="search"
        class="mt-2"
        head-variant="light"
        small
        outlined
        hover
        responsive="sm"
        v-if="report.length > 0"
        :items="report"
        :fields="fields"
        sticky-header="500px"
      >
        <template #cell(document_no)="voucher">
          <b-link
            v-if="voucher.item.v_id"
            :to="{
              name: 'Workflow',
              params: {
                wfName: 'Transactions-Voucher',
                wfId: voucher.item.v_id,
              },
            }"
          >
            {{ voucher.item.v_no }} {{ voucher.item.document_no }}
          </b-link>
        </template>
      </b-table>
    </div>
    <div v-else>
      <b-alert
        show
        class="text-center mx-auto d-print-none"
        variant="primary"
      >
        No data available.
      </b-alert>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import GkFileDownload from '../components/GkFileDownload.vue';

export default {
  name: 'Registers',
  components: { GkDate, GkFileDownload },
  data() {
    return {
      loading: false,
      registerType: null,
      fromDate: '',
      toDate: '',
      search: '',
      report: [],
      tmp_report: [],
      fields: [],
      selected: {},
      expandedTable: false,
      parentMessage: '',
    };
  },
  watch: {
    expandedTable() {
      if (this.registerType != null) {
        this.getRegisters();
      }
    },
  },
  methods: {
    clear() {
      this.registerType = null;
      this.fromDate = this.dateReverse(this.yearStart);
      this.toDate = this.dateReverse(this.yearEnd);
      this.expandedTable = false;
      this.$router.replace({});
      this.report = [];
      this.selected = {};
    },
    formatTable(data) {
      const newdata = data.vouchers.map((voucher) => {
        let obj = {
          v_no: voucher.vouchernumber,
          v_id: voucher.vouchercode,
          document_no: voucher.document_no,
          narration: voucher.narration,
          voucherdate: voucher.voucherdate,
          custname: voucher.custname,
          gstin: voucher.gstin,
          custtin: voucher.custtin,
          amount: parseFloat(voucher.amount).toFixed(2),
          taxed: parseFloat(voucher.taxed).toFixed(2),
        };
        voucher.tax_data.forEach((taxItem) => {
          if (taxItem) {
            obj[taxItem.tax_str] = parseFloat(taxItem.tax_amount).toFixed(2);
          } else {
            obj[taxItem.tax_str] = "0.00";
          }
        });
        return obj;
      });
      let totalRow = {
        custname: 'Total',
        amount: parseFloat(data.voucher_total).toFixed(2),
        taxed: parseFloat(data.taxed_total).toFixed(2),
      };
      data.tax_strings.forEach((taxCol) => {
        if (data.tax_totals[taxCol]) {
          totalRow[taxCol] = parseFloat(data.tax_totals[taxCol]).toFixed(2);
        } else {
          totalRow[taxCol] = "0.00";
        }
      });
      newdata.push(totalRow);

      this.tmp_report = newdata;
      if (this.expandedTable) {
        this.fields = [
          { key: 'document_no', label: 'Voucher No.', stickyColumn: true },
          { key: 'custname', label: 'Customer' },
          { key: 'narration', label: 'Narration', stickyColumn: true },
          { key: 'voucherdate', label: 'Voucher Date' },
        ];

        if (this.isGstEnabled) {
          this.fields.push({ key: 'gstin', label: 'GSTIN' });
        }
        if (this.isVatEnabled) {
          this.fields.push({ key: 'custtin', label: 'TIN' });
        }

        this.fields.push(
          { key: 'amount', label: 'Voucher Amount', tdClass: 'text-right' },
        );

        if (this.isIndia)  {
          this.fields.push(
            ...data.tax_strings.map((taxCol) => {
              return {
                key: taxCol,
                tdClass: 'text-right',
              };
            })
          );
        }

        this.fields.push({ key: 'taxed', label: 'Total', tdClass: 'text-right' });
      } else {
        this.conciseTableRows();
      }

      return newdata;
    },
    // this method get's triggered when the user toggles the table view switch
    conciseTableRows() {
      this.fields = [
        { key: 'document_no', label: 'Voucher No.', stickyColumn: true },
        { key: 'custname', label: 'Customer' },
        { key: 'voucherdate', label: 'Voucher Date' },
        { key: 'amount', label: 'Voucher Amount', tdClass: 'text-right' },
        { key: 'taxed', label: 'Total', tdClass: 'text-right' },
      ];
    },
    getRegisters() {
      this.report = [];
      this.loading = true;
      this.$axios
        .get(
          `/reports/registers?flag=${this.registerType}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
        )
        .then((resp) => {
          console.log(resp);
          this.report = this.formatTable(resp);
          this.selected = {
            registerType: this.registerType,
            fromDate: this.fromDate,
            toDate: this.toDate,
          }
          this.loading = false;
        })
    },
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          from: this.fromDate,
          to: this.toDate,
          type: this.registerType,
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      if (params?.type) {
        this.fromDate = params?.from || this.yearStart;
        this.toDate = params?.to || this.yearEnd;
        this.registerType = Number(params.type);
        this.getRegisters();
      } else {
        this.fromDate = this.dateReverse(this.yearStart);
        this.toDate = this.dateReverse(this.yearEnd);
      }
    },
  },
  computed: {
    downloadUrl: (self) => {
      return `/spreadsheet/view-register?title=Register as&from=${self.selected.fromDate}&to=${self.selected.toDate}&fields=${JSON.stringify(self.fields)}`
    },
    downloadFileName: (self) =>
      `Profit_Loss_${self.fromDate}_to_${self.toDate}`,
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
  },
  mounted() {
    this.parseParams();
  },
};
</script>
