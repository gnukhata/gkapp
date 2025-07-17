<template>
  <section>
    <b-overlay :show="loading">
      <h2 class="my-4 text-muted display-5">
        GST-R1 Report
      </h2>
      <b-card
        bg-variant="light"
        class="mb-3 d-print-none"
      >
        <b-alert
          show
          class="text-center mx-auto d-print-none"
        >
          GST-R1 Report for <b>{{ orgName }}</b> ({{ Object.values(orgAddress.gstin)[0] || 'N/A' }})
          <span
            v-if="selected?.fromDate && selected?.toDate"
          >
            : From {{ dateReverse(selected?.fromDate) }} to
            {{ dateReverse(selected?.toDate) }}
          </span>
        </b-alert>
        <b-form @submit.prevent="showSummary">
          <gk-period
            @update="onPeriodUpdate"
            @validity="updateValidity"
          />
          <b-button
            :disabled="!periodValidity"
            type="submit"
            size="sm"
            variant="success"
          >
            Submit
          </b-button>
        </b-form>
      </b-card>
    </b-overlay>
    <r1-summary
      v-if="selected?.fromDate && selected?.toDate"
      :td="selected.toDate"
      :fd="selected.fromDate"
      :gstin="Object.values(orgAddress.gstin)[0]"
    />
  </section>
</template>

<script>
import GkPeriod from '@/components/GkPeriod.vue';
import { mapState } from 'vuex';
import R1Summary from './R1Summary.vue';
export default {
  components: { GkPeriod, R1Summary },
  name: 'R1',
  data() {
    return {
      fromDate: null,
      toDate: null,
      periodValidity: false,
      loading: false,
      search: '',
      selected: {},
      report: {
        data: null,
        selected: '',
        summary: null,
      },
    };
  },
  computed: {
    ...mapState(['orgName', 'orgAddress']),
  },
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
        this.selected = {
          fromDate: this.fromDate,
          toDate:this.toDate,
        }
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
};
</script>
