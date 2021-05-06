<template>
  <b-card
    class="mb-2 mb-md-0 mr-md-1 ml-md-1"
    border-variant="secondary"
    no-body
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
          label="Del. Note No."
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
      form: {},
      options: {
        delNotes: [],
        invoices: [],
      },
    };
  },
  computed: {
    minDate: (self) => new Date(self.yearStart),
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
      const payload1 = {
        inputdate: this.yearEnd,
        type: "rejectionnote"
      };
      const requests = [
        axios
          .get('/invoice?unbilled_delnotes=true', {
            data: payload1,
          })
          .catch((error) => {
            this.displayToast(
              'Fetch Delivery Note List Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
        axios
          .get('/invoice?type=nonrejected', {
            data: { inputdate: this.yearEnd },
          })
          .catch((error) => {
            this.displayToast(
              'Fetch Non Rejected Invoice List Failed!',
              error.message,
              'danger'
            );
            return error;
          }),
      ];
      const self = this;
      return Promise.all([...requests]).then(([resp1, resp2]) => {
        if (resp1.data.gkstatus === 0) {
          console.log(resp1.data);
          self.options.delNotes = resp1.data.gkresult;
        }

        if (resp2.data.gkstatus === 0) {
          console.log(resp2.data);
          self.options.invoices = resp2.data.gkresult;
        }
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
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'rejection-note-details',
        })
      );
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>