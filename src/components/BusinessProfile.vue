<template>
  <b-form
    id="prod"
    @submit.prevent="updateProfile"
  >
    <b-overlay
      :show="loading"
      blur
      no-wrap
    />
    <div class="mt-4 mr-4 clearfix d-print-none">
      <div class="float-right">
        <b-button
          size="sm"
          class="ml-2"
          variant="dark"
          v-if="details.gsflag == 7"
        >
          <b-icon
            class="mr-1"
            icon="box-seam"
          />
          <span>
            <router-link
              class="custom-link"
              :to="
                `/product-register?product_id=${details.productcode}&current_date=${toDate}&goid=${options.godowns[0]?.value}`
              "
            >Product Register
            </router-link></span>
        </b-button>
      </div>
    </div>
    <div>
      <!-- name --->
      <div class="m-4">
        <h5 class="mb-3">
          Basic Details
        </h5>
        <div class="my-2">
          <b-form-group
            label-cols-md="3"
            content-cols-md="9"
            :label="this.$gettext('Name')"
          >
            <b-form-input
              v-model.trim="details.productdesc"
              type="text"
              required
            />
          </b-form-group>
        </div>
      </div>
      <div class="m-4">
        <h5 class="mt-5 mb-3">
          Price
        </h5>
        <div class="my-2">
          <!--  Cost price. only shown for product -->
          <b-form-group
            id="input-group-2"
            :label="$gettext('Cost Price')"
            label-cols-md="3"
            content-cols-md="9"
            v-if="details.gsflag == 7"
          >
            <b-form-input
              v-model="details.prodmrp"
            />
          </b-form-group>
          <!-- Selling Price -->
          <b-form-group
            v-if="details.gsflag == 7"
            id="input-group-2"
            :label="$gettext('Selling Price')"
            label-cols-md="3"
            content-cols-md="9"
          >
            <b-form-input
              v-model="details.prodsp"
            />
          </b-form-group>
          <!-- Taxable Sale Price, Incase of a service -->
          <b-form-group
            v-else
            id="input-group-2"
            :label="$gettext('Taxable Sale Price')"
            label-cols-md="3"
            content-cols-md="9"
          >
            <b-form-input
              v-model="details.prodsp"
            />
          </b-form-group>
          <!-- discount -->
          <b-form-group
            :label="$gettext('Discount')"
            label-for="input-3"
            label-cols-md="3"
            content-cols-md="9"
          >
            <template #label>
              <translate> Discount </translate>
            </template>
            <b-input-group
              prepend="₹"
            >
              <b-form-input
                type="number"
                step="0.01"
                v-model="details.discountamount"
              />
            </b-input-group>
            <b-input-group
              class="mt-1"
              prepend="%"
            >
              <b-form-input
                type="number"
                step="0.01"
                v-model="discountPercentage"
              />
            </b-input-group>
          </b-form-group>
        </div>
      </div>
      <!-- {{ options.tax }} -->
      <div
        v-if="isIndia"
        class="m-4"
      >
        <h5 class="mt-5 mb-3">
          Tax Details
        </h5>
        <div class="my-3">
          <template v-if="isGstEnabled">
            <b-form-group
              :label="details.gsflag == 7 ? 'HSN' : 'SAC'"
              label-cols-md="3"
              content-cols-md="9"
            >
              <!-- hsn /sac input -->
              <gk-hsn
                :required="orgGstin != null"
                v-model="details.gscode"
              />
            </b-form-group>

            <b-form-group
              class="mb-0"
              label="GST"
              label-cols-md="3"
              content-cols-md="9"
            >
              <b-input-group
                append="%"
              >
                <b-form-select
                  :options="gstRates"
                  v-model="tax.gst[0].taxrate"
                  :disabled="multiGstFlag"
                />
              </b-input-group>

              <b-form-checkbox
                v-model="multiGstFlag"
                class="d-inline-block mb-2"
                switch
              >
                <small>
                  <translate>
                    Add GST rates based on date of applicability
                  </translate>
                </small>
              </b-form-checkbox>
            </b-form-group>
            <div class="clearfix" />

            <b-collapse v-model="multiGstFlag">
              <b-card class="mb-4">
                <b-table-lite
                  small
                  class="text-small"
                  tbody-tr-class="gk-vertical-row"
                  :items="tax.gst"
                  :fields="[
                    {key: 'taxrate', label: 'Rate %'},
                    {key: 'taxfromdate', label: 'Applicable From'},
                    {key: 'edit', label: ''},
                  ]"
                >
                  <template #cell(taxrate)="data">
                    <b-form-select
                      id="bi-input-7"
                      v-model="tax.gst[data.index].taxrate"
                      :options="gstRates"
                    />
                  </template>
                  <template #cell(taxfromdate)="data">
                    <gk-date
                      v-model="tax.gst[data.index].taxfromdate"
                      :id="`gst-from-${data.index}`"
                      :input-style="{'max-width': '120px'}"
                      :min="tax.gst[data.index].min"
                      @validity="updateGstDateValidity($event, data.index)"
                      @input="updateGst"
                      :readonly="!data.index"
                    />
                  </template>
                  <template #cell(edit)="data">
                    <b-button
                      variant="secondary"
                      @click.prevent="removeGstEntry(data.index)"
                      :disabled="!data.index"
                    >
                      -
                    </b-button>
                  </template>
                </b-table-lite>
                <b-button
                  size="sm"
                  @click.prevent="addGstEntry"
                  class="px-1 py-0"
                >
                  + GST
                </b-button>
              </b-card>
            </b-collapse>
          </template>

          <b-form-group
            v-if="isVatEnabled"
            label="CVAT"
            label-cols-md="3"
            content-cols-md="9"
          >
            <b-input-group
              append="%"
            >
              <b-form-input
                type="number"
                step="0.01"
                no-wheel
                v-model="tax.cvat.taxrate"
              />
            </b-input-group>
          </b-form-group>

          <b-form-group
            v-if="isVatEnabled"
            label="VAT"
            label-cols-md="3"
            content-cols-md="9"
          >
            <div
              v-for="(item, index) in tax.vat"
              :key="index"
            >
              <b-input-group
                v-if="item.taxname === 'VAT'"
                class="mb-2"
              >
                <b-form-input
                  type="number"
                  step="0.01"
                  no-wheel
                  v-model="item.taxrate"
                  :required="!!item.state"
                />
                <b-input-group-append>
                  <b-form-select
                    :options="options.states"
                    v-model="item.state"
                    :style="{'border-radius': 0, 'max-width': '200px'}"
                    :required="!!item.taxrate"
                  />
                  <b-button
                    size="sm"
                    @click.prevent="removeVatEntry(index)"
                  >
                    -
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </div>
            <b-button
              size="sm"
              @click.prevent="addVatEntry"
              class="px-1 py-0 my-1"
            >
              + VAT
            </b-button>
          </b-form-group>
          <b-alert
            v-if="!isGstEnabled && !isVatEnabled"
            show
            variant="warning"
            class="mt-2"
          >
            Please add a valid GSTIN/TIN in organisation settings to
            enable GST/VAT options
          </b-alert>
        </div>
      </div>
      <!-- opening stock, Only visible for products-->
      <div
        v-if="details.gsflag == 7"
        class="m-4"
      >
        <h5 class="mt-5 mb-3">
          Godownwise Opening Stock
        </h5>
        <div class="my-2">
          <div
            v-for="(godown, index) in godowns"
            :key="index"
            class="mb-2 d-flex"
            :id="'vat-inp-' + index"
          >
            <div class="m-1">
              {{ index + 1 }}.
            </div>
            <!-- godown select -->
            <b-form-select
              style="max-width: 350px"
              v-model="godown.id"
              :options="options.godowns"
              :disabled="isDropdownDisabled(godown.id)"
            >
              <template #first>
                <b-form-select-option
                  value=""
                  disabled
                >
                  <translate> -- Choose a Godown -- </translate>
                </b-form-select-option>
              </template>
            </b-form-select>
            <!-- godown stock quantity -->
            <b-form-input
              class="mx-2"
              v-model="godown.qty"
              type="number"
              no-wheel
              step="0.01"
              placeholder="Stock Qty"
            />
            <!-- godown stock value -->
            <b-form-input
              class="mx-2"
              v-model="godown.rate"
              type="number"
              no-wheel
              step="0.01"
              placeholder="Stock Value (Cost Price x Stock Qty)"
            />
            <!-- delete godown button. only appears when there atleast one active godown -->
            <b-button
              variant="danger"
              size="sm"
              @click.prevent="deleteGodown(index)"
              title="Delete Godown"
              v-if="options.godowns.length < 2 && godowns.length > 1"
            >
              <B-Icon
                icon="trash"
                variant="light"
              />
            </b-button>
          </div>
          <div class="ml-4">
            <!-- add row button -->
            <b-button
              size="sm"
              @click.prevent="addGodown"
              class="mr-2 px-1 py-0"
              v-if="options.godowns.length !== godowns.length"
            >
              <translate> Add Row </translate>
            </b-button>
            <!-- create godown button -->
            <b-button
              class="px-1 py-0 bg-success"
              size="sm"
              @click.prevent="showGodownForm = true"
            >
              <translate> Create Godown </translate>
            </b-button>
          </div>
        </div>
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
          :hide-back-button="true"
          mode="create"
          :in-overlay="true"
          :on-save="onGodownSave"
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
            >
              x
            </b-button>
          </template>
        </godown>
      </b-modal>
    </div>
    <div class="mt-5 mb-4 ml-4">
      <b-button
        type="submit"
        size="sm"
        class="ml-2"
        variant="dark"
      >
        <translate>Save</translate>
      </b-button>
      <b-button
        @click.prevent="delProfile"
        size="sm"
        class="ml-2"
        variant="danger"
      >
        <span
          v-if="details.gsflag == 7"
          v-translate
        >
          Delete Product
        </span>
        <span
          v-else
          v-translate
        >
          Delete Service
        </span>
      </b-button>
    </div>
  </b-form>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import Godown from '../components/form/Godown.vue';
