<template>
  <div>
    <div v-if="config.bill" class="position-relative my-2">
      <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
      </b-overlay>
      <b-table-simple hover small caption-top responsive bordered>
        <b-thead head-variant="dark">
          <!-- table header -->
          <b-tr class="text-center">
            <b-th
              :style="{ maxWidth: '40px', width: '40px' }"
              rowspan="2"
              v-if="config.bill.index"
              >No</b-th
            >
            <b-th
              :style="{
                maxWidth: '300px',
                width: '150px',
                minWidth: '100px',
              }"
              rowspan="2"
              v-if="config.bill.product"
              >Item
              <b-button
                @click.prevent="showBusinessForm = true"
                class="py-0 ml-3"
                variant="success"
                size="sm"
                >+</b-button
              >
            </b-th>
            <b-th
              :style="{ maxWidth: '200px', width: '150px', minWidth: '80px' }"
              rowspan="2"
              v-if="config.bill.hsn"
              >HSN/SAC</b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
              rowspan="2"
              v-if="config.bill.qty"
              >Qty</b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '150px', minWidth: '80px' }"
              rowspan="2"
              v-if="config.bill.rate"
              >Rate</b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
              rowspan="2"
              v-if="config.bill.discount"
              >Discount</b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
              rowspan="2"
              v-if="config.bill.taxable"
              >Taxable Amt</b-th
            >
            <b-th
              :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
              colspan="2"
              v-if="gstFlag && config.bill.igst"
              >IGST</b-th
            >
            <b-th
              :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
              colspan="2"
              v-if="gstFlag && config.bill.cess"
              >CESS</b-th
            >
            <b-th
              :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
              colspan="2"
              v-if="!gstFlag && config.bill.vat"
              >TAX</b-th
            >
            <b-th
              :style="{
                maxWidth: '300px',
                width: '150px',
                minWidth: '100px',
              }"
              rowspan="2"
              v-if="config.bill.total"
              >Total</b-th
            >
            <b-th :style="{ maxWidth: '40px', width: '40px' }" rowspan="2"
              >+/-</b-th
            >
          </b-tr>
          <!-- tax field sub headers -->
          <b-tr class="text-center">
            <b-th
              :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
              v-if="gstFlag && config.bill.igst"
              >%</b-th
            >
            <b-th
              :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
              v-if="gstFlag && config.bill.igst"
              >₹</b-th
            >
            <b-th
              :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
              v-if="gstFlag && config.bill.cess"
              >%</b-th
            >
            <b-th
              :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
              v-if="gstFlag && config.bill.cess"
              >₹</b-th
            >
            <b-th
              :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
              v-if="!gstFlag && config.bill.vat"
              >%</b-th
            >
            <b-th
              :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
              v-if="!gstFlag && config.bill.vat"
              >₹</b-th
            >
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr class="text-center" v-for="(field, index) in form" :key="index">
            <!-- No.  -->
            <b-td v-if="config.bill.index">
              {{ index + 1 }}
            </b-td>

            <!-- Item -->
            <b-td v-if="config.bill.product">
              <autocomplete
                size="sm"
                v-model="field.product"
                :options="options.products"
                @input="onBillItemSelect(field.product, index)"
                valueUid="id"
                :isOptionsShared="true"
                required
                emptyValue=""
              ></autocomplete>
            </b-td>

            <!-- HSN/SAC -->
            <b-td v-if="config.bill.hsn">
              <b>{{ field.hsn }}</b>
            </b-td>

            <!-- Qty -->
            <b-td v-if="config.bill.qty">
              <b-input
                v-model="field.qty"
                class="hide-spin-button text-right"
                type="number"
                no-wheel
                step="0.01"
                min="0.01"
                @input="updateTaxAndTotal(index)"
                :readonly="field.isService"
                :tabindex="field.isService ? -1 : 0"
              ></b-input>
            </b-td>

            <!-- Rate -->
            <b-td v-if="config.bill.rate">
              <b-input
                v-model="field.rate"
                class="hide-spin-button text-right"
                type="number"
                no-wheel
                step="0.01"
                min="0.01"
                @input="updateTaxAndTotal(index)"
              ></b-input>
            </b-td>

            <!-- Discount -->
            <b-td v-if="config.bill.discount">
              <b-input
                v-model="field.discount.amount"
                class="hide-spin-button text-right"
                type="number"
                no-wheel
                step="0.01"
                min="0.00"
                @input="updateTaxAndTotal(index)"
              ></b-input>
            </b-td>

            <!-- Taxable Amt -->
            <b-td v-if="config.bill.taxable">
              {{ field.taxable }}
            </b-td>

            <!-- GST % -->
            <b-td v-if="gstFlag && config.bill.igst">
              {{ field.igst.rate }}
            </b-td>

            <!-- GST $ -->
            <b-td v-if="gstFlag && config.bill.igst">
              {{ field.igst.amount }}
            </b-td>

            <!-- CESS % -->
            <b-td v-if="gstFlag && config.bill.cess">
              {{ field.cess.rate }}
            </b-td>

            <!-- CESS $ -->
            <b-td v-if="gstFlag && config.bill.cess">
              {{ field.cess.amount }}
            </b-td>

            <!-- VAT Tax % -->
            <b-td v-if="!gstFlag && config.bill.vat">
              {{ field.vat.rate }}
            </b-td>

            <!-- VAT Tax $ -->
            <b-td v-if="!gstFlag && config.bill.vat">
              {{ field.vat.amount }}
            </b-td>

            <!-- Total -->
            <b-td v-if="config.bill.total">
              {{ field.total }}
            </b-td>

            <!-- +/- Buttons -->
            <b-td>
              <b-button
                v-if="index < billLength - 1"
                @click.prevent="deleteBillItem(index)"
                size="sm"
                >-</b-button
              >
              <b-button v-else @click.prevent="addBillItem()" size="sm"
                >+</b-button
              >
            </b-td>
          </b-tr>
        </b-tbody>
        <b-tfoot v-if="config.bill.footer">
          <b-tr variant="secondary" class="text-right">
            <b-th :colspan="config.bill.footer.headingColspan"> Total </b-th>
            <b-th v-if="config.bill.discount">
              <span v-if="config.bill.footer.discount"
                >₹ {{ getTotal('discount', 'amount') }}</span
              >
            </b-th>
            <b-th v-if="config.bill.taxable">
              <span v-if="config.bill.footer.taxable"
                >₹ {{ getTotal('taxable') }}</span
              >
            </b-th>
            <b-th colspan="2" v-if="gstFlag && config.bill.igst">
              <span v-if="config.bill.footer.igst"
                >₹ {{ getTotal('igst', 'amount') }}</span
              ></b-th
            >
            <b-th colspan="2" v-if="gstFlag && config.bill.cess">
              <span v-if="config.bill.footer.cess"
                >₹ {{ getTotal('cess', 'amount') }}</span
              ></b-th
            >
            <b-th colspan="2" v-if="!gstFlag && config.bill.vat"
              >₹
              <span v-if="config.bill.footer.vat">{{
                getTotal('vat', 'amount')
              }}</span>
            </b-th>
            <b-th v-if="config.bill.total">
              <span v-if="config.bill.footer.total"
                >₹ {{ getTotal('total') }}</span
              >
            </b-th>
            <b-th></b-th>
          </b-tr>
        </b-tfoot>
      </b-table-simple>
    </div>

    <!-- Create Business Modal -->
    <b-modal
      size="xl"
      v-model="showBusinessForm"
      v-if="config"
      centered
      static
      body-class="p-0"
      id="business-item-modal"
      hide-footer
      hide-header
    >
      <business-item
        :hideBackButton="true"
        :onSave="onBusinessSave"
        mode="create"
        :inOverlay="true"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click.prevent="
              () => {
                showBusinessForm = false;
              }
            "
            >x</b-button
          >
        </template>
      </business-item>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../../Autocomplete.vue';
