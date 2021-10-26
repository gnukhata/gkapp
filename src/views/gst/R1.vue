<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        header="GST R1 Report"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="getGstR1Report">
          <div class="row row-cols-auto">
            <div class="col">
              <b-form-group label="From" label-cols="auto" label-align="right">
                <gk-date id="from" v-model="fromDate"></gk-date>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group label="To" label-cols="auto" label-align="right">
                <gk-date id="to" v-model="toDate"></gk-date>
              </b-form-group>
            </div>
          </div>
          <b-button type="submit" variant="success" class="float-right"
            ><b-icon icon="eye-fill"></b-icon> Show</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <section class="mt-2" v-if="report.data !== null">
      <div class="d-flex justify-content-center">
        <p class="mt-1 mr-2 text-muted">
          Type:
        </p>
        <b-form-select
          size="sm"
          class="mb-3 col-2 text-center"
          :options="report.list"
          v-model="report.selected"
        >
        </b-form-select>
      </div>
      <b-form-input
        v-model="search"
        placeholder="Search Report"
        class="gkcard mx-auto d-print-none"
      ></b-form-input>
      <b-table
        caption-top
        class="mt-3"
        head-variant="dark"
        small
        bordered
        striped
        stacked="sm"
        :filter="search"
        :items="report.data[report.selected]"
      >
      </b-table>
    </section>
  </section>
</template>

<script>
import axios from 'axios';
import GkDate from '../../components/GkDate.vue';
export default {
  components: { GkDate },
  name: 'R1',
  data() {
    return {
      fromDate: null,
      toDate: null,
      loading: false,
      search: '',
      report: {
        data: null,
        selected: '',
        list: [
          { value: 'b2b', text: 'B2B' },
          { value: 'b2cl', text: 'B2CL' },
          { value: 'b2cs', text: 'B2CS' },
          { value: 'cdnr', text: 'CDNR' },
          { value: 'cdnur', text: 'CDNUR' },
          { value: 'hsn1', text: 'HSN' },
        ],
      },
    };
  },
  methods: {
    getGstR1Report() {
      this.loading = true;
      axios
        .get(`/gstreturns?type=r1&start=${this.fromDate}&end=${this.toDate}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkresult) {
              case 0:
                this.report.data = r.data.gkdata;
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
    // default report
    this.report.selected = 'b2b';
    const d = new Date();
    let cm = d.getMonth();
    const nm = d.getMonth() + 1;
    if (cm < 10) {
      cm = '0' + cm;
    }
    this.fromDate = `01-${cm}-${d.getFullYear()}`;
    this.toDate = `01-${nm}-${d.getFullYear()}`;
  },
};
</script>
