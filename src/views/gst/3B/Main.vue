<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        header="GSTR 3B Report"
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
          <b-form-group label="State" label-cols="auto">
            <gk-state v-model="state" :required="true"></gk-state>
          </b-form-group>
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
import { mapState } from 'vuex';
import GkDate from '../../../components/GkDate.vue';
import GkState from '../../../components/GkState.vue';
export default {
  components: { GkDate, GkState },
  name: 'Main',
  data() {
    return {
      fromDate: null,
      toDate: null,
      loading: false,
      state: '',
      search: '',
      report: {
        data: null,
        selected: '',
        summary: null,
      },
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    showSummary() {
      this.$router.push(
        `/gst/3b/from=${this.fromDate}&to=${this.toDate}&state=${this.state}`
      );
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
  },
};
</script>
