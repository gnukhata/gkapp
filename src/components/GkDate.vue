<template>
  <div ref="date" class="gk-date">
    <b-input-group>
      <b-form-input
        size="sm"
        :id="id"
        v-model="input"
        type="text"
        :placeholder="formatText"
        autocomplete="off"
        :readonly="readonly"
        :tabindex="readonly ? -1 : 0"
        :state="isInputValid && isDateValid"
        :required="required"
      ></b-form-input>
      <b-input-group-append>
        <b-form-datepicker
          size="sm"
          v-model="date"
          button-only
          right
          :aria-controls="id"
          :disabled="readonly"
          :tabindex="readonly ? -1 : 0"
          :min="minDate"
          :max="maxDate"
        >
        </b-form-datepicker>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script>
export default {
  name: 'GkDate',
  model: {
    prop: 'value',
    event: 'input',
  },
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
    id: {
      type: String,
      required: true,
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
      default: false,
    },
  },
  data() {
    return {
      input: '',
      date: '',
    };
  },
  computed: {
    isDateValid: (self) => {
      const validity = self.validateDate(self.date);
      let result = false;
      if (validity === null || self.readonly) {
        result = null;
      } else if (validity === 0) {
        result = true;
      }
      return result;
    },
    isInputValid: (self) => {
      return self.input ? self.validateFormat(self.input, self.format) : null;
    },
    formatText: (self) => self.format.toUpperCase(),
    minDate: (self) =>
      (self.validateFormat(self.min), self.format)
        ? self.toInternalFormat(self.min)
        : '',
    maxDate: (self) =>
      (self.validateFormat(self.max), self.format)
        ? self.toInternalFormat(self.max)
        : '',
    minTime: (self) => new Date(self.minDate).getTime(),
    maxTime: (self) => new Date(self.maxDate).getTime(),
  },
  watch: {
    input(newInput) {
      // console.log(newInput)
      if (this.validateFormat(newInput, this.format)) {
        const newDate = this.toInternalFormat(newInput);
        if (this.date !== newDate) {
          this.date = newDate;
          this.$emit('input', newDate);
          this.$emit('validity', this.validateDate(newDate));
        }
      } else {
        this.date = '';
        this.$emit('input', '');
        if (newInput === '') {
          this.$emit('validity', null);
        } else {
          this.$emit('validity', false);
        }
      }
    },
    date(newDate) {
      if (this.validateFormat(newDate, 'yyyy-mm-dd')) {
        const newInput = this.toExternalFormat(newDate);
        if (this.input !== newInput) {
          this.input = newInput;
          this.$emit('input', newDate); // emit internal format for v-model
          this.$emit('validity', this.validateDate(newDate)); // must use internal format for validation
        }
      } else if (!newDate) {
        // "input" is not updated here, as the user may want
        // to update the faulty date via input field
        this.$emit('input', '');
        this.$emit('validity', null);
      }
    },
    // "date" and "input" are user's way of updating the component
    // with "value", the component can be updated via code,
    // e.g. after preloading, date can be updated via code with v-model
    value(date) {
      if (this.date !== date) {
        if (!date) {
          // used when the component has to be reset
          this.input = '';
        } else {
          this.date = date;
        }
      }
    },
    min(date) {
      if (this.validateFormat(date, this.format)) {
        this.$emit('validity', this.validateDate(this.input));
      }
    },
    max(date) {
      if (this.validateFormat(date, this.format)) {
        this.$emit('validity', this.validateDate(this.input));
      }
    },
  },
  methods: {
    /**
     * toInternalFormat
     *
     * Given a date, it will be converted from the input format
     * to the internally used format
     */
    toInternalFormat(input) {
      let date = '';
      switch (this.format) {
        case 'dd-mm-yyyy': {
          date = input.split('-').reverse().join('-');
          break;
        }
        case 'yyyy-mm-dd':
        default: {
          date = input;
        }
      }
      return date;
    },

    /**
     * toExternalFormat
     *
     * Given a date, converts it from internal format (yyyy-mm-dd)
     * to external format (based on props)
     */
    toExternalFormat(date) {
      let input = '';
      switch (this.format) {
        case 'dd-mm-yyyy': {
          input = date.split('-').reverse().join('-');
          break;
        }
        case 'yyyy-mm-dd':
        default: {
          input = date;
        }
      }
      return input;
    },

    /**
     * validateFormat
     *
     * Given a date string, its format will be validated based on the
     * format
     */
    validateFormat(date, format) {
      if (date.length !== 10) {
        return false;
      }

      const items = date.split('-');
      if (items.length !== 3) {
        return false;
      }

      let year, month, day;
      switch (format) {
        case 'dd-mm-yyyy': {
          year = parseInt(items[2]);
          month = parseInt(items[1]);
          day = parseInt(items[0]);
          break;
        }
        case 'yyyy-mm-dd':
        default: {
          year = parseInt(items[0]);
          month = parseInt(items[1]);
          day = parseInt(items[2]);
        }
      }
      return (
        year > 1899 &&
        year <= 9999 &&
        month > 0 &&
        month < 13 &&
        day > 0 &&
        day < 32
      );
    },

    /**
     * validateDate
     *
     * Given a date in INTERNAL FORMAT, it will be validated based on the min and max
     * props
     *
     * return : result
     * -1  -> Less than min
     *  0  -> Valid
     * +1  -> Greater than max
     * null-> Bad Date String, or Bad Min and Max dates
     */
    validateDate(date) {
      let result = null;
      let currTime = new Date(date).getTime();
      if (this.minDate && this.maxDate) {
        if (this.minTime > this.maxTime) {
          result = null;
        } else {
          if (!isNaN(currTime)) {
            if (currTime < this.minTime) {
              result = -1;
            } else if (currTime > this.maxTime) {
              result = 1;
            } else {
              result = 0;
            }
          }
        }
      } else {
        // if only min or max validation is required
        if (this.minDate) {
          result = currTime < this.minTime ? -1 : 0;
        } else {
          result = currTime > this.maxTime ? 1 : 0;
        }
      }
      return result;
    },
  },
};
</script>


<style lang="scss" scoped>
</style>