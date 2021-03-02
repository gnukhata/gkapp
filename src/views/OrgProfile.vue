<template>
  <section class="container-fluid mt-2">
    <b-form @submit.prevent="confirm('update')">
      <!-- {{ details }} -->
      <b-overlay :show="loading" blur no-wrap></b-overlay>
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

          <b-form-group label="ServiceTax Number" label-cols="4">
            <b-form-input v-model="details.orgstax" type="text"></b-form-input>
          </b-form-group>
          <b-button-group size="sm">
            <b-button v-b-modal.gstin variant="dark" class="float-left">
              <b-icon icon="plus"></b-icon>Add GSTIN
            </b-button>
            <b-button v-b-modal.cess variant="dark" class="ml-1">
              <b-icon icon="plus"></b-icon>Add CESS
            </b-button>
          </b-button-group>
          <!-- {{ details }} -->
        </b-card>
      </b-card-group>
      <!-- Submit & cancel buttons -->
      <div class="mt-2 mb-3 d-flex flex-row-reverse">
        <b-button type="submit" size="sm" class="ml-2" variant="success">
          <b-icon icon="arrow-up-circle"></b-icon> Save Changes
        </b-button>
        <b-button variant="danger" @click="confirm('delete')">
          <b-icon icon="x-circle"></b-icon> Delete Company
        </b-button>
      </div>
    </b-form>
    <!--
      Tax Creation Window
    -->
    <!-- Add GSTIN -->
    <b-modal
      id="gstin"
      centered
      ok-title="Add"
      header-bg-variant="dark"
      header-text-variant="light"
      ok-variant="success"
      title="Add GSTIN"
    >
      <b-form>
        <b-form-group label="State" label-cols="auto">
          <b-form-select
            required
            v-model="stateCode"
            :options="states"
          ></b-form-select>
        </b-form-group>
        <b-form-group label="GSTIN" label-cols="auto">
          <div class="d-flex">
            <b-form-input
              :placeholder="stateCode"
              type="text"
              disabled
              style="max-width: 3em"
            ></b-form-input>
            <b-form-input
              :placeholder="details.orgpan"
              type="text"
              class="ml-1 mr-1"
              disabled
            ></b-form-input>
            <b-form-input v-model="gstin" type="text"></b-form-input>
          </div>
        </b-form-group>
      </b-form>
    </b-modal>
    <!-- Add CESS -->
    <b-modal
      id="cess"
      centered
      header-bg-variant="dark"
      header-text-variant="light"
      ok-title="Add"
      ok-variant="success"
      title="Add CESS"
    >
      <b-form>
        <b-form-group label="CESS" label-cols="auto">
          <b-input-group append="%">
            <b-form-input
              v-model="cess"
              style="max-width: 5em"
              type="text"
            ></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-form>
    </b-modal>
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
      states: [],
      gstin: "",
      stateCode: "",
      cess: "",
    };
  },
  computed: {
    ...mapState(["gkCoreUrl", "authToken"]),
  },
  methods: {
    /**
     * Confirmation for actions
     */
    confirm(type) {
      this.$bvModal
        .msgBoxConfirm(
          `Confirm ${type} company ? ${
            type == "delete"
              ? "This action is Irreversable. We recommend to backup company data before deleting"
              : ""
          }`,
          {
            centered: true,
            size: "md",
            okVariant: "danger",
            headerBgVariant: "danger",
            headerTextVariant: "light",
          }
        )
        .then((val) => {
          if (val === true) {
            if (type === "update") {
              this.updateOrg();
            } else {
              this.deleteOrg();
            }
          }
        });
    },
    /**
     * Fetch org details from api
     */
    getDetails() {
      this.loading = true;
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
              this.loading = false;
              break;
            default:
              this.loading = false;
          }
        })
        .catch((e) => {
          alert(e);
          this.loading = false;
        });
    },
    /**
     * Update organisation details
     */
    updateOrg() {
      this.loading = true;
      delete this.details.statelist;
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
              this.loading = false;
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
              this.loading = false;
              this.$bvToast.toast("Unauthorised Access", {
                variant: "danger",
                solid: true,
              });
              break;
            case 4:
              this.loading = false;
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
          this.loading = false;
        });
    },
    /**
     * Delete organisation
     */
    deleteOrg() {
      this.loading = true;

      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      axios
        .delete(`${this.gkCoreUrl}/organisations`, config)
        .then((r) => {
          console.trace(r);
          if (r.status == "200" && r.data.gkstatus == 0) {
            this.$bvToast.toast(`${this.details.orgname} Deleted`, {
              title: "Success",
              variant: "success",
              solid: true,
            });
            // reset orgname
            this.$store.commit("resetOrg");
            // change auth status
            this.$store.commit("setAuthStatus");
            // redirect to login page
            this.$router.push("/");
            // clear localStorage
            localStorage.clear();
            // set gkCore url
            this.$store.commit("setGkCoreUrl", { gkCoreUrl: this.gkCoreUrl });
            this.loading = false;
          } else {
            this.$bvToast.toast(r.status, {
              title: "Error",
              variant: "danger",
              solid: true,
            });
            this.loading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: "Error",
            variant: "danger",
            solid: true,
          });
          this.loading = false;
        });
    },
    getStates() {
      axios
        .get(`${this.gkCoreUrl}/state`)
        .then((res) => {
          this.states = res.data.gkresult.map((val) => {
            let obj = {};
            obj.value = Object.keys(val)[0];
            obj.text = Object.values(val)[0];
            return obj;
          });
        })
        .catch((e) => {
          console.log("failed to get states", e.message);
        });
    },
  },
  mounted() {
    this.getDetails();
    this.getStates();
  },
};
</script>