import GkDate from '../components/GkDate.vue';
import GkHsn from './GkHsn.vue';

export default {
  name: 'BusinessProfile',
  components: { Godown, GkDate, GkHsn },
  props: {
    name: Object,
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of Business item, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  data() {
    return {
      toDate: null,
      details: [],
      oldGodowns: [],
      godowns: [],
      showGodownForm: false,
      multiGstFlag: false,
      uom: [],
      tax: {
        cess: {},
        cvat: {},
        vat: [],
        gst: [
          {
            taxrate: 0,
            taxfromdate: null,
          },
        ],
        delGst: [],
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
    gstDateValidity: (self) =>
      self.tax.gst.reduce((acc, gst) => acc && gst.dateValidity, true),
    isProduct: (self) => self.details.gsflag === 7,
    gstRates: (self) => self.$store.getters['global/getGstRates'],
    discountPercentage: {
      get: function () {
        return parseFloat(
          parseFloat(
            this.details.discountamount * 100 / this.details.prodsp
          ).toFixed(2)
        );
      },
      set: function (discount) {
        this.details.discountamount = parseFloat(
          discount * this.details.prodsp / 100
        ).toFixed(2);
      }
    },
    ...mapState(['orgGstin', 'gkCoreUrl', 'authToken', 'yearStart', 'yearEnd']),
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
  },
  methods: {
    isDropdownDisabled(id) {
      let found = this.oldGodowns.some(godown => {
        return godown.id === id;
      });
      return found;
    },
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
        .get(`${this.gkCoreUrl}/product/${this.name.productcode}`, {
          headers: {
            gktoken: this.authToken,
          },
        })
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
            this.isLoading = true;
            const config = {
              headers: {
                gktoken: this.authToken,
              },
            };
            const payload = {
              productdetails: this.details,
              godownflag: false,
            };
            // the table name is different from response key, So changing it back, else fails to insert the updated details
            this.details['percentdiscount'] = this.details.discountpercent;
            this.details['amountdiscount'] = this.details.discountamount;
            delete this.details.discountamount;
            delete this.details.discountpercent;
            // these are not db columns, so rm them
            delete this.details.deletable;
            delete this.details.unitname;

            let hsn = this.details.gscode;

            if (typeof hsn == 'object') {
              hsn = JSON.stringify(hsn);
            }

            if (this.godowns.length > 0) {
              let godowns = {};
              this.godowns.forEach((godown) => {
                if (godown.id) {
                  godowns[godown.id] = {
                    qty: parseFloat(godown.qty) || 0,
                    rate: parseFloat(godown.rate) || 0,
                  };
                }
              });
              payload['godetails'] = godowns;
              payload.godownflag = true;
            }
            axios
              .put(`/product/${this.details.productcode}`, payload, config)
              .then((res) => {
                this.isLoading = false;
                switch (res.data.gkstatus) {
                case 7:
                  res.data?.error.forEach((field_err) => {
                    let location = field_err.loc.join(" at ");
                    let message = (location ? location+": " : "") + field_err.msg;
                    this.displayToast("Validation Error", message, "warning");
                  });
                  break;

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

                    this.onUpdate({
                      type: 'update',
                      data: {
                        productdesc: this.details.productdesc,
                      },
                    });

                    this.isLoading = false;
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
                case 3:
                  this.$bvToast.toast(this.$gettext(`Data Error`), {
                    title: this.$gettext('Failure'),
                    variant: 'danger',
                    solid: true,
                  });
                  break;
                }
              })
              .catch((e) => {
                console.error(e.message);
              })
              .then(() => {
                this.isLoading = false;
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
          if (parseFloat(item.taxrate) > 0 && item.taxfromdate) {
            // create a new tax entry, or newly added tax items
            request = axios.post('/tax', tax);
          }
        } else {
          if (
            !self.options.taxIdMap[item.taxid] ||
            parseFloat(item.taxrate) === 0
          ) {
            // delete items that were deleted as an update or equal to 0
            request = axios.delete(`/tax/${item.taxid}`);
          } else {
            // update existing tax items
            request = axios.put(`/tax/${item.taxid}`, tax);
          }
        }
        return request;
      };
      let updates = [];

      this.tax.gst.sort((a, b) => {
        let aDate = new Date(a.taxfromdate).getTime(),
            bDate = new Date(b.taxfromdate).getTime();
        return aDate - bDate;
      });
      for (const name in this.tax) {
        if (name === 'vat' || name === 'gst' || name === 'delGst') {
          this.tax[name].forEach(function(item) {
            let payload = item;
            payload = {
              state: item.state || '',
              taxfromdate: item.taxfromdate || self.yearStart,
              taxname: item.taxname,
              taxrate: item.taxrate,
            };
            if (item.taxid) {
              payload.taxid = item.taxid;
            }
            // if (name === 'gst' || name === 'delGst') {
            // }
            updates.push(updateTaxItem(payload));
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

    /** Add a new GST entry to the GST list */
    addGstEntry() {
      let gsts = this.tax.gst;
      let min = '';
      if (gsts.length && gsts[gsts.length - 1].taxfromdate) {
        let lastDate = new Date(gsts[gsts.length - 1].taxfromdate);
        let minDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
        min = this.dateReverse(minDate.toISOString().substr(0, 10));
      }
      this.tax.gst.push({
        taxname: 'IGST',
        taxrate: 0,
        taxfromdate: null,
        min: min,
        dateValidity: true,
      });
    },
    /** Remove GST entry from the GST list, from the given position */
    removeGstEntry(index) {
      let deleted = this.tax.gst.splice(index, 1)[0];
      if (deleted && deleted.taxid) {
        let duplicate = this.tax.delGst.find(
          (tax) => tax.taxid === deleted.taxid
        );
        if (!duplicate) {
          deleted.taxrate = 0;
          this.tax.delGst.push(deleted);
        }
      }
    },
    updateGstDateValidity(validity, index) {
      if (index === 0 && validity === null) {
        validity = true;
      }
      this.tax.gst[index].dateValidity = validity;
    },
    updateGst() {
      let prev = null;
      if (this.tax.gst.length) {
        this.tax.gst.forEach((item) => {
          if (prev) {
            let min = '';
            let lastDate = new Date(prev.taxfromdate);
            let minDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
            min = this.dateReverse(minDate.toISOString().substr(0, 10));
            item.min = min;
          } else {
            item.min = this.dateReverse(item.taxfromdate);
          }
          prev = item;
        });
      }
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
              .delete(`/product/${this.details.productcode}`, config)
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
                    this.onUpdate({ type: 'delete' });
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
                    `Cannot delete ${this.details.productdesc} as there are some existing entries in the software.`,
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
                console.error(e);
              });
          }
        });
    },
    /*
     * Fetch godown details for selected product
     */
    getGodowns() {
      return axios
        .get(`/godown/product/${this.details.productcode}`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((res) => {
          this.godowns = res.data.gkresult.map((godown) => {
            return {
              id: godown.goid,
              qty: godown.goopeningstock,
              rate: godown.openingstockvalue,
            };
          });
          this.oldGodowns = this.godowns.slice();
          if (!this.godowns.length) {
            this.addGodown();
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    /** Fetch tax details for selected product */
    getTaxDetails() {
      return axios
        .get(
          `${this.gkCoreUrl}/tax/search/p?productcode=${this.name.productcode}`,
          {
            headers: {
              gktoken: this.authToken,
            },
          }
        )
        .then((res) => {
          this.options.tax = res.data.gkresult;
          this.options.taxIdMap = {};
          this.tax.gst = [];
          this.tax.vat = [];
          this.options.tax.forEach((item) => {
            this.options.taxIdMap[item.taxid] = true;
            let taxname = item.taxname.toLowerCase();
            if (taxname === 'vat') {
              this.tax.vat.push(item);
            } else if (taxname === 'igst') {
              item.taxrate = parseFloat(item.taxrate);
              this.tax.gst.push(item);
            } else {
              this.tax[taxname] = item;
            }
          });
          let prev = null;
          if (this.tax.gst.length) {
            this.tax.gst.sort((a, b) => {
              let aDate = new Date(a.taxfromdate).getTime(),
                  bDate = new Date(b.taxfromdate).getTime();
              return aDate - bDate;
            });
            if (this.tax.gst[0].taxfromdate !== this.yearStart) {
              this.tax.gst.unshift({
                taxrate: 0,
                taxfromdate: this.yearStart,
                min: this.dateReverse(this.yearStart),
                dateValidity: true,
                taxname: 'IGST',
              });
            }
            this.tax.gst.forEach((item) => {
              if (prev) {
                let min = '';
                let lastDate = new Date(prev.taxfromdate);
                let minDate = new Date(
                  lastDate.getTime() + 24 * 60 * 60 * 1000
                );
                min = this.dateReverse(minDate.toISOString().substr(0, 10));
                item.min = min;
              } else {
                item.min = this.dateReverse(item.taxfromdate);
              }
              prev = item;
            });
          } else {
            this.tax.gst.push({
              taxname: 'IGST',
              taxrate: 0,
              taxfromdate: this.yearStart,
              min: this.dateReverse(this.yearStart),
              dateValidity: true,
              // max: this.dateReverse(to),
            });
          }
          this.multiGstFlag = this.tax.gst.length > 1;
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
        .get(`${this.gkCoreUrl}/unitofmeasurement`, config)
        .then((response) => {
          switch (response.data.gkstatus) {
          case 0:
            this.options.uom = response.data.gkresult.map((uom) => {
              return {
                text: `${uom.unitname} (${uom.description})`,
                // value: { id: uom.uomid, name: uom.unitname },
                value: uom.uomid,
              };
            });
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
      this.godowns.push({ id: '', qty: null, rate: null });
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
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
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
    const today = new Date();
    this.toDate = today.toISOString().substring(0, 10);
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

<style scoped>
.custom-link {
  color: white;
  text-decoration: none;
}
</style>
