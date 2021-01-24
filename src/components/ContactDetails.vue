<template>
  <div class="main">
    <b-overlay no-wrap blur :show="isLoading"></b-overlay>
    <!-- Contact Details-->
    <b-card bg-variant="light" border-variant="secondary">
      <b-form-group
        label-cols-lg="2"
        label="Contact Details"
        label-size="md"
        label-class="font-weight-bold pt-0"
        class="mb-0"
      >
        <b-form-group
          label="Name:"
          label-for="nested-street"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            :value="details.custname"
            id="nested-street"
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="Phone:"
          label-for="nested-city"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            :value="details.custphone"
            id="nested-city"
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="Email:"
          label-for="nested-state"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            :value="details.custemail"
            id="nested-state"
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="Fax:"
          label-for="nested-country"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            :value="details.custfax"
            id="nested-country"
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>
      </b-form-group>
    </b-card>
    <!-- Contact Address -->
    <b-card bg-variant="light" border-variant="secondary" class="mt-2">
      <b-form-group
        label-cols-lg="2"
        label="Address"
        label-size="md"
        label-class="font-weight-bold pt-0"
        class="mb-0"
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
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>

        <!-- <b-form-group
          label="City:"
          label-for="nested-city"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input id="nested-city"></b-form-input>
        </b-form-group> -->

        <b-form-group
          label="State:"
          label-for="nested-state"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            :value="details.state"
            :disabled="editMode"
            id="nested-state"
          ></b-form-input>
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
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>
      </b-form-group>
    </b-card>
    <!-- Contact Bank details -->
    <!-- {{ details }} -->
    <b-card bg-variant="light" border-variant="secondary" class="mt-2">
      <b-form-group
        label-cols-lg="2"
        label="Financial Details"
        label-size="md"
        label-class="font-weight-bold pt-0"
        class="mb-0"
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
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="TAN:"
          label-for="nested-city"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            :value="details.custtan"
            id="nested-city"
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="State:"
          label-for="nested-state"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            :value="details.state"
            :disabled="editMode"
          ></b-form-input>
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
            :disabled="editMode"
          ></b-form-input>
        </b-form-group>
      </b-form-group>
    </b-card>
    <!-- Action Buttons -->
    <b-button-group size="sm" class="mt-2 mb-2">
      <b-button class="mr-1" @click="editMode = false" variant="warning"
        ><b-icon icon="pencil-square"></b-icon> Edit</b-button
      >
      <b-button
        v-if="!editMode"
        class="mr-1"
        @click="editMode = true"
        variant="danger"
        ><b-icon icon="x-circle"></b-icon> Cancel</b-button
      >
      <b-button v-if="!editMode" @click="updateDetails" variant="success"
        ><b-icon icon="arrow-up-circle"></b-icon> Update Details</b-button
      >
    </b-button-group>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "ContactDetails",
  props: { customer: Object },
  data() {
    return {
      details: null,
      isLoading: true,
      editMode: true,
    };
  },
  computed: {
    ...mapState(["gkCoreUrl", "authToken"]),
  },
  methods: {
    getDetails() {
      let config = {
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
        })
        .catch((err) => {
          console.log(err.message);
        });
    },
    /**
     * Update user details
     */
    updateDetails() {
      this.$bvToast.toast("Profile Details Updated", {
        title: "Success",
        variant: "success",
        solid: true,
      });
      this.editMode = true;
    },
  },
  mounted() {
    this.getDetails();
  },
};
</script>