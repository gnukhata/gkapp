<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <b-card
        header="Cost Center Statement"
        header-bg-variant="dark"
        header-text-variant="light"
        style="max-width: 40em"
        class="mx-auto"
      >
        <template #header>
          <div class="d-flex">
            <div class="mr-auto">Cost Center Statement</div>
            <div>
              <b-icon
                icon="question-circle"
                v-b-popover.click.blur="{
                  variant: 'dark',
                  title: 'Cost Center Statement',
                  html: 'true',
                  content:
                    'The period of this report must begin with the first date of the Financial Year and can end on any date. Select name of the Project/Cost Center for which the statement is to be seen. This statement gives account wise expenses relating to it. ',
                }"
              ></b-icon>
            </div>
          </div>
        </template>
        <b-form @submit.prevent="projectReport">
          <b-form-group label="Product" label-align="right" label-cols="auto">
            <autocomplete
              v-model="projectId"
              :options="projectList"
            ></autocomplete>
          </b-form-group>
          <div class="d-flex">
            <b-form-group label="From" label-align="right" label-cols="auto">
              <gk-date
                :required="true"
                v-model="fromDate"
                id="from"
                class="mr-4"
              ></gk-date>
            </b-form-group>
            <b-form-group label="To" label-cols="auto">
              <gk-date :required="true" v-model="toDate" id="to"></gk-date>
            </b-form-group>
          </div>
          <b-button type="submit" variant="success" class="float-right"
            ><b-icon icon="cloud-download"></b-icon> Get Details</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!--  Table -->
    <b-table-simple
      v-if="report.length > 0"
      class="mt-3"
      small
      responsive="sm"
      bordered
      striped
      hover
      caption-top
    >
      <b-thead head-variant="dark">
        <b-tr>
          <b-th>Account</b-th>
          <b-th>Group Name</b-th>
          <b-th>Sub Group Name</b-th>
          <b-th>Outgoing</b-th>
          <b-th>Incoming</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr v-for="(row, index) in report" :key="index">
          <b-th>{{ row.accountname }}</b-th>
          <b-th>{{ row.groupname }}</b-th>
          <b-th>{{ row.subgroupname }}</b-th>
          <b-th>{{ row.totalout }}</b-th>
          <b-th>{{ row.totalin }}</b-th>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from './Autocomplete.vue';
import GkDate from './GkDate.vue';
export default {
  components: { Autocomplete, GkDate },
  name: 'ProductRegister',
  data() {
    return {
      projectList: [],
      loading: false,
      projectId: null,
      fromDate: '',
      toDate: '',
      report: [],
    };
  },
  methods: {
    projectReport() {
      this.loading = true;
      axios
        .get(
          `https://test.gnukhata.in/report?type=projectstatement&calculateto=${this.toDate}&financialstart=${this.fromDate}&projectcode=${this.projectId}`
        )
        .then((r) => {
          const data = r.data;
          if (r.status == 200) {
            switch (data.gkstatus) {
              case 0:
                this.report = data.gkresult;
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
            this.$bvToast.toast('Failed to get stock report ', {
              variant: 'danger',
              title: r.status,
              solid: true,
            });
          }
          this.loading = false;
        });
    },
    getProjectList() {
      this.loading = true;
      axios
        .get('/projects')
        .then((r) => {
          if (r.status == 200) {
            this.projectList = r.data.gkresult.map((data) => {
              return {
                text: Object.values(data)[1],
                value: Object.values(data)[0],
              };
            });
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
      this.loading = true;
    },
  },
  mounted() {
    this.getProjectList();
    const org = JSON.parse(localStorage.getItem('orgYears'));
    this.fromDate = org.yearStart;
    this.toDate = org.yearEnd;
  },
};
</script>