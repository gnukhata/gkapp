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
        <b>Delivery Note Details</b>
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
          label-for="dnd-input-10"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dnd-input-10"
            v-model="form.no"
            trim
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Date"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
          id="dnd-input-group-1"
        >
          <gk-date
            id="dnd-date-1"
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
          label="Transaction Type"
          label-for="dnd-input-20"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-select
            id="dnd-input-20"
            v-model="form.type"
            size="sm"
            :options="options.transactionTypes"
          >
          </b-form-select>
        </b-form-group>
        <b-form-group
          :label="saleFlag ? 'Origin State' : 'Destination State'"
          label-for="dnd-input-30"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
        >
          <autocomplete
            size="sm"
            id="dnd-input-30"
            valueUid="id"
            v-model="form.state"
            :options="options.states"
            @input="onSelectState(form.state)"
            required
          ></autocomplete>
        </b-form-group>
        <b-form-group
          :label="saleFlag ? 'Dispatch From' : 'Received At'"
          label-for="dnd-input-40"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
        >
          <autocomplete
            size="sm"
            id="dnd-input-40"
            valueUid="id"
            v-model="form.godown"
            :options="options.godowns"
            @input="onUpdateDetails"
            required
          ></autocomplete>
        </b-form-group>
        <b-form-group
          label="GSTIN"
          label-for="dnd-input-50"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dnd-input-50"
            v-model="form.gstin"
            trim
            required
            readonly
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Issuer"
          label-for="dnd-input-60"
          label-cols="3"
          label-size="sm"
          label-cols-md="4"
        >
          <b-form-input
            size="sm"
            id="dnd-input-60"
            v-model="form.issuer"
            trim
            required
            readonly
            tabindex="-1"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Role"
          label-for="dnd-input-70"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dnd-input-70"
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
// import { mapState } from 'vuex';
import Autocomplete from '../../Autocomplete.vue';
import GkDate from '../../GkDate.vue';

import trnDetailsMixin from '@/mixins/transactionProfile.js';

export default {
  name: 'DeliveryNoteDetails',
  components: {
    Autocomplete,
    GkDate,
  },
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
  },
  data() {
    return {
      isCollapsed: false,
      isPreloading: false,
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      delchalNo: {
        sale: '',
        purchase: '',
      },
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
        date: new Date().toISOString().slice(0, 10),
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
  computed: {},
  watch: {
    saleFlag() {
      this.setDelChalNo();
    },
    updateCounter() {
      this.resetForm();
    },
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    setDelChalNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag
          ? this.delchalNo['sale']
          : this.delchalNo['purchase'];
        if (this.form.no) {
          return;
        }
      } else {
        this.delchalNo = {
          sale: '',
          purchase: '',
        };
      }
      if (this.config.no) {
        this.getLastDelChalNo().then((no) => {
          let codes = this.config.no.format
            ? this.config.no.format.code
            : { in: 'DIN', out: 'DOUT' };
          let code = this.saleFlag ? codes.out : codes.in;
          if (isNaN(no)) {
            this.form.no = no;
          } else {
            no++;
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              no,
              code,
              this.form.date
            );
            this.delchalNo[this.saleFlag ? 'sale' : 'purchase'] = this.form.no;
          }
        });
      }
    },
    getLastDelChalNo() {
      const self = this;
      return this.fetchLastDelChalNo().then(() => {
        let no = self.saleFlag
          ? self.options.lastDelChal.sale
          : self.options.lastDelChal.purchase;
        if (isNaN(no)) {
          if (no.indexOf('/D') >= 0) {
            no = no.split('/D')[0];
            return parseInt(no);
          }
          return no;
        } else {
          return parseInt(no);
        }
      });
    },
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'delivery-note-details',
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
      this.form.date = this.getNoteDate();
      this.setDelChalNo(true);
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