import BusinessItem from '../BusinessItem.vue';

import { numberToRupees } from '../../../js/utils';
export default {
  name: 'BillTable',
  components: {
    Autocomplete,
    BusinessItem,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
    gstFlag: {
      type: Boolean,
      required: true,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0
    }
  },
  computed: {
    billLength: (self) => self.form.length,
  },
  watch: {},
  data() {
    return {
      showBusinessForm: false,
      isPreloading: false,
      form: [
        {
          product: { name: '', id: '' },
          hsn: '',
          qty: 0,
          fqty: 0,
          rate: 0,
          discount: { rate: 0, amount: 0 },
          taxable: 0,
          igst: { rate: 0, amount: 0 },
          cess: { rate: 0, amount: 0 },
          vat: { rate: 0, amount: 0 },
          total: 0,
          isService: false, // used to make certain fields readonly
        },
      ],
      options: {
        products: [],
      },
    };
  },
  methods: {
    /**
     * fetchProductDetails(id, index)
     *
     * Description: Fetches product details like price, discount and taxes,
     * when a product is selected in the bill area
     */
    fetchProductDetails(id, index) {
      let self = this;
      const requests = [
        axios.get(`/products?qty=single&productcode=${id}`).catch((error) => {
          return error;
        }),
        axios.get(`/tax?pscflag=p&productcode=${id}`).catch((error) => {
          return error;
        }),
      ];
      return Promise.all([...requests]).then(([resp1, resp2]) => {
        self.isLoading = false;
        // Product Data
        if (resp1.status === 200) {
          if (resp1.data.gkstatus === 0) {
            let data = resp1.data.gkresult;
            if (!self.editFlag) {
              Object.assign(self.form[index], {
                hsn: data.gscode,
                isService: data.gsflag === 19,
                rate: data.prodmrp,
                qty: 0,
                discount: {
                  rate: data.discountpercent,
                  amount: self.config.bill.discount ? data.discountamount : 0,
                },
              });
            } else {
              self.editFlag--;
            }
          }
        } else {
          console.log(resp1.message);
        }

        // Tax details
        if (resp2.status === 200) {
          if (resp2.data.gkstatus === 0) {
            let data = resp2.data.gkresult,
              tax = {
                igst: { rate: 0, amount: 0 },
                cess: { rate: 0, amount: 0 },
                vat: { rate: 0, amount: 0 },
              },
              igst = self.config.bill.igst
                ? data.filter((item) => item.taxname === 'IGST')
                : 0,
              cess = self.config.bill.cess
                ? data.filter((item) => item.taxname === 'CESS')
                : 0,
              vat = self.config.bill.vat
                ? data.filter((item) => item.taxname === 'CVAT')
                : 0;

            if (igst.length) {
              tax['igst'] = {
                rate: igst[0].taxrate,
                amount: 0,
              };
            }
            if (cess.length) {
              tax['cess'] = {
                rate: cess[0].taxrate,
                amount: 0,
              };
            }
            if (vat.length) {
              tax['vat'] = {
                rate: vat[0].taxrate,
                amount: 0,
              };
            }
            Object.assign(self.form[index], tax);
          }
        } else {
          console.log(resp2.message);
        }

        self.updateTaxAndTotal(index);
      });
    },
    onBillItemSelect(item, index) {
      if (item) {
        if (item.id) {
          if (this.form[index].pid !== item.id) {
            this.form[index].pid = item.id;
            const self = this;
            this.fetchProductDetails(item.id, index).then(() => {
              setTimeout(() => self.$emit('details-updated', self.form));
            });
          }
        }
      }
    },
    onBusinessSave() {
      this.showBusinessForm = false;
      let self = this;
      this.fetchBusinessList().then(() => {
        let billCount = self.form.length;
        let productCount = self.options.products.length;
        if (self.form[billCount - 1].product.id !== null) {
          self.addBillItem();
          billCount++;
        }
        setTimeout(() => {
          self.form[billCount - 1].product =
            self.options.products[productCount - 1].value;
          self.fetchProductDetails(
            self.options.products[productCount - 1].id,
            productCount - 1
          );
          self.$forceUpdate();
        }, 100);
      });
    },
    /**
     * getTotal(key)
     *
     * returns the total sum of the given key for all items in bill
     */
    getTotal(key, subKey) {
      let total = 0;
      if (subKey) {
        total = this.form.reduce(
          (acc, curr) => parseFloat(acc) + parseFloat(curr[key][subKey]),
          0
        );
      } else {
        total = this.form.reduce(
          (acc, curr) => parseFloat(acc) + parseFloat(curr[key]),
          0
        );
      }
      return total.toFixed(2);
    },
    addBillItem() {
      this.form.push({
        product: { id: '', name: '' },
        hsn: '',
        qty: 0,
        fqty: 0,
        rate: 0,
        discount: { rate: 0, amount: 0 },
        taxable: 0,
        igst: { rate: 0, amount: 0 },
        cess: { rate: 0, amount: 0 },
        vat: { rate: 0, amount: 0 },
        total: 0,
        pid: null,
      });
    },
    deleteBillItem(index) {
      this.form.splice(index, 1);
    },
    /**
     * updateTaxAndTotal(index)
     *
     * Params:
     * index - Bill item index to update
     *
     * Description:
     * Calculates the taxable amt, GST, CESS, VAT and Total Price for a bill item
     * Invoke it while updating qty, rate and discount fields
     *
     */
    updateTaxAndTotal(index) {
      let item = this.form[index];
      if (item) {
        if (item.rate > 0) {
          if (item.isService) {
            item.taxable = parseFloat(
              (item.rate - item.discount.amount).toFixed(2)
            );
          } else {
            item.taxable = parseFloat(
              (item.rate * item.qty - item.discount.amount).toFixed(2)
            );
          }

          if (this.form.taxType === 'gst') {
            if (item.igst.rate > 0) {
              item.igst.amount = parseFloat(
                (item.taxable * (item.igst.rate * 0.01)).toFixed(2)
              );
            }
            if (item.cess.rate > 0) {
              item.cess.amount = parseFloat(
                (item.taxable * (item.cess.rate * 0.01)).toFixed(2)
              );
            }

            item.total = (
              item.taxable +
              item.igst.amount +
              item.cess.amount
            ).toFixed(2);
          } else {
            if (item.vat.rate > 0) {
              item.vat.amount = item.taxable * (item.vat.rate * 0.01);
            }
            item.total = (item.taxable + item.vat.amount).toFixed(2);
          }
        } else {
          item.taxable = (0).toFixed(2);
          item.total = (0).toFixed(2);
        }
      }
      setTimeout(() => this.$emit('details-updated', this.form));
    },
    fetchBusinessList() {
      let self = this;
      this.isPreloading = true;
      return axios
        .get('/products')
        .then((resp) => {
          self.isPreloading = false;
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              resp.data.gkresult.sort((a, b) => a.productcode - b.productcode);
              self.options.products = resp.data.gkresult.map((item) => {
                return {
                  text: item.productdesc,
                  value: {
                    id: item.productcode,
                    name: item.productdesc,
                  },
                };
              });
            } else {
              this.displayToast(
                'Fetch Product Data Failed!',
                'Please try again later, if problem persists, contact admin',
                'danger'
              );
            }
          }
        })
        .catch((error) => {
          self.isPreloading = false;
          this.displayToast(
            'Fetch Product Data Failed!',
            error.message,
            'danger'
          );
          return error;
        });
    },
  },
  mounted() {
    const self = this;
    this.fetchBusinessList().then(() => {
      setTimeout(() => self.$emit('details-updated', self.form));
    });
  },
};
</script>