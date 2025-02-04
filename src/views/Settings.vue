<template>
  <section class="container-fluid mt-2">
    <b-form @submit.prevent="saveConfig">
      <b-card no-body>
        <template #header>
          <h5 class="my-2">
            Settings
          </h5>
        </template>
        <b-card-body>
          <div>
            <h5 class="mb-3">
              General
            </h5>
            <b-form-group
              label="Date Format"
              label-for="gs-t1-select-10"
              label-cols-md="3"
            >
              <template #label>
                <translate> Date Format </translate>
              </template>
              <b-form-select
                size="sm"
                id="gs-t1-select-10"
                v-model="conf.general.format.date"
                :options="options.general.dateFormat"
                :style="{'max-width': '200px'}"
              />
            </b-form-group>
            <b-form-group
              label="App Language"
              label-for="gs-t1-select-20"
              label-cols-md="3"
            >
              <template #label>
                <translate> App Language </translate>
              </template>
              <b-form-select
                size="sm"
                id="gs-t1-select-20"
                v-model="conf.general.default.locale"
                :style="{'max-width': '200px'}"
              >
                <b-form-select-option
                  v-for="(language, key) in $language.available"
                  :key="key"
                  :value="key"
                >
                  {{ language }}
                </b-form-select-option>
              </b-form-select>
            </b-form-group>
          </div>
          <div>
            <hr class="mx-1 my-4">
            <h5 class="mb-3">
              Payment
            </h5>
            <b-form-group
              label="Payment Mode"
              label-for="gs-t2-select-10"
              label-cols-md="3"
            >
              <template #label>
                <translate> Payment Mode </translate>
              </template>
              <b-form-select
                size="sm"
                id="gs-t2-select-10"
                v-model="conf.transaction.default.payment"
                :options="options.transaction.paymentMode"
                :style="{'max-width': '200px'}"
              />
            </b-form-group>
            <b-form-group
              label="Default Godown"
              label-for="gs-t2-select-30"
              label-cols-md="3"
            >
              <template #label>
                <translate> Default Godown </translate>
              </template>
              <b-form-select
                size="sm"
                id="gs-t2-select-30"
                v-model="conf.transaction.default.godown"
                :options="options.transaction.godowns"
                :style="{'max-width': '200px'}"
              />
            </b-form-group>
            <b-form-group
              label="Allow Negative Stock"
              label-for="gs-t2-select-40"
              label-cols-md="3"
            >
              <template #label>
                <translate>
                  Allow Negative Stock
                </translate>
              </template>
              <b-form-checkbox
                switch
                v-model="conf.transaction.default.allowNegativeStock"
              />
            </b-form-group>
            <b-form-group
              label="Use contact ledgers to track transactions"
              label-for="gs-t2-select-30"
              label-cols-md="3"
            >
              <template #label>
                <translate>
                  Use contact ledgers to track transactions
                </translate>
                <div v-b-modal.m1>
                  <b-icon icon="question-circle" />
                </div>
                <b-modal
                  id="m1"
                  size="md"
                  ok-variant="dark"
                  title="Help"
                  hide-footer
                  no-stacking
                  scrollable
                >
                  <p>
                    Enabling contact ledgers will make use of separate accounts
                    per contact (Customer/Supplier) for cash and bank
                    transactions. Otherwise generic sales/purchase accounts
                    will be used. Credit transactions will always use contact
                    accounts regardless of this setting.
                  </p>
                </b-modal>
              </template>
              <b-form-checkbox
                switch
                v-model="conf.transaction.default.partyVoucherFlag"
              />
            </b-form-group>
          </div>
          <div>
            <hr class="mx-1 my-4">
            <b-button
              type="submit"
              variant="success"
              size="sm"
            >
              <translate>Save</translate>
            </b-button>
          </div>
        </b-card-body>
      </b-card>
    </b-form>
  </section>
</template>

<script>
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
        OrgProfile: {
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
      this.mobileMode = this.is_mobile();
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
