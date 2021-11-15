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
          v-if="config.no"
          label="Inv. #"
          label-for="ivd-input-10"
          label-cols-lg="2"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="ivd-input-10"
            v-model="form.no"
            trim
            required
            :readonly="disabled.no"
            :tabindex="disabled.no ? -1 : 0"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="config.date"
          label="Date"
          label-cols-lg="2"
          label-cols="3"
          label-size="sm"
          id="ivd-input-group-1"
        >
          <gk-date
            id="ivd-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="maxDate"
            @validity="setDateValidity"
            :required="true"
            :readonly="disabled.date"
          >
          </gk-date>
        </b-form-group>
        <b-form-group
          label="Place of Supply"
          label-for="ivd-input-11"
          label-cols-lg="2"
          label-cols="3"
          label-size="sm"
        >
          <autocomplete
            size="sm"
            id="ivd-input-11"
            v-model="form.taxState"
            :options="options.states"
            :required="true"
            @input="onUpdateDetails"
          ></autocomplete>
        </b-form-group>
        <b-form-group
          v-if="config.delNote"
          label="Del. Note"
          label-for="ivd-input-20"
          label-cols-lg="2"
          label-cols="3"
          label-size="sm"
        >
          <autocomplete
            size="sm"
            id="ivd-input-20"
            v-model="form.delNote"
            :options="delNoteOptions"
            @input="onUpdateDetails"
            :required="false"
          ></autocomplete>
        </b-form-group>
        <b-form-group
          v-if="saleFlag && config.ebn"
          label="Eway Bill #"
          label-for="ivd-input-30"
          label-cols-lg="2"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="ivd-input-30"
            v-model="form.ebn"
            trim
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="config.gstin"
          label="GSTIN"
          label-for="ivd-input-40"
          label-cols-lg="2"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="ivd-input-40"
            v-model="form.gstin"
            trim
            required
            readonly
            tabindex="-1"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="saleFlag && config.addr"
          label-cols-lg="2"
          label-cols="3"
          label="Address"
          label-for="ivd-input-50"
          label-size="sm"
        >
          <b-form-textarea
            size="sm"
            id="ivd-input-50"
            v-model="form.addr"
            rows="2"
            max-rows="2"
            trim
            required
            readonly
            tabindex="-1"
          ></b-form-textarea>
        </b-form-group>
        <b-row>
          <b-col class="pr-lg-2" cols="12" lg="6" v-if="saleFlag && config.pin">
            <b-form-group
              label-cols-lg="4"
              label-cols="3"
              label="PIN"
              label-for="ivd-input-60"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="ivd-input-60"
                v-model="form.pin"
                trim
                readonly
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col
            v-if="config.state"
            cols="12"
            lg="6"
            :class="{ 'pl-lg-2': config.pin }"
          >
            <b-form-group
              label="State"
              label-for="ivd-input-70"
              label-size="sm"
              label-cols-lg="4"
              label-cols="3"
            >
              <b-form-select
                size="sm"
                id="ivd-input-70"
                v-model="form.state"
                :options="options.states"
                required
                :disabled="true"
                tabindex="-1"
              ></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row v-if="saleFlag">
          <b-col
            v-if="config.issuer"
            :class="{ 'pr-lg-2': config.role }"
            cols="12"
            lg="6"
          >
            <b-form-group
              label="Issuer"
              label-for="ivd-input-80"
              label-cols="3"
              label-size="sm"
              label-cols-lg="4"
            >
              <b-form-input
                size="sm"
                id="ivd-input-80"
                v-model="form.issuer"
                trim
                required
                readonly
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col
            v-if="config.role"
            :class="{ 'pl-lg-2': config.issuer }"
            cols="12"
            lg="6"
          >
            <b-form-group
              label="Role"
              label-for="ivd-input-90"
              label-cols="3"
              label-cols-lg="4"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="ivd-input-90"
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
// import { mapState } from 'vuex';
import GkDate from '../../GkDate.vue';
import Autocomplete from '../../Autocomplete.vue';
import trnDetailsMixin from '@/mixins/transactionProfile.js';

