<template>
  <b-form-group
    :label-for="dateId"
    v-bind="$attrs"
    :state="valid"
    :invalid-feedback="notValidText"
  >
    <gk-date
      :id="dateId"
      :format="format"
      v-model="date"
      :min="min"
      :max="max"
      @input="onInput"
      @validity="setDateValidity"
      :required="required"
      :readonly="readonly"
    ></gk-date>
  </b-form-group>
</template>

<script>
import GkDate from './GkDate.vue';
export default {
  name: 'GkFormDate',
  components: { GkDate },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: false,
      default: null,
      note: 'used for exposing v-model',
    },
    format: {
      type: String,
      required: true,
      validator: function (value) {
        return ['yyyy-mm-dd', 'dd-mm-yyyy'].indexOf(value) !== -1;
      },
      note: `The format, input will be provided in. 
      This can be different from the format supported by the date component`,
    },
    min: {
      type: String,
      required: false,
      default: '',
      note: 'The date has to be in the same format as the "format" prop',
    },
    max: {
      type: String,
      required: false,
      default: '',
      note: 'The date has to be in the same format as the "format" prop',
    },
    dateId: {
      type: String,
      required: true,
      note: 'Id to be used on the date input component',
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
      note:
        'If readonly is true, then only update of data through code is possible',
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      valid: null,
      notValidText: 'Date Not Valid',
      date: '',
    };
  },
  computed: {},
  watch: {
    value(date) {
      if(this.date !== date) {
        this.date = date;
      }
    }
  },
  methods: {
    onInput(newDate) {
      // update v-model when new date is chosen
      this.$emit('input', this.date);
    },
    setDateValidity(validity) {
      if(this.readonly) {
        this.valid = null;
      } else {
        if (validity === 0) {
          this.valid = true;
        } else if (validity === null) {
          this.valid = null;
        } else {
          if (validity === false) {
            this.notValidText = `Date Invalid. Use valid format: (${this.format})`;
          } else {
            if(this.min && this.max) {
              this.notValidText = `Date Invalid. Choose between (${this.min}) and (${this.max})`;
            } else {
              if(this.min) {
                this.notValidText = `Date Invalid. Choose on or after (${this.min})`;
              } else {
                this.notValidText = `Date Invalid. Choose on or before (${this.max})`;
              }
            }
          }
          this.valid = false;
        }
      }
      this.$emit('validity', this.valid);
    },
  },
};
</script>


<style lang="scss" scoped>
</style>