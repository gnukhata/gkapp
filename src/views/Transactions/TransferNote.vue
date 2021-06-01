<template>
  <b-container style="min-width: 300px" fluid class="mt-2 px-md-3 px-2 align-form-label-right">
    <b-alert :show="isInvDateValid === false" variant="danger"
      >Date must be within the Financial Year, from <b>{{ yearStart }}</b> to
      <b>{{ yearEnd }}</b>
    </b-alert>
    <div class="mb-2">
      <!-- <span class="float-right">
        <config
          title="Invoice Page Configuration"
          getDefault="getDefaultTransferNoteConfig"
          setCustom="updateTransferNoteConfig"
          getCustom="getCustomTransferNoteConfig"
        >
        </config>
      </span> -->
      <div class="clearfix"></div>
    </div>
    <b-form @submit.prevent="onSubmit">
      <b-card-group class="d-block d-md-flex my-2" deck>
        <!-- Delivery Note Details -->
        <transfer-note-details
          :config="config.transferNote"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.transferNote"
          ref="transferNote"
        ></transfer-note-details>
        <transport-details
          ref="transport"
          :config="config.transport"
          :updateCounter="updateCounter.transport"
          :parentData="form.transport"
        ></transport-details>
      </b-card-group>
      <!-- Bill Table -->
      <bill-table
        :gstFlag="true"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :updateCounter="updateCounter.bill"
        :parentData="form.bill"
        ref="bill"
      ></bill-table>
      <b-tooltip
        target="inv-submit"
        :show="showErrorToolTip"
        placement="top"
        triggers="manual"
      >
        Date must be within the Financial Year, from <b>{{ yearStart }}</b> to
        <b>{{ yearEnd }}</b>
      </b-tooltip>
      <hr />
      <div class="float-right">
        <b-button
          class="m-1"
          size="sm"
          variant="danger"
          @click.prevent="$router.go(-1)"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle"
            icon="arrow-left"
          ></b-icon>
          <span class="align-middle"> Back</span>
        </b-button>
        <b-button
          class="m-1"
          size="sm"
          variant="warning"
          @click.prevent="resetForm"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle"
            icon="arrow-repeat"
          ></b-icon>
          <span class="align-middle"> Reset</span>
        </b-button>
        <b-button
          id="inv-submit"
          :disabled="!isInvDateValid"
          type="submit"
          size="sm"
          class="m-1"
          variant="success"
        >
          <span>
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Create</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix"></div>
    </b-form>
  </b-container>
</template>

<script>
// import axios from 'axios';
import { mapState } from 'vuex';

// import Config from '../../components/Config.vue';

import BillTable from '../../components/form/transaction/BillTable.vue';
import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import TransferNoteDetails from '../../components/form/transaction_details/TransferNoteDetails.vue';

import TransferNoteConfig from '../../js/config/transferNote.js';

export default {
  name: '',
  components: {
    // Config,

    BillTable,
    TransportDetails,
    TransferNoteDetails,
  },
  data() {
    return {
      vuexNameSpace: '',
      isLoading: false,
      isInvDateValid: false,
      updateCounter: {
        transferNote: 0,
        bill: 0,
        transport: 0,
      },
      form: {
        transferNote: {},
        bill: [],
        transport: {},
      },
      options: {
        states: [],
      },
    };
  },
  computed: {
    config: (self) => {
      let newConf = self.$store.getters[`${self.vuexNameSpace}/getCustomTransferNoteConfig`];
      if (newConf) {
        newConf.transferNote.class = { 'mr-md-1': true };
        newConf.transport.class = { 'ml-md-1': true };
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
          inv: {
            class: {},
          },
          bill: {},
          transport: {
            class: {},
          },
        };
      }

      return newConf;
    },
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'orgCode']),
  },
  methods: {
    onComponentDataUpdate(payload) {
      switch (payload.name) {
        case 'transfer-note-details':
          Object.assign(this.form.transferNote, payload.data);
          break;
      }
    },
    collectComponentData() {
      Object.assign(this.form.transferNote, this.$refs.transferNote.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.transport, this.$refs.transport.form);
    },
    updateComponentData() {
      this.updateCounter.transferNote++;
      this.updateCounter.transport++;
      this.updateCounter.bill++;
    },
    resetForm() {},
    initForm() {},
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
  beforeMount() {
    this.vuexNameSpace = 'transferNoteConfig_' + Date.now()
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, TransferNoteConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initTransferNoteConfig`, {orgCode: this.orgCode});
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future

    this.initForm();
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>