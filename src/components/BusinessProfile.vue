<template>
  <div>
    {{ details }}
    <b-overlay :show="loading" no-wrap></b-overlay>
    <div class="d-flex flex-row-reverse mb-2">
      <b-button variant="warning"
        ><b-icon icon="pencil-square"></b-icon> Edit Details</b-button
      >
    </div>
    <!-- <b-card-group deck> -->
    <b-form>
      <!-- name --->
      <b-card header="Details" bg-variant="light" border-variant="dark">
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
          id="input-group-2"
          label="Opening Stock"
          label-cols="auto"
        >
          <b-form-input v-model="details.openingstock"></b-form-input>
        </b-form-group>
        <!-- HSN Code -->
        <b-form-group label-cols="auto" label="HSN Code">
          <b-form-input v-model="details.gscode"></b-form-input>
        </b-form-group>
        <!-- UOM -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="Unit of Measure"
          label-cols="auto"
          label-class="required"
        >
          <b-input-group :prepend="details.unitname.name || details.unitname">
            <b-form-select
              v-model="details.unitname"
              :options="options.uom"
              required
            >
            </b-form-select>
          </b-input-group>
        </b-form-group>
      </b-card>
      <b-card header="Price" border-variant="dark" class="mt-2">
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
          <b-form-input
            title="cannot be modified"
            v-model="details.prodsp"
          ></b-form-input>
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
      <!-- 
      <b-form-group id="input-group-4" v-slot="{ ariaDescribedby }">
        <b-form-checkbox-group
          v-model="form.checked"
          id="checkboxes-4"
          :aria-describedby="ariaDescribedby"
        >
          <b-form-checkbox value="me">Check me out</b-form-checkbox>
          <b-form-checkbox value="that">Check that out</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group> -->
      <div class="mt-2 mb-3 d-flex flex-row-reverse">
        <b-button
          size="sm"
          class="ml-2"
          v-if="!noEdit"
          @click="updateDetails"
          variant="success"
          ><b-icon icon="arrow-up-circle"></b-icon> Update Details</b-button
        >
        <b-button
          size="sm"
          v-if="!noEdit"
          class=""
          @click="noEdit = true"
          variant="danger"
          ><b-icon icon="x-circle"></b-icon> Cancel</b-button
        >
      </div>
    </b-form>
    <!-- </b-card-group> -->
  </div>
</template>

<script>
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
          console.log(res.data.gkresult);
          this.details = res.data.gkresult;
          setTimeout(() => {
            this.loading = false;
          }, 1000);
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
  },
  mounted() {
    this.getDetails();
    this.getUOM();
  },
};
</script>