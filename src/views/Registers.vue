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
      <div class="text-center mt-3">
        <h3>{{ orgName }}</h3>
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
    formatTable(data) {
      console.log(data);
      const newdata = data.gkresult.map((d) => {
        return {
          sr_no: Object.values(d)[0],
          invoice_id: Object.values(d)[1],
          invoice_no: Object.values(d)[2],
          date: Object.values(d)[3],
          name: Object.values(d)[4],
          GSTIN: Object.values(d)[10],
          TIN: Object.values(d)[5],
          gross_amount: Object.values(d)[6],
          tax_free: Object.values(d)[7],
          tax: Object.values(d)[8],
          tax_amount: Object.values(d)[9],
        };
      });
      data.totalrow.name = 'Total';
      newdata.push(data.totalrow);
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
    this.toDate = this.dateReverse(this.yearEnd);
  },
};
</script>
