<template>
  <div>
    <div v-if="config" class="position-relative my-2">
      <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
      </b-overlay>
      <b-table-simple
        v-if="false"
        hover
        small
        caption-top
        :responsive="isResponsive"
        bordered
      >
        <b-thead head-variant="dark">
          <!-- table header -->
          <b-tr class="text-center">
            <b-th
              :style="{ maxWidth: '40px', width: '40px' }"
              v-if="config.index"
              class="d-none d-sm-table-cell"
              >No</b-th
            >
            <b-th
              :style="{
                maxWidth: '300px',
                width: '150px',
                minWidth: '91px',
              }"
              v-if="config.product"
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
              :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
              v-if="config.qty"
              >Qty</b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
              v-if="config.rejectedQty"
              >Rejected Qty</b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
              v-if="config.packageCount"
              >No. of Packages</b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '150px', minWidth: '70px' }"
              v-if="config.rate"
              >Rate <small>₹</small></b-th
            >
            <b-th
              :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
              v-if="gstFlag && config.igst"
              class="d-none d-sm-table-cell"
              >IGST <small>%</small></b-th
            >
            <b-th
              :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
              v-if="config.cess"
              class="d-none d-sm-table-cell"
              >CESS <small>%</small></b-th
            >
            <b-th
              :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
              v-if="!gstFlag && config.vat"
              class="d-none d-sm-table-cell"
              >TAX <small>%</small></b-th
            >
            <b-th
              :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
              v-if="config.discount"
              ><span class="d-none d-sm-inline">Discount</span
              ><span class="d-inline d-sm-none">Dis.</span>
              <small>₹</small></b-th
            >
            <b-th
              :style="{
                maxWidth: '300px',
                width: '150px',
                minWidth: '89px',
              }"
              v-if="config.total"
              >Total <small>₹</small></b-th
            >
            <b-th
              v-if="config.addBtn"
              :style="{ maxWidth: '40px', width: '40px' }"
              >+/-</b-th
            >
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr class="text-center" v-for="(field, index) in form" :key="index">
            <!-- No.  -->
            <b-td v-if="config.index" class="d-none d-sm-table-cell">
              {{ index + 1 }}
            </b-td>

            <!-- Item -->
            <b-td v-if="config.product">
              <autocomplete
                size="sm"
                v-model="field.product"
                :options="options.products"
                @input="onBillItemSelect(field.product, index)"
                valueUid="id"
                :isOptionsShared="true"
                required
                emptyValue=""
                :readonly="disabled.product"
              ></autocomplete>
            </b-td>

            <!-- Qty -->
            <b-td v-if="config.qty">
              <b-input
                size="sm"
                v-model="field.qty"
                class="hide-spin-button text-right px-1"
                type="number"
                no-wheel
                step="0.01"
                min="0.01"
                @input="updateTaxAndTotal(index)"
                :readonly="field.isService || disabled.qty"
                :tabindex="field.isService ? -1 : 0"
              ></b-input>
            </b-td>

            <!-- Rejected Qty -->
            <b-td v-if="config.rejectedQty">
              <b-input
                size="sm"
                v-model="field.rejectedQty"
                class="hide-spin-button text-right px-1"
                type="number"
                no-wheel
                step="0.01"
                min="0"
                :max="field.qty"
                @input="updateTaxAndTotal(index)"
              ></b-input>
            </b-td>

            <!-- No. of Packages -->
            <b-td v-if="config.packageCount">
              <b-input
                size="sm"
                v-model="field.packageCount"
                class="hide-spin-button text-right px-1"
                type="number"
                no-wheel
                step="0.01"
                min="0.01"
                :readonly="field.isService"
                :tabindex="field.isService ? -1 : 0"
              ></b-input>
            </b-td>

            <!-- Rate -->
            <b-td v-if="config.rate">
              <b-input
                v-model="field.rate"
                size="sm"
                class="hide-spin-button text-right px-1"
                type="number"
                no-wheel
                step="0.01"
                min="0.01"
                @input="updateTaxAndTotal(index)"
                :readonly="disabled.rate"
              ></b-input>
            </b-td>

            <!-- GST % -->
            <b-td v-if="gstFlag && config.igst" class="d-none d-sm-table-cell">
              {{ field.igst.rate }}
            </b-td>

            <!-- CESS % -->
            <b-td v-if="config.cess" class="d-none d-sm-table-cell">
              {{ field.cess.rate }}
            </b-td>

            <!-- VAT Tax % -->
            <b-td v-if="!gstFlag && config.vat" class="d-none d-sm-table-cell">
              {{ field.vat.rate }}
            </b-td>

            <!-- Discount -->
            <b-td v-if="config.discount">
              <b-input
                size="sm"
                v-model="field.discount.amount"
                class="hide-spin-button text-right px-1"
                type="number"
                no-wheel
                step="0.01"
                min="0.00"
                @input="updateTaxAndTotal(index)"
                :readonly="disabled.discount"
              ></b-input>
            </b-td>

            <!-- Total -->
            <b-td v-if="config.total">
              {{ field.total }}
            </b-td>

            <!-- +/- Buttons -->
            <b-td v-if="config.addBtn">
              <b-button @click.prevent="deleteBillItem(index)" size="sm"
                >-</b-button
              >
            </b-td>
          </b-tr>
        </b-tbody>
        <b-tfoot v-if="config.footer">
          <b-tr variant="secondary" class="text-right">
            <b-th :colspan="config.footer.headingColspan">
              {{ showTotalFooterText ? 'Total' : '' }}
            </b-th>
            <b-th v-if="config.discount">
              <span v-if="config.footer.discount">{{
                getTotal('discount', 'amount')
              }}</span>
            </b-th>
            <b-th v-if="config.total">
              <span v-if="config.footer.total">{{ getTotal('total') }}</span>
            </b-th>
            <b-th class="text-center" v-if="config.addBtn">
              <b-button @click.prevent="addBillItem()" size="sm">+</b-button>
            </b-th>
          </b-tr>
        </b-tfoot>
      </b-table-simple>
      <b-card body-class="py-2 px-2" v-if="showAddProduct || config.addBtn">
        <b-button
          v-if="showAddProduct"
          @click.prevent="showBusinessForm = true"
          class="py-0 mr-1"
          variant="success"
          size="sm"
          >+ Item</b-button
        >
        <b-button
          v-if="config.addBtn"
          @click.prevent="addBillItem()"
          class="py-0 ml-1"
          variant="success"
          size="sm"
          >+ Row</b-button
        >
      </b-card>
      <b-table
        v-if="true"
        hover
        small
        caption-top
        bordered
        striped
        :items="form"
        :fields="fields"
        :primary-key="`tbl_${Date.now()}`"
        :foot-clone="true"
        stacked="sm"
        :per-page="mobileMode ? 1 : 10"
        :current-page="currentPage"
        head-variant="dark"
        tbody-tr-class="text-center"
        thead-tr-class="text-center"
      >
        <!-- Index -->
        <template #cell(index)="data">
          {{ data.value + 1 }}
        </template>

        <!-- Row Selected -->
        <template #head(rowSelected)>
          <b-form-checkbox
            @input="selectAllRows"
            v-model="allRowsSelected"
          ></b-form-checkbox>
        </template>
        <template #cell(rowSelected)="data">
          <b-form-checkbox
            @input="callRowSelected(data.item.index)"
            v-model="form[data.item.index].rowSelected"
          ></b-form-checkbox>
        </template>

        <!-- Product -->
        <template #head(product)="data">
          <span>{{ data.label }}</span>
        </template>
        <template #cell(product)="data">
          <autocomplete
            v-if="!disabled.product"
            size="sm"
            v-model="form[data.item.index].product"
            :options="options.products"
            @input="
              onBillItemSelect(form[data.item.index].product, data.item.index)
            "
            valueUid="id"
            :isOptionsShared="true"
            required
            emptyValue=""
            :readonly="disabled.product"
          ></autocomplete>
          <span v-else>{{ data.value.name }}</span>
        </template>

        <!-- Qty -->
        <template #cell(qty)="data">
          <b-input
            v-if="!disabled.qty"
            size="sm"
            v-model="data.value"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.01"
            @input="updateTaxAndTotal(data.item.index)"
            :readonly="data.item.isService || disabled.qty"
            :tabindex="data.item.isService ? -1 : 0"
          ></b-input>
          <span v-else>{{ data.value }}</span>
        </template>

        <!-- Package Count (Purchase Sales Order) -->
        <template #cell(packageCount)="data">
          <b-input
            v-if="!disabled.packageCount"
            size="sm"
            v-model="data.value"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.01"
            :readonly="data.item.isService"
            :tabindex="data.item.isService ? -1 : 0"
          ></b-input>
          <span v-else>{{ data.value }}</span>
        </template>

        <!-- Rejected Qty (Rejection Note) -->
        <template #cell(rejectedQty)="data">
          <b-input
            v-if="!disabled.rejectedQty"
            size="sm"
            v-model="form[data.item.index].rejectedQty"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0"
            :max="data.item.qty"
            @input="onRejectedQty(data.item.index)"
          ></b-input>
          <span v-else>{{ form[data.item.index].rejectedQty }}</span>
        </template>

        <!-- Debit Credit Value (Debit Credit Note) -->
        <template #head(dcValue)="">
          {{ creditFlag ? 'Credited Value' : 'Debited Value' }}
        </template>
        <template #cell(dcValue)="data">
          <b-input
            v-if="!disabled.dcValue"
            size="sm"
            v-model="form[data.item.index].dcValue"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0"
            :max="data.item.qty * data.item.rate"
            @input="updateTaxAndTotal(data.item.index)"
          ></b-input>
          <span v-else>{{ form[data.item.index].dcValue }}</span>
        </template>

        <!-- Rate -->
        <template #cell(rate)="data">
          <b-input
            v-if="!disabled.rate"
            v-model="data.value"
            size="sm"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.01"
            @input="updateTaxAndTotal(data.item.index)"
            :readonly="disabled.rate"
          ></b-input>
          <span v-else>{{ data.value }}</span>
        </template>

        <!-- CGST -->
        <template #cell(cgst)="data">
          {{ data.value.rate }}
        </template>

        <!-- SGST -->
        <template #cell(sgst)="data">
          {{ data.value.rate }}
        </template>

        <!-- IGST -->
        <template #cell(igst)="data">
          {{ data.value.rate }}
        </template>

        <!-- CESS -->
        <template #cell(cess)="data">
          {{ data.value.rate }}
        </template>

        <!-- VAT -->
        <template #cell(vat)="data">
          {{ data.value.rate }}
        </template>

        <!-- Discount -->
        <template #cell(discount)="data">
          <b-input
            v-if="!disabled.discount"
            size="sm"
            v-model="data.value.amount"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.00"
            @input="updateTaxAndTotal(data.item.index)"
            :readonly="disabled.discount"
          ></b-input>
          <span v-else>{{ data.value.amount }}</span>
        </template>

        <template #foot(discount)="">
          <div class="text-right" v-if="config.footer.discount">
            {{ getTotal('discount', 'amount') }}
          </div>
        </template>

        <!-- Total -->
        <template #cell(total)="data">
          {{ data.value }}
        </template>

        <template v-if="config.footer.total" #foot(total)="">
          <div class="text-right">{{ getTotal('total') }}</div>
        </template>

        <!-- +/- Buttons -->
        <template #cell(addBtn)="data">
          <b-button @click.prevent="deleteBillItem(data.item.index)" size="sm"
            >-</b-button
          >
        </template>

        <!-- Default fall-back custom formatted footer cell -->
        <template #foot()="">
          {{ '' }}
        </template>
      </b-table>
      <b-pagination
        v-if="mobileMode || form.length > 10"
        v-model="currentPage"
        :per-page="mobileMode ? 1 : 10"
        :total-rows="form.length"
        align="fill"
        size="sm"
        class="my-0"
      ></b-pagination>
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
      default: 0,
    },
    onRowSelected: {
      type: Function,
      required: false,
      note: 'Used for applying row select callbacks',
      default: function () {},
    },
    cgstFlag: {
      type: Boolean,
      required: false,
      default: false
    },
    parentData: {
      type: Array,
      required: false,
      default: function () {
        return [
          {
            product: { name: '', id: '' },
            hsn: '',
            qty: 0,
            fqty: 0,
            packageCount: 0,
            rate: 0,
            discount: { rate: 0, amount: 0 },
            taxable: 0,
            igst: { rate: 0, amount: 0 },
            cess: { rate: 0, amount: 0 },
            vat: { rate: 0, amount: 0 },
            total: 0,
            isService: false, // used to make certain fields readonly
          },
        ];
      },
    },
  },
  data() {
    return {
      showBusinessForm: false,
      isPreloading: false,
      editCounter: 0,
      mobileMode: false,
      currentPage: 1,
      allRowsSelected: false,
      skipAllRowSelect: false,
      // fields: [],
      form: [
        {
          index: 0,
          product: { name: '', id: '' },
          hsn: '',
          qty: 0,
          fqty: 0,
          packageCount: 0,
          rejectedQty: 0,
          dcValue: 0,
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
  computed: {
    fields: (self) => {
      let data = [
        { key: 'index', label: 'No' },
        { key: 'rowSelected', label: '\u2611' },
        { key: 'product', label: 'Item' },
        { key: 'qty', label: 'Qty' },
        { key: 'packageCount', label: 'No. of Packages' },
        { key: 'rejectedQty', label: 'Rejected Qty' },
        { key: 'dcValue', label: 'Value' },
        { key: 'rate', label: 'Rate ₹', tdClass: 'text-right' },
        { key: 'discount', label: 'Discount ₹', tdClass: 'text-right' },
        { key: 'vat', label: 'VAT %' },
        { key: 'cgst', label: 'CGST %' },
        { key: 'sgst', label: 'SGST %' },
        { key: 'igst', label: 'IGST %' },
        { key: 'cess', label: 'CESS %' },
        { key: 'total', label: 'Total ₹', tdClass: 'text-right' },
        { key: 'addBtn', label: '+/-' },
      ];
      if (self.gstFlag) {
        data.splice(9, 1); // remove vat
        if(self.cgstFlag) {
          data.splice(11, 1); // remove igst
        } else {
          data.splice(9, 2); // remove cgst, sgst
        }
      } else {
        data.splice(10, 4); // remove igst, cgst, sgst and cess
      }
      if (!self.config.addBtn) {
        data.pop();
      }
      let fields = [];
      data.forEach((field) => {
        if (self.config[field.key]) {
          fields.push(field);
        }
      });
      return fields;
    },
    disabled: (self) => {
      let disabled = {};
      for (const item in self.config) {
        if (typeof self.config[item] === 'object') {
          disabled[item] = !!self.config[item].disabled;
        } else {
          disabled[item] = false;
        }
      }
      return disabled;
    },
    showAddProduct: (self) => {
      if (self.config.product) {
        if (typeof self.config.product === 'object') {
          return !!self.config.product.addBtn;
        }
      }
      return true; // by default show addProductBtn
    },
    creditFlag: (self) => self.form.drcrFlag === 'credit', // used by debit credit note
  },
  watch: {
    updateCounter() {
      let updateBillTable = !(
        this.parentData.length &&
        typeof this.parentData[0].product === 'object' &&
        !this.parentData[0].product.name
      );
      if (!updateBillTable) {
        this.form = [];
        this.addBillItem();
        return;
      }

      this.isPreloading = true;
      this.editCounter = 0;
      const self = this;
      this.form = [];
      let products = [];
      this.parentData.forEach((item) => {
        let product = self.options.products.find(
          (p) => p.text === item.product
        );
        if (product) {
          self.editCounter++;
          self.addBillItem();
          products.push({
            pid: product.value.id,
            product: product.value,
            discount: item.discount,
            qty: item.qty,
            fqty: item.fqty,
            rate: item.rate,
            isService: item.isService,
          });
        }
      });
      setTimeout(() => {
        if (products.length) {
          products.forEach((product, index) => {
            Object.assign(self.form[index], product);
            self.fetchProductDetails(self.form[index].product.id, index);
          });
        }
        // self.$forceUpdate();
        self.isPreloading = false;
      }, 500);
    },
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
            if (!self.editCounter) {
              Object.assign(self.form[index], {
                hsn: data.gscode,
                isService: data.gsflag === 19,
                rate: data.prodmrp,
                qty: 1,
                discount: {
                  rate: data.discountpercent,
                  amount: self.config.discount ? data.discountamount : 0,
                },
              });
            } else {
              self.editCounter--;
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
                cgst: { rate: 0, amount: 0 },
                sgst: { rate: 0, amount: 0 },
                cess: { rate: 0, amount: 0 },
                vat: { rate: 0, amount: 0 },
              },
              igst = self.config.igst
                ? data.filter((item) => item.taxname === 'IGST')
                : 0,
              cgst = self.config.igst
                ? data.filter((item) => item.taxname === 'CGST')
                : 0,
              cess = self.config.cess
                ? data.filter((item) => item.taxname === 'CESS')
                : 0,
              vat = self.config.vat
                ? data.filter((item) => item.taxname === 'CVAT')
                : 0;

            if (igst.length) {
              tax['igst'] = {
                rate: igst[0].taxrate,
                amount: 0,
              };
              tax['cgst'] = {
                rate: igst[0].taxrate/2,
                amount: 0,
              };
              tax['sgst'] = {
                rate: igst[0].taxrate/2,
                amount: 0,
              };
            }
            if (cgst.length) {
              tax['cgst'] = {
                rate: cgst[0].taxrate,
                amount: 0,
              };
              tax['sgst'] = {
                rate: cgst[0].taxrate,
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
              self.onUpdateDetails();
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
        index: this.form.length,
        rowSelected: false,
        product: { id: '', name: '' },
        hsn: '',
        qty: 0,
        packageCount: 0,
        rejectedQty: 0,
        dcValue: 0,
        fqty: 0,
        rate: 0,
        discount: { rate: 0, amount: 0 },
        taxable: 0,
        cgst: { rate: 0, amount: 0 },
        sgst: { rate: 0, amount: 0 },
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
          let qty = item.qty;
          if (this.config.rejectedQty) {
            qty = item.rejectedQty;
          }
          // if (item.isService) {
          //   item.taxable = parseFloat(
          //     (item.rate - item.discount.amount).toFixed(2)
          //   );
          // } else {
          //   }
          item.taxable = parseFloat(
            (item.rate * qty - item.discount.amount * qty).toFixed(2)
          );

          if (this.gstFlag) {
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
      this.onUpdateDetails();
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
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', { data: this.form, name: 'bill-table' })
      );
    },
    /**
     * onRejectedQty
     *
     * input event callback for rejectedQty field
     */
    onRejectedQty(index) {
      const row = this.form[index];
      if (!row.rejectedQty && row.rowSelected) {
        row.rowSelected = false;
      }
      this.updateTaxAndTotal(index);
      this.onUpdateDetails();
    },
    /**
     * callRowSelected
     *
     * Calls the rowSelected callback and the emits details-updated event
     */
    callRowSelected(rowIndex) {
      // deselect allRowsSelected when the current row is unselected
      if (!this.form[rowIndex].rowSelected && this.allRowsSelected) {
        this.allRowsSelected = false;
        this.skipAllRowSelect = true;
      }
      this.onRowSelected(rowIndex, this.form);
      this.updateTaxAndTotal(rowIndex);
      this.onUpdateDetails();
    },
    /**
     * selectAllRows
     *
     * Will select all rows in the bill table
     */
    selectAllRows() {
      // If selectAllRows is called by methods other than @input event,
      // set skipAllRowSelect to true, to avoid setting/unsetting all rows
      if (this.skipAllRowSelect) {
        this.skipAllRowSelect = false;
        return;
      }
      this.form.forEach((row) => {
        row.rowSelected = this.allRowsSelected;
        if (!this.allRowsSelected) {
          row.rejectedQty = 0;
        }
      });
    },
  },
  mounted() {
    const self = this;
    this.fetchBusinessList().then(() => {
      self.onUpdateDetails();
    });
    this.mobileMode = window.innerWidth < 576;
    window.addEventListener(
      'resize',
      (function () {
        let timeout;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            self.mobileMode = window.innerWidth < 576;
          }, 100);
        };
      })()
    );
  },
};
</script>