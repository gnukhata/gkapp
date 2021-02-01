<template>
  <b-form @submit.prevent="updateDetails">
    <b-overlay no-wrap blur :show="isLoading"></b-overlay>
    <b-card
      header="Details"
      header-text-variant="light"
      header-bg-variant="primary"
      border-variant="secondary"
    >
      <b-form-group
        label="Name"
        label-for="nested-street"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          :value="details.custname"
          id="nested-street"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="Phone"
        label-for="nested-city"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          :value="details.custphone"
          id="nested-city"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="Email:"
        label-for="nested-state"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input :value="details.custemail"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Fax:"
        label-for="nested-country"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input :value="details.custfax"></b-form-input>
      </b-form-group>
    </b-card>
    <!-- Contact Address -->
    <b-card
      header="Address"
      header-text-variant="light"
      header-bg-variant="primary"
      border-variant="secondary"
      class="mt-2"
    >
      <b-form-group
        label="Street:"
        label-for="nested-street"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          :value="details.custaddr"
          id="nested-street"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="State:"
        label-for="nested-state"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-select
          :options="options.states"
          :value="details.state"
          v-model="details.state"
        ></b-form-select>
      </b-form-group>

      <b-form-group
        label="Pincode"
        label-for="nested-country"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          :value="details.pincode"
          id="nested-country"
        ></b-form-input>
      </b-form-group>
    </b-card>
    <!-- Contact Bank details -->
    <b-card
      header="Financial Details"
      header-bg-variant="primary"
      header-text-variant="light"
      border-variant="secondary"
      class="mt-2"
    >
      <b-form-group
        label="PAN:"
        label-for="nested-street"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          :value="details.custpan"
          id="nested-street"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="TAN:"
        label-for="nested-city"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input :value="details.custtan" id="nested-city"></b-form-input>
      </b-form-group>

      <b-form-group
        label="GSTIN"
        label-for="nested-state"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          v-for="i in details.gstin"
          :key="i"
          :value="i"
          class="m-1"
          disabled
        ></b-form-input>
      </b-form-group>

      <!-- <b-form-group
        label="State:"
        label-for="nested-state"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-select
          :options="options.states"
          :value="details.state"
          v-model="options.selectedState"
        ></b-form-select>
      </b-form-group> -->
    </b-card>
    <!-- Action Buttons -->
    <div class="mt-2 mb-3 d-flex flex-row-reverse">
      <b-button type="submit" size="sm" class="ml-2" variant="success"
        ><b-icon icon="arrow-up-circle"></b-icon> Update Details</b-button
      >
    </div>
  </b-form>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "ContactDetails",
  props: { customer: Object },
  data() {
    return {
      details: Array,
      isLoading: true,
      options: {
        states: [],
        selectedState: {},
      },
    };
  },
  computed: {
    ...mapState(["gkCoreUrl", "authToken"]),
  },
  methods: {
    getDetails() {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      axios
        .get(
          `${this.gkCoreUrl}/customersupplier?qty=single&custid=${this.customer.custid}`,
          config
        )
        .then((res) => {
          this.details = res.data.gkresult;
          this.isLoading = false;
          this.states();
        })
        .catch((err) => {
          console.log(err.message);
        });
    },
    /**
     * Update customer/supplier details
     */
    updateDetails() {
      delete this.details.statelist;
      this.isLoading = true;
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      axios
        .put(`${this.gkCoreUrl}/customersupplier`, this.details, config)
        .then((res) => {
          switch (res.data.gkstatus) {
            case 0:
              this.isLoading = false;
              this.$bvToast.toast(
                `${this.details.custname} Profile Details Updated`,
                {
                  title: "Success",
                  variant: "success",
                  solid: true,
                }
              );
              break;
            case 2:
              this.isLoading = false;

              this.$bvToast.toast("You have no permissions to modify details", {
                variant: "danger",
                solid: true,
              });
              break;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: "danger",
            solid: true,
          });
        });
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
  },
};
</script>