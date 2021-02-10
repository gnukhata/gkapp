<template>
  <b-form id="prod" @submit.prevent="updateProfile">
    <b-overlay :show="loading" blur no-wrap></b-overlay>
    <!-- {{ details }} -->
    <!-- {{ godowns }} -->
    <!-- name --->
    <b-card class="mb-2" header-bg-variant="warning" no-body>
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-info>
          <div class="mr-auto">Info</div>
          <div>
            <b-icon
              :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse v-model="isCollapsed" class="p-3" id="collapse-info">
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
        <b-form-group
          v-if="details.gsflag == 7"
          label="HSN Code"
          label-cols="4"
        >
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
      </b-collapse>
    </b-card>
    <b-card no-body header-bg-variant="warning">
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-price>
          <div class="mr-auto">Price</div>
          <div>
            <b-icon
              :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse v-model="isCollapsed" class="p-3" id="collapse-price">
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
      </b-collapse>
    </b-card>
    <h3 class="text-muted text-center mt-3 mb-3">Taxes</h3>
    <!-- <b-card class="mt-2" header="Tax" header-bg-variant="warning"> -->
    <!-- {{ options.tax }} -->
    <b-card-group deck>
      <b-card
        v-for="item in options.tax"
        :key="item.taxid"
        header-bg-variant="warning"
        style="max-width: 30em"
      >
        <template #header>
          <b-icon
            class="float-right"
            icon="x-circle-fill"
            variant="danger"
          ></b-icon>
        </template>
        <b-input-group :prepend="item.taxname + ' %'">
          <b-form-input
            :value="item.taxrate"
            v-model="item.taxrate"
          ></b-form-input>
        </b-input-group>
        <b-input-group v-if="item.state !== null" class="mt-2" prepend="State">
          <b-form-select
            :options="options.states"
            :value="item.state"
            v-model="item.state"
          ></b-form-select>
        </b-input-group>
      </b-card>
    </b-card-group>
    <!-- </b-card> -->
    <!-- Tax details Cards -->
    <!-- Submit & delete buttons -->
    <div class="mt-4 pb-4 d-flex flex-row-reverse">
      <b-button type="submit" size="sm" class="ml-2" variant="success"
        ><b-icon icon="cloud-arrow-up"></b-icon> Save Changes</b-button
      >
      <b-button
        @click.prevent="delProfile"
        size="sm"
        class="ml-2"
        variant="danger"
        ><b-icon :icon="details.gsflag == 7 ? 'box' : 'headset'"></b-icon>
        Delete {{ details.gsflag == 7 ? "Product" : "Service" }}</b-button
      >
    </div>
  </b-form>
</template>

<script>
/**
 * TODO
 *
 * Delete product
 * add / delete tax
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
      isCollapsed: false,
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
          switch (res.data.gkstatus) {
            case 0:
              this.details = res.data.gkresult;
              this.getTaxDetails();
              this.getGodowns();
              setTimeout(() => {
                this.loading = false;
              }, 500);
              break;
            case 3:
              this.$bvToast.toast("Product does not exist", {
                title: "Error",
                variant: "danger",
                solid: true,
              });
              break;
          }
        });
    },
    /*
     * Update product/service details
     */
    updateProfile() {
      this.$bvModal
        .msgBoxConfirm(`Update ${this.details.productdesc} details ?`, {
          centered: true,
          size: "lg",
        })
        .then((val) => {
          this.loading = true;
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

            delete this.details.discountamount;
            delete this.details.discountpercent;
            delete this.details.deletable;
            delete this.details.unitname;

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
                    this.loading = false;
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
    /**
     * Delete selected product
     */
    delProfile() {
      this.$bvModal
        .msgBoxConfirm(`Delete ${this.details.productdesc} ?`, {
          centered: true,
          variant: "danger",
          size: "lg",
        })
        .then((val) => {
          if (val == true) {
            this.isLoading = true;
            const config = {
              headers: {
                gktoken: this.authToken,
              },
              data: {
                productcode: this.details.productcode,
              },
            };
            axios
              .delete("/products", config)
              .then((res) => {
                switch (res.data.gkstatus) {
                  case 0:
                    // Add delete log to server
                    const payload = {
                      activity: `${this.details.productdesc} ${
                        this.details.csflag == 7 ? "product" : "service"
                      } deleted`,
                    };
                    axios.post(`${this.gkCoreUrl}/log`, payload, config);
                    this.$bvToast.toast(`${this.details.productdesc} deleted`, {
                      title: "Success",
                      solid: true,
                      variant: "success",
                    });
                    this.isLoading = false;
                    document.querySelector("#prod").innerHTML = "";
                    break;
                  case 3:
                    this.$bvToast.toast(
                      `${this.details.productdesc} Cannot be deleted`,
                      {
                        title: "",
                        solid: true,
                        variant: "danger",
                      }
                    );
                    break;
                  case 4:
                    this.$bvToast.toast(
                      `Cannot delete ${this.details.productdesc}`,
                      {
                        title: "Bad Privilige",
                        solid: true,
                        variant: "danger",
                      }
                    );
                    break;
                  case 5:
                    this.$bvToast.toast(
                      `Cannot delete ${this.details.productdesc}`,
                      {
                        title: "Action Disallowed",
                        solid: true,
                        variant: "danger",
                      }
                    );
                    break;
                }
              })
              .catch((e) => {
                console.log("delete err ", e);
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
