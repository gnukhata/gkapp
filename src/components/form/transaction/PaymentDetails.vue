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
        <b>Payment Details</b>
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
          label="Mode of Payment"
          label-for="input-19"
          label-size="sm"
          label-cols="auto"
          v-if="config.mode"
        >
          <b-form-select
            size="sm"
            id="input-19"
            v-model="form.mode"
            :options="options.payModes"
            required
          ></b-form-select>
        </b-form-group>
        <b v-if="form.mode === 3">{{
          saleFlag === true ? 'CASH RECEIVED' : 'CASH PAID'
        }}</b>
        <div v-if="form.mode === 2">
          <b>Bank Details</b>
          <b-form-group
            label="Acc. No."
            label-for="input-20"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.no"
          >
            <b-form-input
              size="sm"
              id="input-20"
              v-model="form.bank.no"
              trim
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Bank Name"
            label-for="input-21"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-model="form.bank.name"
          >
            <b-form-input
              size="sm"
              id="input-21"
              v-if="config.bank.name"
              trim
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Branch"
            label-for="input-22"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.branch"
          >
            <b-form-input
              size="sm"
              id="input-22"
              v-model="form.bank.branch"
              trim
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="IFSC"
            label-for="input-23"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.ifsc"
          >
            <b-form-input
              size="sm"
              id="input-23"
              v-model="form.bank.ifsc"
              trim
              required
            ></b-form-input>
          </b-form-group>
        </div>
        <b v-if="form.mode === 15">ON CREDIT</b>
      </div>
    </div>
  </b-card>
</template>

<script>
export default {
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
      default: function () {
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
      default: function () {
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
  },
};
</script>