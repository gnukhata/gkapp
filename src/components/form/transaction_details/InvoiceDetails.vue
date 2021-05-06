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
        <b>Invoice Details</b>
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
        <b-row>
          <b-col v-if="config.no" cols="12">
            <b-form-group
              label="Inv. No."
              label-for="input-1"
              label-cols-lg="2"
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
          </b-col>
          <b-col v-if="config.date" cols="12">
            <b-form-group
              id="input-group-3"
              label="Date"
              label-cols-lg="2"
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
          </b-col>
        </b-row>
        <b-row>
          <b-col v-if="config.delNote" class="pr-lg-2" cols="12" lg="6">
            <b-form-group
              label="Del. Note"
              label-for="input-2"
              label-cols-lg="4"
              label-cols="3"
              label-size="sm"
            >
              <b-form-select
                size="sm"
                id="input-2"
                v-model="form.delNote"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col class="pl-lg-2" v-if="saleFlag && config.ebn">
            <b-form-group
              label="EBN"
              label-for="input-3"
              label-cols-lg="4"
              label-cols="3"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-3"
                v-model="form.ebn"
                trim
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.gstin">
            <b-form-group
              label="GSTIN"
              label-for="input-8-1"
              label-cols-lg="2"
              label-cols="3"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-8-1"
                v-model="form.gstin"
                trim
                required
                readonly
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="saleFlag && config.addr">
            <b-form-group
              label-cols-lg="2"
              label-cols="3"
              label="Address"
              label-for="input-4"
              label-size="sm"
            >
              <b-form-textarea
                size="sm"
                id="input-4"
                v-model="form.addr"
                rows="2"
                max-rows="2"
                trim
                required
                readonly
                tabindex="-1"
              ></b-form-textarea>
            </b-form-group>
          </b-col>
          <b-col class="pr-lg-2" cols="12" lg="6" v-if="saleFlag && config.pin">
            <b-form-group
              label-cols-lg="4"
              label-cols="3"
              label="PIN"
              label-for="input-5"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-5"
                v-model="form.pin"
                trim
                readonly
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col v-if="config.state" cols="12" lg="6" class="pl-lg-2">
            <b-form-group
              label="State"
              label-for="input-6"
              label-size="sm"
              label-cols-lg="4"
              label-cols="3"
            >
              <b-form-select
                size="sm"
                id="input-6"
                v-model="form.state"
                :options="options.states"
                required
                disabled
                tabindex="-1"
              ></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row v-if="saleFlag">
          <b-col v-if="config.issuer" class="pr-lg-2" cols="12" lg="6">
            <b-form-group
              label="Issuer"
              label-for="input-7"
              label-cols="3"
              label-size="sm"
              label-cols-lg="4"
            >
              <b-form-input
                size="sm"
                id="input-7"
                v-model="form.issuer"
                trim
                required
                readonly
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col v-if="config.role" class="pl-lg-2" cols="12" lg="6">
            <b-form-group
              label="Role"
              label-for="input-8"
              label-cols="3"
              label-cols-lg="4"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-8"
                v-model="form.role"
                trim
                required
                readonly
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
    </div>
  </b-card>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';

export default {
  name: 'InvoiceDetails',
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
      isCollapsed: false,
      isPreloading: false,
      form: {
        no: null,
        date: this.formatDateObj(new Date()),
        delNote: null,
        ebn: null,
        addr: null,
        pin: null,
        gstin: null,
        state: {},
        issuer: null,
        role: null,
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
    },
  },
  methods: {
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'invoice-details',
        })
      );
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
    preloadData() {
      this.isPreloading = true;
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
        this.fetchUserData(),
      ];
      const self = this;
      return Promise.all([...requests])
        .then(([resp1, resp2]) => {
          this.isPreloading = false;
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
            if (resp2.data.gkstatus === 0) {
              self.options.orgDetails = resp2.data.gkdata;
              setTimeout(() => {
                self.setOrgDetails();
              }, 1);
            }
          }
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