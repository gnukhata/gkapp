<template>
  <b-form @submit.prevent="updateProfile">
    <b-overlay :show="loading" blur no-wrap></b-overlay>
    {{ details }}
    {{ godowns }}
    <!-- name --->
    <b-card class="mb-2" header="Info" header-bg-variant="warning">
      <b-form-group label="Name" label-cols="4">
        <b-form-input
          v-model="details.productdesc"
          :value="details.productdesc"
          type="text"
          required
        ></b-form-input>
      </b-form-group>
      <!-- Opening Stock -->
      <b-form-group
        v-if="details.gsflag == 7"
        label="Opening Stock"
        label-cols="4"
      >
        <b-form-input
          :value="details.openingstock"
          v-model="details.openingstock"
          type="number"
        ></b-form-input>
      </b-form-group>
      <!-- UOM -->
      <b-form-group
        v-if="details.gsflag == 7"
        label="Unit of Measure"
        label-cols="4"
      >
        <b-input-group :prepend="details.unitname.name || details.unitname">
          <b-form-select
            :value="details.unitname"
            v-model="details.unitname"
            :options="options.uom"
          >
          </b-form-select>
        </b-input-group>
      </b-form-group>
      <!-- HSN / SCN Code -->
      <b-form-group v-if="details.gsflag == 7" label="HSN Code" label-cols="4">
        <b-form-input
          v-model="details.gscode"
          :value="details.gscode"
        ></b-form-input>
      </b-form-group>
      <b-form-group v-else label="SAC Code" label-cols="4">
        <b-form-input
          v-model="details.gscode"
          :value="details.gscode"
        ></b-form-input>
      </b-form-group>
    </b-card>
    <b-card header="Price" header-bg-variant="warning">
      <!-- MRP -->
      <b-form-group label="MRP" label-cols="4">
        <b-form-input
          v-model="details.prodmrp"
          :value="details.prodmrp"
        ></b-form-input>
      </b-form-group>
      <!-- Selling Price -->
      <b-form-group id="input-group-2" label="Selling Price" label-cols="4">
        <b-form-input
          :value="details.prodmrp"
          v-model="details.prodsp"
        ></b-form-input>
      </b-form-group>
      <!-- discount -->
      <b-form-group label-cols="4" label="Discount" label-for="input-3">
        <b-input-group prepend="₹">
          <b-form-input
            :value="details.discountamount"
            v-model="details.discountamount"
          ></b-form-input>
        </b-input-group>
        <b-input-group class="mt-1" prepend="%">
          <b-form-input
            :value="details.discountname"
            v-model="details.discountpercent"
          ></b-form-input>
        </b-input-group>
      </b-form-group>
    </b-card>
    <b-card class="mt-2" header="Tax" header-bg-variant="warning">
      {{ options.tax }}
      <b-card-group deck>
        <b-card
          v-for="item in options.tax"
          :key="item.taxid"
          :header="item.taxname"
        >
          <b-input-group prepend="%">
            <b-form-input
              :value="item.taxrate"
              v-model="item.taxrate"
            ></b-form-input>
          </b-input-group>
          <b-input-group
            v-if="item.state !== null"
            class="mt-1"
            prepend="State"
          >
            <b-form-input
              :value="item.state"
              v-model="item.state"
            ></b-form-input>
          </b-input-group>
        </b-card>
      </b-card-group>
    </b-card>
    <!-- Tax details Cards -->
    <!-- Submit & delete buttons -->
    <div class="mt-2 mb-3 d-flex flex-row-reverse">
      <b-button type="submit" size="sm" class="ml-2" variant="success"
        ><b-icon icon="arrow-up-circle"></b-icon> Update Details</b-button
      >
    </div>
  </b-form>
</template>

<script>
/**
 * TODO
 * 1. Update records
 * 2. Delete records
 * 3. Add tax details
 */
