<template>
  <div>
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
    <b-button
      v-if="showValidityButton"
      size="sm"
      variant="success"
      class="px-1 py-0 mt-1"
      @click.prevent="getGstinCaptcha"
      :disabled="!(validity.checksum && validity.format)"
    >
      {{valButtonText}}
    </b-button>

    <b-modal
      v-model="gstinCaptcha.show"
      header-class="p-2"
      body-class="px-0 py-2"
      hide-footer
      centered
      size="l"
      id="gstin-validation-modal"
      title="GSTIN Validation"
    >
      <b-container
        v-if="!gstinData.validity"
        fluid
        :style="{ minWidth: '300px' }"
      >
        <b-form>
          <b-form-input
            class="mb-2"
            size="sm"
            v-model.trim="input"
            placeholder="Enter a valid GSTIN"
          ></b-form-input>
          <b-form-group
            class="align-items-baseline"
            label-for="gkg-captcha-input"
            label-cols="auto"
          >
            <template #label>
              <img
                style="width: 182px; height: 50px;"
                :src="gstinCaptcha.image"
              />
              <b-button
                @click.prevent="getGstinCaptcha"
                class="p-0 mx-2"
                variant="link"
              >
                <b-icon icon="arrow-repeat"></b-icon>
              </b-button>
            </template>
            <b-form-input
              v-model.trim="gstinCaptcha.text"
              id="gkg-captcha-input"
              :state="gstinCaptcha.validity"
            >
            </b-form-input>
            <b-form-invalid-feedback>
              Captcha not correct, please try again!
            </b-form-invalid-feedback>
          </b-form-group>
        </b-form>
        <hr class="my-2" />
        <b-button
          size="sm"
          variant="warning"
          class="mx-1"
          @click.prevent="validateGstinOnline"
        >
          Validate
        </b-button>
      </b-container>
      <b-container
        v-if="gstinData.validity"
        fluid
        :style="{ minWidth: '300px' }"
      >
        <h5>{{ input }} is valid!</h5>
        <b-form class="align-form-label-right">
          <b-form-group
            label="Trade Name"
            label-size="sm"
            label-for="gkg-input-110"
            label-cols="3"
          >
            <b-form-input
              size="sm"
              id="gkg-input-110"
              v-model="gstinData.tradeName"
              trim
              readonly
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Status"
            label-size="sm"
            label-for="gkg-input-120"
            label-cols="3"
          >
            <b-form-input
              size="sm"
              id="gkg-input-120"
              v-model="gstinData.status"
              trim
              readonly
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Address"
            label-size="sm"
            label-for="gkg-input-130"
            label-cols="3"
          >
            <b-form-textarea
              size="sm"
              id="gkg-input-130"
              v-model="gstinData.addr"
              rows="3"
              trim
              readonly
            ></b-form-textarea>
          </b-form-group>
          <hr class="my-2" />
          <b-button
            size="sm"
            variant="warning"
            class="mx-1"
            @click.prevent="useGstinData"
          >
            Use GSTIN data
          </b-button>
        </b-form>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
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
    showValidation: {
      type: Number,
      required: false,
      default: 1,
      note: 'Visibility of online validation button. (0 - dont show, 1 - show only when valid gstin entered, 2 - show always)'
    },
    valButtonText: {
      type: String,
      required: false,
      default: 'Validate',
      note: 'Text to be displayd on the validate online button'
    }
  },
  data() {
    return {
      input: null,
      validity: {
        checksum: false,
        format: false,
      },
      gstinCaptcha: {
        image: '',
        cookie: '',
        show: false,
        text: '',
        validity: null,
      },
      gstinData: {
        tradeName: '',
        addr: '',
        status: '',
        state: '',
        pincode: '',
        validity: null,
      },
    };
  },
  computed: {
    // show validity button
    showValidityButton: (self) => {
      let show = false;
      if(self.showValidation === 1) {
        // show only when valid gstin is entered  
        show = self.validity.checksum && self.validity.format;
      } else if (self.showValidation === 2) {
        show = true;
      }
      return show;
    },
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
    useGstinData() {
      this.$emit('gstin_data', {
        name: this.gstinData.tradeName,
        addr: this.gstinData.addr,
        pincode: this.gstinData.pincode
      });
      this.gstinCaptcha.show = false;
      this.gstinData.validity = null;
      this.gstinCaptcha.validity = null;
      this.gstinCaptcha.text = '';
    },
    validateGstinOnline() {
      const payload = {
        payload: {
          gstin: this.input,
          captcha: this.gstinCaptcha.text,
        },
        cookie: this.gstinCaptcha.cookie,
      };
      axios.post('/gstreturns?type=gstin_captcha', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          let data = resp.data.gkresult;
          let addrSplit = data.pradr.adr.split(', ');
          this.gstinData = {
            tradeName: data.tradeNam ? data.tradeNam : '',
            status: data.sts ? data.sts : '',
            addr: data.pradr.adr ? data.pradr.adr : '',
            pincode: addrSplit? addrSplit[addrSplit.length -1] : '',
            validity: true,
          };
          this.gstinCaptcha.validity = true;
        } else {
          this.gstinData.validity = false;
          let error = resp.data.gkerror;
          if (error) {
            if (error.errorCode && error.errorCode === 'SWEB_9000') {
              this.gstinCaptcha.validity = false;
              this.gstinCaptcha.text = '';
              this.getGstinCaptcha();
            }
          }
        }
      });
    },
    getGstinCaptcha() {
      axios.get('/gstreturns?type=gstin_captcha').then((resp) => {
        if (resp.data.gkstatus === 0) {
          let data = resp.data.gkresult;
          let captchaB64 = data.captcha;
          this.gstinCaptcha.cookie = data.cookie;
          this.gstinCaptcha.image = `data:image/png;base64,${captchaB64}`;
          this.gstinCaptcha.show = true;
        } else {
          this.gstinCaptcha.show = false;
        }
      });
    },
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
        valid.format = /^[0-9]{4}[A-Z]{3}[0-9]{5}[0-9A-Z]{3}/g.test(gstn);
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
  mounted() {
    if(this.value && !this.input) {
      this.input = this.value;
    }
  },
};
</script>
