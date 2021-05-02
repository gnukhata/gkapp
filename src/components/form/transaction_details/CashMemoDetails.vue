<template>
  <b-card
    v-if="config"
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
  >
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="p-2 p-md-3">
      <div>
        <b>Cash Memo Details</b>
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
          label-cols-md="2"
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
          label-cols-md="2"
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
          label="State"
          label-for="input-6"
          label-size="sm"
          label-cols-md="2"
          label-cols="3"
        >
          <autocomplete
            size="sm"
            id="input-6"
            valueUid="id"
            v-model="form.state"
            :options="options.states"
            @input="onSelectState(form.state)"
            required
          ></autocomplete>
        </b-form-group>
        <b-form-group
          label="GSTIN"
          label-for="input-8"
          label-cols-md="2"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="input-8"
            v-model="form.gstin"
            trim
            readonly
          ></b-form-input>
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

import Autocomplete from '../../Autocomplete.vue'
export default {
  name: 'CashMemoDetails',
  components: { Autocomplete },
  props: {
    config: {
      type: Object,
      required: true,
    },
    states: {
      type: Object,
      required: false,
    },
    parentData: {
      type: Object,
      required: true
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data() {
    return {
      isCollapsed: false,
      isPreloading: false,
      form: {
        no: null,
        date: this.formatDateObj(new Date()),
        state: {},
        gstin: null,
        options: {
          gstin: {},
        },
      },
      options: {
        states: [],
        orgDetails: {},
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
  watch: {
    updateCounter() {
      this.resetForm();
    }
  },
  methods: {
    onUpdateDetails() {
      setTimeout(() => this.$emit('details-updated', {data: this.form, name: 'cash-memo-details', options: {isDateValid: this.isInvDateValid}}));
    },
    onSelectState(state) {
      // set DelNote Gstin based on state
      if (state) {
        this.form.gstin = this.form.options.gstin[state.id];
      }
      this.onUpdateDetails();
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
    setOrgDetails() {
      if (this.options.orgDetails !== null) {
        if (this.options.orgDetails.orgname) {
          let orgstate = (this.options.orgDetails.orgstate || '').toLowerCase();
          let state = orgstate
            ? this.options.states.find(
                (state) => state.text.toLowerCase() === orgstate
              )
            : null;
          Object.assign(this.form, {
            state: state ? state.value : null,
            options: {
              gstin: this.options.orgDetails.gstin,
            },
            gstin: this.options.orgDetails.gstin[state.value.id],
          });
        }
      }
    },
    preloadData() {
      this.isPreloading = true;
      const self = this;
      const requests = [
        axios.get('/state').catch((error) => {
          this.displayToast(
            'Fetch State Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/organisation`).catch((error) => {
          this.displayToast(
            'Fetch Organisation Profile Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      return Promise.all([...requests])
        .then(([resp1, resp2]) => {
          if (resp1.data.gkstatus === 0) {
            self.options.states = resp1.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: {
                  id: Object.keys(item)[0],
                  name: Object.values(item)[0],
                },
              };
            });
          }

          if (resp2.data.gkstatus === 0) {
            self.options.orgDetails = resp2.data.gkdata;
            setTimeout(() => {
              self.setOrgDetails();
            }, 1);
          }
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    resetForm() {
      this.setOrgDetails();
      if (!this.isInvDateValid) {
        this.form.date = this.yearStart;
      }
      this.onUpdateDetails();
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
  },
  mounted() {
    const self = this;
    this.preloadData().then(() => {
      self.resetForm();
    });
  },
};
</script>