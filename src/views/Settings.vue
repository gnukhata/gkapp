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
              <template #label> <translate> Date Format </translate> </template>
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
              <template #label>
                <translate> App Language </translate>
              </template>
              <b-form-select
                size="sm"
                id="gs-t1-select-20"
                v-model="conf.general.default.locale"
                :style="{ 'max-width': '200px' }"
              >
                <b-form-select-option
                  v-for="(language, key) in $language.available"
                  :key="key"
                  :value="key"
                  >{{ language }}</b-form-select-option
                >
              </b-form-select>
            </b-form-group>
            <b-button type="submit" size="sm" variant="success">
              <translate> save </translate>
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
              <template #label>
                <translate> Payment Mode </translate>
              </template>
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
              <template #label> <translate> Tax Mode </translate> </template>
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
              <template #label>
                <translate> Default Godown </translate>
              </template>
              <b-form-select
                size="sm"
                id="gs-t2-select-30"
                v-model="conf.transaction.default.godown"
                :options="options.transaction.godowns"
                :style="{ 'max-width': '200px' }"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label="Use Customer / Supplier ledgers to track transactions"
              label-for="gs-t2-select-30"
              label-cols-lg="2"
              label-cols="3"
              label-size="sm"
            >
              <template #label>
                <translate>
                  Use Customer / Supplier ledgers to track transactions
                </translate>
              </template>
              <b-form-checkbox
                switch
                v-model="conf.transaction.default.partyVoucherFlag"
              >
              </b-form-checkbox>
            </b-form-group>
            <b-button type="submit" size="sm" variant="success">
              <translate> save </translate>
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
              this.$gettext(`Success!`),
              this.$gettext('Global Config Saved Successfully.'),
              'success'
            );
            this.$store.dispatch('global/initGlobalConfig', {
              lang: this.$language,
            });
          } else {
            this.displayToast(
              this.$gettext(`Success!`),
              this.$gettext('Global Config Saved Successfully.'),
              'failure'
            );
          }
        });
    },
    checkMobileMode() {
      this.mobileMode = window.innerWidth < 576;
    },
  },
  mounted() {
    const self = this;
    Promise.all([
      this.$store.dispatch('global/initGlobalConfig'),
      this.$store.dispatch('global/initGlobalConfigOptions'),
    ]).then(() => {
      self.conf = {
        general: self.globalConf.general,
        transaction: self.globalConf.transaction,
      };
    });

    debounceEvent(window, 'resize', this.checkMobileMode, 300);
    this.checkMobileMode();
  },
};
</script>
<style scoped></style>
