<template>
  <section>
    <h2 class="mb-5 text-muted display-5">
      AUDIT LOGS
    </h2>
    <b-card
      bg-variant="light"
    >
      <!-- <p><b class="text-muted">SEARCH</b></p> -->
      <!-- Get logs by date range -->
      <b-alert
        show
        class="text-center mx-auto d-print-none"
      >
        <div v-if="dateRange.isActive">
          Audit Logs: From {{ dateReverse(dateRange.from) }} to
          {{ dateReverse(dateRange.to) }}
        </div>
        <div v-else>
          Audit Logs: From {{ dateReverse(yearStart) }} to
          {{ dateReverse(yearEnd) }}
        </div>
      </b-alert>
      <b-form @submit.prevent="logsByDateRange">
        <b-row>
          <b-col
            cols
            lg="3"
            class="pl-0"
          >
            <!-- date start -->
            <b-form-group
              label="From:"
              label-cols="3"
              label-align="right"
            >
              <gk-date
                id="fd"
                format="dd-mm-yyyy"
                v-model="dateRange.from"
                :min="dateReverse(yearStart)"
                :max="dateReverse(yearEnd)"
                :required="true"
              />
            </b-form-group>
          </b-col>
          <b-col
            cols
            lg="3"
            class="pl-0"
          >
            <!-- date end -->
            <b-form-group
              label="To:"
              label-cols="3"
              label-align="right"
            >
              <gk-date
                id="td"
                format="dd-mm-yyyy"
                v-model="dateRange.to"
                :min="dateReverse(yearStart)"
                :max="dateReverse(yearEnd)"
                :required="true"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-button-group
          size="sm"
          class="float-right"
        >
          <b-button
            @click="$router.go()"
            variant="dark"
          >
            <translate>Clear</translate>
          </b-button>
          <b-button
            variant="success"
            type="submit"
            class="ml-1"
          >
            <translate>Submit</translate>
          </b-button>
        </b-button-group>
      </b-form>
    </b-card>

    <b-row>
      <b-col
        cols
        lg="3"
        class="mb-2 mt-4"
      >
        <!-- search bar -->
        <b-form-input
          type="text"
          :placeholder="$gettext('Search Logs')"
          v-model="searchText"
          size="sm"
          style="align-self:center"
        />
      </b-col>
    </b-row>

    <b-alert
      class="text-center mt-5 mx-auto"
      style="width: 20em"
      v-if="log.length == 0 && !isLoading"
      show
      variant="warning"
    >
      <b-icon
        icon="exclamation-triangle-fill"
        class="mr-1"
      />
      <translate>No Logs Available</translate>
    </b-alert>
    <b-table
      v-else
      responsive="sm"
      small
      hover
      head-variant="light"
      outlined
      :items="log"
      :busy="isLoading"
      :filter="searchText"
      :fields="fields"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong>
            <translate>Fetching Logs ...</translate>
          </strong>
        </div>
      </template>
      <template #cell(username)="data">
        {{ data.item.username }}
      </template>
      <template #cell(time)="data">
        <b-icon
          icon="calendar-event"
          class="mr-1"
        />
        {{ data.item.time.split(' ')[0] }}
        <b-icon
          icon="clock"
          class="mr-1"
        />{{ data.item.time.split(' ')[1] }}
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkDate from '@/components/GkDate.vue';
export default {
  components: { GkDate },
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
        .get(
          `/log/dateRange?from=${this.dateRange.from}&to=${this.dateRange.to}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.dateRange.isActive = true;
              this.log = r.data.gkresult;
              this.$root.$emit('bv::hide::popover', 'date-select');
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
            }
          }
        })
        .catch((e) => {
          console.error(e);
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
