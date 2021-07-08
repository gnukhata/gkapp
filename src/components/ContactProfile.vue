<template>
  <b-form id="contactinfo" @submit.prevent="updateContact">
    <b-overlay no-wrap blur :show="isLoading"></b-overlay>
    <b-card
      class="mt-2"
      header-text-variant="light"
      header-bg-variant="dark"
      no-body
    >
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-info>
          <div class="mr-auto">Info</div>
          <div>
            <b-icon
              :icon="isCollapsed1 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse class="m-3" v-model="isCollapsed1" id="collapse-info">
        <b-form-group
          label="Name"
          label-for="Name"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            id="nested-name"
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
            v-model="details.custphone"
            id="nested-city"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="Email"
          label-for="nested-state"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input v-model="details.custemail"></b-form-input>
        </b-form-group>

        <b-form-group
          label="Fax"
          label-for="nested-country"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input v-model="details.custfax"></b-form-input>
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- Contact Address -->
    <b-card
      header-text-variant="light"
      header-bg-variant="dark"
      class="mt-3"
      no-body
    >
      <template #header>
        <div v-b-toggle.address class="d-flex">
          <div class="mr-auto">Address</div>
          <div>
            <b-icon
              :icon="isCollapsed2 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse class="m-3" v-model="isCollapsed2" id="address">
        <b-form-group
          label="Street"
          label-for="nested-street"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            id="nested-street"
            v-model="details.custaddr"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="State"
          label-for="state"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-select
            :options="options.states"
            v-model="details.state"
            @change="gstin.stateCode = options.stateMap[details.state]"
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
            v-model="details.pincode"
            id="nested-country"
          ></b-form-input>
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- Contact Bank details -->
    <b-card
      header-bg-variant="dark"
      header-text-variant="light"
      class="mt-3"
      no-body
    >
      <template #header>
        <div v-b-toggle.financial class="d-flex">
          <div class="mr-auto">Financial Details</div>
          <div>
            <b-icon
              variant="light"
              :icon="isCollapsed3 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>

      <b-collapse class="m-3" v-model="isCollapsed3" id="financial">
        <b-form-group
          label="PAN"
          label-for="nested-pan"
          label-cols-sm="3"
          label-align-sm="right"
          :state="isPanValid"
          invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
        >
          <b-form-input
            :value="details.custpan"
            v-model="details.custpan"
            id="nested-pan"
            :state="isPanValid"
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            @change="gstin.pan = details.custpan"
            :required="!!details.custpan"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="TAN"
          label-for="nested-tan"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <b-form-input
            v-model="details.custtan"
            :value="details.custtan"
            id="nested-tan"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="GSTIN"
          label-for="nested-state"
          label-cols-sm="3"
          label-align-sm="right"
        >
          <div class="d-flex">
            <b-form-input
              type="text"
              disabled
              style="max-width: 3em"
              v-model="gstin.stateCode"
            ></b-form-input>
            <b-form-input
              type="text"
              class="ml-1 mr-1"
              disabled
              v-model="gstin.pan"
            ></b-form-input>
            <b-form-input
              type="text"
              v-model="gstin.checksum"
              title="Format: [Number] [Alphabet] [Number / Alphabet]"
              pattern="[0-9]{1}[A-Z]{1}[A-Z0-9]{1}"
              :state="isChecksumValid"
              :required="!!gstin.checksum"
            ></b-form-input>
          </div>
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
      <b-button to="/invoice/create/0" size="sm" class="ml-2" variant="dark"
        ><b-icon icon="receipt"></b-icon> Add Transaction</b-button
      >
      <b-button
        :to="{
          name: 'Create_Voucher',
          params: {
            type: customer.csflag ? 'receipt' : 'payment',
            customer: customer.custname || '',
          },
        }"
        size="sm"
        class="ml-2"
        variant="warning"
        ><b-icon icon="file-earmark-plus"></b-icon> Create Voucher</b-button
      >
    </div>
  </b-form>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

