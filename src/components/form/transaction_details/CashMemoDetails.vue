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
          variant="secondary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'dash' : 'arrows-fullscreen'"
            class="float-right"
          ></b-icon>
        </b-button>
      </div>
      <div class="mt-3" :class="{ 'd-md-block': true, 'd-none': !isCollapsed }">
        <b-form-group
          label="No."
          label-for="cmd-input-10"
          label-cols-md="2"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="cmd-input-10"
            v-model="form.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Date"
          label-cols-md="2"
          label-cols="3"
          label-size="sm"
          id="cmd-input-group-1"
        >
          <gk-date
            id="cmd-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="maxDate"
            @validity="setDateValidity"
            :required="true"
          >
          </gk-date>
        </b-form-group>
        <b-form-group
          label="State"
          label-for="cmd-input-20"
          label-size="sm"
          label-cols-md="2"
          label-cols="3"
        >
          <autocomplete
            size="sm"
            id="cmd-input-20"
            valueUid="id"
            v-model="form.state"
            :options="options.states"
            @input="onSelectState(form.state)"
            required
          ></autocomplete>
        </b-form-group>
        <b-form-group
          label="GSTIN"
          label-for="cmd-input-30"
          label-cols-md="2"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="cmd-input-30"
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
// import { mapState } from 'vuex';

import Autocomplete from '../../Autocomplete.vue';
import GkDate from '../../GkDate.vue';

import trnDetailsMixin from '@/mixins/transactionProfile.js';
export default {
  name: 'CashMemoDetails',
  components: { Autocomplete, GkDate },
  mixins: [trnDetailsMixin],
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
      required: true,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
    saleFlag: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isCollapsed: false,
      isPreloading: false,
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      memoNo: {
        purchase: '',
        sale: '',
      },
      form: {
        no: null,
        date: new Date().toISOString().slice(0, 10),
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
  computed: {},
  watch: {
    saleFlag() {
      this.setNoteNo();
    },
    updateCounter() {
      this.resetForm();
    },
  },
  methods: {
    setNoteNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag ? this.memoNo.sale : this.memoNo.purchase;
        if (this.form.no) {
          return;
        }
      } else {
        this.memoNo = {
          purchase: '',
          sale: '',
        };
      }
      let url = `/invoice?cash=all&inoutflag=${this.saleFlag ? 15 : 9}`;
      axios
        .get(url)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let counter = resp.data.gkresult.length;
            let codes = this.config.no.format
              ? this.config.no.format.code
              : { sale: 'CMS', purchase: 'CMP' };
            let code = this.saleFlag ? codes.sale : codes.purchase;
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              counter + 1,
              code,
              this.form.date,
              this.yearEnd
            );
            this.memoNo[this.saleFlag ? 'sale' : 'purchase'] = this.form.no;
          }
        })
        .catch((error) => {
          return error;
        });
    },
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'cash-memo-details',
          options: { isDateValid: this.date.valid },
        })
      );
    },
    onSelectState(state) {
      // set DelNote Gstin based on state
      if (state) {
        this.form.gstin = this.form.options.gstin[state.id];
      }
      this.onUpdateDetails();
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
          let gstin = this.options.orgDetails.gstin;
          Object.assign(this.form, {
            state: state ? state.value : null,
            options: {
              gstin: gstin || {},
            },
            gstin: gstin && state ? gstin[state.value.id] : '',
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

      return Promise.all(requests)
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
      this.form.date = this.getNoteDate();
      this.setNoteNo(true);
      this.onUpdateDetails();
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