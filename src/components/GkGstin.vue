<template>
  <b-input-group>
    <b-form-input
      size="sm"
      ref="gstin"
      class="gk-gstin"
      v-model.trim="input"
      v-bind="$attrs"
      type="text"
      autocomplete="off"
      :readonly="readonly"
      :tabindex="readonly ? -1 : 0"
      :state="validity"
    ></b-form-input>
    <b-form-invalid-feedback id="gstin-feedback">
      {{ invalidText }}
    </b-form-invalid-feedback>
  </b-input-group>
</template>

<script>
export default {
  name: 'GkGstin',
  model: {
    prop: 'value',
    event: 'input',
  },
  // Have binded $attrs to input tag, so attributes of b-form-input need not be redefined as props
  // This binding doesn't affect style and class attributes of input tag, but that of the wrapper tag (input-group)
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: false,
      default: null,
      note: 'used for exposing v-model',
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
      note:
        'If readonly is true, then only update of data through code is possible',
    },
    invalidText: {
      type: String,
      required: false,
      default: 'GSTIN format incorrect!',
      note: 'used for exposing v-model',
    },
  },
  data() {
    return {
      input: null,
      validity: null,
    };
  },
  computed: {},
  watch: {
    input(gstin, oldInput) {
      if (this.oldInput !== gstin && gstin) {
        this.validateGstin(gstin);
        this.$emit('input', this.input);
      }
    },
    value(gstin, oldValue) {
      if (oldValue !== gstin && gstin) {
        this.validateGstin(gstin);
      }
    },
  },
  methods: {
    /**
     * Validates the gstin and emits a payload with validity status and checksum, pan and state code
     *  */
    validateGstin(gstin) {
      // console.log(1);
      this.validity = this.isValidGstin(gstin);
      let payload = this.validity
        ? {
            validity: this.validity,
            stateCode: gstin.substr(0, 2),
            pan: gstin.substr(2, 10),
            checksum: gstin.substr(12, 3),
          }
        : {
            validity: this.validity,
          };
      this.$emit('validity', payload);
    },
    /**
     * Structurally validates specified GST Number
     *
     * @param {string} gstn GST Number to validate
     * @return TRUE/FALSE
     *
     * Code taken from https://excelkida.com/script-library/fn-isvalidgstn
     */
    isValidGstin(gstn) {
      if (
        !/^(0[1-9]|[1-2][0-9]|3[0-7])[A-Z]{3}([ABCFGHLJPT])[A-Z][0-9]{4}[A-Z][1-9][Z][0-9A-Z]$/g.test(
          gstn
        )
      )
        return false;

      //Calculate 15th digit checksum from 14 digits and compare it
      let gstnCodepointChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let factor = 2,
        sum = 0,
        checkCodePoint = 0;
      let mod = gstnCodepointChars.length;
      for (let i = gstn.length - 2; i >= 0; i--) {
        let codePoint = gstnCodepointChars.indexOf(gstn.charAt(i));
        let digit = factor * codePoint;
        factor = factor == 2 ? 1 : 2;
        digit = digit / mod + (digit % mod);
        sum += Math.floor(digit);
      }
      checkCodePoint = (mod - (sum % mod)) % mod;
      let checksumCharacter = gstnCodepointChars.charAt(checkCodePoint);
      return gstn.substring(14, 15) == checksumCharacter;
    },
  },
  mounted() {},
};
</script>