export default {
  name: 'ContactProfile',
  props: { customer: Object },
  data() {
    return {
      details: Array,
      oldContactName: '',
      isLoading: true,
      isCollapsed1: false,
      isCollapsed2: false,
      isCollapsed3: false,
      options: {
        states: [],
        selectedState: {},
        stateMap: {},
      },
      gstin: {
        stateCode: '',
        pan: '',
        checksum: '',
      },
      regex: {
        checksum: new RegExp('[0-9]{1}[A-Z]{1}[0-9A-Z]{1}'),
        pan: new RegExp('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
      },
    };
  },
  computed: {
    isChecksumValid: (self) =>
      self.gstin.checksum
        ? self.regex.checksum.test(self.gstin.checksum)
        : null,
    isPanValid: (self) =>
      self.details.custpan ? self.regex.pan.test(self.details.custpan) : null,
    ...mapState(['gkCoreUrl', 'authToken']),
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
              this.oldContactName = this.details.custname;
              this.isLoading = false;
              this.states().then(() => {
                if (this.details.gstin) {
                  this.splitGstin(Object.values(this.details.gstin)[0]);
                } else {
                  this.splitGstin();
                }
              });
              break;
            case 2:
              this.$bvToast.toast('Unauthorised Access', {
                variant: 'danger',
                title: 'Alert',
                solid: true,
              });
              this.isLoading = false;
              break;
            case 3:
              this.$bvToast.toast('Contact not found', {
                variant: 'danger',
                title: 'Alert',
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
          size: 'lg',
        })
        .then((val) => {
          if (val) {
            delete this.details.statelist;
            this.isLoading = true;
            if (
              this.gstin.stateCode.length === 2 &&
              this.gstin.pan.length === 10 &&
              this.gstin.checksum.length === 3
            ) {
              this.details.gstin = {};
              this.details.gstin[
                this.gstin.stateCode
              ] = `${this.gstin.stateCode}${this.gstin.pan}${this.gstin.checksum}`;
            }
            axios
              .put(`/customersupplier`, this.details)
              .then((res) => {
                switch (res.data.gkstatus) {
                  case 0:
                    this.isLoading = false;
                    this.updateAccountDetails(this.oldContactName);
                    this.$bvToast.toast(
                      `${this.details.custname} Profile Details Updated`,
                      {
                        title: 'Success',
                        variant: 'success',
                        solid: true,
                      }
                    );
                    break;
                  case 2:
                    this.isLoading = false;
                    this.$bvToast.toast('Unauthorised Access', {
                      variant: 'danger',
                      solid: true,
                    });
                    break;
                  case 4:
                    this.isLoading = false;
                    this.$bvToast.toast(
                      'You have no permissions to delete details',
                      {
                        variant: 'danger',
                        solid: true,
                      }
                    );
                    break;
                }
              })
              .catch((e) => {
                this.$bvToast.toast(e.message, {
                  variant: 'danger',
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
          size: 'lg',
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
                    document.querySelector('#contactinfo').innerHTML = '';
                    this.$bvToast.toast(
                      `${this.details.custname} Profile Deleted`,
                      {
                        title: 'Success',
                        variant: 'success',
                        solid: true,
                      }
                    );
                    break;
                  case 2:
                    this.isLoading = false;
                    this.$bvToast.toast('Unauthorised Access', {
                      title: 'Action Denied',
                      variant: 'danger',
                      solid: true,
                    });
                    break;
                  case 4:
                    this.isLoading = false;
                    this.$bvToast.toast(
                      'You have no permissions to modify details',
                      {
                        title: 'Access Denied',
                        variant: 'danger',
                        solid: true,
                      }
                    );
                    break;
                  case 5:
                    this.isLoading = false;
                    this.$bvToast.toast('Causes Integrity Issues', {
                      title: 'Cannot Delete Contact',
                      variant: 'danger',
                      solid: true,
                    });
                    break;
                }
              })
              .catch((e) => {
                this.$bvToast.toast(e.message, {
                  variant: 'danger',
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
                  console.log('account delete status', res.data.gkstatus);
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
    /**Update the account associated with this contact when the contact name is changed*/
    updateAccountDetails(oldContactName) {
      axios.get('/accounts').then((res) => {
        if (res.data.gkstatus === 0) {
          let acc = res.data.gkresult.find(
            (account) => account.accountname === oldContactName
          );
          if (acc) {
            let payload = {
              custsupflag: 1,
              oldcustname: oldContactName,
              gkdata: {
                accountname: this.details['custname'],
                openingbal: acc['openingbal'],
                accountcode: acc['accountcode'],
              },
            };
            axios.put('accounts', payload);
          }
        }
        this.oldContactName = this.details.custname;
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
          this.details.csflag == 3 ? 'customer' : 'supplier'
        } deleted`,
      };
      axios
        .post(`${this.gkCoreUrl}/log`, payload, config)
        .then((res) => {
          console.log('log status ', res.data.gkstatus, payload);
        })
        .catch((e) => {
          console.log('log ', e);
        });
    },
    /** Splits the GSTIN into state code, pan and checksum */
    splitGstin(gstin) {
      let gstinUpdated = false;
      if (gstin) {
        if (gstin.length === 15) {
          gstinUpdated = true;
          this.gstin = {
            stateCode: gstin.substring(0, 2),
            pan: gstin.substring(2, 12),
            checksum: gstin.substring(12, 15),
          };
        }
      }
      if (!gstinUpdated) {
        this.gstin.stateCode = this.options.stateMap[this.details.state] || '';
        // console.log(this.options.stateMap[this.details.state])
        this.gstin.pan = this.details.custpan || '';
      }
    },
    /** Fetches statelist from gkcore and prepares it for b-select.
     *  Also creates stateName to stateCode map, for quick lookup of state codes
     */
    states() {
      return axios
        .get(`${this.gkCoreUrl}/state`)
        .then((res) => {
          if (res.data.gkstatus === 0) {
            this.options.states = [];
            let name, code;
            res.data.gkresult.forEach((item) => {
              name = Object.values(item)[0];
              code = Object.keys(item)[0];
              if (parseInt(code) < 10) {
                code = '0' + code;
              }
              this.options.states.push(name);
              this.options.stateMap[name] = code;
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e, {
            variant: 'danger',
          });
        });
    },
  },
  created() {
    if (window.screen.width > 600) {
      this.isCollapsed1 = true;
      this.isCollapsed2 = true;
      this.isCollapsed3 = true;
    }
    window.addEventListener('resize', () => {
      if (window.screen.width > 600) {
        this.isCollapsed1 = true;
        this.isCollapsed2 = true;
        this.isCollapsed3 = true;
      } else {
        this.isCollapsed1 = false;
        this.isCollapsed2 = false;
        this.isCollapsed3 = false;
      }
    });
  },
  mounted() {
    this.getDetails();

    // This is used by the invoice form, to autofill party details
    this.$store.commit('setInvoiceParty', {
      id: this.customer.custid,
      name: this.customer.custname,
      type: this.customer.csflag ? 'customer' : 'supplier', // 3 -> customer, 19-> supplier
    });
  },
};
</script>
