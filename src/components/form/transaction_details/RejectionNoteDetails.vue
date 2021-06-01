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
          label-for="rnd-input-10"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="rnd-input-10"
            v-model="form.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <gk-form-date
          label="Date"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
          id="rnd-input-group-1"
          dateId="rnd-date-1"
          :format="date.format"
          v-model="form.date"
          :min="minDate"
          :max="maxDate"
          @validity="setDateValidity"
          :required="true"
        ></gk-form-date>
        <b-form-group
          :label="saleFlag ? 'Dispatch From' : 'Received At'"
          label-for="rnd-input-20"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
        >
          <autocomplete
            size="sm"
            id="rnd-input-20"
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
          label-for="rnd-input-30"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-select
            id="rnd-input-30"
            v-model="form.type"
            size="sm"
            :options="options.transactionTypes"
            :disabled="true"
          >
          </b-form-select>
        </b-form-group>
        <b-form-group
          label="Issuer"
          label-for="rnd-input-40"
          label-cols="3"
          label-size="sm"
          label-cols-md="4"
        >
          <b-form-input
            size="sm"
            id="rnd-input-40"
            v-model="form.issuer"
            trim
            required
            readonly
            tabindex="-1"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Role"
          label-for="rnd-input-50"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="rnd-input-50"
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
// import GkDate from '../../GkDate.vue';
import GkFormDate from '../../GkFormDate.vue';
export default {
  name: 'RejectionNoteDetails',
  components: { Autocomplete, GkFormDate },
  props: {
    invDate: {
      type: String,
      required: true,
      note: "The date from Invoice Details. Its used as the min date here"
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
      date: {
        valid: null,
        format: 'dd-mm-yyyy',
      },
      form: {
        no: "",
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
    updateCounter() {
      this.resetForm();
    }
  },
  computed: {
    minDate: (self) =>
      self.invDate
        ? self.toDMYDate(self.invDate)
        : self.toDMYDate(self.yearStart),
    maxDate: (self) => self.toDMYDate(self.yearEnd),
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    toDMYDate(date) {
      return date.split('-').reverse().join('-');
    },
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
    resetForm() {
      Object.assign(this.form, {
        no: "",
        date: ""
      })
    },
    onUpdateDetails() {
      const self = this;
      setTimeout(
        () =>
          self.$emit('details-updated', {
            data: self.form,
            name: 'rejection-note-details',
            options: {
              isDateValid: self.date.valid,
            },
          }),
        1000
      );
    },
  },
  mounted() {
    this.preloadData();
    if (!this.date.valid) {
      this.form.date = this.yearStart;
    }
    this.onUpdateDetails();
  },
};
</script>