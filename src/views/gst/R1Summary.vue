<template>
  <section class="m-2">
    <!-- Headings -->
    <report-header :show="true">
      <div class="text-center">
        GST R1 Summary
        <div>
          {{ dateReverse(this.params.td) }} to
          {{ dateReverse(this.params.fd) }}
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
      <b-table
        caption-top
        class="mt-3"
        head-variant="dark"
        small
        bordered
        striped
        :filter="search"
        :items="summary.b2b"
        :fields="b2bfields"
        responsive="sm"
      >
        <!-- <template #table-busy>
                     <div class="text-center my-2">
                     <b-spinner type="grow" class="align-middle"></b-spinner>
                     <strong> Fetching data</strong>
                     </div>
                     </template> -->
        <template #table-caption><h3 class="ml-4">B2B Invoices:</h3> </template>
      </b-table>
      <b-button @click="go('b2b')" class="float-right"
        >Details <b-icon icon="chevron-right"></b-icon>
      </b-button>
      <!-- B2CL -->
      <div v-if="list.b2cl.length > 0">
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          striped
          :filter="search"
          :items="list.b2cl"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">B2CL:</h3></template>
        </b-table>
        <b-button class="float-right" @click="go('b2cl')">Details</b-button>
      </div>
      <!-- B2CS -->
      <div v-if="list.b2cs.length > 0">
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          striped
          :filter="search"
          :items="list.b2cs"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">B2CS:</h3></template>
        </b-table>
        <b-button class="float-right" @click="go('b2cs')">Details</b-button>
      </div>
      <!-- CDNR -->
      <div v-if="list.cdnr.length > 0">
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          striped
          :filter="search"
          :items="list.cdnr"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">CDNR:</h3></template>
        </b-table>
        <b-button @click="go('cdnr')" class="float-right">Details</b-button>
      </div>
      <!-- CDNUR -->
      <div v-if="list.cdnur.length > 0">
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          striped
          :filter="search"
          :items="list.cdnur"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">CDNUR:</h3></template>
        </b-table>
        <b-button class="float-right" @click="go('cdnur')">Details</b-button>
      </div>
      <!-- HSN -->
      <div v-if="list.hsn1">
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          striped
          :filter="search"
          :items="list.hsn1"
          responsive="sm"
        >
          <template #table-caption><h3 class="ml-4">HSN:</h3></template>
        </b-table>
        <b-button @click="go('hsn1')" class="float-right">Details</b-button>
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
      list: [],
      search: null,
      params: null,
      loading: false,
      summary: {
        b2b: [],
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
    ...mapState(['orgName']),
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
      // if only one entry is present
      if (this.list.b2b.length == 1) {
        const o = {
          invoice_count: 1,
          invoice_value: this.list.b2b[0]['invoice_value'],
          taxable_value: this.list.b2b[0]['taxable_value'],
          cess: this.list.b2b[0]['cess'],
        };
        this.summary['b2b'].push(o);
      }
    },
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
  created() {
    this.params = this.$route.params;
    this.getGstR1List();
  },
};
</script>
