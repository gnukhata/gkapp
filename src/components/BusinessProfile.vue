<template>
  <b-form id="prod" @submit.prevent="updateProfile">
    <b-overlay :show="loading" blur no-wrap></b-overlay>
    <!-- {{ details }} -->
    <!-- {{ godowns }} -->
    <!-- name --->
    <b-card
      class="mb-2"
      header-bg-variant="dark"
      header-text-variant="light"
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
      <b-collapse v-model="isCollapsed1" class="p-3" id="collapse-info">
        <b-form-group label="Name" label-cols="4">
          <b-form-input
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
        >
          <b-form-input
            v-model="details.openingstock"
            type="number"
            no-wheel
          ></b-form-input>
        </b-form-group>
        <!-- UOM -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="Unit of Measure"
          label-cols="4"
        >
          <b-input-group :prepend="details.unitname">
            <b-form-select v-model="details.unitname" :options="options.uom">
            </b-form-select>
          </b-input-group>
        </b-form-group>
        <!-- HSN / SCN Code -->
        <b-form-group
          v-if="details.gsflag == 7"
          label="HSN Code"
          label-cols="4"
        >
          <b-form-input v-model="details.gscode"></b-form-input>
        </b-form-group>
        <b-form-group v-else label="SAC Code" label-cols="4">
          <b-form-input v-model="details.gscode"></b-form-input>
        </b-form-group>
      </b-collapse>
    </b-card>
    <b-card no-body header-bg-variant="dark" header-text-variant="light">
      <template #header>
        <div class="d-flex" v-b-toggle.collapse-price>
          <div class="mr-auto">Price</div>
          <div>
            <b-icon
              :icon="isCollapsed2 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse v-model="isCollapsed2" class="p-3" id="collapse-price">
        <!-- MRP -->
        <b-form-group label="MRP" label-cols="4">
          <b-form-input v-model="details.prodmrp"></b-form-input>
        </b-form-group>
        <!-- Selling Price -->
        <b-form-group id="input-group-2" label="Selling Price" label-cols="4">
          <b-form-input v-model="details.prodsp"></b-form-input>
        </b-form-group>
        <!-- discount -->
        <b-form-group label-cols="4" label="Discount" label-for="input-3">
          <b-input-group prepend="₹">
            <b-form-input v-model="details.discountamount"></b-form-input>
          </b-input-group>
          <b-input-group class="mt-1" prepend="%">
            <b-form-input v-model="details.discountpercent"></b-form-input>
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
          <div class="mr-auto">Taxes</div>
          <div>
            <b-icon
              :icon="isCollapsed3 ? 'dash' : 'arrows-fullscreen'"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-collapse v-model="isCollapsed3" class="p-3" id="collapse-tax">
        <b-form-group label="HSN" label-cols="4">
          <b-input-group>
            <b-form-input
              type="number"
              no-wheel
              required
              v-model="details.gscode"
            ></b-form-input>
          </b-input-group>
        </b-form-group>

        <b-form-group label="GST" label-cols="4">
          <b-input-group append="%">
            <b-form-select v-model="tax.igst.taxrate">
              <b-form-select-option value="0.00">0.00</b-form-select-option>
              <b-form-select-option value="5.00">5.00</b-form-select-option>
              <b-form-select-option value="18.00">18.00</b-form-select-option>
              <b-form-select-option value="28.00">28.00</b-form-select-option>
            </b-form-select>
          </b-input-group>
        </b-form-group>

        <b-form-group label="CESS" label-cols="4">
          <b-input-group append="%">
            <b-form-input
              type="number"
              step="0.01"
              no-wheel
              v-model="tax.cess.taxrate"
            ></b-form-input>
          </b-input-group>
        </b-form-group>

        <b-form-group label="CVAT" label-cols="4">
          <b-input-group append="%">
            <b-form-input
              type="number"
              step="0.01"
              no-wheel
              v-model="tax.cvat.taxrate"
            ></b-form-input>
          </b-input-group>
        </b-form-group>

        <b-form-group label="VAT" label-cols="4">
          <div v-for="(item, index) in tax.vat" :key="index">
            <b-input-group v-if="item.taxname === 'VAT'" class="mb-2">
              <b-form-input
                type="number"
                step="0.01"
                no-wheel
                v-model="item.taxrate"
                :required="!!item.state"
              ></b-form-input>
              <b-input-group-append>
                <b-form-select
                  :options="options.states"
                  v-model="item.state"
                  :style="{ 'border-radius': 0, 'max-width': '200px' }"
                  :required="!!item.taxrate"
                ></b-form-select>
                <b-button @click.prevent="removeVatEntry(index)">-</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <b-button @click.prevent="addVatEntry" class="float-right p-0 px-1"
            >+ VAT</b-button
          >
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- Submit & delete buttons -->
    <div class="mt-4 pb-4 d-flex flex-row-reverse">
      <b-button type="submit" size="sm" class="ml-2" variant="success"
        ><b-icon icon="cloud-arrow-up"></b-icon> Save Changes</b-button
      >
      <b-button
        @click.prevent="delProfile"
        size="sm"
        class="ml-2"
        variant="danger"
        ><b-icon :icon="details.gsflag == 7 ? 'box' : 'headset'"></b-icon>
        Delete {{ details.gsflag == 7 ? 'Product' : 'Service' }}</b-button
      >
    </div>
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
export default {
  name: 'BusinessProfile',
  props: {
    name: Object,
  },
  data() {
    return {
      details: [],
      godowns: [],
      isCollapsed1: false,
      isCollapsed2: false,
      isCollapsed3: false,
      uom: [],
      tax: {
        igst: {},
        cess: {},
        cvat: {},
        vat: [],
      },
      loading: true,
      options: {
        uom: [],
        states: [],
        gstRates: [0, 5, 12, 18, 28],
        cess: 0,
        cvat: 0,
        tax: [],
        taxIdMap: {},
      },
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
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
              this.getTaxDetails();
              this.getGodowns();
              setTimeout(() => {
                this.loading = false;
              }, 500);
              break;
            case 3:
              this.loading = false;
              this.$bvToast.toast('Product does not exist', {
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
              payload['godetails'] = this.godowns;
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
                          title: 'Success',
                          variant: 'success',
                          solid: true,
                        }
                      );

                      let log = {
                        activity: `${
                          this.details.gsflag === 7 ? 'service' : 'product'
                        } updated: ${this.details.productdesc}`,
                      };
                      axios.post('/log', log);

                      this.loading = false;
                      this.updateTaxDetails();
                    }
                    break;
                  case 2:
                    this.$bvToast.toast(`Unauthorised access`, {
                      title: 'Failure',
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
      const updateTaxItem = function (item) {
        const tax = Object.assign({ productcode: self.name.productcode }, item);
        if (item.taxid === undefined) {
          if (parseFloat(item.taxrate) > 0) {
            // create a new tax entry, or newly added tax items
            axios.post('/tax', tax);
          }
        } else {
          if (
            !self.options.taxIdMap[item.taxid] ||
            parseFloat(item.taxrate) === 0
          ) {
            // delete items that were deleted as an update or equal to 0
            axios.delete('/tax', {
              data: {
                taxid: item.taxid,
              },
            });
          } else {
            // update existing tax items
            axios.put('/tax', tax);
          }
        }
      };
      for (const name in this.tax) {
        if (name === 'vat') {
          this.tax[name].forEach(function (item) {
            updateTaxItem(item);
          });
        } else {
          updateTaxItem(this.tax[name]);
        }
      }
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
                        title: 'Bad Privilige',
                        solid: true,
                        variant: 'danger',
                      }
                    );
                    break;
                  case 5:
                    this.$bvToast.toast(
                      `Cannot delete ${this.details.productdesc}`,
                      {
                        title: 'Action Disallowed',
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
      axios
        .get(`/products?by=godown&productcode=${this.details.productcode}`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.godowns = res.data.gkresult;
          console.log('godown details fetched');
        })
        .catch((e) => {
          console.log('godown fetch error ', e);
        });
    },
    /** Fetch tax details for selected product */
    getTaxDetails() {
      axios
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
      axios
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
              this.$bvToast.toast(`Please try after sometime`, {
                title: `Error: Fetching Unit of Measurement`,
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
      axios
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
  },
  mounted() {
    this.getDetails();
    this.getUOM();
    this.states();
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
};
</script>
