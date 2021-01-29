<template>
  <!-- <div> -->
  <!-- <div class="d-flex flex-row-reverse mb-2">
      <b-button variant="warning"
        ><b-icon icon="pencil-square"></b-icon> Edit Details</b-button
      >
    </div> -->
  <!-- <b-card-group deck> -->
  <b-form>
    {{ details }} <br />
    <br />
    {{ options.tax }}
    <b-overlay :show="loading" blur no-wrap></b-overlay>
    <!-- name --->
    <b-card-group deck>
      <b-card header="Info" header-bg-variant="warning" border-variant="dark">
        <b-form-group label="Name" label-cols="auto">
          <b-form-input
            v-model="details.productdesc"
            type="text"
            required
          ></b-form-input>
        </b-form-group>
        <!-- Opening Stock -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="Opening Stock"
          label-cols="auto"
        >
          <b-form-input v-model="details.openingstock"></b-form-input>
        </b-form-group>
        <!-- HSN Code -->
        <!-- <b-form-group label-cols="auto" label="HSN Code">
          <b-form-input v-model="details.gscode"></b-form-input>
        </b-form-group> -->
        <!-- UOM -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="Unit of Measure"
          label-cols="auto"
        >
          <b-input-group :prepend="details.unitname.name || details.unitname">
            <b-form-select v-model="details.unitname" :options="options.uom">
            </b-form-select>
          </b-input-group>
        </b-form-group>
      </b-card>
      <b-card header="Price" header-bg-variant="warning" border-variant="dark">
        <!-- MRP -->
        <b-form-group label="MRP" label-cols="auto">
          <b-form-input
            title="cannot be modified"
            v-model="details.prodmrp"
          ></b-form-input>
        </b-form-group>
        <!-- Selling Price -->
        <b-form-group
          id="input-group-2"
          label="Selling Price"
          label-cols="auto"
        >
          <b-form-input v-model="details.prodsp"></b-form-input>
        </b-form-group>
        <!-- discount -->
        <b-form-group label-cols="auto" label="Discount" label-for="input-3">
          <b-input-group prepend="₹">
            <b-form-input v-model="details.discountamount"></b-form-input>
          </b-input-group>
          <b-input-group class="mt-1" prepend="%">
            <b-form-input v-model="details.discountpercent"></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-card>
    </b-card-group>
    <!-- Tax details Card -->
    <b-card
      class="mt-2"
      header="Tax"
      header-bg-variant="warning"
      border-variant="dark"
      style="max-width: 28em"
    >
      <!-- HSN / SCN Code -->
      <b-form-group
        v-if="details.gsflag == 7"
        label="HSN Code"
        label-cols="auto"
      >
        <b-form-input
          title="cannot be modified"
          v-model="details.gscode"
        ></b-form-input>
      </b-form-group>
      <b-form-group v-else label="SAC Code" label-cols="auto">
        <b-form-input
          title="cannot be modified"
          v-model="details.gscode"
        ></b-form-input>
      </b-form-group>
      <!-- Selling Price -->
      <b-form-group id="input-group-2" label="State" label-cols="auto">
        <b-form-select :options="options.states"></b-form-select>
      </b-form-group>
      <!-- discount -->
      <b-form-group label-cols="auto" label="GST" label-for="input-3">
        <b-input-group prepend="%">
          <b-form-select :options="options.gstRates"></b-form-select>
        </b-input-group>
      </b-form-group>
      <b-form-group label="CESS" label-cols="auto">
        <b-input-group label="CESS" class="mt-1" prepend="%">
          <b-form-input v-model="options.cess"></b-form-input>
        </b-input-group>
      </b-form-group>
      <b-form-group label="CVAT" label-cols="auto">
        <b-input-group label="CESS" class="mt-1" prepend="%">
          <b-form-input v-model="options.cvat"></b-form-input>
        </b-input-group>
      </b-form-group>
    </b-card>
    <!-- Submit & cancel buttons -->
    <div class="mt-2 mb-3 d-flex flex-row-reverse">
      <b-button size="sm" class="ml-2" variant="success"
        ><b-icon icon="arrow-up-circle"></b-icon> Update Details</b-button
      >
      <!-- <b-button size="sm" class="" variant="danger"
          ><b-icon icon="x-circle"></b-icon> Cancel</b-button
        > -->
    </div>
  </b-form>
  <!-- </b-card-group> -->
  <!-- </div> -->
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
          setTimeout(() => {
            this.loading = false;
          }, 500);
        });
    },
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