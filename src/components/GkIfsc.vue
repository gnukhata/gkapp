<template>
  <div>
    <b-overlay :show="loading">
      <!-- Input area -->
      <b-input-group>
        <b-form-input
          placeholder="eg: KARB0000001"
          :size="size"
          v-model="ifscCode"
          @blur="validateIfsc"
        ></b-form-input>
        <!-- Validate button -->
        <b-input-group-append>
          <b-button
            title="validate"
            @click="validateIfsc"
            size="sm"
            variant="dark"
          >
            <b-icon icon="check-all"></b-icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-overlay>
    <!-- popup modal -->
    <b-modal
      id="ifsc-info"
      size="md"
      title="IFSC Details"
      scrollable
      header-bg-variant="dark"
      header-text-variant="light"
      header-class="p-2"
      v-if="ifscData"
    >
      <template #modal-footer>
        <b-button variant="dark" size="sm" @click="autoFill">
          Auto fill</b-button
        >
      </template>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="Bank"
      >
        <b-form-input v-model="ifscData.BANK" size="sm"> </b-form-input>
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="Branch"
      >
        <b-form-input size="sm" v-model="ifscData.BRANCH"> </b-form-input>
      </b-form-group>

      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="Center"
      >
        <b-form-input size="sm" v-model="ifscData.CENTRE"> </b-form-input>
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="City"
      >
        <b-form-input size="sm" v-model="ifscData.CITY"> </b-form-input>
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="Address"
      >
        <b-form-input size="sm" v-model="ifscData.ADDRESS"> </b-form-input>
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="State"
      >
        <b-form-input size="sm" v-model="ifscData.STATE"> </b-form-input>
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="Contact"
      >
        <b-form-input size="sm" v-model="ifscData.CONTACT"> </b-form-input>
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        label="MICR"
      >
        <b-form-input size="sm" v-model="ifscData.MICR"> </b-form-input>
      </b-form-group>
      <b-badge class="mr-2" :variant="ifscData.UPI ? 'success' : 'danger'"
        ><b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        ></b-icon>
        UPI</b-badge
      >
      <b-badge class="mr-2" :variant="ifscData.RTGS ? 'success' : 'danger'"
        ><b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        ></b-icon>
        RTGS</b-badge
      >
      <b-badge class="mr-2" :variant="ifscData.NEFT ? 'success' : 'danger'"
        ><b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        ></b-icon>
        NEFT</b-badge
      >
      <b-badge :variant="ifscData.IMPS ? 'success' : 'danger'"
        ><b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        ></b-icon>
        IMPS</b-badge
      >
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'GkIfsc',
  model: {
    prop: 'ifscCode',
    event: 'change',
  },
  props: {
    size: {
      type: String,
      default: 'md',
    },
  },
  data() {
    return {
      loading: false,
      ifscCode: null,
      ifscData: Object,
    };
  },
  methods: {
    /**
     * send the ifsc object to the parent
     */
    autoFill() {
      this.$emit('fill', this.ifscData);
      this.$bvModal.hide('ifsc-info');
    },
    /**
     * validate the given ifsc string with razorpay/ifsc
     * proxy server & get appropriate response
     */
    validateIfsc() {
      this.$emit('change');
      this.loading = true;
      axios
        .get(`/ifsc?check=${this.ifscCode}`)
        .then((r) => {
          switch (r.data.gkstatus) {
            case 0:
              this.ifscData = r.data.gkresult;
              this.$emit('change');
              this.$bvModal.show('ifsc-info');
              break;
            case 1:
              this.$bvToast.toast('Duplicate Entry', {
                variant: 'warning',
                solid: true,
              });
              break;
            case 2:
              this.$bvToast.toast('Unauthorised Access', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
              this.$bvToast.toast('Invalid IFSC Code', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast('No Privilege', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 5:
              this.$bvToast.toast('Integrity error', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 6:
              this.$bvToast.toast('Proxy Server Error', {
                variant: 'danger',
                solid: true,
              });
              break;
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
  },
};
</script>