<template>
  <section class="m-1">
    <b-overlay :show="loading" blur>
      <b-card
        header="View Registers"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard"
      >
        <b-form @submit.prevent="getRegisters">
          <!-- Select Register -->
          <b-form-group label="Type" label-cols="auto">
            <b-form-select v-model="registerType" required>
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
    <b-table
      caption-top
      :filter="search"
      class="mt-3"
      head-variant="dark"
      small
      bordered
      striped
      stacked="sm"
      v-if="report.length > 0"
      :items="report"
    >
      <template #table-caption>
        <b-form-input
          type="text"
          class="mx-auto gkcard mt-2"
          placeholder="search Register"
          v-model="search"
        ></b-form-input>
      </template>
    </b-table>
  </section>
</template>
<!-- TODOS
     * Fix Table fields
     * Add Button for export as spreadsheet
-->
<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import axios from 'axios';
export default {
  name: 'Registers',
  components: { GkDate },
  data() {
    return {
      loading: false,
      registerType: '',
      fromDate: '',
      toDate: '',
      search: '',
      report: [],
    };
  },
  methods: {
    getRegisters() {
      this.loading = true;
      axios
        .get(
          `/report?type=register&flag=${this.registerType}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.report = r.data.gkresult;
                console.log(r.data);
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
            this.$bvToast.toast('failed to load register data ' + e.message, {
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
    dateReverse(date) {
      let d = date.split('-').reverse();
      return `${d[0]}-${d[1]}-${d[2]}`;
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  mounted() {
    this.fromDate = this.dateReverse(this.yearStart);
    this.toDate = this.dateReverse(this.yearEnd);
  },
};
</script>
