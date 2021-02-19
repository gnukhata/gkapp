<template>
  <section class="container-fluid mt-2">
    <b-overlay :show="loading" blur no-wrap></b-overlay>
    <h3 class="text-center mb-4 mt-2 text-muted">
      {{ details.orgname }} Profile
    </h3>
    <b-form @submit.prevent="updateDetails">
      {{ details }}
      <b-card-group deck>
        <!-- general Card -->
        <b-card
          header="General"
          header-bg-variant="primary"
          header-text-variant="light"
        >
          <b-form-group label="Name" label-cols="4">
            <b-form-input
              v-model="details.orgname"
              type="text"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Website" label-cols="4">
            <b-form-input
              v-model="details.orgwebsite"
              type="text"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Email" label-cols="4">
            <b-form-input
              v-model="details.orgemail"
              type="email"
            ></b-form-input>
          </b-form-group>
        </b-card>
        <!-- Contact Card -->
        <b-card
          header="Contact Details"
          header-bg-variant="secondary"
          header-text-variant="light"
        >
          <b-form-group label="Address" label-cols="4">
            <b-form-input
              v-model="details.orgaddr"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group label="City" label-cols="4">
            <b-form-input
              v-model="details.orgcity"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group label="State" label-cols="4">
            <b-form-input
              v-model="details.orgstate"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Country" label-cols="4">
            <b-form-input
              v-model="details.orgcountry"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Pincode" label-cols="4" label-align="left">
            <b-form-input
              v-model="details.orgpincode"
              type="text"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Phone" label-cols="4" label-align="left">
            <b-input-group>
              <b-form-input
                v-model="details.orgtelno"
                type="text"
              ></b-form-input>
            </b-input-group>
          </b-form-group>
          <b-form-group label="Fax" label-cols="4">
            <b-form-input v-model="details.orgfax" type="text"></b-form-input>
          </b-form-group>
        </b-card>
      </b-card-group>
      <!-- Bank card --->
      <b-card-group deck class="mt-4">
        <b-card
          v-if="details.bankdetails"
          header="Bank Details"
          header-bg-variant="warning"
          header-text-variant="dark"
        >
          <b-form-group label="Name" label-cols="4" label-align="left">
            <b-input-group>
              <b-form-input
                v-model="details.bankdetails.bankname"
                type="text"
              ></b-form-input>
            </b-input-group>
          </b-form-group>
          <b-form-group
            label="Account Number"
            label-cols="4"
            label-align="left"
          >
            <b-form-input
              v-model="details.bankdetails.accountno"
              type="text"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Branch" label-cols="4">
            <b-form-input
              v-model="details.bankdetails.branchname"
              type="text"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="IFSC Code" label-cols="4">
            <b-form-input
              v-model="details.bankdetails.ifsc"
              type="text"
            ></b-form-input>
          </b-form-group>
        </b-card>
        <!-- Tax card-->
        <b-card
          header="Tax Details"
          header-bg-variant="danger"
          header-text-variant="light"
        >
          <b-form-group label="PAN" label-cols="4" label-align="left">
            <b-input-group>
              <b-form-input v-model="details.orgpan" type="text"></b-form-input>
            </b-input-group>
          </b-form-group>
          <b-form-group
            v-if="details.gstin !== null"
            label="GSTIN"
            label-cols="4"
          >
            <b-form-input
              v-for="(gst, index) in details.gstin"
              :key="gst"
              v-model="details.gstin[index]"
              type="text"
            ></b-form-input>
          </b-form-group>
          <b-form-group v-else label="GSTIN" label-cols="4">
            <b-form-input type="text"></b-form-input>
          </b-form-group>

          <b-form-group label="Service Tax Number" label-cols="4">
            <b-form-input v-model="details.orgstax" type="text"></b-form-input>
          </b-form-group>
        </b-card>
      </b-card-group>
      <!-- Submit & cancel buttons -->
      <div class="mt-2 mb-3 d-flex flex-row-reverse">
        <b-button type="submit" size="sm" class="ml-2" variant="success"
          ><b-icon icon="arrow-up-circle"></b-icon> Save Changes</b-button
        >
      </div>
    </b-form>
  </section>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "OrgProfile",
  data() {
    return {
      loading: true,
      details: "",
    };
  },
  computed: {
    ...mapState(["gkCoreUrl", "authToken"]),
  },
  methods: {
    getDetails() {
      axios
        .get(`${this.gkCoreUrl}/organisation`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          switch (res.data.gkstatus) {
            case 0:
              this.details = res.data.gkdata;
              this.loading = false;
              break;
            case 2:
              alert("Access Denied");
              break;
            default:
          }
        })
        .catch((e) => {
          alert(e);
        });
    },
    updateDetails() {
      this.$bvModal
        .msgBoxConfirm(`Update ${this.details.orgname} details ?`, {
          centered: true,
          size: "sm",
        })
        .then((val) => {
          if (val) {
            delete this.details.statelist;
            this.isLoading = true;
            const config = {
              headers: {
                gktoken: this.authToken,
              },
            };
            axios
              .put(`${this.gkCoreUrl}/organisations`, this.details, config)
              .then((res) => {
                switch (res.data.gkstatus) {
                  case 0:
                    this.isLoading = false;
                    this.$bvToast.toast(
                      `${this.details.orgname} Profile Details Updated`,
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
                    this.$bvToast.toast(
                      "You have no permissions to delete details",
                      {
                        variant: "danger",
                        solid: true,
                      }
                    );
                    break;
                }
              })
              .catch((e) => {
                this.$bvToast.toast(e.message, {
                  variant: "danger",
                  solid: true,
                });
              });
          }
        });
    },
  },
  mounted() {
    this.getDetails();
  },
};
</script>

<style>
</style>