<template>
  <section class="m-1">
    <gk-ifsc></gk-ifsc>
    <b-overlay :show="loading">
      <b-card
        header="GST R1 Report"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="showSummary">
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
          <b-button
            type="submit"
            size="sm"
            variant="success"
            class="float-right"
            ><b-icon icon="eye-fill"></b-icon> Show</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
  </section>
</template>

<script>
import GkDate from '../../components/GkDate.vue';
import GkIfsc from '../../components/GkIfsc.vue';
export default {
  components: { GkDate, GkIfsc },
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
        summary: null,
        // list: [
        //   { value: 'b2b', text: 'B2B' },
        //   { value: 'b2cl', text: 'B2CL' },
        //   { value: 'b2cs', text: 'B2CS' },
        //   { value: 'cdnr', text: 'CDNR' },
        //   { value: 'cdnur', text: 'CDNUR' },
        //   { value: 'hsn1', text: 'HSN' },
        // ],
      },
    };
  },
  methods: {
    showSummary() {
      this.$router.push(
        `/gst/r1/summary/from=${this.fromDate}&to=${this.toDate}`
      );
    },
  },
  mounted() {
    const d = new Date();
    let cm = d.getMonth();
    let lastday = new Date(d.getFullYear(), cm, 0).getDate();
    if (cm < 10) {
      cm = '0' + cm;
    }
    this.fromDate = `01-${cm}-${d.getFullYear()}`;
    this.toDate = `${lastday}-${cm}-${d.getFullYear()}`;
  },
};
</script>
