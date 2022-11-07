<template>
  <section class="m-1">
    <b-overlay :show="loading" blur>
      <b-card
        :header="$gettext('View Registers')"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="getRegisters">
          <!-- Select Register -->
          <b-form-group label="Type" label-cols="auto">
            <b-form-select ref="register-type" v-model="registerType" required>
              <template #first>
                <b-form-select-option disabled value=""
                  ><translate
                    >-- Select Type Of Register --</translate
                  ></b-form-select-option
                >
              </template>
              <b-form-select-option value="1"
                ><translate>Purchase</translate></b-form-select-option
              >
              <b-form-select-option value="0"
                ><translate>Sale</translate></b-form-select-option
              >
            </b-form-select>
          </b-form-group>
          <!-- Date -->
          <div class="row">
            <div class="col">
              <b-form-group :label="$gettext('From')">
                <gk-date
                  :formatOutput="true"
                  id="1"
                  required
                  v-model="fromDate"
                ></gk-date>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group :label="$gettext('To')">
                <gk-date
                  :formatOutput="true"
                  id="2"
                  required
                  v-model="toDate"
                ></gk-date>
              </b-form-group>
            </div>
          </div>
          <b-button
            @click="updateRoute()"
            variant="success"
            type="submit"
            class="float-right"
            ><b-icon class="mr-1" icon="cloud-download"></b-icon>
            <translate>Get Details</translate></b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <div v-if="report.length > 0">
      <report-header>
        <div class="text-center">
          <b
            >{{
              $refs['register-type'].value == 0 ? 'Sale' : 'Purchase'
            }}
            Register</b
          >
          | <translate>From</translate>
          <b class="ml-1 mr-1">{{ fromDate }}</b>
          <translate>to</translate>
          <b class="mr-1 ml-2">{{ toDate }}</b>
        </div>
      </report-header>
      <gk-toolbar class="mt-5">
        <template #left>
          <b-form-input
            type="text"
            class="d-print-none"
            :placeholder="$gettext('search Register')"
            v-model="search"
            size="sm"
            style="align-self:center"
          ></b-form-input>
        </template>
        <template>
          <div class="d-flex flex-row-reverse m-1">
            <b-checkbox switch v-model="expandedTable"></b-checkbox>
            <span class="mr-1" v-translate>Expanded Table</span>
          </div>
        </template>
      </gk-toolbar>
      <b-table
        caption-top
        :filter="search"
        class="mt-2"
        head-variant="dark"
        small
        bordered
        striped
        v-if="report.length > 0"
        :items="report"
        :fields="fields"
        sticky-header="500px"
      >
        <template #cell(invoice_no)="d">
          <b-link
            :to="{
              name: 'Workflow',
              params: {
                wfName:
                  d.item.icflag === 9
                    ? 'Transactions-Invoice'
                    : 'Transactions-CashMemo',
                wfId: d.item.invoice_id,
              },
            }"
          >
            {{ d.item.invoice_no }}
          </b-link>
        </template>
      </b-table>
    </div>
  </section>
