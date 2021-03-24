<template>
  <b-overlay :show="isLoading">
    <b-form @submit.prevent="updateUOM">
      {{ form }} {{ id }}
      <b-form-group label="Unit Name" tooltip>
        <b-form-input
          v-model="form.unitname"
          type="text"
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group label="Description" tooltip>
        <b-form-input
          v-model="form.description"
          type="text"
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group label="Sub Unit of " description="optional">
        <autocomplete
          v-model="form.subunitof"
          :options="uomList"
        ></autocomplete>
      </b-form-group>
      <b-form-group label="Conversion Rate">
        <b-form-input
          v-model="form.conversionrate"
          type="text"
          required
        ></b-form-input>
        <b-button type="submit" variant="success" class="float-right"
          ><b-icon icon="thermometer"></b-icon> Update UOM</b-button
        >
      </b-form-group>
    </b-form>
  </b-overlay>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Autocomplete from '../Autocomplete.vue';
export default {
  components: { Autocomplete },
  name: 'EditUOM',
  props: {
    id: Number,
  },
  data() {
    return {
      isLoading: false,
      uomInfo: [],
      uomList: [],
      form: {
        unitname: '',
        description: '',
        subunitof: '',
        uomid: '',
        conversionrate: '',
        sysunit: '',
        flag: '',
      },
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    /*
     * Get UOM info from 'id' prop & display the details
     */
    getUOMInfo() {
      axios
        .get(
          `${this.gkCoreUrl}/unitofmeasurement?qty=single&uomid=${this.id}`,
          {
            headers: {
              gktoken: this.authToken,
            },
          }
        )
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.form = r.data.gkresult;
          } else {
            this.$bvToast.toast('Unable to fetch UOM list from the server', {
              solid: true,
              variant: 'danger',
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            solid: true,
            variant: 'danger',
          });
        });
      this.getUOM();
    },
    /*
     * Get the list of units from the server & assign it to uomList.
     */
    getUOM() {
      this.isLoading = true;
      axios
        .get(`${this.gkCoreUrl}/unitofmeasurement?qty=all`, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let u = r.data.gkresult.map((data) => {
              let obj = {};
              obj.text = `${Object.values(data)[1]} - ${
                Object.values(data)[2]
              }`;
              obj.value = Object.values(data)[0];
              return obj;
            });
            this.uomList = u;
            this.isLoading = false;
          } else {
            console.log(r.data.gkstatus);
            this.$bvToast.toast(
              'Unable to fetch UOM list, Please reload the page',
              { variant: 'danger' }
            );
            this.isLoading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, { variant: 'danger' });
        });
    },
    /*
     * Update UOM details
     */
    updateUOM() {
      console.log(this.form);
      this.isLoading = true;
      axios
        .put(`${this.gkCoreUrl}/unitofmeasurement`, this.form, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast(
                  `${this.form.unitname} updated successfully`,
                  {
                    variant: 'success',
                    solid: true,
                  }
                );
                this.isLoading = false;
                this.$emit('refresh');
                break;
              case 1:
                this.$bvToast.toast(`Duplicate Entry`, {
                  variant: 'warning',
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 2:
                this.$bvToast.toast(`Unauthorised Access`, {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 3:
                this.$bvToast.toast(`Connection Failed`, {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 4:
                this.$bvToast.toast(`Bad Privilege`, {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 5:
                this.$bvToast.toast(`Action Disallowed`, {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
                break;
            }
          } else {
            this.$bvToast.toast(
              `Connection failed with status code ${r.status}`,
              {
                variant: 'danger',
                solid: true,
              }
            );
            this.isLoading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'success',
            solid: true,
          });
          this.isLoading = false;
        });
    },
  },
  mounted() {
    this.getUOMInfo();
  },
};
</script>
