<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        style="min-width: 300px"
        header="GSTR-1 Report"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="showSummary">
          <gk-period @update="onPeriodUpdate" @validity="updateValidity"> </gk-period>
          <b-button
            :disabled="!periodValidity"
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
import GkPeriod from '@/components/GkPeriod.vue';
// import { mapState } from 'vuex';
export default {
  components: { GkPeriod },
  name: 'R1',
  data() {
    return {
      fromDate: null,
      toDate: null,
      periodValidity: false,
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
  computed: {},
  methods: {
    updateValidity(validity) {
      this.periodValidity = validity;
    },
    onPeriodUpdate(period) {
      this.fromDate = period.from || null;
      this.toDate = period.to || null;
    },
    showSummary() {
      if (this.fromDate && this.toDate) {
        this.$router.push(
          `/gst/r1/summary/from=${this.fromDate}&to=${this.toDate}`
        );
      } else {
        this.$bvToast.toast(
          this.$gettext(`Please select a valid time period.`),
          {
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
          }
        );
      }
    },
  },
  mounted() {
    // this.calculateTimePeriods();
  },
};
</script>
