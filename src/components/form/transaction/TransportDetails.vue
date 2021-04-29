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
        <b>Transport Details</b>
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
          label="Number of packages"
          label-for="input-24-1"
          label-size="sm"
          label-cols="3"
        >
          <b-form-input
            size="sm"
            id="input-24-1"
            v-model="form.packageCount"
            type="number"
            min="0"
            no-wheel
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Mode of Transport"
          label-for="input-24"
          label-size="sm"
          label-cols="auto"
          v-if="config.mode"
        >
          <b-form-select
            size="sm"
            id="input-24"
            v-model="form.mode"
            :options="options.transportModes"
          ></b-form-select>
        </b-form-group>
        <b-form-group
          label="Vehicle No."
          label-for="input-25"
          label-cols="auto"
          label-size="sm"
          label-cols-lg="autauto"
          v-if="form.mode === 'Road' && config.vno"
        >
          <b-form-input
            size="sm"
            id="input-25"
            v-model="form.vno"
            trim
          ></b-form-input>
        </b-form-group>
        <b-form-group
          id="input-group-3"
          label="Date of Supply"
          label-cols="auto"
          label-for="date-2"
          label-size="sm"
          v-if="config.date"
        >
          <b-input-group>
            <b-form-input
              size="sm"
              id="date-2"
              v-model="form.date"
              type="text"
              placeholder="YYYY-MM-DD"
              autocomplete="off"
            ></b-form-input>
            <b-input-group-append>
              <b-form-datepicker
                size="sm"
                v-model="form.date"
                button-only
                right
                locale="en-GB"
                aria-controls="date-1"
              >
              </b-form-datepicker>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-checkbox
          v-model="form.reverseCharge"
          size="sm"
          name="check-button"
          switch
          v-if="config.reverseCharge"
        >
          Reverse Charge
        </b-form-checkbox>
      </div>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'TransportDetails',
  props: {
    config: {
      type: Object,
      required: false,
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
          mode: 'Road',
          vno: null,
          date: null,
          reverseCharge: false,
          packageCount: 0,
        };
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
      isCollapsed: false,
      form: {
        mode: 'Road',
        vno: null,
        date: null,
        reverseCharge: false,
        packageCount: 0,
      },
      options: {
        transportModes: [
          { text: '-- Transport Mode --', value: null },
          'Road',
          'Rail',
          'Air',
          'Ship',
          'Other',
        ],
      },
    };
  },
};
</script>