</template>
<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import axios from 'axios';
import ReportHeader from '../components/ReportHeader.vue';
import GkToolbar from '@/components/GkToolbar.vue';
export default {
  name: 'Registers',
  components: { GkDate, ReportHeader, GkToolbar },
  data() {
    return {
      loading: false,
      registerType: '',
      fromDate: '',
      toDate: '',
      search: '',
      report: [],
      tmp_report: [],
      fields: [],
      expandedTable: false,
    };
  },
  watch: {
    expandedTable(v) {
      console.info(v);
      this.getRegisters();
    },
  },
  methods: {
    formatTable(data) {
      const newdata = data.gkresult.map((d) => {
        let obj = {
          sr_no: d.srno,
          invoice_id: d.invid,
          invoice_no: d.invoiceno,
          date: d.invoicedate,
          name: d.customername,
          GSTIN: d.custgstin,
          TIN: d.customertin,
          gross_amount: d.grossamount,
          tax_free: d.taxfree,
          // tax: d.tax,
          // tax_amount: d.taxamount,
          icflag: d.icflag,
        };
        data.taxcolumns.forEach((taxCol) => {
          if (d.taxamount[taxCol]) {
            obj[taxCol] = d.taxamount[taxCol];
            obj['taxable'] = d.tax[taxCol];
          } else {
            obj[taxCol] = 0;
          }
        });
        // let netTax = obj.tax
        //   for (const i in data.taxcolumns) {
        //       obj["taxable_amount"] =
        //   }
        return obj;
      });

      let totalRow = {
        name: 'Total',
        tax_free: data.totalrow.taxfree,
        gross_amount: data.totalrow.grossamount,
      };
      data.taxcolumns.forEach((taxCol) => {
        if (data.totalrow.taxamount[taxCol]) {
          totalRow[taxCol] = data.totalrow.taxamount[taxCol];
          totalRow['taxable'] = data.totalrow.tax[taxCol];
        } else {
          totalRow[taxCol] = 0;
        }
      });
      newdata.push(totalRow);

      this.tmp_report = newdata;
      if (this.expandedTable) {
        this.fields = [
          { key: 'sr_no', label: 'No.', stickyColumn: true },
          { key: 'invoice_no', label: 'Inv. No.', stickyColumn: true },
          { key: 'date', label: 'Inv. Date' },
          { key: 'name', label: 'Customer' },
          { key: 'GSTIN', label: 'GSTIN' },
          { key: 'TIN', label: 'TIN' },
          { key: 'tax_free', label: 'Tax Free', tdClass: 'text-right' },
        ];

        this.fields.push(
          ...data.taxcolumns.map((taxCol) => {
            return {
              key: taxCol,
              tdClass: 'text-right',
            };
          })
        );

        this.fields.push({ key: 'taxable', tdClass: 'text-right' });
        this.fields.push({ key: 'gross_amount', tdClass: 'text-right' });
      } else {
        this.conciseTableRows();
      }

      return newdata;
    },
    // this method get's triggered when the user toggles the table view switch
    conciseTableRows() {
      this.fields = [
        { key: 'sr_no', label: 'No.', stickyColumn: true },
        { key: 'invoice_no', label: 'Inv. No.', stickyColumn: true },
        { key: 'date', label: 'Inv. Date' },
        { key: 'name', label: 'Customer' },
        { key: 'GSTIN', label: 'GSTIN' },
        { key: 'TIN', label: 'TIN' },
        { key: 'tax_free', label: 'Tax Free', tdClass: 'text-right' },
        { key: 'taxable', tdClass: 'text-right' },
        { key: 'gross_amount', tdClass: 'text-right' },
      ];
    },
    getRegisters() {
      this.report = [];
      this.loading = true;
      axios
        .get(
          `/report?type=register&flag=${this.registerType}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.report = this.formatTable(r.data);
                break;
              case 1:
                this.$bvToast.toast('Duplicate Entry', {
                  variant: 'warning',
                  solid: true,
                });
                break;
              case 2:
                this.$bvToast.toast('Unauthorised Access', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 3:
                this.$bvToast.toast('Data error', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast('No Privilege', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 5:
                this.$bvToast.toast('Integrity error', {
                  variant: 'danger',
                  solid: true,
                });
                break;
            }
            this.loading = false;
          } else {
            this.$bvToast.toast('failed to load register data ', {
              variant: 'danger',
              solid: true,
            });
            this.loading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
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
      if (Object.keys(params).length > 0) {
        this.fromDate = params.from;
        this.toDate = params.to;
        this.registerType = params.type;
      } else {
        this.fromDate = this.dateReverse(this.yearStart);
        this.toDate = this.dateReverse(this.currentDate());
        this.registerType = 0;
      }
      this.getRegisters();
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  mounted() {
    this.parseParams();
  },
};
</script>
