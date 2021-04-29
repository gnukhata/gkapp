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
        <b>Shipping Details</b>
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
      <div
        class="mt-3"
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
          {{(saleFlag)? 'Use Billing Address' : 'Use Organisation Address'}}
        </b-form-checkbox>
        <b-row>
          <b-col cols="12" v-if="config.name">
            <b-form-group
              label="Name"
              label-for="input-14"
              label-cols="3"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-14"
                v-model="form.name"
                :readonly="copyFlag"
                tabindex="-1"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col cols="12" v-if="config.addr">
            <b-form-group
              label-cols="3"
              label="Address"
              label-for="input-15"
              label-size="sm"
            >
              <b-form-textarea
                size="sm"
                id="input-15"
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
              label="PIN"
              label-for="input-16"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-16"
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
              label-for="input-17"
              label-size="sm"
              label-cols="3"
            >
              <autocomplete
                size="sm"
                id="input-17"
                v-model="form.state"
                :options="options.states"
                trim
                valueUid="id"
                :readonly="copyFlag"
                tabindex="-1"
              ></autocomplete>
            </b-form-group>
          </b-col>
          <b-col v-if="gstFlag && config.gstin" cols="12">
            <b-form-group
              label-cols="3"
              label="GSTIN"
              label-for="input-18"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-18"
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
              label="TIN"
              label-for="input-18"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="input-18"
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
import Autocomplete from '../../Autocomplete.vue';
export default {
  name: 'ShipDetails',
  components: {
    Autocomplete,
  },
  data() {
    return {
      copyFlag: true,
      isCollapsed: false,
      isPreloading: false,
      form: {
        name: null,
        addr: null,
        state: {},
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
    states: {
      type: Array,
      required: false,
    },
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
    },
    organisationDetails: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  watch: {
    copyFlag(newVal, oldVal) {
      this.setShippingDetails();
    },
    updateCounter() {
      this.setShippingDetails();
    },
    saleFlag() {
      this.setShippingDetails();
    }
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
                text: Object.values(item)[0],
                value: {
                  id: Object.keys(item)[0],
                  name: Object.values(item)[0],
                },
              };
            });
          }
        })
        .catch((error) => {
          this.isPreloading = false;
          this.displayToast(
            'Fetch State Data Failed!',
            error.message,
            'danger'
          );
          return error;
        });
    },
    setShippingDetails() {
      if (this.copyFlag) {
        if(this.saleFlag) {
          if(this.billingDetails.name) {
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
      }
    },
    resetForm() {
      this.form = {
        name: null,
        addr: null,
        state: {},
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
    if (this.states.length) {
      this.options.states = this.states;
    } else {
      this.preloadData();
    }
  },
};
</script>