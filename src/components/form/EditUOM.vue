<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <b-card
        header="Edit Unit"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard"
      >
        <b-form @submit.prevent="confirm()">
          <b-form-group
            :label="$gettext('Name')"
            label-align="right"
            label-cols="4"
            tooltip
          >
            <b-form-input
              v-model="form.unitname"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-align="right"
            label-cols="4"
            :label="$gettext('Description')"
            tooltip
          >
            <b-form-input
              v-model="form.description"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-align="right"
            label-cols="4"
            :label="$gettext('Sub Unit of')"
            description="optional"
          >
            <autocomplete
              v-model="form.subunitof"
              :options="uomList"
              :placeholder="$gettext('Select Unit')"
            ></autocomplete>
          </b-form-group>
          <b-form-group
            :label="$gettext('Conversion Rate')"
            label-align="right"
            label-cols="4"
          >
            <b-form-input
              v-model="form.conversionrate"
              type="number"
              no-wheel
              placeholder="0.00"
              step="0.01"
              required
            ></b-form-input>
          </b-form-group>
          <b-button-group size="sm" class="float-right">
            <b-button type="submit" class="mr-1" variant="success">
              <b-icon icon="thermometer"></b-icon>
              <translate>Update Unit</translate></b-button
            >
            <b-button
              variant="danger"
              :disabled="sysunit == 1"
              @click="confirm('delete')"
            >
              <b-icon class="mr-1" icon="x-circle"></b-icon>
              <translate>Delete Unit</translate></b-button
            >
          </b-button-group>
        </b-form>
      </b-card>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Autocomplete from '../Autocomplete.vue';
export default {
  components: { Autocomplete },
  name: 'EditUOM',
  data() {
    return {
      id: Number,
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
              obj.text = `${data.unitname} - ${data.description}`;
              obj.value = data.uomid;
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
                // Create log
                axios.post(
                  `${this.gkCoreUrl}/log`,
                  {
                    activity: `uom updated: ${this.form.unitname}`,
                  },
                  {
                    headers: {
                      gktoken: this.authToken,
                    },
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
                // Create log
                axios.post(
                  `${this.gkCoreUrl}/log`,
                  {
                    activity: `uom deleted: ${this.form.unitname}`,
                  },
                  {
                    headers: {
                      gktoken: this.authToken,
                    },
                  }
                );
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
    this.id = this.$route.params.id;
    this.getUOMInfo();
  },
};
</script>
