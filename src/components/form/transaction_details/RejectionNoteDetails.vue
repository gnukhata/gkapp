<template>
  <b-card
    class="mb-2 mb-md-0"
    border-variant="secondary"
    no-body
    :class="config.class"
  >
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="p-2 p-md-3">
      <div>
        <b>Rejection Note Details</b>
        <b-button
          variant="primary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            class="float-right"
          ></b-icon>
        </b-button>
      </div>
      <div class="mt-3" :class="{ 'd-md-block': true, 'd-none': !isCollapsed }">
        <b-form-group
          label="No."
          label-for="input-1"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="input-1"
            v-model="form.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          id="input-group-3"
          label="Date"
          label-cols-md="4"
          label-cols="3"
          label-for="date-1"
          label-size="sm"
        >
          <b-input-group>
            <b-form-input
              size="sm"
              id="date-1"
              v-model="form.date"
              type="text"
              placeholder="YYYY-MM-DD"
              autocomplete="off"
              required
              :state="isInvDateValid"
              debounce="500"
              @input="onUpdateDetails"
            ></b-form-input>
            <b-input-group-append>
              <b-form-datepicker
                size="sm"
                v-model="form.date"
                button-only
                right
                locale="en-GB"
                aria-controls="date-1"
                :min="minDate"
                :max="maxDate"
              >
              </b-form-datepicker>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group
          :label="saleFlag ? 'Dispatch From' : 'Received At'"
          label-for="input-7"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
        >
          <autocomplete
            size="sm"
            id="input-7"
            valueUid="id"
            v-model="form.godown"
            :options="options.godowns"
            @input="onUpdateDetails"
            :readonly="true"
            required
          ></autocomplete>
        </b-form-group>
        <b-form-group
          label="Transaction Type"
          label-for="input-1"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-select
            v-model="form.type"
            size="sm"
            :options="options.transactionTypes"
            :disabled="true"
          >
          </b-form-select>
        </b-form-group>
        <b-form-group
          label="Issuer"
          label-for="input-7-1"
          label-cols="3"
          label-size="sm"
          label-cols-md="4"
        >
          <b-form-input
            size="sm"
            id="input-7-1"
            v-model="form.issuer"
            trim
            required
            readonly
            tabindex="-1"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Role"
          label-for="input-8-1"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="input-8-1"
            v-model="form.role"
            trim
            required
            readonly
            tabindex="-1"
          ></b-form-input>
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';

import Autocomplete from '../../Autocomplete.vue';
export default {
  name: 'RejectionNoteDetails',
  components: { Autocomplete },
  props: {
    invDate: {
      type: String,
      required: true,
    },
    saleFlag: {
      type: Boolean,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      isPreloading: false,
      isCollapsed: false,
      form: {
        date: this.formatDateObj(new Date()),
        issuer: null,
        role: null,
      },
      options: {
        delNotes: [],
        invoices: {
          sale: [],
          purchase: [],
        },
      },
    };
  },
  watch: {
    invDate() {
      this.onUpdateDetails();
    },
  },
  computed: {
    minDate: (self) =>
      self.invDate ? new Date(self.invDate) : new Date(self.yearStart),
    maxDate: (self) => new Date(self.yearEnd),
    isInvDateValid: (self) => {
      let currDate = new Date(self.form.date).getTime(),
        minDate = self.minDate.getTime(),
        maxDate = self.maxDate.getTime();
      return !isNaN(currDate)
        ? currDate >= minDate && currDate <= maxDate
        : null;
    },
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    preloadData() {
      const requests = [this.fetchUserData()];
      return Promise.all([...requests]).then(() => {});
    },
    fetchUserData() {
      let self = this;
      return axios
        .get(`/users?user=single`)
        .then((resp) => {
          // === User name and role ===
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              self.form.issuer = resp.data.gkresult.username;
              self.form.role = resp.data.gkresult.userroleName;
            } else {
              // User data not available, check again
            }
          } else {
            // User data not available, check again
          }
        })
        .catch((error) => {
          this.displayToast('Fetch User Data Failed!', error.message, 'danger');
          return error;
        });
    },
    /**
     * formatDateObj(date)
     *
     * Description: Converts a js Date object, into yyyy-mm-dd string
     */
    formatDateObj(date) {
      let month = date.getMonth() + 1;
      month = month > 9 ? month : '0' + month;
      let day = date.getDate();
      day = day > 9 ? day : '0' + day;
      return `${date.getFullYear()}-${month}-${day}`;
    },
    onUpdateDetails() {
      const self = this
      setTimeout(
        () =>
          self.$emit('details-updated', {
            data: self.form,
            name: 'rejection-note-details',
            options: {
              isDateValid: self.isInvDateValid,
            },
          }),
        1000
      );
    },
  },
  mounted() {
    this.preloadData();
    if (!this.isInvDateValid) {
      this.form.date = this.yearStart;
    }
    this.onUpdateDetails();
  },
};
</script>