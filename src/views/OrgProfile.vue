<!--
  Todo:
  Add CESS accounts
-->
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
            <b-form-select
              v-model="stateCode"
              :options="states"
              required
            ></b-form-select>
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
          <b-form-group
            label="PAN"
            label-cols="4"
            label-align="left"
            :state="isPanValid"
            invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
          >
            <b-input-group>
              <b-form-input
                v-model="details.orgpan"
                type="text"
                :state="isPanValid"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                @change="gstin.pan = details.orgpan"
                :required="!!details.orgpan"
              ></b-form-input>
            </b-input-group>
          </b-form-group>
          <!-- <b-form-group
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
          </b-form-group> -->

          <b-form-group label="ServiceTax Number" label-cols="4">
            <b-form-input v-model="details.orgstax" type="text"></b-form-input>
          </b-form-group>

          <b-form-group label="GSTIN" label-cols="4">
            <div
              v-for="(gst, sc, index) in gstin"
              :key="index"
              class="mb-2 d-flex align-items-center"
            >
              <b>
                {{ gst }}
              </b>
              <b-button class="mx-2" size="sm" variant="warning"
                ><b-icon font-scale="0.95" icon="pencil"></b-icon
              ></b-button>
              <b-button class="" size="sm" variant="danger">-</b-button>
            </div>
            <b-button
              v-b-modal.gstin
              variant="dark"
              class="p-0 px-1 float-left"
              @click="resetGstin"
            >
              <b-icon icon="plus"></b-icon>GSTIN
            </b-button>
          </b-form-group>
          <b-form-group label="CESS" label-cols="4">
            <div
              v-for="(value, cessAmount, index) in cess"
              :key="index"
              class="mb-2 d-flex align-items-center"
            >
              <b>
                {{ cessAmount }}
              </b>
              <b-button class="p-0 px-1" variant="link"
                ><b-icon font-scale="0.95" icon="pencil"></b-icon
              ></b-button>
            </div>
            <b-button
              v-b-modal.cess
              variant="dark"
              class="p-0 px-1 float-left"
              @click="newCess = 0"
            >
              <b-icon icon="plus"></b-icon>CESS
            </b-button>
          </b-form-group>
          <!-- {{ details }} -->
        </b-card>
      </b-card-group>
      <!-- Submit & cancel buttons -->
      <div class="mt-2 mb-3 d-flex flex-row-reverse">
        <b-button type="submit" size="sm" class="ml-2" variant="success">
          <b-icon icon="arrow-up-circle"></b-icon> Save Changes
        </b-button>
        <b-button variant="danger" @click="confirm('delete')">
          <b-icon icon="x-circle"></b-icon> Delete Organisation
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
      @ok="addGstin"
    >
      <b-form>
        <b-form-group label="State" label-cols="auto">
          <b-form-select
            required
            v-model="newGstin.stateCode"
            :options="states"
          ></b-form-select>
        </b-form-group>
        <b-form-group label="GSTIN" label-cols="auto">
          <div class="d-flex">
            <b-form-input
              v-model="newGstin.stateCode"
              type="text"
              disabled
              style="max-width: 3em"
            ></b-form-input>
            <b-form-input
              v-model="details.orgpan"
              type="text"
              class="ml-1 mr-1"
              disabled
            ></b-form-input>
            <b-form-input
              type="text"
              title="Format: [Number] [Alphabet] [Number / Alphabet]"
              v-model="newGstin.checksum"
            ></b-form-input>
          </div>
        </b-form-group>
      </b-form>

      <template #modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="danger" @click="cancel()">
          Cancel
        </b-button>
        <b-button
          size="sm"
          variant="success"
          @click="ok()"
          :disabled="!isGstinValid"
        >
          OK
        </b-button>
      </template>
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
      @ok="addCess"
    >
      <b-form>
        <b-form-group label="CESS" label-cols="auto">
          <b-input-group append="%">
            <b-form-input
              v-model="newCess"
              style="max-width: 5em"
              type="number"
              step="0.01"
              min="0"
            ></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-form>

      <template #modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="danger" @click="cancel()">
          Cancel
        </b-button>
        <b-button
          size="sm"
          variant="success"
          @click="ok()"
          :disabled="!(newCess > 0)"
        >
          OK
        </b-button>
      </template>
    </b-modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';

