<template>
  <b-form
    class="align-form-label-right"
    id="prod"
    @submit.prevent="updateProfile"
  >
    <b-overlay :show="loading" blur no-wrap></b-overlay>
    <!-- {{ details }} -->
    <!-- {{ godowns }} -->
    <!-- name --->
    <b-card
      class="mt-2"
      header-bg-variant="dark"
      header-text-variant="light"
      no-body
    >
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-info>
          <div class="mr-auto" v-translate>Info</div>
          <div>
            <b-icon
              :icon="isCollapsed1 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse v-model="isCollapsed1" class="p-3" id="collapse-info">
        <b-form-group label-size="sm" label="Name" label-cols="4">
          <b-form-input
            size="sm"
            v-model="details.productdesc"
            type="text"
            required
          ></b-form-input>
        </b-form-group>
        <!-- Opening Stock -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="Opening Stock"
          label-cols="4"
          label-size="sm"
        >
          <template #label> <translate> Opening Stock </translate> </template>
          <b-input-group size="sm">
            <b-form-input
              v-model="details.openingstock"
              type="number"
              no-wheel
              step="0.01"
              :readonly="isGodownUsed || useGodownwise"
            ></b-form-input>
            <template v-if="isGodownUsed" #append>
              <b-button @click="scrollToGodownCard" variant="dark">
                <b-icon font-scale="0.9" icon="pencil"></b-icon>
              </b-button>
            </template>
          </b-input-group>
          <b-form-checkbox
            v-if="!isGodownUsed"
            v-model="useGodownwise"
            class="float-right"
            name="check-button"
            switch
            size="sm"
          >
            <translate> Use Godownwise Opening Stock </translate>
          </b-form-checkbox>
        </b-form-group>
        <!-- UOM -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="Unit of Measure"
          label-cols="4"
          label-size="sm"
        >
          <template #label> <translate> Unit of Measure </translate> </template>
          <b-input-group size="sm" :prepend="details.unitname">
            <b-form-select
              size="sm"
              v-model="details.unitname"
              :options="options.uom"
            >
            </b-form-select>
          </b-input-group>
        </b-form-group>
        <!-- HSN / SCN Code -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="HSN Code"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input size="sm" v-model="details.gscode"></b-form-input>
        </b-form-group>
        <b-form-group v-else label="SAC Code" label-cols="4">
          <b-form-input size="sm" v-model="details.gscode"></b-form-input>
        </b-form-group>
      </b-collapse>
    </b-card>
    <b-card
      class="mt-2"
      no-body
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-price>
          <div class="mr-auto" v-translate>Price</div>
          <div>
            <b-icon
              :icon="isCollapsed2 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse v-model="isCollapsed2" class="p-3" id="collapse-price">
        <!-- MRP -->
        <b-form-group label-size="sm" label="MRP" label-cols="4">
          <b-form-input size="sm" v-model="details.prodmrp"></b-form-input>
        </b-form-group>
        <!-- Selling Price -->
        <b-form-group
          label-size="sm"
          id="input-group-2"
          label="Selling Price"
          label-cols="4"
        >
          <b-form-input size="sm" v-model="details.prodsp"></b-form-input>
        </b-form-group>
        <!-- discount -->
        <b-form-group
          label-size="sm"
          label-cols="4"
          label="Discount"
          label-for="input-3"
        >
          <template #label> <translate> Discount </translate> </template>
          <b-input-group size="sm" prepend="₹">
            <b-form-input
              size="sm"
              v-model="details.discountamount"
            ></b-form-input>
          </b-input-group>
          <b-input-group label-size="sm" size="sm" class="mt-1" prepend="%">
            <b-form-input
              size="sm"
              v-model="details.discountpercent"
            ></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- <h3 class="text-muted text-center mt-3 mb-3">Taxes</h3> -->
    <!-- <b-card class="mt-2" header="Tax" header-bg-variant="warning"> -->
    <!-- {{ options.tax }} -->
    <b-card
      no-body
      class="mt-2"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-tax>
          <div class="mr-auto" v-translate>Taxes</div>
          <div>
            <b-icon
              :icon="isCollapsed3 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse v-model="isCollapsed3" class="p-3" id="collapse-tax">
        <b-form-group label-size="sm" label="HSN" label-cols="4">
          <b-form-input
            size="sm"
            type="number"
            no-wheel
            required
            v-model="details.gscode"
          ></b-form-input>
        </b-form-group>

        <b-form-group label-size="sm" label="GST" label-cols="4">
          <b-input-group size="sm" append="%">
            <b-form-select
              size="sm"
              :options="gstRates"
              v-model="tax.igst.taxrate"
            >
            </b-form-select>
          </b-input-group>
        </b-form-group>

        <b-form-group label-size="sm" label="CESS" label-cols="4">
          <b-input-group size="sm" append="%">
            <b-form-input
              size="sm"
              type="number"
              step="0.01"
              no-wheel
              v-model="tax.cess.taxrate"
            ></b-form-input>
          </b-input-group>
        </b-form-group>

        <b-form-group label-size="sm" label="CVAT" label-cols="4">
          <b-input-group size="sm" append="%">
            <b-form-input
              size="sm"
              type="number"
              step="0.01"
              no-wheel
              v-model="tax.cvat.taxrate"
            ></b-form-input>
          </b-input-group>
        </b-form-group>

        <b-form-group label-size="sm" label="VAT" label-cols="4">
          <div v-for="(item, index) in tax.vat" :key="index">
            <b-input-group v-if="item.taxname === 'VAT'" class="mb-2">
              <b-form-input
                size="sm"
                type="number"
                step="0.01"
                no-wheel
                v-model="item.taxrate"
                :required="!!item.state"
              ></b-form-input>
              <b-input-group-append>
                <b-form-select
                  size="sm"
                  :options="options.states"
                  v-model="item.state"
                  :style="{ 'border-radius': 0, 'max-width': '200px' }"
                  :required="!!item.taxrate"
                ></b-form-select>
                <b-button size="sm" @click.prevent="removeVatEntry(index)"
                  >-</b-button
                >
              </b-input-group-append>
            </b-input-group>
          </div>
          <b-button
            size="sm"
            @click.prevent="addVatEntry"
            class="float-right p-0 px-1"
            >+ VAT</b-button
          >
        </b-form-group>
      </b-collapse>
    </b-card>

    <b-card
      no-body
      class="mt-2"
      header-bg-variant="dark"
      header-text-variant="light"
      id="godown-card"
      v-if="isProduct && (useGodownwise || isGodownUsed)"
    >
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-godown>
          <div class="mr-auto" v-translate>Godownwise Opening Stock</div>
          <div>
            <b-icon
              :icon="isCollapsed3 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <div class="p-2">
        <b-collapse v-model="isCollapsed4" class="p-3" id="collapse-godown">
          <div
            v-for="(godown, index) in godowns"
            :key="index"
            class="mb-2 d-flex"
            :id="'vat-inp-' + index"
          >
            <b-form-select
              size="sm"
              style="max-width: 350px"
              v-model="godown.id"
              :options="options.godowns"
            >
              <template #first>
                <b-form-select-option value="" disabled>
                  <translate> -- Choose a Godown -- </translate>
                </b-form-select-option>
              </template>
            </b-form-select>
            <b-form-input
              class="mx-2"
              size="sm"
              v-model="godown.value"
              type="number"
              no-wheel
              step="0.01"
              placeholder="Stock qty"
            ></b-form-input>
            <b-button
              variant="outline-secondary"
              size="sm"
              @click.prevent="deleteGodown(index)"
            >
              -
            </b-button>
          </div>
          <b-button
            size="sm"
            @click.prevent="addGodown"
            class="float-right py-0 px-1"
          >
            <translate> Add Row </translate>
          </b-button>
          <b-button
            class="float-right mx-2 py-0 px-1"
            size="sm"
            @click.prevent="showGodownForm = true"
          >
            <translate> Create Godown </translate>
          </b-button>
        </b-collapse>
      </div>
    </b-card>
    <!-- Submit & delete buttons -->
    <div class="mt-4 pb-4 d-flex flex-row-reverse">
      <b-button type="submit" size="sm" class="ml-2" variant="success"
        ><b-icon icon="cloud-arrow-up"></b-icon>
        <translate> Save Changes </translate>
      </b-button>
      <b-button
        @click.prevent="delProfile"
        size="sm"
        class="ml-2"
        variant="danger"
        ><b-icon :icon="details.gsflag == 7 ? 'box' : 'headset'"></b-icon>
        <span v-if="details.gsflag == 7" v-translate> Delete Product </span>
        <span v-else v-translate> Delete Service </span>
      </b-button>
    </div>

    <b-modal
      size="lg"
      v-model="showGodownForm"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <godown
        :hideBackButton="true"
        mode="create"
        :inOverlay="true"
        :onSave="onGodownSave"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click.prevent="
              () => {
                showGodownForm = false;
              }
            "
            >x</b-button
          >
        </template>
      </godown>
    </b-modal>
  </b-form>
