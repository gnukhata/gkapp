<template>
  <b-overlay :show="isLoading">
    <b-form @submit.prevent="createUOM">
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
      <b-button type="submit" variant="success" class="float-right"
        >Create New UOM</b-button
      >
    </b-form>
  </b-overlay>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import Autocomplete from "../Autocomplete.vue";
export default {
  components: { Autocomplete },
  name: "AddUOM",
  data() {
    return {
      isLoading: false,
      uomList: [],
      form: {
        unitname: "",
        description: "",
        subunitof: ""
      }
    };
  },
  computed: {
    ...mapState(["gkCoreUrl", "authToken"])
  },
  methods: {
    /*
     * Get the list of units from the server & assign it to uomList keygen
     */
    getUOM() {
      this.isLoading = true;
      axios
        .get(`${this.gkCoreUrl}/unitofmeasurement?qty=all`, {
          headers: { gktoken: this.authToken }
        })
        .then(r => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let u = r.data.gkresult.map(data => {
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
              "Unable to fetch UOM list, Please reload the page",
              { variant: "danger" }
            );
            this.isLoading = false;
          }
        })
        .catch(e => {
          this.$bvToast.toast(e.message, { variant: "danger" });
        });
    },
    /*
     * Create a new UOM with name, description & sub unit value (optional)
     */
    createUOM() {
      console.log(this.form);
      this.isLoading = true;
      axios
        .post(`${this.gkCoreUrl}/unitofmeasurement`, this.form, {
          headers: { gktoken: this.authToken }
        })
        .then(r => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast(
                  `UOM ${this.form.unitname} Created Successfully`,
                  {
                    variant: "success",
                    solid: true
                  }
                );
                this.isLoading = false;
                this.$emit("refresh");
                break;
              case 1:
                this.$bvToast.toast(`Duplicate Entry`, {
                  variant: "warning",
                  solid: true
                });
                this.isLoading = false;
                break;
              case 2:
                this.$bvToast.toast(`Unauthorised Access`, {
                  variant: "danger",
                  solid: true
                });
                this.isLoading = false;
                break;
              case 3:
                this.$bvToast.toast(`Data error`, {
                  variant: "danger",
                  solid: true
                });
                this.isLoading = false;
                break;
              case 4:
                this.$bvToast.toast(`No Privilege`, {
                  variant: "danger",
                  solid: true
                });
                this.isLoading = false;
                break;
              case 5:
                this.$bvToast.toast(`Integrity error`, {
                  variant: "danger",
                  solid: true
                });
                this.isLoading = false;
                break;
            }
          } else {
            this.$bvToast.toast(`${r.status} error`, {
              variant: "danger",
              solid: true
            });
          }
        })
        .catch(e => {
          this.$bvToast.toast(e.message, {
            variant: "danger",
            solid: true
          });
        });
    }
  },
  mounted() {
    this.getUOM();
  }
};
</script>