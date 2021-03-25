<template>
  <b-overlay :show="isLoading">
    <b-form @submit.prevent="confirm()">
      {{ form }}
      <b-form-group label="Name" tooltip>
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
      </b-form-group>
      <b-button-group size="sm" class="float-right">
        <b-button type="submit" class="mr-1" variant="success"
          ><b-icon icon="thermometer"></b-icon> Update Unit</b-button
        >
        <b-button
          variant="danger"
          :disabled="sysunit == 1"
          @click="confirm('delete')"
          ><b-icon icon="x-circle"></b-icon> Delete Unit</b-button
        >
      </b-button-group>
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
      sysunit: Number,
      form: {
        unitname: '',
        description: '',
        subunitof: '',
        uomid: '',
        conversionrate: '',
      },
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    /*Confirm dialog for  update & delete actions*/
    confirm(type) {
      if (type == 'delete') {
        this.$bvModal
          .msgBoxConfirm(`Delete unit ${this.form.unitname} ?`, {
            centered: true,
            size: 'md',
            okVariant: 'danger',
            okTitle: 'Delete',
            headerBgVariant: 'danger',
            headerTextVariant: 'light',
          })
          .then((r) => {
            if (r) {
              this.deleteUOM();
            }
          });
      } else {
        this.$bvModal
          .msgBoxConfirm(`Update unit ${this.form.unitname} ?`, {
            centered: true,
            size: 'md',
            okVariant: 'warning',
            okTitle: 'Update',
          })
          .then((r) => {
            if (r) {
              this.updateUOM();
            }
          });
      }
    },
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
            let res = r.data.gkresult;
            this.form.uomid = res.uomid;
            this.form.unitname = res.unitname;
            this.form.description = res.description;
            this.form.subunitof = res.subunitof;
            this.form.conversionrate = res.conversionrate;
            // Default gkcore unit
            this.sysunit = res.sysunit;
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
            this.$bvToast.toast(`Request failed with status code ${r.status}`, {
              variant: 'danger',
              solid: true,
            });
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
    /*
    / This method deletes UOM. It takes uomid as value
    /*/
    deleteUOM() {
      this.isLoading = true;
      axios
        .delete(`${this.gkCoreUrl}/unitofmeasurement`, {
          headers: { gktoken: this.authToken },
          data: { uomid: this.form.uomid },
        })
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast(`${this.form.unitname} deleted`, {
                  variant: 'success',
                  solid: true,
                });
                this.isLoading = false;
                this.$emit('refresh');
                setTimeout(() => {
                  this.$bvModal.hide('edit-uom');
                }, 2000);
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
          }
        });
    },
  },
  mounted() {
    this.getUOMInfo();
  },
};
</script>
