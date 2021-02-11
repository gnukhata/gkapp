<template>
  <b-form id="contactinfo" @submit.prevent="updateContact">
    <b-overlay no-wrap blur :show="isLoading"></b-overlay>
    <b-card
      class="mt-2"
      header-text-variant="light"
      header-bg-variant="primary"
      no-body
    >
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
      <b-collapse class="m-3" v-model="isCollapsed" id="collapse-info">
        <b-form-group
          label="Name"
          label-for="Name"
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
          label-for="Phone Number"
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
      </b-collapse>
    </b-card>
    <!-- Contact Address -->
    <b-card
      header-text-variant="light"
      header-bg-variant="primary"
      class="mt-3"
      no-body
    >
      <template #header>
        <div v-b-toggle.address class="d-flex">
          <div class="mr-auto">Address</div>
          <div>
            <b-icon
              :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse class="m-3" v-model="isCollapsed" id="address">
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
          label-for="state"
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
            type="number"
            no-wheel
            :value="details.pincode"
            v-model="details.pincode"
            id="nested-country"
          ></b-form-input>
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- Contact Bank details -->
    <b-card
      header-bg-variant="primary"
      header-text-variant="light"
      class="mt-3"
      no-body
    >
      <template #header>
        <div v-b-toggle.financial class="d-flex">
          <div class="mr-auto">Financial Details</div>
          <div>
            <b-icon
              :icon="isCollapsed ? 'arrows-collapse' : 'arrows-expand'"
            ></b-icon>
          </div>
        </div>
      </template>

      <b-collapse class="m-3" v-model="isCollapsed" id="financial">
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
      </b-collapse>
    </b-card>
    <!-- Action Buttons -->
    <div class="pt-2 pb-3 d-flex flex-row-reverse">
      <b-button
        @click.prevent="deleteContact"
        size="sm"
        class="ml-2"
        variant="danger"
        ><b-icon icon="person-dash"></b-icon> Delete Contact</b-button
      >
      <b-button type="submit" size="sm" class="ml-2" variant="success"
        ><b-icon icon="cloud-arrow-up"></b-icon> Save Changes</b-button
      >
      <b-button to="/invoice" size="sm" class="ml-2" variant="dark"
        ><b-icon icon="receipt"></b-icon> Add Transaction</b-button
      >
    </div>
  </b-form>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "ContactProfile",
  props: { customer: Object },
  data() {
    return {
      details: Array,
      isLoading: true,
      isCollapsed: false,
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
      this.$bvModal
        .msgBoxConfirm(`Update ${this.details.custname} details ?`, {
          centered: true,
          size: "lg",
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
    /**Delete contact details based on custid */
    deleteContact() {
      this.$bvModal
        .msgBoxConfirm(`Delete ${this.details.custname} ?`, {
          centered: true,
          size: "lg",
        })
        .then((val) => {
          if (val) {
            const config = {
              headers: {
                gktoken: this.authToken,
              },
              data: {
                custid: this.details.custid,
              },
            };
            this.isLoading = true;
            axios
              .delete(`${this.gkCoreUrl}/customersupplier`, config)
              .then((res) => {
                this.isLoading = true;
                switch (res.data.gkstatus) {
                  case 0:
                    // Delete Contact's Account
                    this.delAccount(this.details.custname);
                    this.isLoading = false;
                    document.querySelector("#contactinfo").innerHTML = "";
                    this.$bvToast.toast(
                      `${this.details.custname} Profile Deleted`,
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
                      title: "Action Denied",
                      variant: "danger",
                      solid: true,
                    });
                    break;
                  case 4:
                    this.isLoading = false;
                    this.$bvToast.toast(
                      "You have no permissions to modify details",
                      {
                        title: "Access Denied",
                        variant: "danger",
                        solid: true,
                      }
                    );
                    break;
                  case 5:
                    this.isLoading = false;
                    this.$bvToast.toast("Causes Integrity Issues", {
                      title: "Cannot Delete Contact",
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
          }
        });
    },
    /** Delete account corresponding to Contact name */
    delAccount(name) {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      let accList;
      // Grab the list of accounts
      axios
        .get(`${this.gkCoreUrl}/accounts`, config)
        .then((res) => {
          accList = res.data.gkresult;
          for (var i in accList) {
            /**
             * Match with the supplied account name in the list
             * and delete it
             */
            if (accList[i].accountname == name) {
              axios
                .delete(`${this.gkCoreUrl}/accounts`, {
                  headers: {
                    gktoken: this.authToken,
                  },
                  data: {
                    accountcode: accList[i].accountcode, // Get account code
                  },
                })
                .then((res) => {
                  console.log("account delete status", res.data.gkstatus);
                  // Add a log about the delete status
                  this.addLog();
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    /**Add a record of contact delete action */
    addLog() {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      const payload = {
        activity: `${this.details.custname} ${
          this.details.csflag == 3 ? "customer" : "supplier"
        } deleted`,
      };
      axios
        .post(`${this.gkCoreUrl}/log`, payload, config)
        .then((res) => {
          console.log("log status ", res.data.gkstatus, payload);
        })
        .catch((e) => {
          console.log("log ", e);
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

    // This is used by the invoice form, to autofill party details
    this.$store.commit('setInvoiceParty', {
      id: this.customer.custid,
      name: this.customer.custname,
      type: (this.customer.csflag)? 'customer' : 'supplier', // 3 -> customer, 19-> supplier
    })
  },
};
</script>