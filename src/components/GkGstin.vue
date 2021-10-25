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
      :state="isGstinValid"
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
    invalidFormatText: {
      type: String,
      required: false,
      default: 'GSTIN format incorrect!',
      note: 'used for exposing v-model',
    },
    invalidChecksumText: {
      type: String,
      required: false,
      default: 'GSTIN checksum incorrect!',
      note: 'used for exposing v-model',
    },
  },
  data() {
    return {
      input: null,
      validity: {
        checksum: false,
        format: false,
      },
    };
  },
  computed: {
    isGstinValid: (self) =>
      self.value ? self.validity.checksum && self.validity.format : null,
    invalidText: (self) => {
      let text = '';
      if (!self.validity.format) {
        text = self.invalidFormatText;
      } else if (!self.validity.checksum) {
        text = self.invalidChecksumText;
      }
      return text;
    },
  },
  watch: {
    input(gstin, oldInput) {
      if (oldInput !== gstin) {
        this.validateGstin(gstin);
        this.$emit('input', this.input);
      }
    },
    value(gstin, oldValue) {
      if (oldValue !== gstin && gstin) {
        this.validateGstin(gstin);
        this.input = gstin;
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
      let payload = {
        validity: this.validity,
      };
      if (this.validity) {
        if (this.validity.isUin) {
          payload = {
            validity: this.validity,
            stateCode: gstin.substr(0, 2),
          };
        } else {
          payload = {
            validity: this.validity,
            stateCode: gstin.substr(0, 2),
            pan: gstin.substr(2, 10),
            checksum: gstin.substr(12, 3),
          };
        }
      }
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
      let valid = {
        format: true,
        checksum: false,
        isUin: false,
      };

      // check if normal GSTIN (2 digit State Code + 10 digit PAN + 3 digit Checksum)
      // 22AABCU9603R1ZX
      valid.format = /^(0[1-9]|[1-2][0-9]|3[0-7])[A-Z]{3}([ABCFGHLJPT])[A-Z][0-9]{4}[A-Z][1-9][Z][0-9A-Z]$/g.test(
        gstn
      );

      // check if UIN/OIDAR (refer: https://www.teachoo.com/6925/1984/GSTIN-Number-Format/category/GST-Registration/)
      // (2 digit StateCode + 2 digit year + 3 digit country code + 5 digit Alphabets + 3 digit checksum )
      // state code - 99 or 98 (needs review)
      // 0717USA12345NFD
      if (!valid.format) {
        valid.format = /^[0-9]{4}[A-Z]{3}[0-9]{5}[0-9A-Z]{3}/g.test(
          gstn
        );
        if (valid.format) {
          valid.isUin = true;
        }
      }

      if (!valid.format) {
        return valid;
      }

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
      valid.checksum = gstn.substring(14, 15) == checksumCharacter;
      return valid;
    },
  },
  mounted() {},
};
</script>
