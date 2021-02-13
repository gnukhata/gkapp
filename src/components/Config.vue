<template>
  <div class="d-inline-block">
    <b-button size="sm" @click="openModal()">
      <b-icon icon="gear"></b-icon>
    </b-button>
    <b-modal v-model="showModal" header-class="p-2" body-class="px-0 py-2" hide-footer centered size="xl" id="config-modal" :title="title || 'Page Configuration'">
      <b-container fluid :style="{minWidth: '300px'}">
        <b-row>
          <b-col cols="12" md="6" class="mb-1 pr-md-2">
            <b>Custom Config</b>
            <b-form-textarea
              v-model="customConfig"
              placeholder="Enter something..."
              max-rows="12"
              class="px-2"
              :class="{'border-danger': isFormatError, 'border-success': isFormatSuccess}"
              :style="{ height: '300px', maxHeight: '300px' }"
            ></b-form-textarea>
            <div :style="{fontSize: '0.8rem'}" v-if="isFormatError"> <b-icon icon="x-circle-fill" variant="danger"></b-icon>
            JSON format error! Fix your JSON structure and try again.
            </div>
            <div :style="{fontSize: '0.8rem'}" v-if="isFormatSuccess"> <b-icon icon="check-circle-fill" variant="success"></b-icon>
            Configuration formatted successfully!
            </div>
          </b-col>
          <b-col cols="12" md="6" class="mb-1 pl-md-2">
            <b>Formatted Config</b>
            <div class="border border-dark h-100 rounded overflow-auto p-1 position-relative" :style="{ height: '300px', maxHeight: '300px' }">
              <b-overlay :show="isFormatting" variant="secondary" no-wrap blur>
              </b-overlay>
              <pre>{{formattedConfig}}</pre>
            </div>
          </b-col>
        </b-row>
        <hr class="my-2">
        <b-button class="mx-1" @click="editDefault()" size="sm" variant="primary">Edit Default</b-button>
        <b-button size="sm" variant="warning" class="mx-1" @click="formatConfig()">Format</b-button>
        <b-button class="float-right" size="sm" variant="success" @click="saveConfig()">Save</b-button>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "Config",
  components: {},
  props: {
    title: {
      type: String,
      required: false
    },
    getDefault: {
      type: String,
      required: true,
    },
    getCustom: {
      type: String,
      required: true,
    },
    setCustom: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showModal: false,
      formattedConfig: {},
      customConfig: JSON.stringify({}),
      isFormatError: false,
      isFormatSuccess: false,
      isFormatting: false
    };
  },
  computed: {
    defaultConfig: (self) => self.$store.getters[self.getDefault],
    getCustomConfig: (self) => self.$store.getters[self.getCustom],
  },
  methods: {
    openModal() {
      this.showModal = true;
      this.formattedConfig = {};
      this.customConfig = JSON.stringify(this.getCustomConfig, undefined, 2);
      // console.log(this.getCustomConfig)
      this.isFormatError = false;
      this.isFormatSuccess = false;
      this.isFormatting = false;
    },
    /**
     * validateConfig(inpConf, defConf)
     *
     * Arguments: inpConf -> the input, defConf -> the default complete conf
     *
     * Description: parses the input config and returns an object that is valid
     * based on a default config
     */
    validateConfig(inpConf, defConf) {
      let conf = {};
      Object.keys(defConf).forEach((key) => {
        if (
          typeof defConf[key] === "object" &&
          typeof inpConf[key] === "object"
        ) {
          conf[key] = this.validateConfig(inpConf[key], defConf[key]);
        } else if (inpConf[key] === undefined) {
          conf[key] = true; // if a field is not specified, then that field will be visible by default
        } else {
          conf[key] = inpConf[key];
        }
      });
      return Object.assign(conf, {});
    },
    /**
     * autoFillConfig(inpConf, defConf)
     *
     * Paramteres - inpConf (Validated config), defConf (Full default config)
     *
     * Description - Takes the validated config, and autofills the sub fields of
     * a config field that is set to true.
     *
     * e.g. if all the fields listed under config.party has to be visible, we can use
     * config.party = true, instead of manually setting every field true. And this method will
     * auto fill that value.
     *
     *
     */
    autoFillConfig(inpConf, defConf) {
      let conf = {};
      if (inpConf === true) {
        Object.keys(defConf).forEach((key) => {
          if (typeof defConf[key] === "object") {
            conf[key] = this.autoFillConfig(true, defConf[key]);
          } else {
            conf[key] = inpConf;
          }
        });
      } else {
        Object.keys(inpConf).forEach((key) => {
          conf[key] = inpConf[key];
          if (typeof defConf[key] === "object") {
            if (inpConf[key] === true) {
              conf[key] = this.autoFillConfig(true, defConf[key]);
            }
          }
        });
      }
      return Object.assign(conf, {});
    },

    formatConfig() {
      let custom = {}
      this.isFormatting = true
      try {
        custom = JSON.parse(this.customConfig)
        this.isFormatError = false
        this.isFormatSuccess = true

        let conf = this.validateConfig(custom, this.defaultConfig)
        conf = this.autoFillConfig(conf, this.defaultConfig)
        this.formattedConfig = JSON.stringify(Object.assign(conf, {}), undefined, 2)
      }
      catch(error) {
        this.isFormatError = true
        this.isFormatSuccess = false
        console.log("JSON format is not correct")
        custom = {}
        this.formattedConfig = JSON.stringify({}, undefined, 2)
      }

      let self = this
      window.setTimeout(function() {
        self.isFormatting = false
      }, 500)
    },
    editDefault() {
      this.customConfig = JSON.stringify(this.defaultConfig, undefined, 2)
    },
    saveConfig () {
      this.formatConfig()
      if(this.isFormatSuccess) {
        this.$store.dispatch(this.setCustom, JSON.parse(this.formattedConfig))
        this.showModal = false
        this.$bvToast.toast(`${this.title} was successfully saved`, {
          title: "Configuration Update Success!!",
          autoHideDelay: 3000,
          variant: "success",
          appendToast: true,
          solid: true,
        });
      } else {
        this.$bvToast.toast(`The Configuration JSON entered could not be parsed, please provide a valid JSON`, {
          title: "Configuration Update Failure!!",
          autoHideDelay: 5000,
          variant: "warning",
          appendToast: true,
          solid: true,
        });
      }
    }
  },
  mounted() {
  },
};
</script>
