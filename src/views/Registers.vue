<template>
  <section class="m-1">
    <b-overlay :show="loading" blur>
      <b-card
        header="View Registers"
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
                  >-- Select Type Of Register --</b-form-select-option
                >
              </template>
              <b-form-select-option value="1">Purchase</b-form-select-option>
              <b-form-select-option value="0">Sale</b-form-select-option>
            </b-form-select>
          </b-form-group>
          <!-- Date -->
          <div class="row">
            <div class="col">
              <b-form-group label="From">
                <gk-date
                  :formatOutput="true"
                  id="1"
                  required
                  v-model="fromDate"
                ></gk-date>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group label="To">
                <gk-date
                  :formatOutput="true"
                  id="2"
                  required
                  v-model="toDate"
                ></gk-date>
              </b-form-group>
            </div>
          </div>
          <b-button variant="success" type="submit" class="float-right"
            ><b-icon icon="cloud-download"></b-icon> Get Details</b-button
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
          | From
          <b>{{ fromDate }}</b>
          to
          <b>{{ toDate }}</b>
        </div>
      </report-header>
      <b-form-input
        type="text"
        class="mx-auto gkcard mt-3 border border-dark d-print-none"
        placeholder="search Register"
        v-model="search"
      ></b-form-input>
      <b-table
        caption-top
        :filter="search"
        class="mt-3"
        head-variant="dark"
        responsive="lg"
        small
        bordered
        striped
        stacked="sm"
        v-if="report.length > 0"
        :items="report"
      >
        <template #cell(invoice_no)="d">
          <b-link
            @click="
              $router.push(
                '/workflow/Transactions-Invoice/' + d.item.invoice_id
              )
            "
            >{{ d.item.invoice_no }}
          </b-link>
        </template>
      </b-table>
    </div>
  </section>
</template>
<!-- TODOS
     * Fix Table fields
     * API response has object with multiple key/values. Process them
     * Add Button for export as spreadsheet
-->
<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import axios from 'axios';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  name: 'Registers',
  components: { GkDate, ReportHeader },
  data() {
    return {
      loading: false,
      registerType: '',
      fromDate: '',
      toDate: '',
      search: '',
      report: [],
      tmp_report: [],
    };
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
          tax: d.tax,
          tax_amount: d.taxamount,
        };
        // let netTax = obj.tax
        //   for (const i in data.taxcolumns) {
        //       obj["taxable_amount"] =
        //   }
        return obj;
      });
      data.totalrow.name = 'Total';
      newdata.push(data.totalrow);
      this.tmp_report = newdata;
      return newdata;
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
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  mounted() {
    this.fromDate = this.dateReverse(this.yearStart);
    this.toDate = this.dateReverse(this.currentDate());
  },
};
</script>
