<template>
  <section class="container-fluid mt-2">
    <b-card no-body>
      <b-tabs pills card :vertical="!mobileMode">
        <b-tab title="General" active>
          <!-- <b-card-text>Tab contents 1</b-card-text> -->
          <b-form @submit.prevent="saveConfig">
            <b-form-group
              label="Date Format"
              label-for="gs-t1-select-10"
              label-cols-lg="2"
              label-cols="3"
              label-size="sm"
            >
              <b-form-select
                size="sm"
                id="gs-t1-select-10"
                v-model="conf.general.format.date"
                :options="options.general.dateFormat"
                :style="{ 'max-width': '200px' }"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label="App Language"
              label-for="gs-t1-select-20"
              label-cols-lg="2"
              label-cols="3"
              label-size="sm"
            >
              <b-form-select
                size="sm"
                id="gs-t1-select-20"
                v-model="conf.general.default.locale"
                :options="options.general.locale"
                :style="{ 'max-width': '200px' }"
              >
              </b-form-select>
            </b-form-group>
            <b-button type="submit" size="sm" variant="success">
              save
            </b-button>
          </b-form>
        </b-tab>
        <b-tab title="Transaction">
          <!-- <b-card-text>Tab contents 2</b-card-text> -->
          <b-form @submit.prevent="saveConfig">
            <b-form-group
              label="Payment Mode"
              label-for="gs-t2-select-10"
              label-cols-lg="2"
              label-cols="3"
              label-size="sm"
            >
              <b-form-select
                size="sm"
                id="gs-t2-select-10"
                v-model="conf.transaction.default.payment"
                :options="options.transaction.paymentMode"
                :style="{ 'max-width': '200px' }"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label="Tax Mode"
              label-for="gs-t2-select-20"
              label-cols-lg="2"
              label-cols="3"
              label-size="sm"
            >
              <b-form-select
                size="sm"
                id="gs-t2-select-20"
                v-model="conf.transaction.default.tax"
                :options="options.transaction.taxMode"
                :style="{ 'max-width': '200px' }"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label="Default Godown"
              label-for="gs-t2-select-30"
              label-cols-lg="2"
              label-cols="3"
              label-size="sm"
            >
              <b-form-select
                size="sm"
                id="gs-t2-select-30"
                v-model="conf.transaction.default.godown"
                :options="options.transaction.godowns"
                :style="{ 'max-width': '200px' }"
              ></b-form-select>
            </b-form-group>
            <b-button type="submit" size="sm" variant="success">
              save
            </b-button>
          </b-form>
        </b-tab>
      </b-tabs>
    </b-card>
  </section>
</template>

<script>
// import axios from 'axios';
import { mapState } from 'vuex';
import { debounceEvent } from '../js/utils.js';

export default {
  name: 'Settings',
  components: {},
  props: {},
  data() {
    return {
      conf: {
        general: {
          format: {},
          default: {},
        },
        transaction: {
          format: {},
          default: {},
        },
      },
      mobileMode: false,
    };
  },
  watch: {},
  computed: {
    globalConf: (self) => self.$store.getters['global/getGlobalConfig'],
    options: (self) => self.$store.getters['global/getGlobalConfigOptions'],
    ...mapState(['yearStart', 'yearEnd', 'orgCode']),
  },
  methods: {
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
    saveConfig() {
      this.$store
        .dispatch('global/updateGlobalConfig', this.conf)
        .then((resp) => {
          if (resp.gkstatus === 0) {
            this.displayToast(
              `Success!`,
              'Global Config Saved Successfully.',
              'success'
            );
            this.$store.dispatch('global/initGlobalConfig');
            this.$i18n.locale = this.conf.general.default.locale || 'en';
          } else {
            this.displayToast(
              `Success!`,
              'Global Config Saved Successfully.',
              'failure'
            );
          }
        });
    },
  },
  mounted() {
    const self = this;
    this.conf = {
      general: this.globalConf.general,
      transaction: this.globalConf.transaction,
    };
    this.$store.dispatch('global/initGlobalConfig');
    this.$store.dispatch('global/initGlobalConfigOptions');

    debounceEvent(
      window,
      'resize',
      () => {
        self.mobileMode = window.innerWidth < 576;
        console.log(self.mobileMode);
      },
      300
    );
  },
};
</script>
<style scoped></style>
