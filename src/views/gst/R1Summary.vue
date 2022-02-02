<template>
  <section class="m-2">
    <!-- Headings -->
    <report-header :show="true">
      <div class="text-center">
        GST R1 Summary
        <div>
          {{ dateReverse(this.params.fd) }} to
          {{ dateReverse(this.params.td) }}
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
      <div v-if="list.b2b.length > 0">
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
      <div v-if="list.b2cl.length > 0">
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
      <div v-if="list.b2cs.length > 0">
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
      <div v-if="list.cdnr.length > 0">
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
      <div v-if="list.cdnur.length > 0">
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
      <div v-if="list.hsn1.length > 0">
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
      list: Object,
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
  computed: {
    ...mapState(['orgName', 'orgAddress']),
  },
  mounted() {
    this.b2bSummary();
  },
  methods: {
    go(report) {
      this.$router.push(
        `/gst/r1/${report}/${this.params.fd}&${this.params.td}`
      );
    },
    /**
     * Generates B2B summary
     */
    b2bSummary() {
      let b2b = this.list.b2b;
      // if only one entry is present
      if (b2b.length == 1) {
        const o = {
          invoice_count: 1,
          invoice_value: b2b[0]['invoice_value'],
          taxable_value: b2b[0]['taxable_value'],
          cess: b2b[0]['cess'],
        };
        this.summary['b2b'].push(o);
        // for more than one entry
      } else if (b2b.length > 1) {
        let o = {
          invoice_count: b2b.length,
        };
        // add invoice values
        let [invVal, taxVal, cessVal] = [0, 0, 0];
        for (let i in b2b) {
          invVal += parseFloat(b2b[i].invoice_value);
        }
        o['invoice_value'] = invVal;

        // add taxable values
        for (let i in b2b) {
          taxVal += parseFloat(b2b[i].taxable_value);
        }
        o['taxable_value'] = taxVal;

        // add cess values
        for (let i in b2b) {
          cessVal += parseFloat(b2b[i].cess);
        }
        o['cess'] = cessVal;

        this.summary['b2b'].push(o);
      }
      this.cdnrSummary();
      this.b2csSummary();
    },
    b2csSummary() {
      let b2cs = this.list.b2cs;
      // if only one entry is present
      if (b2cs.length == 1) {
        const o = {
          invoice_count: 1,
          taxable_value: b2cs[0]['taxable_value'],
          rate: b2cs[0]['rate'],
          cess: b2cs[0]['cess'],
        };
        this.summary['b2cs'].push(o);
        // for more than one entry
      } // else if (b2b.length > 1) {
      // let o = {
      //   invoice_count: b2b.length,
      // };
      // // add invoice values
      // let [invVal, taxVal, cessVal] = [0, 0, 0];
      // for (let i in b2b) {
      //   invVal += parseFloat(b2b[i].invoice_value);
      // }
      // o['invoice_value'] = invVal;
      //
      // // add taxable values
      // for (let i in b2b) {
      //   taxVal += parseFloat(b2b[i].taxable_value);
      // }
      // o['taxable_value'] = taxVal;
      //
      // // add cess values
      // for (let i in b2b) {
      //   cessVal += parseFloat(b2b[i].cess);
      // }
      // o['cess'] = cessVal;
      //
      // this.summary['b2b'].push(o);
      //       }
    },
    cdnrSummary() {
      let cdnr = this.list.cdnr;
      // if only one entry is present
      if (cdnr.length == 1) {
        const o = {
          invoice_count: 1,
          invoice_value: cdnr[0]['refund_voucher_value'],
          taxable_value: cdnr[0]['taxable_value'],
          cess: cdnr[0]['cess'],
        };
        this.summary['cdnr'].push(o);
        // for more than one entry
      } else if (cdnr.length > 1) {
        let o = {
          invoice_count: cdnr.length,
        };
        // add invoice values
        let [rvVal, taxVal, cessVal] = [0, 0, 0];
        for (let i in cdnr) {
          rvVal += parseFloat(cdnr[i].refund_voucher_value);
        }
        o['refund_voucher_value'] = parseFloat(rvVal).toFixed(2);

        // add taxable values
        for (let i in cdnr) {
          taxVal += parseFloat(cdnr[i].taxable_value);
        }
        o['taxable_value'] = taxVal;

        // add cess values
        for (let i in cdnr) {
          cessVal += parseFloat(cdnr[i].cess);
        }
        o['CESS'] = cessVal;
        this.summary['cdnr'].push(o);
      }
      this.hsnSummary();
    },
    hsnSummary() {
      let hsn = this.list.hsn1;
      // if only one entry is present
      if (hsn.length == 1) {
        const o = {
          product_entries: 1,
          total_value: hsn[0]['totalvalue'],
          taxable_value: hsn[0]['taxableamt'],
          SGST: hsn[0]['SGSTamt'],
          IGST: hsn[0]['IGSTamt'],
          cess: hsn[0]['cess'],
        };
        this.summary['hsn'].push(o);
        // for more than one entry
      } else if (hsn.length > 1) {
        let o = {
          product_entries: hsn.length,
        };
        // add total values
        let [totVal, taxVal, sgstVal, igstVal, cessVal] = [0, 0, 0, 0, 0];
        for (let i in hsn) {
          totVal += parseFloat(hsn[i].totalvalue);
        }
        o['total_value'] = parseFloat(totVal).toFixed(2);

        // add taxable values
        for (let i in hsn) {
          taxVal += parseFloat(hsn[i].taxableamt);
        }
        o['taxable_value'] = taxVal;

        // SGST values
        for (let i in hsn) {
          sgstVal += parseFloat(hsn[i].SGSTamt);
        }
        o['SGST'] = sgstVal;

        // IGST values
        for (let i in hsn) {
          igstVal += parseFloat(hsn[i].IGSTamt);
        }
        o['IGST'] = igstVal;

        // add cess values
        for (let i in hsn) {
          cessVal += parseFloat(hsn[i].CESSamt);
        }
        o['CESS'] = cessVal;
        this.summary['hsn'].push(o);
      }
    },
    /**
     * get GST R1 list
     */
    getGstR1List() {
      this.loading = true;
      axios
        .get(
          `/gstreturns?type=r1&start=${this.params.fd}&end=${this.params.td}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkresult) {
              case 0:
                this.list = r.data.gkdata;
                this.b2bSummary();
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
    debugger;
    this.params = this.$route.params;
    this.getGstR1List();
  },
};
</script>
