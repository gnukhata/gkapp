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
        <b-card header="General" header-bg-variant="dark" header-text-variant="light">
          <!-- <b-img
                 rounded
                 center
                 height="180"
                 width="180"
                 class="mx-auto m-1 border border-dark"
                 :src="orgImg"
          ></b-img>-->
          <b-form-group
            label="Image"
            label-size="sm"
            label-align="right"
            lable-cols="4"
            content-cols="8"
          >
            <b-form-file
              @change="prepareImg"
              v-model="details.logo"
              size="sm"
              accept="image/*"
              placeholder="Choose a file / Drag & drop it here"
              drop-placeholder="Drop file here..."
            ></b-form-file>
          </b-form-group>
          <b-form-group label="Name" label-size="sm" label-align="right" label-cols="4">
            <b-form-input v-model="details.orgname" size="sm" type="text" required></b-form-input>
          </b-form-group>
          <b-form-group label="Website" label-size="sm" label-align="right" label-cols="4">
            <b-form-input v-model="details.orgwebsite" size="sm" type="text"></b-form-input>
          </b-form-group>
          <b-form-group label="Email" label-size="sm" label-align="right" label-cols="4">
            <b-form-input v-model="details.orgemail" size="sm" type="email"></b-form-input>
          </b-form-group>
        </b-card>
        <!-- Contact Card -->
        <b-card header="Contact Details" header-bg-variant="dark" header-text-variant="light">
          <b-form-group label="Address" label-cols="4" label-align="right">
            <b-form-input v-model="details.orgaddr" size="sm" type="text" required></b-form-input>
          </b-form-group>
          <b-form-group label="City" label-size="sm" label-align="right" label-cols="4">
            <b-form-input v-model="details.orgcity" size="sm" type="text" required></b-form-input>
          </b-form-group>
          <b-form-group label="State" label-size="sm" label-align="right" label-cols="4">
            <b-form-select v-model="stateCode" size="sm" :options="states" required></b-form-select>
          </b-form-group>
          <b-form-group label="Country" label-size="sm" label-align="right" label-cols="4">
            <b-form-input v-model="details.orgcountry" size="sm" type="text" required></b-form-input>
          </b-form-group>
          <b-form-group label="Pincode" label-size="sm" label-align="right" label-cols="4">
            <b-form-input v-model="details.orgpincode" size="sm" type="text"></b-form-input>
          </b-form-group>
          <b-form-group label="Phone" label-size="sm" label-align="right" label-cols="4">
            <b-input-group>
              <b-form-input v-model="details.orgtelno" size="sm" type="right"></b-form-input>
            </b-input-group>
          </b-form-group>
          <b-form-group label="Fax" label-size="sm" label-align="right" label-cols="4">
            <b-form-input v-model="details.orgfax" size="sm" type="text"></b-form-input>
          </b-form-group>
        </b-card>
      </b-card-group>
      <!-- Bank card --->
      <b-card-group deck class="mt-4">
        <b-card
          v-if="details.bankdetails"
          header="Bank Details"
          header-bg-variant="dark"
          header-text-variant="light"
        >
          <b-form-group label="Name" label-cols="4" label-align="left">
            <b-input-group>
              <b-form-input v-model="details.bankdetails.bankname" type="text"></b-form-input>
            </b-input-group>
          </b-form-group>
          <b-form-group label="Account Number" label-cols="4" label-align="left">
            <b-form-input v-model="details.bankdetails.accountno" type="text"></b-form-input>
          </b-form-group>
          <b-form-group label="Branch" label-cols="4">
            <b-form-input v-model="details.bankdetails.branchname" type="text"></b-form-input>
          </b-form-group>
          <b-form-group label="IFSC Code" label-cols="4">
            <b-form-input v-model="details.bankdetails.ifsc" type="text"></b-form-input>
          </b-form-group>
        </b-card>
        <!-- Tax card-->
        <b-card
          header="Tax Details"
          class="gkcard"
          header-bg-variant="dark"
          header-text-variant="light"
        >
          <b-form-group
            label="PAN"
            label-align="right"
            label-cols="4"
            label-size="sm"
            :state="isPanValid"
            invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
          >
            <b-input-group size="sm">
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
          <b-form-group
            label="ServiceTax Number"
            label-size="sm"
            label-align="right"
            label-cols="4"
          >
            <b-form-input v-model="details.orgstax" size="sm" type="text"></b-form-input>
          </b-form-group>

          <b-form-group label="GSTIN" label-cols="4" label-align="right">
            <div
              v-for="(gst, sc, index) in gstin"
              :key="index"
              class="mb-2 d-flex align-items-center justify-content-end justify-content-sm-start"
            >
              <b>{{ gst }}</b>
              <b-button
                v-b-modal.gstin
                class="mx-2"
                size="sm"
                variant="warning"
                @click="onGstinEdit(gst)"
              >
                <b-icon font-scale="0.95" icon="pencil"></b-icon>
              </b-button>
              <b-button class size="sm" variant="danger">-</b-button>
            </div>
            <b-button
              v-b-modal.gstin
              variant="dark"
              class="p-0 px-1 float-right float-sm-left"
              @click="onGstinAdd"
            >
              <b-icon icon="plus"></b-icon>GSTIN
            </b-button>
          </b-form-group>
          <b-form-group label="CESS" label-cols="4" label-align="right">
            <div
              v-for="(value, cessAmount, index) in cess"
              :key="index"
              class="mb-2 d-flex align-items-center justify-content-end justify-content-sm-start"
            >
              <b :style="{ width: '25px' }">{{ cessAmount }}</b>
              <b-button class size="sm" variant="danger" @click="deleteCess(cessAmount)">-</b-button>
            </div>
            <b-button
              v-b-modal.cess
              variant="dark"
              class="p-0 px-1 float-right float-sm-left"
              @click="onCessAdd"
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
          <b-icon icon="arrow-up-circle"></b-icon>Save Changes
        </b-button>
        <b-button variant="danger" size="sm" @click="confirm('delete')">
          <b-icon icon="building"></b-icon>Delete Organisation
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
      @ok="onGstinModalOk"
    >
      <b-form>
        <b-form-group label="State" label-cols="auto">
          <b-form-select required v-model="gstinModal.stateCode" :options="states"></b-form-select>
        </b-form-group>
        <b-form-group label="GSTIN" label-cols="auto">
          <div class="d-flex">
            <b-form-input
              v-model="gstinModal.stateCode"
              type="text"
              disabled
              style="max-width: 3em"
            ></b-form-input>
            <b-form-input v-model="details.orgpan" type="text" class="ml-1 mr-1" disabled></b-form-input>
            <b-form-input
              type="text"
              title="Format: [Number] [Alphabet] [Number / Alphabet]"
              v-model="gstinModal.checksum"
            ></b-form-input>
          </div>
        </b-form-group>
      </b-form>

      <template #modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="danger" @click="cancel()">Cancel</b-button>
        <b-button
          size="sm"
          variant="success"
          @click="ok()"
          :disabled="!isGstinValid"
        >{{ gstinModal.mode === 'create' ? 'Add' : 'Update' }}</b-button>
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
      @ok="onCessModalOk"
    >
      <b-form>
        <b-form-group label="CESS" label-cols="4" label-align="right">
          <b-input-group append="%">
            <b-form-input
              v-model="cessModal.rate"
              style="max-width: 5em"
              type="number"
              step="0.01"
              min="0"
            ></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-form>

      <template #modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="danger" @click="cancel()">Cancel</b-button>
        <b-button
          size="sm"
          variant="success"
          @click="ok()"
          :disabled="!(cessModal.rate > 0)"
        >{{ cessModal.mode === 'create' ? 'Add' : 'Update' }}</b-button>
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
      details: Array,
      states: [],
      gstin: {},
      cess: {},
      newGstin: {
        stateCode: null,
        checksum: '',
      },
      stateCode: '',
      regex: {
        checksum: new RegExp('[0-9]{1}[A-Z]{1}[0-9A-Z]{1}'),
        pan: new RegExp('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
      },
      cessModal: {
        rate: 0,
        mode: 'create',
        inEdit: null,
        toBeEdited: {},
        toBeDeleted: {},
      },
      gstinModal: {
        stateCode: null,
        checksum: '',
        mode: 'create',
        inEdit: {
          stateCode: null,
          checksum: '',
        },
        edited: {}, // edited: {edit: source}
      },
      options: {
        gstAccounts: [],
      },
    };
  },
  computed: {
    isGstinValid: function () {
      if (
        this.gstinModal.stateCode !== null &&
        this.regex.pan.test(this.details.orgpan) &&
        this.regex.checksum.test(this.gstinModal.checksum)
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
    async getDetails() {
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
            let rate;
            this.options.gstAccounts = res.data.accounts;
            res.data.accounts.forEach((account) => {
              if (account.includes('CESSIN_') || account.includes('CESSOUT_')) {
                rate = account.split('@')[1].split('%')[0]; // CESS rate
                cess[rate] = true;
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
    async getCreateCessData() {
      return axios.get('/organisation?getgstgroupcode').then(async (resp) => {
        if (resp.data.gkstatus === 0) {
          let groupCode = resp.data.groupcode,
            subGroupCode = resp.data.subgroupcode;
          let stateCodes = Object.keys(this.gstin);

          return this.getStateAbbreviations(stateCodes)
            .then((taxStates) => {
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
                  .catch(() => false);
              }
              return {
                taxStates,
                groupcode: subGroupCode === 'None' ? groupCode : subGroupCode,
              };
            })
            .catch(() => false);
        }
      });
    },
    /**Create / Update the CESS accounts, based on the CESS rates and the states in GSTIN list */
    async updateCessAccounts() {
      let cess = Object.keys(this.cess);
      let saveAccount = function (payload) {
        return axios.post('/accounts', payload);
      };

      // let editAccount = function () {};
      let self = this;
      return this.getCreateCessData().then((meta) => {
        if (!meta) {
          return;
        }
        let acc = {
          accountname: '',
          groupcode: meta.groupcode,
          openingbal: '0.00',
          sysaccount: 1,
        };
        let createCalls = [];
        let createdAccs = [];
        cess.forEach((rate) => {
          meta.taxStates.forEach((taxState) => {
            acc.accountname = `CESSIN_${taxState}@${rate}%`;
            if (self.options.gstAccounts.indexOf(acc.accountname) < 0) {
              createCalls.push(saveAccount(acc));
              createdAccs.push(acc.accountname);
            } else {
              // call edit
            }
            acc.accountname = `CESSOUT_${taxState}@${rate}%`;
            if (self.options.gstAccounts.indexOf(acc.accountname) < 0) {
              createCalls.push(saveAccount(acc));
              createdAccs.push(acc.accountname);
            } else {
              // call edit
            }
          });
        });
        Promise.all([...createCalls]).then((results) => {
          let accs = '';
          results.forEach((res, i) => {
            if (res.data.gkstatus === 0) {
              accs += `${createdAccs[i]} `;
            }
          });
          if (accs) {
            this.$bvToast.toast(`${accs} accounts were successfully created`, {
              title: 'CESS accounts created successfully',
              variant: 'success',
              solid: true,
            });
          }
        });
        return this.deleteCessAccounts();
      });
    },
    /** Get the state abbraviations of the given statecodes.
     *
     * params: stateCodes -> array of state codes */
    async getStateAbbreviations(stateCodes) {
      let requests = [];
      stateCodes.forEach((code) => {
        requests.push(axios.get(`/state?abbreviation&statecode=${code}`));
      });
      return Promise.all([...requests]).then((res) => {
        return res.map((r) => r.data.abbreviation);
      });
    },
    /** returns the account codes for CESS accounts that are no longer required.
     *
     * The CESS accounts with states other than the GSTIN states, CESS accounts with edited or deleted rates
     * are no longer required.
     */
    async getDeleteCessData() {
      let cess = Object.keys(this.cessModal.toBeDeleted);
      let states = this.options.gstAccounts
        .filter((acc) => {
          let rate =
            acc.indexOf('@') >= 0 ? acc.split('@')[1].split('%')[0] : ''; // CESS rate
          return cess.indexOf(rate) >= 0;
        })
        .map(
          (acc) =>
            acc.indexOf('CESSIN') >= 0
              ? acc.split('@')[0].split('CESSIN_')[1]
              : acc.split('@')[0].split('CESSOUT_')[1]
          // CESS State
        );

      // if gstin state is edited, delete that state associated with all the cess values
      let gstinEditedStates = Object.values(this.gstinModal.edited);
      return this.getStateAbbreviations(gstinEditedStates).then(
        async (editedStates) => {
          if (editedStates.length) states.push(...editedStates);
          if (gstinEditedStates.length) cess = Object.keys(this.cess);

          let temp = {};
          states.forEach((state) => {
            temp[state] = true;
          });
          states = Object.keys(temp);
          let toDelete = [];
          let accounts = [];
          cess.forEach((rate) => {
            states.forEach((taxState) => {
              if (
                this.options.gstAccounts.indexOf(`CESSIN_${taxState}@${rate}%`)
              ) {
                toDelete.push(
                  axios.get(
                    `/accounts?type=getAccCode&accountname=CESSIN_${taxState}@${rate}%`
                  )
                );
                accounts.push(`CESSIN_${taxState}@${rate}%`);
              }
              if (
                this.options.gstAccounts.indexOf(`CESSOUT_${taxState}@${rate}%`)
              ) {
                toDelete.push(
                  axios.get(
                    `/accounts?type=getAccCode&accountname=CESSOUT_${taxState}@${rate}%`
                  )
                );
                accounts.push(`CESSOUT_${taxState}@${rate}%`);
              }
            });
          });

          return Promise.all([...toDelete]).then((accCodes) => {
            let codes = accCodes.map((accCode) => accCode.data.accountcode);
            return { codes, accounts };
          });
        }
      );
    },
    /** Deletes the CESS accounts that have become absolete because of the updates made recently in orgprofile */
    deleteCessAccounts() {
      this.getDeleteCessData().then(async (data) => {
        let accCodes = data.codes,
          accounts = data.accounts;
        let deletedCess = '',
          failedCess = '',
          error = '';
        let deleteCalls = accCodes.map((accCode) => {
          return axios.delete(`/accounts`, {
            data: { accountcode: accCode },
          });
        });
        return Promise.all([...deleteCalls]).then((delAccounts) => {
          delAccounts.forEach((delAccount, i) => {
            switch (delAccount.data.gkstatus) {
              case 0:
                deletedCess += `${accounts[i]} `;
                break;
              case 2:
                error = 'Unauthorized Access, Please contact Admin.';
                break;
              case 3:
                error = 'Internal Server Error, Please contact Admin.';
                break;
              case 4:
                error = 'Bad Privilege, Only Admin can delete CESS accounts.';
                break;
              case 5:
                failedCess += `${accounts[i]}`;
                break;
            }
          });
          if (deletedCess) {
            this.$bvToast.toast(
              `${deletedCess} accounts were successfully deleted`,
              {
                title: 'CESS accounts deleted successfully',
                variant: 'success',
                solid: true,
              }
            );
          }
          if (failedCess) {
            this.$bvToast.toast(
              `${failedCess} accounts were not deleted to avoid integrity issues.`,
              {
                title: 'CESS accounts delete failure',
                variant: 'warning',
                solid: true,
              }
            );
          }
          if (!(deletedCess || failedCess) && error) {
            this.$bvToast.toast(error, {
              title: 'CESS accounts delete failure',
              variant: 'danger',
              solid: true,
            });
          }
        });
      });
    },
    /** Deletes all the CESS accounts that have states other than those in the GSTIN.
     *
     * Currently used only for dev purpose and data cleanup during dev.
     */
    deleteNonGstCess() {
      let gstStates = Object.keys(this.gstin);
      this.getStateAbbreviations(gstStates).then((states) => {
        let toDelete = this.options.gstAccounts.filter((acc) => {
          if (acc.indexOf('CESSIN_') >= 0 || acc.indexOf('CESSOUT_') >= 0) {
            let state =
              acc.indexOf('CESSIN') >= 0
                ? acc.split('@')[0].split('CESSIN_')[1]
                : acc.split('@')[0].split('CESSOUT_')[1];
            if (states.indexOf(state) < 0) {
              return true;
            }
          }
          return false;
        });
        let codeRequests = toDelete.map((acc) =>
          axios.get(`/accounts?type=getAccCode&accountname=${acc}`)
        );
        Promise.all([...codeRequests]).then((accCodes) => {
          let codes = accCodes.map((accCode) => accCode.data.accountcode);
          codes.map((accCode) => {
            // debugger;
            return axios.delete(`/accounts`, {
              data: { accountcode: accCode },
            });
          });
        });
      });
    },
    /**
     * Update organisation details
     */
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      // const reader = new FileReader();
      // reader.readAsDataURL(this.details.logo);
      // reader.onload = () => {
      //   console.log(reader.result);
      // };
    },
    prepareImg() {
      this.getBase64(this.details.logo).then((r) => {
        this.details.logo = r;
      });
    },
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
              this.updateCessAccounts().then(() => {
                this.init();
              });
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
    /** Add an extra GSTIN to the list */
    addGstin() {
      if (
        this.gstinModal.stateCode !== null &&
        this.gstinModal.checksum !== ''
      ) {
        this.gstin[
          this.gstinModal.stateCode
        ] = `${this.gstinModal.stateCode}${this.details.orgpan}${this.gstinModal.checksum}`;
        this.$forceUpdate();
      }
    },
    /** Add an extra CESS to the list */
    addCess() {
      if (this.cessModal.rate > 0) {
        let rate = parseFloat(parseFloat(this.cessModal.rate).toFixed(2));
        this.cess[rate] = true;
        this.$forceUpdate();
      }
    },
    /** Delete a CESS from the list */
    deleteCess(rate) {
      if (this.cess[rate]) {
        this.cessModal.toBeDeleted[rate] = true;
        delete this.cess[rate];
        this.$forceUpdate();
      }
    },
    async getStates() {
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
    /** The ADD/Update BUtton callback for the GSTIN modal */
    onGstinModalOk() {
      if (this.gstinModal.mode === 'create') {
        this.addGstin();
      } else {
        // edit gstin
        let state = this.gstinModal.inEdit.stateCode,
          state_new = this.gstinModal.stateCode,
          checksum = this.gstinModal.inEdit.checksum,
          checksum_new = this.gstinModal.checksum;
        if (state != state_new || checksum != checksum_new) {
          // if gstin was already edited, then the state code will be present as a key in the gstinModal.edited object
          if (this.gstinModal.edited[state]) {
            this.gstinModal.edited[state_new] = this.gstinModal.edited[state];
            delete this.gstinModal.edited[state];
          } else {
            this.gstinModal.edited[state_new] = state;
          }
          delete this.gstin[state];
          this.addGstin();
        }
      }
    },
    /** Initialize the GSTIN modal after clicking the Add GSTIN button */
    onGstinAdd() {
      this.gstinModal.mode = 'create';
      this.gstinModal.stateCode = null;
      this.gstinModal.checksum = '';
      this.gstinModal.inEdit = {
        stateCode: null,
        checksum: '',
      };
    },
    /** Initialize the GSTIN modal after clicking the Edit GSTIN button */
    onGstinEdit(gstin) {
      let stateCode = gstin.substr(0, 2);
      let checksum = gstin.substr(12, 3);
      this.gstinModal.mode = 'edit';
      this.gstinModal.stateCode = stateCode;
      this.gstinModal.checksum = checksum;
      this.gstinModal.inEdit = {
        stateCode: stateCode,
        checksum: checksum,
      };
    },
    /** Callback for the Add/Update button in the CESS modal*/
    onCessModalOk() {
      if (this.cessModal.mode === 'create') {
        this.addCess();
      } else {
        // CESS rate accounts can't be edited, they can only be deleted if not used in any transactions
      }
    },
    /** Initialize the CESS modal after clicking the Add CESS button */
    onCessAdd() {
      this.cessModal.mode = 'create';
      this.cessModal.rate = 0;
      this.cessModal.inEdit = null;
    },
    init() {
      this.cessModal = {
        rate: 0,
        mode: 'create',
        inEdit: null,
        toBeEdited: {},
        toBeDeleted: {},
      };
      this.gstinModal = {
        stateCode: null,
        checksum: '',
        mode: 'create',
        inEdit: {
          stateCode: null,
          checksum: '',
        },
        edited: {}, // edited: {edit: source}
      };
      return Promise.all([
        this.getStates(),
        this.getDetails(),
        this.getCessDetails(),
      ]);
    },
  },
  mounted() {
    this.getOrgImage();
    this.init().then(() => {
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
