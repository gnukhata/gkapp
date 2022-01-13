<template>
  <b-card
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
    v-if="config"
  >
    <div class="p-2 p-md-3">
      <div>
        <b v-translate> Payment Details </b>
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
          label="Mode of Payment"
          label-for="pmd-input-10"
          label-size="sm"
          label-cols="auto"
          v-if="config.mode"
        >
          <template #label> <translate> Mode of Payment </translate> </template>
          <b-form-select
            size="sm"
            id="pmd-input-10"
            v-model="form.mode"
            :options="options.payModes"
            required
          ></b-form-select>
        </b-form-group>
        <div v-if="form.mode === 3">
          <b v-if="saleFlag === true" v-translate> CASH RECEIVED </b>
          <b v-else v-translate> CASH PAID </b>
        </div>
        <div v-if="form.mode === 2">
          <b v-translate> Bank Details </b>
          <b-form-group
            label="Acc. No."
            label-for="pmd-input-20"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.no"
          >
            <template #label> <translate> Acc. No. </translate> </template>
            <b-form-input
              size="sm"
              id="pmd-input-20"
              v-model="form.bank.no"
              trim
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Bank Name"
            label-for="pmd-input-30"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
          >
            <template #label> <translate> Bank Name </translate> </template>
            <b-form-input
              size="sm"
              id="pmd-input-30"
              v-if="config.bank.name"
              v-model="form.bank.name"
              trim
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Branch"
            label-for="pmd-input-40"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.branch"
          >
            <template #label> <translate> Branch </translate> </template>
            <b-form-input
              size="sm"
              id="pmd-input-40"
              v-model="form.bank.branch"
              trim
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="IFSC"
            label-for="pmd-input-50"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.ifsc"
          >
            <!-- <b-form-input
                   size="sm"
                   id="pmd-input-50"
                   v-model="form.bank.ifsc"
                   trim
                   required
                   ></b-form-input> -->
            <gk-ifsc v-model="form.bank.ifsc"></gk-ifsc>
          </b-form-group>
        </div>
        <b v-if="form.mode === 15" v-translate>ON CREDIT</b>
      </div>
    </div>
  </b-card>
</template>

<script>
import GkIfsc from '../../GkIfsc.vue';
export default {
  components: { GkIfsc },
  name: 'PaymentDetails',
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
        return {
          mode: 3,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        };
      },
    },
    optionsData: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
    },
  },
  watch: {
    updateCounter() {
      Object.assign(this.form, this.parentData);
    },
  },
  data() {
    return {
      form: {
        mode: 3,
        bank: {
          no: null,
          name: null,
          branch: null,
          ifsc: null,
        },
      },
      options: {
        payModes: [
          { text: '-- Payment Mode --', value: null },
          { text: 'Cash', value: 3 },
          { text: 'Bank', value: 2 },
          { text: 'On Credit', value: 15 },
        ],
      },
      isCollapsed: false,
    };
  },
  mounted() {
    if (this.optionsData.payModes) {
      this.options.payModes = this.optionsData.payModes;
    }

    // translating the paymodes
    this.options.payModes = [
      { text: this.$gettext('-- Payment Mode --'), value: null },
      { text: this.$gettext('Cash'), value: 3 },
      { text: this.$gettext('Bank'), value: 2 },
      { text: this.$gettext('On Credit'), value: 15 },
    ];
  },
};
</script>
