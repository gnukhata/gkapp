<template>
  <div>
    <b-overlay :show="loading">
      <!-- HSN Input -->
      <b-form-group :description="hsn.desc" class="mb-0">
        <b-form-input
          type="text"
          :size="size"
          @input="checkHsn"
          v-model="hsn.code"
          :placeholder="this.$gettext('Enter HSN code / description')"
          :state="hsn.isValid"
          :required="required"
        ></b-form-input>
      </b-form-group>
    </b-overlay>
    <!-- HSN Suggestions Table -->
    <div
      v-if="hsn.suggestions.length > 0"
      style="height: 20em; width: inherit; overflow-y:scroll"
      class="border mb-1 text-"
    >
      <b-table
        table-variant="warning"
        hover
        small
        thead-class="d-none"
        :items="hsn.suggestions"
      >
        <template #cell(hsn_code)="data">
          <div @click="selectHsnSuggestion(data.item)" role="button">
            <small>{{ data.item.hsn_code }}</small>
          </div>
        </template>
        <template #cell(hsn_desc)="data">
          <div @click="selectHsnSuggestion(data.item)" role="button">
            <small>{{ data.item.hsn_desc }}</small>
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// import { mapGetters } from 'vuex';
export default {
  name: 'GkHsn',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    size: {
      type: String,
      default: 'sm',
      description:
        'Default value is "md". Possible values are "sm", "md", "xl"',
    },
    required: {
      type: [String, Boolean],
      default: false,
    },
    value: {
      type: [Object, String],
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      hsn: {
        code: null,
        desc: '',
        suggestions: [],
        isValid: null,
      },
    };
  },
  watch: {
    value(v) {
      this.string2json(v);
    },
  },
  methods: {
    /**
     * Convert string to JSON & validate
     */
    string2json(s) {
      this.hsn.code = JSON.parse(s)['hsn_code'];
      this.checkHsn();
    },
    /**
     * Check if entered hsn is valid, else emit
     * `null` & show a list of hsn suggestions
     */
    checkHsn() {
      if (this.hsn.code.length == 0) {
        this.hsn.isValid = null;
        this.hsn.desc = '';
        return;
      }
      axios.get(`/hsn?validate=${this.hsn.code}`).then((r) => {
        if (r.data.gkstatus != 0) {
          this.hsn.isValid = false;
          this.searchHsn();
          this.$emit('change', null);
        } else {
          this.hsn.isValid = true;
          this.hsn.desc = r.data.gkresult['hsn_desc'];
          this.hsn.suggestions = [];
          this.$emit('change', JSON.stringify(r.data.gkresult));
        }
      });
    },
    /**
     * Select HSN Code in table
     */
    selectHsnSuggestion(o) {
      this.hsn.code = o.hsn_code;
      this.checkHsn();
    },

    /**
     * Return matching hsn info as array of objects
     */
    searchHsn() {
      this.loading = true;
      if (this.hsn.code !== '' && this.hsn.code.length >= 3) {
        axios
          .get(`/hsn?search=${this.hsn.code}`)
          .then((r) => {
            switch (r.data.gkstatus) {
              case 0:
                this.hsn.suggestions = r.data.gkresult;
                break;
              case 2:
                this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 6:
                this.$bvToast.toast(this.$gettext('Proxy Server Error'), {
                  variant: 'danger',
                  solid: true,
                });
                break;
            }
            this.loading = false;
          })
          .catch((e) => {
            this.$bvToast.toast(e.message, {
              variant: 'danger',
              solid: true,
            });
            this.loading = false;
          });
      } else {
        this.loading = false;
      }
    },
  },
};
</script>