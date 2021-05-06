<template>
  <b-card
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
  >
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="p-2 p-md-3">
      <div>
        <b>Transfer Note Details</b>
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
          label="Transfer Note No."
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
          label="Dispatch From"
          label-for="input-4"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
        >
          <autocomplete
            size="sm"
            id="input-4"
            valueUid="id"
            v-model="form.godown"
            :options="options.godowns"
            @input="onUpdateDetails"
            required
          ></autocomplete>
        </b-form-group>
        <b-form-group
          label="Dispatch To"
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
          label="Issuer"
          label-for="input-8"
          label-cols="3"
          label-size="sm"
          label-cols-md="4"
        >
          <b-form-input
            size="sm"
            id="input-8"
            v-model="form.issuer"
            trim
            required
            readonly
            tabindex="-1"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Role"
          label-for="input-9"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="input-9"
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
  name: 'TransferNoteDetails',
  components: {
    Autocomplete,
  },
  props: {
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
      isCollapsed: false,
      isPreloading: false,
      options: {
        orgDetails: null,
        transactionTypes: [
          { text: 'Approval', value: 0 },
          { text: 'Consignment', value: 1 },
          { text: 'Free Replacement', value: 2 },
          { text: 'Purchase', value: 3 },
          { text: 'Sample', value: 4 },
        ],
        godowns: [],
        states: [],
        lastDelChal: {
          sale: null,
          purchase: null,
        },
      },
      form: {
        no: null,
        date: this.formatDateObj(new Date()),
        state: {},
        godown: null,
        type: null,
        gstin: null,
        issuer: null,
        role: null,
        options: {
          gstin: {},
        },
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
    saleFlag() {
      this.setDelChalNo();
    },
    updateCounter() {
      this.resetForm();
    },
  },
  methods: {
    setDelChalNo() {
      let no = this.getLastDelChalNo();
      if (isNaN(no)) {
        this.form.no = no;
      } else {
        no++;
        let year = new Date(this.form.date).getFullYear() % 100;
        let delType = this.saleFlag ? 'DOUT' : 'DIN';
        this.form.no = `${no}/${delType}-${year}`;
      }
    },
    getLastDelChalNo() {
      let no = this.saleFlag
        ? this.options.lastDelChal.sale
        : this.options.lastDelChal.purchase;
      if (isNaN(no)) {
        if (no.indexOf('/D') >= 0) {
          no = no.split('/D')[0];
          return parseInt(no);
        }
        return no;
      } else {
        return parseInt(no);
      }
    },
    onUpdateDetails() {
      setTimeout(() => this.$emit('details-updated', {data: this.form, name: 'transfer-note-details'}));
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
            addr: this.options.orgDetails.orgaddr,
            pin: this.options.orgDetails.orgpincode,
            state: state ? state.value : {},
            options: {
              gstin: this.options.orgDetails.gstin,
            },
            gstin: this.options.orgDetails.gstin[state.value.id],
          });
        }
      }
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
    fetchLastDelChalNo() {
      const requests = [
        // last purchase delivery chalan
        axios.get('/delchal?delchal=last&status=9').catch((error) => {
          this.displayToast(
            'Fetch Delivery Challan No. Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        // last sale delivery chalan
        axios.get('/delchal?delchal=last&status=15').catch((error) => {
          this.displayToast(
            'Fetch Delivery Challan No. Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      const self = this;
      return Promise.all([...requests]).then(([resp1, resp2]) => {
        if (resp1.data.gkstatus === 0) {
          self.options.lastDelChal.purchase = resp1.data.gkresult.dcno;
        }
        if (resp2.data.gkstatus === 0) {
          self.options.lastDelChal.sale = resp2.data.gkresult.dcno;
        }
      });
    },
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get(`/organisation`).catch((error) => {
          this.displayToast(
            'Fetch Organisation Profile Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/godown`).catch((error) => {
          this.displayToast('Fetch Godowns Failed!', error.message, 'danger');
          return error;
        }),
        axios.get('/state').catch((error) => {
          this.displayToast(
            'Fetch State Data Failed!',
            error.message,
            'danger'
          );
          return error;
        }),
        this.fetchUserData(),
        this.fetchLastDelChalNo(),
      ];
      const self = this;
      return Promise.all([...requests])
        .then(([resp1, resp2, resp3]) => {
          if (resp1.data.gkstatus === 0) {
            self.options.orgDetails = resp1.data.gkdata;
            setTimeout(() => {
              self.setOrgDetails();
            }, 1);
          }

          if (resp2.data.gkstatus === 0) {
            self.options.godowns = resp2.data.gkresult.map((godown) => {
              return {
                text: `${godown.goname} (${godown.goaddr})`,
                value: godown.goid,
              };
            });
          }

          if (resp3.data.gkstatus === 0) {
            self.options.states = resp3.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: {
                  id: Object.keys(item)[0],
                  name: Object.values(item)[0],
                },
              };
            });
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
      this.setDelChalNo();
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