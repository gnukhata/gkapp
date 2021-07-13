<template>
  <div>
    <div v-if="config" class="position-relative my-2">
      <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
      </b-overlay>
      <b-card body-class="py-2 px-2">
        <b-button
          v-if="editMode"
          @click.prevent="onItemView"
          class="py-0 mx-1"
          variant="secondary"
          size="sm"
          >Back</b-button
        >
        <span class="float-right">
          <b-button
            v-if="config.addBtn"
            @click.prevent="addBillItem()"
            class="py-0 mx-1"
            variant="success"
            size="sm"
            >Add Item</b-button
          >
          <b-button
            v-if="showAddProduct"
            @click.prevent="showBusinessForm = true"
            class="py-0 mx-1"
            variant="success"
            size="sm"
            >Create Item</b-button
          >
        </span>
      </b-card>
      <b-table
        hover
        small
        caption-top
        bordered
        striped
        :items="form"
        :fields="fields"
        :primary-key="`tbl_${Date.now()}`"
        :foot-clone="true"
        :stacked="editMode"
        :per-page="editMode ? 1 : 10"
        :current-page="currentPage"
        head-variant="dark"
        tbody-tr-class="text-center"
        thead-tr-class="text-center"
      >
        <!-- Index -->
        <template #cell(index)="data">
          {{ data.item.index + 1 }}
        </template>

        <!-- Edit Btn -->
        <template #cell(editBtn)="data">
          <b-button
            variant="outline"
            @click.prevent="onItemEdit(data.item.index)"
            size="sm"
            ><b-icon icon="pencil"></b-icon
          ></b-button>
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
            :inactiveText="config.qty.checkStock ? 'Out of Stock' : ''"
          ></autocomplete>
          <span v-else>{{ data.value.name }}</span>
        </template>

        <!-- Qty -->
        <template #cell(qty)="data">
          <b-input
            v-if="!disabled.qty"
            size="sm"
            v-model="form[data.item.index].qty"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.01"
            @input="onQtyUpdate(data.item.index, data.item.pid)"
            :readonly="data.item.isService || disabled.qty"
            :tabindex="data.item.isService ? -1 : 0"
          ></b-input>
          <span v-else>{{
            form[data.item.index] ? form[data.item.index].qty : ''
          }}</span>
          <small
            class="text-danger"
            v-if="
              config.qty.checkStock &&
              form[data.item.index].qty > options.stock[data.item.pid]
            "
            >Stock On Hand = {{ options.stock[data.item.pid] }}</small
          >
        </template>

        <!-- Package Count (Purchase Sales Order) -->
        <template #cell(packageCount)="data">
          <b-input
            v-if="!disabled.packageCount"
            size="sm"
            v-model="form[data.item.index].packageCount"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.01"
            :readonly="data.item.isService"
            :tabindex="data.item.isService ? -1 : 0"
          ></b-input>
          <span v-else>{{ form[data.item.index].packageCount }}</span>
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
            v-model="form[data.item.index].rate"
            size="sm"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.01"
            @input="updateTaxAndTotal(data.item.index)"
            :readonly="disabled.rate"
            :required="!disabled.rate"
          ></b-input>
          <span v-else>{{ form[data.item.index].rate }}</span>
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
            v-model="form[data.item.index].discount.amount"
            class="hide-spin-button text-right px-1"
            type="number"
            no-wheel
            step="0.01"
            min="0.00"
            @input="updateTaxAndTotal(data.item.index)"
            :readonly="disabled.discount"
          ></b-input>
          <span v-else>{{ form[data.item.index].discount.amount }}</span>
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
          <div class="text-right">{{ getTotal('total') || '-' }}</div>
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
        v-if="editMode || form.length > 10"
        v-model="currentPage"
        :per-page="editMode ? 1 : 10"
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
import { mapState } from 'vuex';
import { debounceEvent } from '../../../js/utils';

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
      default: false,
      note: `true if the org state and party state are the same 
      (use CGST and SGST). If false use IGST.`,
    },
    creditFlag: {
      type: Boolean,
      required: false,
      default: false,
      note: 'Used in Debit/Credit Note form',
    },
    godownId: {
      type: Number,
      required: false,
      default: -1,
      note: 'Used in Transfer note to fetch godownwise stock on hand',
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
      endDate: null,
      editMode: false,
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
        productData: [],
        products: [],
        stock: {},
        godownStock: {},
      },
    };
  },
  computed: {
    fields: (self) => {
      function remove(names) {
        if (!Array.isArray(names)) {
          names = [names];
        }
        names.forEach((name) => {
          let index = data.findIndex((item) => item.key === name);
          if (index >= 0) {
            data.splice(index, 1);
          }
        });
      }
      function replace(key, label) {
        let index = data.findIndex((item) => item.key === key);
        if (index >= 0) {
          data[index].label = label;
        }
      }
      let data = [
        { key: 'editBtn', label: 'Edit' },
        { key: 'index', label: 'No' },
        { key: 'rowSelected', label: '\u2611' },
        { key: 'product', label: 'Item' },
        { key: 'qty', label: 'Qty', tdClass: 'bt-cell-qty' },
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
      replace('dcValue', self.creditFlag ? 'Credited Value' : 'Debited Value');
      if (self.gstFlag) {
        remove('vat');
        if (self.cgstFlag) {
          remove('igst');
        } else {
          remove(['cgst', 'sgst']);
        }
      } else {
        remove(['cgst', 'sgst', 'igst', 'cess']);
      }
      if (self.editMode || !self.mobileMode) {
        remove('editBtn');
      }
      let fields = [];
      if (self.mobileMode && !self.editMode) {
        data.forEach((field) => {
          if (self.config[field.key]) {
            if (self.config[field.key].mobileMode) {
              fields.push(field);
            }
          }
        });
      } else {
        data.forEach((field) => {
          if (self.config[field.key]) {
            fields.push(field);
          }
        });
      }
      return fields;
    },
    disabled: (self) => {
      let disabled = {};
      for (const item in self.config) {
        disabled[item] = self.config[item]
          ? !!self.config[item].disabled
          : false;
      }
      if (self.mobileMode && !self.editMode) {
        for (const item in self.config) {
          if (self.config[item] && self.config[item].mobileMode) {
            disabled[item] =
              !!self.config[item].disabled ||
              self.config[item].mobileMode.disabled;
          }
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
    ...mapState(['yearEnd']),
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
        this.updateTaxAndTotal(0);
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
    godownId() {
      this.fetchStockOnHandData();
    },
  },
  methods: {
    onQtyUpdate(index, pid) {
      if (parseFloat(this.form[index].qty) <= this.options.stock[pid]) {
        this.updateTaxAndTotal(index);
      }
      this.$forceUpdate();
    },
    /**
     * fetchProductDetails(id, index)
     *
     * Description: Fetches product details like price, discount and taxes,
     * when a product is selected in the bill area
     */
    fetchProductDetails(id, index) {
      let self = this;
      const stockPath =
        this.godownId === -1
          ? '/report?stockonhandreport'
          : '/report?godownwisestockonhand';
      let stockParams = `&productcode=${id}&enddate=${this.endDate}`;
      if (this.godownId !== -1) {
        stockParams += `goid=${this.godownId}&type=pg`;
      }
      const requests = [
        axios.get(`/products?qty=single&productcode=${id}`).catch((error) => {
          return error;
        }),
        axios.get(`/tax?pscflag=p&productcode=${id}`).catch((error) => {
          return error;
        }),
        axios.get(`${stockPath}${stockParams}`).catch((error) => {
          return error;
        }),
      ];
      return Promise.all([...requests]).then(([resp1, resp2, resp3]) => {
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
                rate: igst[0].taxrate / 2,
                amount: 0,
              };
              tax['sgst'] = {
                rate: igst[0].taxrate / 2,
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

        // Stock On Hand
        if (resp3.data.gkstatus === 0) {
          self.options.stock[id] = parseFloat(resp3.data.gkresult[0].balance);
        }
      });
    },
    onItemEdit(index) {
      this.editMode = true;
      this.currentPage = index + 1;
    },
    onItemView() {
      this.currentPage = 1;
      this.editMode = false;
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

      /**
       * Fetching the business list, clears the options variable and repopulates it.
       * This action makes the autocomplete component's value null. To counter this
       * the table data is copied by value before that and pasted afterwards.
       */

      let tableData = this.form.map((item) => {
        return { id: item.product.id, name: item.product.name };
      });
      this.fetchBusinessList().then(() => {
        let billCount = self.form.length;
        let productCount = self.options.products.length;
        tableData.forEach((item, i) => {
          self.form[i].product = item;
        });
        if (self.form[billCount - 1].product.id) {
          self.addBillItem();
          billCount++;
        }
        self.form[billCount - 1].product =
          self.options.products[productCount - 1].value;
        self.fetchProductDetails(
          self.options.products[productCount - 1].id,
          billCount - 1
        );
        self.$forceUpdate();
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
          (acc, curr) => parseFloat(acc) + (parseFloat(curr[key][subKey]) || 0),
          0
        );
      } else {
        total = this.form.reduce(
          (acc, curr) => parseFloat(acc) + (parseFloat(curr[key]) || 0),
          0
        );
      }
      if (isNaN(total)) {
        return null;
      }
      return total.toFixed(2);
    },
    indexBillItems() {
      this.form.forEach((item, index) => {
        item.index = index;
      });
    },
    addBillItem() {
      this.form.push({
        rowSelected: false,
        product: { id: '', name: '' },
        hsn: '',
        qty: null,
        packageCount: null,
        rejectedQty: null,
        dcValue: null,
        fqty: null,
        rate: null,
        discount: { rate: 0, amount: null },
        taxable: null,
        cgst: { rate: 0, amount: 0 },
        sgst: { rate: 0, amount: 0 },
        igst: { rate: 0, amount: 0 },
        cess: { rate: 0, amount: 0 },
        vat: { rate: 0, amount: 0 },
        total: 0,
        pid: null,
      });
      this.indexBillItems();
    },
    deleteBillItem(index) {
      this.form.splice(index, 1);
      this.indexBillItems();
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
          const discount = this.config.dcValue ? 0 : item.discount.amount;

          item.taxable = parseFloat(
            (item.rate * qty - discount * qty).toFixed(2)
          );

          if (this.config.dcValue) {
            item.taxable = parseFloat(item.dcValue);
          }

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
      if (isNaN(item.taxable) || isNaN(item.total)) {
        item.total = '';
      }
      this.onUpdateDetails();
    },
    /**
     * fetchStockOnHand()
     *
     * Description: Fetches the stock on hand for all the products in the org.
     *
     * Note: This is a work around till an API is written
     * for it in gkcore
     */
    fetchStockOnHandData() {
      const prodList = this.options.productData;
      const self = this;

      // if godown id is -1, uses stockonhand, else uses godownwise stock on hand
      const url =
        this.godownId === -1
          ? '/report?stockonhandreport'
          : '/report?godownwisestockonhand';
      let params;
      if (self.godownId !== -1) {
        if (self.godownId === null) {
          return;
        } else if (this.options.godownStock[this.godownId]) {
          this.options.stock = this.options.godownStock[this.godownId];
          this.setStockStatus();
          return;
        }
      }

      const requests = prodList.map((item) => {
        params = `&productcode=${item.productcode}&enddate=${this.endDate}`;
        if (self.godownId !== -1) {
          params += `&goid=${self.godownId}&type=pg`;
        }
        return axios.get(`${url}${params}`).catch((error) => {
          return error;
        });
      });

      return Promise.all([...requests]).then((stockResp) => {
        self.options.godownStock[self.godownId] = {};
        self.options.stock = {};
        let stock = self.options.stock;
        let godownStock = self.options.godownStock[self.godownId];
        let prodOptions = self.options.products;
        let id;
        stockResp.forEach((r, index) => {
          id = prodList[index].productcode;
          if (r.data.gkstatus === 0) {
            stock[id] = parseFloat(r.data.gkresult[0].balance);
            // option is marked active if stock is greater than 1 or its a service (gsflag=19)
            prodOptions[index].active = stock[id] > 0;
          }
          if (prodList[index].gsflag === 19) {
            prodOptions[index].active = true;
            stock[id] = 1;
          }
          godownStock[id] = stock[id];
        });
      });
    },
    setStockStatus() {
      const self = this;
      let id;
      let prodOptions = self.options.products;
      this.options.productData.forEach((product, index) => {
        id = product.productcode;
        // option is marked active if stock is greater than 1 or its a service (gsflag=19)
        prodOptions[index].active = self.options.stock[id] > 0;
        if (product.gsflag === 19) {
          prodOptions[index].active = true;
        }
      });
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
              self.options.products = [];
              self.options.productData = [];
              resp.data.gkresult.forEach((item) => {
                self.options.products.push({
                  text: item.productdesc,
                  value: {
                    id: item.productcode,
                    name: item.productdesc,
                  },
                });
                self.options.productData.push({
                  productcode: item.productcode,
                  gsflag: item.gsflag,
                });
              });
              if (self.config.qty.checkStock) {
                self.fetchStockOnHandData();
              }
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

    // update endDate used for getting product's StockOnHand
    let date = new Date().getTime();
    let maxDate = new Date(this.yearEnd).getTime();
    this.endDate =
      date > maxDate ? new Date().toISOString().slice(0, 10) : this.yearEnd;

    // add event listener for tracking screen size
    this.mobileMode = window.innerWidth < 576;
    debounceEvent(window, 'resize', () => {
      self.mobileMode = window.innerWidth < 576;
      if (!self.mobileMode) {
        self.currentPage = 1;
        self.editMode = false;
      }
    }, 100);
  },
};
</script>

<style>
@media screen and (min-width: 576px) {
  .bt-cell-qty {
    max-width: 100px;
  }
}
</style>