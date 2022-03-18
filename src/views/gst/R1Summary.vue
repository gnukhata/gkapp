<template>
  <section class="m-2">
    <!-- Headings -->
    <report-header :show="true">
      <div class="text-center">
        GST R1 Summary
        <div>
          {{ fromDate }} to
          {{ toDate }}
        </div>
      </div>
    </report-header>
    <!-- <div class="mt-2 gkcard mx-auto">
             <b-form-input type="text" v-model="search" placeholder="Search">
             </b-form-input>
             </div> -->

    <!-- R1 Tables (only shown if they have atleast one entry) -->
    <b-overlay :show="loading" spinner-type="grow">
      <!-- B2B -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.b2b"
          :fields="b2bfields"
          responsive
        >
          <!-- <template #table-busy>
                     <div class="text-center my-2">
                     <b-spinner type="grow" class="align-middle"></b-spinner>
                     <strong> Fetching data</strong>
                     </div>
                     </template> -->
          <template #table-caption
            ><h3 class="ml-4">B2B Invoices:</h3>
          </template>
        </b-table>
        <b-button size="sm" @click="go('b2b')" class="float-right"
          >Details <b-icon icon="chevron-right"></b-icon>
        </b-button>
      </div>
      <!-- B2CL -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="list.b2cl"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">B2CL:</h3></template>
        </b-table>
        <b-button class="arrow-right-circle" @click="go('b2cl')"
          >Details</b-button
        >
      </div>
      <!-- B2CS -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.b2cs"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">B2CS:</h3></template>
        </b-table>
        <b-button size="sm" class="float-right" @click="go('b2cs')"
          >Details <b-icon icon="chevron-right"></b-icon
        ></b-button>
      </div>
      <!-- CDNR -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.cdnr"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">CDNR:</h3></template>
        </b-table>
        <b-button size="sm" class="float-right" @click="go('cdnr')"
          >Details <b-icon icon="chevron-right"></b-icon
        ></b-button>
      </div>
      <!-- CDNUR -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="list.cdnur"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">CDNUR:</h3></template>
        </b-table>
        <b-button size="sm" class="float-right" @click="go('cdnur')"
          >Details <b-icon icon="chevron-right"></b-icon
        ></b-button>
      </div>
      <!-- HSN -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.hsn"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">HSN:</h3></template>
        </b-table>
        <b-button size="sm" class="float-right" @click="go('hsn1')"
          >Details <b-icon icon="chevron-right"></b-icon
        ></b-button>
      </div>
      <br />
      <br />
      <br />
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import ReportHeader from '../../components/ReportHeader.vue';
export default {
  components: { ReportHeader },
  name: 'R1Detailed',
  data() {
    return {
      list: { b2b: [], b2cl: [], b2cs: [], cdnr: [], cdnur: [], hsn1: [] },
      search: null,
      params: null,
      loading: false,
      summary: {
        b2b: [],
        b2cs: [],
        cdnr: [],
        hsn: [],
      },
      b2bfields: [
        {
          key: 'invoice_count',
          label: 'Invoice Count',
        },
        {
          key: 'invoice_value',
          label: 'Invoice Value',
        },
        {
          key: 'taxable_value',
          label: 'Taxable Value',
        },
        {
          key: 'cess',
          label: 'CESS',
        },
      ],
    };
  },
  props: {
    td: {
      type: String,
    },
    fd: {
      type: String,
    },
  },
  computed: {
    fromDate: function() {
      return this.fd ? this.dateReverse(this.fd) : '';
    },
    toDate: function() {
      return this.td ? this.dateReverse(this.td) : '';
    },
    ...mapState(['orgName', 'orgAddress']),
  },
  methods: {
    go(report) {
      this.$router.push(`/gst/r1/${report}/${this.fd}&${this.td}`);
    },
    generateSummary() {
      this.b2bSummary();
      this.cdnrSummary();
      this.b2csSummary();
      this.hsnSummary();
    },
    /**
     * Generates B2B summary
     */
    b2bSummary() {
      const b2b = this.list.b2b;

      if (b2b.length) {
        let o = {
          invoice_count: b2b.length,
        };
        let [invVal, taxVal, cessVal] = [0, 0, 0];
        for (let i in b2b) {
          // add invoice values
          invVal += parseFloat(b2b[i].invoice_value);
          // add taxable values
          taxVal += parseFloat(b2b[i].taxable_value);
          // add cess values
          cessVal += parseFloat(b2b[i].cess);
        }
        o['invoice_value'] = invVal.toFixed(2);
        o['taxable_value'] = taxVal.toFixed(2);
        o['cess'] = cessVal.toFixed(2);

        this.summary['b2b'] = [o];
      } else {
        this.summary['b2b'] = [
          {
            invoice_count: 0,
            invoice_value: 0,
            taxable_value: 0,
            cess: 0,
          },
        ];
      }
    },
    b2csSummary() {
      const b2cs = this.list.b2cs;

      if (b2cs.length) {
        let summary = b2cs.reduce(
          (acc, item) => {
            acc.invoice_count++;
            acc.taxable_value += parseFloat(item.taxable_value);
            acc.rate += parseFloat(item.rate);
            acc.cess += parseFloat(item.cess);
            return acc;
          },
          { invoice_count: 0, taxable_value: 0, rate: 0, cess: 0 }
        );
        this.summary['b2cs'] = [
          {
            invoice_count: summary.invoice_count.toFixed(2),
            taxable_value: summary.taxable_value.toFixed(2),
            rate: summary.rate.toFixed(2),
            cess: summary.cess.toFixed(2),
          },
        ];
      } else {
        this.summary['b2cs'] = [
          {
            invoice_count: 0,
            taxable_value: 0,
            rate: 0,
            cess: 0,
          },
        ];
      }
    },
    cdnrSummary() {
      const cdnr = this.list.cdnr;

      if (cdnr.length) {
        let o = {
          invoice_count: cdnr.length,
        };
        let [rvVal, taxVal, cessVal] = [0, 0, 0];
        for (let i in cdnr) {
          // add refund voucher values
          rvVal += parseFloat(cdnr[i].refund_voucher_value);
          // add taxable values
          taxVal += parseFloat(cdnr[i].taxable_value);
          // add cess values
          cessVal += parseFloat(cdnr[i].cess);
        }
        o['refund_voucher_value'] = parseFloat(rvVal).toFixed(2);
        o['taxable_value'] = taxVal.toFixed(2);
        o['CESS'] = cessVal.toFixed(2);

        this.summary['cdnr'] = [o];
      } else {
        this.summary['cdnr'] = [
          {
            invoice_count: 0,
            invoice_value: 0,
            taxable_value: 0,
            cess: 0,
          },
        ];
      }
    },
    hsnSummary() {
      const hsn = this.list.hsn1;

      if (hsn.length) {
        let o = {
          product_entries: hsn.length,
        };
        let [totVal, taxVal, sgstVal, igstVal, cessVal] = [0, 0, 0, 0, 0];
        for (let i in hsn) {
          // add total values
          totVal += parseFloat(hsn[i].totalvalue);
          // add taxable values
          taxVal += parseFloat(hsn[i].taxableamt);
          // SGST values
          sgstVal += parseFloat(hsn[i].SGSTamt);
          // IGST values
          igstVal += parseFloat(hsn[i].IGSTamt);
          // add cess values
          cessVal += parseFloat(hsn[i].CESSamt);
        }
        o['total_value'] = totVal.toFixed(2);
        o['taxable_value'] = taxVal.toFixed(2);
        o['SGST'] = sgstVal.toFixed(2);
        o['IGST'] = igstVal.toFixed(2);
        o['CESS'] = cessVal.toFixed(2);

        this.summary['hsn'] = [o];
      } else {
        this.summary['hsn'] = [
          {
            product_entries: 0,
            total_value: 0,
            taxable_value: 0,
            SGST: 0,
            IGST: 0,
            cess: 0,
          },
        ];
      }
    },
    /**
     * get GST R1 list
     */
    getGstR1List() {
      this.loading = true;
      axios
        .get(`/gstreturns?type=r1&start=${this.fd}&end=${this.td}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.list = r.data.gkdata;
                this.generateSummary();
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
          } else {
            console.log(r);
          }
          this.loading = false;
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
  mounted() {
    // this.params = this.$route.params;
    // this.b2bSummary();
    this.getGstR1List();
  },
};
</script>