export default {
  name: 'OrgProfile',
  data() {
    return {
      loading: true,
      details: '',
      states: [],
      gstin: {},
      cess: {},
      newGstin: {
        stateCode: null,
        checksum: '',
      },
      newCess: 0,
      stateCode: '',
      regex: {
        checksum: new RegExp('[0-9]{1}[A-Z]{1}[0-9A-Z]{1}'),
        pan: new RegExp('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
      },
      options: {
        gstAccounts: [],
      },
    };
  },
  computed: {
    isGstinValid: function () {
      if (
        this.newGstin.stateCode !== null &&
        this.regex.pan.test(this.details.orgpan) &&
        this.regex.checksum.test(this.newGstin.checksum)
      ) {
        return true;
      }
      return false;
    },
    isPanValid: (self) =>
      self.details.orgpan ? self.regex.pan.test(self.details.orgpan) : null,
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    /**
     * Confirmation for actions
     */
    confirm(type) {
      this.$bvModal
        .msgBoxConfirm(
          `Confirm ${type} company ? ${
            type == 'delete'
              ? 'This action is Irreversable. We recommend to backup company data before deleting'
              : ''
          }`,
          {
            centered: true,
            size: 'md',
            okVariant: 'danger',
            headerBgVariant: 'danger',
            headerTextVariant: 'light',
          }
        )
        .then((val) => {
          if (val === true) {
            if (type === 'update') {
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
      return axios
        .get(`${this.gkCoreUrl}/organisation`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          switch (res.data.gkstatus) {
            case 0:
              this.details = res.data.gkdata;
              if (this.details.gstin) {
                this.gstin = Object.assign({}, this.details.gstin);
              }
              this.loading = false;
              break;
            case 2:
              alert('Access Denied');
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
    /** Get GST accounts and update the CESS fields */
    getCessDetails() {
      axios
        .get('/organisation?getgstaccounts')
        .then((res) => {
          if (res.data.gkstatus === 0) {
            let cess = {};
            let percent;
            this.options.gstAccounts = res.data.accounts;
            res.data.accounts.forEach((account) => {
              if (account.includes('CESSIN_')) {
                percent = account.split('@')[1].split('%')[0];
                cess[percent] = true;
              }
            });
            Object.assign(this.cess, cess);
            this.$forceUpdate();
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        });
    },
    /** Gets all the meta data required from the server for creating CESS accounts */
    getAccountsMetaData() {
      let requests = [];

      return axios.get('/organisation?getgstgroupcode').then((resp) => {
        if (resp.data.gkstatus === 0) {
          let groupCode = resp.data.groupcode,
            subGroupCode = resp.data.subgroupcode;
          let stateCodes = Object.keys(this.gstin);

          stateCodes.forEach((code) => {
            requests.push(axios.get(`/state?abbreviation&statecode=${code}`));
          });
          return Promise.all([...requests])
            .then((res) => {
              let taxStates = res.map((r) => r.data.abbreviation);
              if (subGroupCode === 'New') {
                return axios
                  .post('/groupsubgroups', {
                    groupname: 'Duties & Taxes',
                    subgroupof: groupCode,
                  })
                  .then((res2) => {
                    let data = JSON.parse(res2.data);
                    if (data.gkstatus === 0) {
                      return {
                        taxStates,
                        groupcode: data.gkresult,
                      };
                    } else {
                      return false;
                    }
                  })
                  .catch((e) => e);
              }
              return {
                taxStates,
                groupcode: subGroupCode === 'None' ? groupCode : subGroupCode,
              };
            })
            .catch((e) => e);
        }
      });
    },
    /**Create / Update the CESS accounts, based on the CESS rates and the states in GSTIN list */
    updateCessAccounts() {
      let cess = Object.keys(this.cess);
      let saveAccount = function (payload) {
        axios.post('/accounts', payload);
      };

      // let editAccount = function () {};
      let self = this;
      this.getAccountsMetaData().then((meta) => {
        let acc = {
          accountname: '',
          groupcode: meta.groupcode,
          openingbal: '0.00',
          sysaccount: 1,
        };
        cess.forEach((rate) => {
          meta.taxStates.forEach((taxState) => {
            acc.accountname = `CESSIN_${taxState}@${rate}%`;
            if (self.options.gstAccounts.indexOf(acc.accountname) < 0) {
              saveAccount(acc);
            } else {
              // call edit
            }
            acc.accountname = `CESSOUT_${taxState}@${rate}%`;
            if (self.options.gstAccounts.indexOf(acc.accountname) < 0) {
              saveAccount(acc);
            } else {
              // call edit
            }
          });
        });
      });
    },
    /**
     * Update organisation details
     */
    updateOrg() {
      this.loading = true;
      delete this.details.statelist;

      // update state
      let state = this.states.find((state) => state.value === this.stateCode);
      state = state ? state.text : null;

      this.details.orgstate = state;

      // update GSTIN
      this.details.gstin = Object.assign({}, this.gstin);

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
              this.updateCessAccounts();
              this.$bvToast.toast(
                `${this.details.orgname} Profile Details Updated`,
                {
                  title: 'Success',
                  variant: 'success',
                  solid: true,
                }
              );
              break;
            case 2:
              this.loading = false;
              this.$bvToast.toast('Unauthorised Access', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.loading = false;
              this.$bvToast.toast('You have no permissions to delete details', {
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
          if (r.status == '200' && r.data.gkstatus == 0) {
            this.$bvToast.toast(`${this.details.orgname} Deleted`, {
              title: 'Success',
              variant: 'success',
              solid: true,
            });
            // reset orgname
            this.$store.commit('resetOrg');
            // change auth status
            this.$store.commit('setAuthStatus');
            // redirect to login page
            this.$router.push('/');
            // clear localStorage
            localStorage.clear();
            // set gkCore url
            this.$store.commit('setGkCoreUrl', { gkCoreUrl: this.gkCoreUrl });
            this.loading = false;
          } else {
            this.$bvToast.toast(r.status, {
              title: 'Error',
              variant: 'danger',
              solid: true,
            });
            this.loading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    addGstin() {
      if (this.newGstin.stateCode !== null && this.newGstin.checksum !== '') {
        this.gstin[
          this.newGstin.stateCode
        ] = `${this.newGstin.stateCode}${this.details.orgpan}${this.newGstin.checksum}`;
        this.$forceUpdate();
      }
    },
    addCess() {
      if (this.newCess > 0) {
        let percent = parseFloat(parseFloat(this.newCess).toFixed(2));
        this.cess[percent] = true;
        this.$forceUpdate();
      }
    },
    resetGstin() {
      this.newGstin = {
        stateCode: null,
        checksum: '',
      };
    },

    getStates() {
      return axios
        .get(`${this.gkCoreUrl}/state`)
        .then((res) => {
          this.states = res.data.gkresult.map((val) => {
            let obj = {};
            obj.value = Object.keys(val)[0];
            obj.text = Object.values(val)[0];
            if (parseInt(obj.value) < 10) {
              obj.value = '0' + obj.value;
            }
            return obj;
          });
        })
        .catch((e) => {
          console.log('failed to get states', e.message);
        });
    },
  },
  mounted() {
    Promise.all([
      this.getStates(),
      this.getDetails(),
      this.getCessDetails(),
    ]).then(() => {
      if (this.details.orgstate && this.states.length) {
        let state = this.states.find(
          (state) => state.text === this.details.orgstate
        );
        if (state) {
          this.stateCode = state.value;
        }
      }
    });
  },
};
</script>