import axios from "axios";
import { mapState } from "vuex";
export default {
  name: "BusinessProfile",
  props: {
    name: Object,
  },
  data() {
    return {
      details: [],
      godowns: [],
      uom: [],
      loading: true,
      options: {
        uom: [],
        states: [],
        gstRates: [0, 5, 12, 18, 28],
        cess: 0,
        cvat: 0,
        tax: [],
      },
    };
  },
  computed: {
    ...mapState(["gkCoreUrl", "authToken"]),
  },
  methods: {
    /**
     * Fetch Product /Service details & assign it to details variable
     */
    getDetails() {
      axios
        .get(
          `${this.gkCoreUrl}/products?qty=single&productcode=${this.name.productcode}`,
          {
            headers: {
              gktoken: this.authToken,
            },
          }
        )
        .then((res) => {
          this.details = res.data.gkresult;
          this.getTaxDetails();
          this.getGodowns();
          setTimeout(() => {
            this.loading = false;
          }, 500);
        });
    },
    /*
     * Update product/service details
     */
    updateProfile() {
      this.$bvModal
        .msgBoxConfirm(`Update ${this.details.productdesc} details ?`, {
          centered: true,
          size: "sm",
        })
        .then((val) => {
          if (val) {
            const config = {
              headers: {
                gktoken: this.authToken,
              },
            };
            const payload = {
              productdetails: this.details,
              godownflag: false,
            };
            if (this.godowns.length > 0) {
              payload["godetails"] = this.godowns;
              payload.godownflag = true;
            }
            axios
              .put(`/products`, payload, config)
              .then((res) => {
                switch (res.data.gkstatus) {
                  case 0:
                    this.$bvToast.toast(`${this.details.productdesc} updated`, {
                      title: "Success",
                      variant: "success",
                      solid: true,
                    });
                    break;
                  case 2:
                    this.$bvToast.toast(`Unauthorised access`, {
                      title: "Failure",
                      variant: "danger",
                      solid: true,
                    });
                    break;
                  default:
                    console.log("product update status ", res.data.gkstatus);
                }
              })
              .catch((e) => {
                console.log("update details ", e.message);
              });
          }
        });
    },
    /*
     * Fetch godown details for selected product
     */
    getGodowns() {
      axios
        .get(`/products?by=godown&productcode=${this.details.productcode}`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.godowns = res.data.gkresult;
          console.log("godown details fetched");
        })
        .catch((e) => {
          console.log("godown fetch error ", e);
        });
    },
    /** Fetch tax details for selected product */
    getTaxDetails() {
      axios
        .get(
          `${this.gkCoreUrl}/tax?pscflag=p&productcode=${this.name.productcode}`,
          {
            headers: {
              gktoken: this.authToken,
            },
          }
        )
        .then((res) => {
          this.options.tax = res.data.gkresult;
        });
    },
    /**
     * Get Unit Of Measurement Details (uom) & assign it to uom var
     */
    getUOM() {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      axios
        .get(`${this.gkCoreUrl}/unitofmeasurement?qty=all`, config)
        .then((response) => {
          switch (response.data.gkstatus) {
            case 0:
              this.options.uom = response.data.gkresult.map((uom) => {
                return {
                  text: `${uom.unitname} (${uom.description})`,
                  value: { id: uom.uomid, name: uom.unitname },
                };
              });
              this.uom = this.options.uom.filter(
                (uom) => uom.value.name === "UNT"
              )[0].value;
              // console.log(response.data.gkresult)
              break;
            default:
              this.$bvToast.toast(`Please try after sometime`, {
                title: `Error: Fetching Unit of Measurement`,
                autoHideDelay: 3000,
                variant: "warning",
                appendToast: true,
                solid: true,
              });
          }
        })
        .catch(() => {});
    },
    /**
     * Get state list
     * */
    states() {
      axios
        .get(`${this.gkCoreUrl}/state`)
        .then((res) => {
          this.options.states = res.data.gkresult.map(
            (item) => Object.values(item)[0]
          );
        })
        .catch((e) => {
          this.$bvToast.toast(e, {
            variant: "danger",
          });
        });
    },
  },
  mounted() {
    this.getDetails();
    this.getUOM();
    this.states();
  },
};
</script>