export default {
  name: 'InvoiceDetails',
  components: { GkDate, Autocomplete },
  mixins: [trnDetailsMixin],
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
    parentData: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
    },
  },
  data() {
    return {
      isCollapsed: false,
      isPreloading: false,
      invNo: {
        sale: '',
        purchase: '',
      },
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      form: {
        no: null,
        date: new Date().toISOString().slice(0, 10),
        delNote: null,
        ebn: null,
        addr: null,
        pin: null,
        gstin: null,
        state: {},
        issuer: null,
        role: null,
        taxState: {}
      },
      options: {
        states: [],
        orgDetails: {},
        delNotes: {
          sale: [],
          purchase: [],
        },
      },
    };
  },
  computed: {
    delNoteOptions: (self) =>
      self.saleFlag
        ? self.options.delNotes.sale
        : self.options.delNotes.purchase,
    disabled: (self) => {
      let disabled = {
        no: false,
        date: false,
        state: false,
      };

      if (typeof self.config.no === 'object') {
        disabled.no = !!self.config.no.disabled;
      }

      if (typeof self.config.date === 'object') {
        disabled.date = !!self.config.date.disabled;
      }

      if (typeof self.config.state === 'object') {
        disabled.state = !!self.config.state.disabled;
      }
      return disabled;
    },
  },
  watch: {
    updateCounter() {
      this.resetForm();
      if (this.parentData.no) {
        this.form.no = this.parentData.no;
      }
      if (this.parentData.date) {
        this.form.date = this.parentData.date;
      }
      if (this.parentData.state) {
        this.form.state = this.parentData.state;
      }
      this.onUpdateDetails();
    },
    saleFlag() {
      this.setInvoiceNo();
    },
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'invoice-details',
          options: {
            dateValid: this.date.valid,
          },
        })
      );
    },

    /**
     * setInvoiceNo()
     *
     * Description: Auto invoice numbering, based on invoice type
     * Using the /invoice?getinvid API
     */
    setInvoiceNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag ? this.invNo.sale : this.invNo.purchase;
        if (this.form.no) {
          return;
        }
      } else {
        this.invNo = {
          sale: '',
          purchase: '',
        };
      }
      // inoutflag = 9-purchase, 15-sale
      let self = this;
      let inoutflag = this.saleFlag ? 15 : 9;
      return axios
        .get(`/invoice?getinvid&type=${inoutflag}`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let codes = self.config.no.format
              ? self.config.no.format.code
              : { sale: 'SL', purchase: 'PU' };
            let code = self.saleFlag ? codes.sale : codes.purchase;
            self.form.no = self.formatNoteNo(
              self.numberFormat,
              parseInt(resp.data.invoiceid),
              code,
              self.form.date,
              self.yearEnd
            );
            self.invNo[self.saleFlag ? 'sale' : 'purchase'] = self.form.no;
          }
        })
        .catch((error) => {
          return error;
        });
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
              self.form.userid = resp.data.gkresult.userid;
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
    fetchDelNotes() {
      const self = this;
      axios
        .get(
          `/invoice?unbilled_delnotes&inputdate=${this.form.date}&type=invoice`
        )
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            self.options.delNotes = {
              sale: [],
              purchase: [],
            };
            resp.data.gkresult.forEach((delNote) => {
              if (delNote.inoutflag === 15) {
                self.options.delNotes.sale.push({
                  text: `${delNote.dcno},${delNote.dcdate},${delNote.custname}`,
                  value: delNote.dcid,
                });
              } else {
                self.options.delNotes.purchase.push({
                  text: `${delNote.dcno},${delNote.dcdate},${delNote.custname}`,
                  value: delNote.dcid,
                });
              }
            });
          }
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
          let gstin = this.options.orgDetails.gstin;
          Object.assign(this.form, {
            addr: this.options.orgDetails.orgaddr,
            pin: this.options.orgDetails.orgpincode,
            state: state ? state.value : {},
            options: {
              gstin: gstin,
            },
            gstin: gstin && state ? gstin[state.value.id] : '',
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
        this.fetchDelNotes(),
      ];
      const self = this;
      return Promise.all(requests)
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
      if (this.disabled.state) {
        this.form.state = '';
      }
      this.form.date = !this.disabled.date ? this.getNoteDate() : '';
      if (!this.disabled.no) {
        this.setInvoiceNo(true);
      } else {
        this.form.no = '';
      }
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
