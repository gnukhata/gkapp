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
        <b v-translate>Shipping Details</b>
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
      <div
        class="mt-3 px-2"
        :class="{ 'd-md-block': true, 'd-none': !isCollapsed }"
        id="shipping-details"
      >
        <b-form-checkbox
          id="checkbox-1"
          v-model="copyFlag"
          name="checkbox-1"
          class="mb-3"
          size="sm"
          switch
          v-if="config.copyFlag"
        >
          <span v-if="saleFlag" v-translate> Use Billing Address </span>
          <span v-else v-translate> Use Organisation Address </span>
        </b-form-checkbox>
        <b-row>
          <b-col cols="12" v-if="config.name">
            <b-form-group
              label="Name"
              label-for="spd-input-10"
              label-cols="3"
              label-cols-md="4"
              label-cols-lg="3"
              label-size="sm"
            >
              <template #label> <translate> Name </translate> </template>
              <b-form-input
                size="sm"
                id="spd-input-10"
                v-model="form.name"
                :readonly="copyFlag"
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.addr">
            <b-form-group
              label-cols="3"
              label-cols-md="4"
              label-cols-lg="3"
              label="Address"
              label-for="spd-input-20"
              label-size="sm"
            >
              <template #label> <translate> Address </translate> </template>
              <b-form-textarea
                size="sm"
                id="spd-input-20"
                v-model="form.addr"
                rows="2"
                max-rows="2"
                trim
                :readonly="copyFlag"
                tabindex="-1"
              ></b-form-textarea>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.pin">
            <b-form-group
              label-cols="3"
              label-cols-md="4"
              label-cols-lg="3"
              label="PIN"
              label-for="spd-input-30"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="spd-input-30"
                v-model="form.pin"
                trim
                :readonly="copyFlag"
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.state">
            <b-form-group
              label="State"
              label-for="spd-input-40"
              label-size="sm"
              label-cols="3"
              label-cols-md="4"
              label-cols-lg="3"
            >
              <template #label> <translate> State </translate> </template>
              <v-select
                id="spd-input-40"
                v-model="form.state"
                :options="options.states"
                trim
                :disabled="copyFlag"
                :tabindex="-1"
                label="name"
                :reduce="(state) => state.name"
              >
              </v-select>
            </b-form-group>
          </b-col>
          <b-col v-if="gstFlag && config.gstin" cols="12">
            <b-form-group
              label-cols="3"
              label-cols-md="4"
              label-cols-lg="3"
              label="GSTIN"
              label-for="spd-input-50"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="spd-input-50"
                v-model="form.gstin"
                trim
                :readonly="copyFlag"
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col v-else-if="config.tin" cols="12">
            <b-form-group
              label-cols="3"
              label-cols-md="4"
              label-cols-lg="3"
              label="TIN"
              label-for="spd-input-60"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="spd-input-60"
                v-model="form.tin"
                trim
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
export default {
  name: 'ShipDetails',
  components: {
  },
  data() {
    return {
      copyFlag: true,
      isCollapsed: false,
      isPreloading: false,
      form: {
        name: null,
        addr: null,
        state: {name: ''},
        gstin: null,
        tin: null,
        pin: null,
      },
      options: {
        states: [],
      },
    };
  },
  props: {
    gstFlag: {
      type: Boolean,
      required: true,
    },
    saleFlag: {
      type: Boolean,
      required: true,
    },
    billingDetails: {
      type: Object,
      required: true,
      note: 'Party details, used for Sale Invoices',
    },
    organisationDetails: {
      type: Object,
      required: true,
      note: 'Organisation details, used for Purchase Invoices',
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
    customDetails: {
      type: Object,
      required: false,
      default: null,
      note: 'Custom Details, used for edit Invoices',
    },
  },
  watch: {
    copyFlag() {
      this.setShippingDetails();
    },
    updateCounter() {
      if (this.customDetails) {
        Object.assign(this.form, this.customDetails);
        if (typeof this.customDetails.copyFlag === 'boolean') {
          this.copyFlag = this.customDetails.copyFlag;
        }
      } else {
        this.setShippingDetails();
      }
    },
    saleFlag() {
      this.setShippingDetails();
    },
  },
  methods: {
    preloadData() {
      let self = this;
      this.isPreloading = true;
      axios
        .get('/state')
        .then((resp) => {
          this.isPreloading = false;
          if (resp.data.gkstatus === 0) {
            self.options.states = resp.data.gkresult.map((item) => {
              return {
                id: Object.keys(item)[0],
                name: Object.values(item)[0]
              };
            });
          }
        })
        .catch((error) => {
          this.isPreloading = false;
          this.displayToast(
            this.$gettext('Fetch State Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
    setShippingDetails() {
      if (this.copyFlag) {
        if (this.saleFlag) {
          if (this.billingDetails.name) {
            Object.assign(this.form, this.billingDetails);
            this.form.name = this.billingDetails.name.name;
            delete this.form.type;
          } else {
            this.resetForm();
          }
        } else {
          Object.assign(this.form, this.organisationDetails);
        }
      } else {
        this.resetForm();
        if (this.customDetails) {
          Object.assign(this.form, this.customDetails);
        }
      }
    },
    resetForm() {
      this.form = {
        name: null,
        addr: null,
        state: {name: ''},
        gstin: null,
        tin: null,
        pin: null,
      };
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
    this.preloadData();
  },
};
</script>
