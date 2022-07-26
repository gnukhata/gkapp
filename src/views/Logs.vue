<template>
  <section class="container-fluid">
    <div class="d-flex justify-content-center mt-3 mb-3 d-print-none">
      <b-form-input
        class="border border-secondary container-sm gksearch"
        type="text"
        placeholder="Search Logs"
        v-model="searchText"
      ></b-form-input>
    </div>
    <!-- Log info -->
    <b-alert show class="bg-dark text-light text-center d-print-none">
      <div v-if="dateRange.isActive">
        Audit Logs: From {{ dateReverse(dateRange.from) }} to
        {{ dateReverse(dateRange.to) }}
      </div>
      <div v-else>
        Audit Logs: From {{ dateReverse(yearStart) }} to
        {{ dateReverse(yearEnd) }}
      </div>
    </b-alert>
    <gk-toolbar class="d-print-none">
      <div>
        <b-button variant="link" id="date-select">
          <b-icon icon="funnel"></b-icon>
        </b-button>
        <!-- Filters -->
        <b-popover
          class="bg-secondary"
          target="date-select"
          triggers="click"
          placement="bottom"
        >
          <!-- Get logs by date range -->
          <b-form @submit.prevent="logsByDateRange">
            <h6 v-text="'Sort by Date Range:'"></h6>
            <!-- date start -->
            <gk-date
              id="fd"
              format="dd-mm-yyyy"
              v-model="dateRange.from"
              :min="dateReverse(yearStart)"
              :max="dateReverse(yearEnd)"
              :required="true"
            ></gk-date>

            <!-- date end -->
            <gk-date
              id="td"
              format="dd-mm-yyyy"
              v-model="dateRange.to"
              :min="dateReverse(yearStart)"
              :max="dateReverse(yearEnd)"
              :required="true"
              class="mb-2 mt-2"
            ></gk-date>
            <b-button-group size="sm">
              <b-button variant="dark" type="submit"
                ><translate>Submit</translate></b-button
              >

              <b-button @click="$router.go()" variant="danger" class="ml-1"
                ><translate>Clear</translate></b-button
              >
            </b-button-group>
          </b-form>
          <!-- <hr /> -->
          <!-- <h6 v-text="this.$gettext('Filter by Role:')" /> -->
          <!-- <b-select -->
          <!--   :options="['admin', 'manager', 'accountant', 'godown incharge']" -->
          <!-- ></b-select> -->
          <!-- <b-button size="sm" class="mt-2">Submit</b-button> -->
        </b-popover>
      </div>
    </gk-toolbar>
    <report-header>
      <div class="text-center">
        <div v-if="dateRange.isActive" class="text-center">
          Audit Logs: From {{ dateReverse(dateRange.from) }} to
          {{ dateReverse(dateRange.to) }}
        </div>
        <div v-else class="text-center">
          Audit Logs: From {{ dateReverse(yearStart) }} to
          {{ dateReverse(yearEnd) }}
        </div>
      </div>
    </report-header>
    <b-table
      responsive="sm"
      small
      hover
      striped
      fixed
      head-variant="dark"
      bordered
      :items="log"
      :busy="isLoading"
      :filter="searchText"
      :fields="fields"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner class="align-middle" type="grow"></b-spinner>
          <strong>
            <translate>Fetching Logs ...</translate>
          </strong>
        </div>
      </template>
      <template #cell(username)="data">
        <b-link @click="$router.push(`/users/${data.item.userid}`)">{{
          data.item.username
        }}</b-link>
      </template>
      <template #cell(time)="data"> {{ data.item.time }} </template>
    </b-table>
  </section>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkToolbar from '@/components/GkToolbar.vue';
import GkDate from '@/components/GkDate.vue';
import ReportHeader from '@/components/ReportHeader.vue';
export default {
  components: { GkToolbar, GkDate, ReportHeader },
  name: 'Logs',
  data() {
    return {
      log: [],
      isLoading: true,
      searchText: '',
      fields: [
        { key: 'activity', sortable: true },
        { key: 'time', label: this.$gettext('Date / Time'), sortable: true },
        { key: 'username', label: this.$gettext('User'), sortable: true },
      ],
      dateRange: Object,
    };
  },
  computed: {
    ...mapState(['orgName', 'yearStart', 'yearEnd']),
  },
  methods: {
    logsByDateRange() {
      this.loading = true;
      axios
        .get(`/log?range&from=${this.dateRange.from}&to=${this.dateRange.to}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                // if no logs are present in given date range, inform user
                if (r.data.gkresult.length == 0) {
                  this.$bvToast.toast(
                    this.$gettext('No entries present in given date range'),
                    {
                      title: this.$gettext('No Data'),
                      variant: 'warning',
                      solid: true,
                    }
                  );
                } else {
                  this.dateRange.isActive = true;
                  this.log = r.data.gkresult;
                  this.$root.$emit('bv::hide::popover', 'date-select');
                }
                this.isLoading = false;
                break;
              case 2:
                this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                  title: this.$gettext('Error'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast(
                  this.$gettext('You have no permission to access'),
                  {
                    title: this.$gettext('Error'),
                    variant: 'danger',
                    solid: true,
                  }
                );
                break;
            }
          }
        });
    },
    getLogs() {
      axios
        .get('/log')
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.log = r.data.gkresult.reverse();
                this.isLoading = false;
                break;
              case 2:
                this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                  title: this.$gettext('Error'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast(
                  this.$gettext('You have no permission to access'),
                  {
                    title: this.$gettext('Error'),
                    variant: 'danger',
                    solid: true,
                  }
                );
                break;
              default:
                console.log(r.data.gkstatus);
            }
          }
        })
        .catch((e) => {
          console.log(e);
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  mounted() {
    this.getLogs();
  },
};
</script>
