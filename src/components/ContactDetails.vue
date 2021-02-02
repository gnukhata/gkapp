<template>
  <b-form @submit.prevent="updateContact">
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
          v-model="details.custname"
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
          v-model="details.custphone"
          id="nested-city"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="Email:"
        label-for="nested-state"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          v-model="details.custemail"
          :value="details.custemail"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="Fax:"
        label-for="nested-country"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          v-model="details.custfax"
          :value="details.custfax"
        ></b-form-input>
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
          v-model="details.custaddr"
          :value="details.custaddr"
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
          v-model="details.pincode"
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
          v-model="details.custpan"
          id="nested-street"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="TAN:"
        label-for="nested-city"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input
          v-model="details.custtan"
          :value="details.custtan"
          id="nested-city"
        ></b-form-input>
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
    </b-card>
    <!-- Action Buttons -->
    <div class="mt-2 mb-3 d-flex flex-row-reverse">
      <b-button type="submit" size="sm" class="ml-2" variant="success"
        ><b-icon icon="arrow-up-circle"></b-icon> Update Details</b-button
      >
      <b-button
        @click.prevent="deleteContact"
        size="sm"
        class="ml-2"
        variant="danger"
        ><b-icon icon="person-dash"></b-icon> Delete Contact</b-button
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
          console.log(res.data.gkstatus);
          switch (res.data.gkstatus) {
            case 0:
              this.details = res.data.gkresult;
              this.isLoading = false;
              this.states();
              break;
            case 2:
              this.$bvToast.toast("Unauthorised Access", {
                variant: "danger",
                title: "Alert",
                solid: true,
              });
              this.isLoading = false;
              break;
            case 3:
              this.$bvToast.toast("Contact not found", {
                variant: "danger",
                title: "Alert",
                solid: true,
              });
              this.isLoading = false;
              break;
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    },
    /**
     * Update customer/supplier details
     */
    updateContact() {
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
              this.$bvToast.toast("Unauthorised Access", {
                variant: "danger",
                solid: true,
              });
              break;
            case 4:
              this.isLoading = false;
              this.$bvToast.toast("You have no permissions to delete details", {
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
    /**Delete contact details based on custid */
    deleteContact() {
      this.isLoading = true;
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      const payload = {
        custid: parseInt(this.details.custid),
      };
      axios
        .delete(`${this.gkCoreUrl}/customersupplier`, payload, config)
        .then((res) => {
          console.log(res.data.gkstatus);
          switch (res.data.gkstatus) {
            case 0:
              this.isLoading = false;
              this.$bvToast.toast(`${this.details.custname} Profile Deleted`, {
                title: "Success",
                variant: "success",
                solid: true,
              });
              break;
            case 2:
              this.isLoading = false;
              this.$bvToast.toast("Unauthorised Access", {
                title: "Access Denied",
                variant: "danger",
                solid: true,
              });
              break;
            case 4:
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