</template>

<script>
/**
 * TODO
 *
 * Delete product
 * add / delete tax
 */
import axios from 'axios';
import { mapState } from 'vuex';
import Godown from '../components/form/Godown.vue';
export default {
  name: 'BusinessProfile',
  components: { Godown },
  props: {
    name: Object,
  },
  data() {
    return {
      details: [],
      oldGodowns: [],
      godowns: [],
      isCollapsed1: false,
      isCollapsed2: false,
      isCollapsed3: false,
      isCollapsed4: false,
      showGodownForm: false,
      useGodownwise: false,
      uom: [],
      tax: {
        igst: {},
        cess: {},
        cvat: {},
        vat: [],
      },
      loading: true,
      options: {
        godowns: [],
        uom: [],
        states: [],
        cess: 0,
        cvat: 0,
        tax: [],
        taxIdMap: {},
      },
    };
  },
  computed: {
    isProduct: (self) => self.details.gsflag === 7,
    isGodownUsed: (self) => !!self.oldGodowns.length,
    gstRates: (self) => self.$store.getters['global/getGstRates'],
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    scrollToGodownCard() {
      document
        .getElementById('godown-card')
        .scrollIntoView({ behavior: 'smooth' });
    },
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
          switch (res.data.gkstatus) {
            case 0:
              this.details = res.data.gkresult;
              Promise.all([this.getTaxDetails(), this.getGodowns()]).then(
                () => {
                  this.loading = false;
                }
              );
              break;
            case 3:
              this.loading = false;
              this.$bvToast.toast(this.$gettext('Product does not exist'), {
                title: 'Error',
                variant: 'danger',
                solid: true,
              });
              break;
            default:
              this.loading = false;
          }
        });
    },
    /*
     * Update product/service details
     */
    updateProfile() {
      this.$bvModal
        .msgBoxConfirm(`Update ${this.details.productdesc} details ?`, {
          centered: true,
          size: 'lg',
        })
        .then((val) => {
          if (val) {
            this.loading = true;
            const config = {
              headers: {
                gktoken: this.authToken,
              },
            };
            const payload = {
              productdetails: this.details,
              godownflag: false,
            };

            delete this.details.discountamount;
            delete this.details.discountpercent;
            delete this.details.deletable;
            delete this.details.unitname;

            if (this.godowns.length > 0) {
              let godowns = {};
              this.godowns.forEach((godown) => {
                if (godown.id && parseFloat(godown.value)) {
                  godowns[godown.id] = godown.value;
                }
              });
              payload['godetails'] = godowns;
              payload.godownflag = true;
            }
            axios
              .put(`/products`, payload, config)
              .then((res) => {
                switch (res.data.gkstatus) {
                  case 0:
                    {
                      this.$bvToast.toast(
                        `${this.details.productdesc} updated`,
                        {
                          title: this.$gettext('Success'),
                          variant: 'success',
                          solid: true,
                        }
                      );

                      let log = {
                        activity: `${
                          this.details.gsflag === 7 ? 'product' : 'service'
                        } updated: ${this.details.productdesc}`,
                      };
                      axios.post('/log', log);

                      this.loading = false;
                      this.updateTaxDetails().then(() => {
                        this.getDetails();
                      });
                    }
                    break;
                  case 2:
                    this.$bvToast.toast(this.$gettext(`Unauthorised access`), {
                      title: this.$gettext('Failure'),
                      variant: 'danger',
                      solid: true,
                    });
                    break;
                  default:
                    console.log('product update status ', res.data.gkstatus);
                }
              })
              .catch((e) => {
                console.log('update details ', e.message);
              });
          }
        });
    },
    /** Update the Tax Details (Add, edit & Delete) */
    updateTaxDetails() {
      const self = this;
      const updateTaxItem = function(item) {
        const tax = Object.assign({ productcode: self.name.productcode }, item);
        let request;
        if (item.taxid === undefined) {
          if (parseFloat(item.taxrate) > 0) {
            // create a new tax entry, or newly added tax items
            request = axios.post('/tax', tax);
          }
        } else {
          if (
            !self.options.taxIdMap[item.taxid] ||
            parseFloat(item.taxrate) === 0
          ) {
            // delete items that were deleted as an update or equal to 0
            request = axios.delete('/tax', {
              data: {
                taxid: item.taxid,
              },
            });
          } else {
            // update existing tax items
            request = axios.put('/tax', tax);
          }
        }
        return request;
      };
      let updates = [];
      for (const name in this.tax) {
        if (name === 'vat') {
          this.tax[name].forEach(function(item) {
            updates.push(updateTaxItem(item));
          });
        } else {
          updates.push(updateTaxItem(this.tax[name]));
        }
      }
      return Promise.all(updates).then(() => true);
    },
    /** Add a new VAT entry to the VAT list */
    addVatEntry() {
      this.tax.vat.push({
        taxname: 'VAT',
        taxrate: '0.00',
        state: null,
      });
    },
    /** Remove VAT entry from the VAT list, from the given position */
    removeVatEntry(index) {
      this.tax.vat.splice(index, 1);
    },
    /**
     * Delete selected product
     */
    delProfile() {
      this.$bvModal
        .msgBoxConfirm(`Delete ${this.details.productdesc} ?`, {
          centered: true,
          variant: 'danger',
          size: 'lg',
        })
        .then((val) => {
          if (val == true) {
            this.isLoading = true;
            const config = {
              headers: {
                gktoken: this.authToken,
              },
              data: {
                productcode: this.details.productcode,
              },
            };
            axios
              .delete('/products', config)
              .then((res) => {
                switch (res.data.gkstatus) {
                  case 0:
                    {
                      // Add delete log to server
                      const payload = {
                        activity: `${this.details.productdesc} ${
                          this.details.gsflag == 7 ? 'product' : 'service'
                        } deleted`,
                      };
                      axios.post(`${this.gkCoreUrl}/log`, payload, config);
                      this.$bvToast.toast(
                        `${this.details.productdesc} deleted`,
                        {
                          title: 'Success',
                          solid: true,
                          variant: 'success',
                        }
                      );
                      this.isLoading = false;
                      document.querySelector('#prod').innerHTML = '';
                    }
                    break;
                  case 3:
                    this.$bvToast.toast(
                      `${this.details.productdesc} Cannot be deleted`,
                      {
                        title: '',
                        solid: true,
                        variant: 'danger',
                      }
                    );
                    break;
                  case 4:
                    this.$bvToast.toast(
                      `Cannot delete ${this.details.productdesc}`,
                      {
                        title: this.$gettext('Bad Privilige'),
                        solid: true,
                        variant: 'danger',
                      }
                    );
                    break;
                  case 5:
                    this.$bvToast.toast(
                      `Cannot delete ${this.details.productdesc}`,
                      {
                        title: this.$gettext('Action Disallowed'),
                        solid: true,
                        variant: 'danger',
                      }
                    );
                    break;
                }
              })
              .catch((e) => {
                console.log('delete err ', e);
              });
          }
        });
    },
    /*
     * Fetch godown details for selected product
     */
    getGodowns() {
      return axios
        .get(`/products?by=godown&productcode=${this.details.productcode}`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.godowns = res.data.gkresult.map((godown) => {
            return {
              id: godown.goid,
              value: godown.goopeningstock,
            };
          });
          this.oldGodowns = this.godowns.slice();
          if (!this.godowns.length) {
            this.addGodown();
          }
          console.log('godown details fetched');
        })
        .catch((e) => {
          console.log('godown fetch error ', e);
        });
    },
    /** Fetch tax details for selected product */
    getTaxDetails() {
      return axios
        .get(
          `${this.gkCoreUrl}/tax?pscflag=p&productcode=${this.name.productcode}`,
          {
            headers: {
              gktoken: this.authToken,
            },
          }
        )
        .then((res) => {
          this.options.tax = res.data.gkresult;
          this.options.taxIdMap = {};
          this.options.tax.forEach((item) => {
            this.options.taxIdMap[item.taxid] = true;
            let taxname = item.taxname.toLowerCase();
            if (taxname === 'vat') {
              this.tax.vat.push(item);
            } else {
              this.tax[taxname] = item;
            }
          });
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
      return axios
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
                (uom) => uom.value.name === 'UNT'
              )[0].value;
              // console.log(response.data.gkresult)
              break;
            default:
              this.$bvToast.toast(this.$gettext(`Please try after sometime`), {
                title: this.$gettext(`Error: Fetching Unit of Measurement`),
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              });
          }
        })
        .catch(() => {});
    },
    /**
     * Get state list
     * */
    states() {
      return axios
        .get(`${this.gkCoreUrl}/state`)
        .then((res) => {
          this.options.states = res.data.gkresult.map(
            (item) => Object.values(item)[0]
          );
        })
        .catch((e) => {
          this.$bvToast.toast(e, {
            variant: 'danger',
          });
        });
    },

    onGodownSave() {
      this.showGodownForm = false;
      this.fetchGodownList().then(() => {
        let stockGdnCount = this.godowns.length;
        let godownCount = this.options.godowns.length;
        if (this.godowns[stockGdnCount - 1].id !== null) {
          this.addGodown();
          stockGdnCount++;
        }
        this.godowns[stockGdnCount - 1].id = this.options.godowns[
          godownCount - 1
        ].value;

        this.form.showGodownForm = false;
      });
    },
    addGodown() {
      this.godowns.push({ id: '', value: '' });
    },
    deleteGodown(index) {
      this.godowns.splice(index, 1);
    },
    fetchGodownList() {
      let self = this;
      return axios
        .get('/godown')
        .then((resp) => {
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              // console.log(resp.data.gkresult);
              resp.data.gkresult.sort((a, b) => a.goid - b.goid); // sorting the godown list based on goid, to order it in creation order
              self.options.godowns = resp.data.gkresult.map((item) => {
                return {
                  text: `${item.goname} (${item.goaddr})`,
                  value: parseInt(item.goid),
                };
              });
            } else {
              this.displayToast(
                this.$gettext('Fetch Product Data Failed!'),
                this.$gettext(
                  'Please try again later, if problem persists, contact admin'
                ),
                'danger'
              );
            }
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Godowns Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
  },
  mounted() {
    Promise.all([this.getUOM(), this.states(), this.fetchGodownList()]).then(
      () => {
        this.$forceUpdate();
        this.getDetails();
      }
    );
  },
  created() {
    if (window.screen.width > 600) {
      this.isCollapsed1 = true;
      this.isCollapsed2 = true;
      this.isCollapsed3 = true;
      this.isCollapsed4 = true;
    }
    window.addEventListener('resize', () => {
      if (window.screen.width > 600) {
        this.isCollapsed1 = true;
        this.isCollapsed2 = true;
        this.isCollapsed3 = true;
        this.isCollapsed4 = true;
      } else {
        this.isCollapsed1 = false;
        this.isCollapsed2 = false;
        this.isCollapsed3 = false;
        this.isCollapsed4 = false;
      }
    });
  },
};
</script>
