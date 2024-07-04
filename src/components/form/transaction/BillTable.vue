<!-- ToDo
    * Add discount percent
    * Currently in edit mode, product tax is fetched from the tax table. Instead use the tax from the invoice details fetched.
 -->
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
        >
          <translate> Back </translate>
        </b-button>
        <!-- 
          TODO: Move this option to global settings page
          <b-form-checkbox @input="updateAllTaxAndTotal" v-model="inclusiveFlag" name="check-button" switch>
          Inclusive of tax
        </b-form-checkbox> -->
        <span class="float-left">
          <b-form-checkbox
            id="checkbox-stock"
            v-model="form.allowNegativeStock"
            @input="updateCheckStock"
            name="checkbox-stock"
            class="mt-1"
            size="sm"
            switch
          >
            Allow Negative Stock
          </b-form-checkbox>
        </span>
        <span class="float-right">
          <b-button
            v-if="showAddProduct"
            @click.prevent="showBusinessForm = true"
            class="py-0 mx-1"
            variant="success"
            size="sm"
          >
            <translate>
              Create Item
            </translate>
          </b-button>
          <b-button
            v-if="config.addBtn"
            @click.prevent="addBillItem()"
            class="py-0 mx-1"
            variant="success"
            size="sm"
          >
            <translate> Add Item </translate>
          </b-button>
        </span>
      </b-card>
      <b-table
        hover
        small
        bordered
        striped
        :items="formItems()"
        :fields="fields"
        :primary-key="`tbl_${Date.now()}`"
        :foot-clone="true"
        :stacked="editMode"
        :per-page="editMode ? 1 : 10"
        :current-page="currentPage"
        head-variant="dark"
        ref="billTable"
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
            v-if="form[data.item.index]"
            @input="callRowSelected(data.item.index)"
            v-model="form[data.item.index].rowSelected"
          ></b-form-checkbox>
        </template>

        <!-- Product -->
        <template #head(product)="data">
          <span>{{ data.label }}</span>
        </template>
        <template #cell(product)="data">
        <b-form-select
          class="item"
          v-if="form[data.item.index] && !disabled.product"
          v-model="form[data.item.index].product"
          required
          @change="onBillItemSelect(form[data.item.index].product, data.item.index)"
          :disabled="disabled.product"
          :state="!form[data.item.index].product ? false : null"
          :rules="[v => !!form[data.item.index].product || 'Please select an option']"
        >
          <b-form-select-option
            v-for="option in options.products"
            :key="option.id"
            :value="option"
          >
            <div v-if="options.productData[option.id] && options.productData[option.id]?.gsflag !== 19">
              {{ option.name }}
              <div class="text-small" v-if="options.stock[option.id] && options.stock[option.id] > 0">
                ({{ options.stock[option.id] }})
              </div>
              <div v-else>({{ options.stock[option.id] || 0 }})</div>
            </div>
             <div v-else>{{ option.name }}</div>
          </b-form-select-option>
        </b-form-select>
        <b-form-select
          class="item"
          v-else-if="form[data.item.index] && form[data.item.index].product"
          v-model="form[data.item.index].product"
          required
          @change="onBillItemSelect(form[data.item.index].product, data.item.index)"
          :disabled="disabled.product"
          :state="!form[data.item.index].product ? false : null"
          :rules="[v => !!form[data.item.index].product || 'Please select an option']"
        >
          <b-form-select-option
            v-for="option in options.products"
            :key="option.id"
            :value="option"
          >
            <div v-if="options.productData[option.id] && options.productData[option.id]?.gsflag !== 19">
              {{ option.name }}
              <div class="text-small" v-if="options.stock[option.id] && options.stock[option.id] > 0">
                ({{ options.stock[option.id] }})
              </div>
              <div v-else>({{ options.stock[option.id] || 0 }})</div>
            </div>
             <div v-else>{{ option.name }}</div>
          </b-form-select-option>
        </b-form-select>
        </template>


        <!-- Qty -->
        <template #head(qty)="">
          <span v-translate>Qty</span>
        </template>
        <template #cell(qty)="data">
          <div v-if="form[data.item.index]">
            <b-input
              v-if="!disabled.qty"
              size="sm"
              v-model="form[data.item.index].qty"
              class="hide-spin-button text-right px-1"
              type="number"
              no-wheel
              step="0.01"
              min="0.01"
              :max="(config.qty.checkStock && !form[data.item.index].isService) ? options.stock[data.item.pid] : null"
              @input="onQtyUpdate(data.item.index, data.item.pid)"
              :readonly="data.item.isService || disabled.qty"
              :tabindex="data.item.isService ? -1 : 0"
            ></b-input>
            <span v-else>{{
              form[data.item.index] ? form[data.item.index].qty : ''
            }}</span>
            <div>
              <small
                class="text-danger"
                v-if="
                  config.qty.checkStock &&
                    form[data.item.index].qty > options.stock[data.item.pid] &&
                    !form[data.item.index].isService
                "
              >
                <translate
                  :translate-params="{
                    stockOnHand: options.stock[data.item.pid],
                  }"
                >
                  Stock On Hand = %{stockOnHand}
                </translate>
              </small>
            </div>
          </div>
        </template>

        <!-- Package Count (Purchase Sales Order) -->
        <template #head(packageCount)="">
          <span v-translate>No. of Packages</span>
        </template>
        <template #cell(packageCount)="data">
          <div v-if="form[data.item.index]">
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
          </div>
        </template>

        <!-- Rejected Qty (Rejection Note) -->
        <template #head(rejectedQty)="">
          <span v-translate>Rejected Qty</span>
        </template>
        <template #cell(rejectedQty)="data">
          <div v-if="form[data.item.index]">
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
          </div>
        </template>

        <!-- Debit Credit Value (Debit Credit Note) -->
        <template #head(dcValue)="">
          <span v-if="creditFlag" v-translate> Credited Value </span>
          <span v-else v-translate> Debited Value </span>
        </template>
        <template #cell(dcValue)="data">
          <div v-if="form[data.item.index]">
            <b-input
              v-if="!disabled.dcValue"
              size="sm"
              v-model="form[data.item.index].dcValue"
              class="hide-spin-button text-right px-1"
              type="number"
              no-wheel
              step="0.01"
              min="0"
              :max="creditFlag ? form[data.item.index].rate : null"
              @input="updateTaxAndTotal(data.item.index)"
              required
            ></b-input>
            <span v-else>{{ form[data.item.index].dcValue }}</span>
          </div>
        </template>

        <!-- Rate -->
        <template #head(rate)="">
          <span v-translate>Rate</span> <small>₹</small>
        </template>
        <template #cell(rate)="data">
          <div v-if="form[data.item.index]">
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
              @click="updateRateField(data.item.index, ['rate'], 'clickin')"
              @blur="updateRateField(data.item.index, ['rate'], 'clickout')"
              :readonly="disabled.rate"
              :required="!disabled.rate"
            ></b-input>
            <span v-else>{{ form[data.item.index].rate }}</span>
          </div>
        </template>

        <!-- CGST -->
        <template #cell(cgst)="data">
          {{
            form[data.item.index] && form[data.item.index].cgst
              ? form[data.item.index].cgst.rate
              : ''
          }}
        </template>

        <!-- SGST -->
        <template #cell(sgst)="data">
          {{
            form[data.item.index] && form[data.item.index].sgst
              ? form[data.item.index].sgst.rate
              : ''
          }}
        </template>

        <!-- IGST -->
        <template #cell(igst)="data">
          {{
            form[data.item.index] && form[data.item.index].igst
              ? form[data.item.index].igst.rate
              : ''
          }}
        </template>

        <!-- CESS -->
        <template #cell(cess)="data">
          {{
            form[data.item.index] && form[data.item.index].cess
              ? form[data.item.index].cess.rate
              : ''
          }}
        </template>

        <!-- VAT -->
        <template #cell(vat)="data">
          {{
            form[data.item.index] && form[data.item.index].vat
              ? form[data.item.index].vat.rate || ''
              : ''
          }}
        </template>

        <!-- Discount -->
        <template #head(discount)="">
          <span v-translate>Discount</span> <small>₹</small>
        </template>
        <template #cell(discount)="data">
          <div v-if="form[data.item.index]">
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
              @click="
                updateRateField(
                  data.item.index,
                  ['discount', 'amount'],
                  'clickin'
                )
              "
              @blur="
                updateRateField(
                  data.item.index,
                  ['discount', 'amount'],
                  'clickout'
                )
              "
              :readonly="disabled.discount"
            ></b-input>
            <span v-else>{{ form[data.item.index].discount.amount }}</span>
          </div>
        </template>

        <template #foot(discount)="">
          <div class="text-right" v-if="config.footer.discount">
            {{ getTotal('discount', 'amount') }}
          </div>
        </template>

        <!-- Total -->
        <template #head(total)="">
          <span v-translate>Total </span> <small>₹</small>
        </template>
        <template #cell(total)="data">
          {{ form[data.item.index] ? form[data.item.index].total : '' }}
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

        <template #table-caption>
          <small v-if="!gstFlag">
            {{ taxState ? '' : '* Need Place of Supply to implment taxes' }}
          </small>
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
        @childValueUpdate="onBusinessSave"
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
import BusinessItem from '../BusinessItem.vue';
import { mapState } from 'vuex';
import { debounceEvent } from '../../../js/utils';

export default {
  name: 'BillTable',
  components: {
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
    saleFlag: {
      type: Boolean,
      required: false,
      default: false,
      note: `true if sale, false if purchase. Used to purchase out of stock items`,
    },
    onRowSelected: {
      type: Function,
      required: false,
      note: 'Used for applying row select callbacks',
      default: function() {},
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
    blockEmptyStock: {
      type: Boolean,
      required: false,
      default: false,
      note: 'Flag to block the selection of items with no stock',
    },
    vatFlag: {
      type: Boolean,
      required: false,
      default: false,
      note: `true if the org state and party state are the same 
      (use VAT). If false use IGST.`,
    },
    invDate: {
      type: String,
      required: false,
      default: '',
      note:
        'Invoice date in yyyy-mm-dd format to determine the appropriate gst',
    },
    taxState: {
      type: String,
      required: false,
      default: '',
      note: 'tax state is used to choose the appropriate VAT',
    },
    parentData: {
      type: Array,
      required: false,
      default: function() {
        return [
          {
            product: { name: '', id: '', productquantity: '' },
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
      inclusiveFlag: false,
      endDate: null,
      editMode: false,
      showBusinessForm: false,
      isPreloading: false,
      editCounter: 0,
      mobileMode: false,
      currentPage: 1,
      allRowsSelected: false,
      skipAllRowSelect: false,
      taxInclusiveFlag: false,
      // fields: [],
      form: [
        {
          index: 0,
          product: { name: '', id: '', productquantity: '' },
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
          allowNegativeStock: this.config.qty.checkStock,
        },
      ],
      options: {
        productData: {}, // product's data, mapped to its id
        products: [], // product list used by the bill table
        stock: {}, // stock data based on godown id
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
        { key: 'editBtn', label: self.$gettext('Edit') },
        { key: 'index', label: self.$gettext('No') },
        { key: 'rowSelected', label: '\u2611' },
        { key: 'product', label: self.$gettext('Item') },
        { key: 'qty', label: self.$gettext('Qty'), tdClass: 'bt-cell-qty' },
        { key: 'packageCount', label: self.$gettext('No. of Packages') },
        { key: 'rejectedQty', label: self.$gettext('Rejected Qty') },
        { key: 'dcValue', label: self.$gettext('Value') },
        { key: 'rate', label: self.$gettext('Rate ₹'), tdClass: 'text-right' },
        {
          key: 'discount',
          label: self.$gettext('Discount ₹'),
          tdClass: 'text-right',
        },
        { key: 'vat', label: 'VAT %' },
        { key: 'cgst', label: 'CGST %' },
        { key: 'sgst', label: 'SGST %' },
        { key: 'igst', label: 'IGST %' },
        { key: 'cess', label: 'CESS %' },
        {
          key: 'total',
          label: self.$gettext('Total ₹'),
          tdClass: 'text-right',
        },
        { key: 'addBtn', label: '+/-' },
      ];
      replace(
        'dcValue',
        self.creditFlag
          ? self.$gettext('Credited Value')
          : self.$gettext('Debited Value')
      );
      // debugger;
      if (self.gstFlag) {
        remove('vat');
        if (self.cgstFlag) {
          remove('igst');
        } else {
          remove(['cgst', 'sgst']);
        }
      } else if (self.vatFlag) {
        remove(['cgst', 'sgst', 'igst', 'cess']);
      } 
      else {
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
      // debugger;
      // console.log(1);
      let updateBillTable = !(
        this.parentData.length &&
        typeof this.parentData[0].product === 'object' &&
        !this.parentData[0].product.name
      );
      if (!updateBillTable) {
        this.fetchBusinessList().then(() => {
          this.form = [];
          this.addBillItem();
          this.updateTaxAndTotal(0);
        });
        return;
      }

      this.isPreloading = true;
      this.editCounter = 0;
      const self = this;
      this.form = [];
      let products = [];
      this.parentData.forEach((item) => {
        let product = self.options.products.find(
          (p) => p.name === item.product.name
        );
        if (product) {
          self.editCounter += 2; // parent is calling child update hook twice
          self.addBillItem();
          products.push({
            pid: product.id,
            product: product,
            discount: item.discount,
            qty: item.qty,
            fqty: item.fqty,
            rate: item.rate,
            isService: item.isService,
          });
        }
      });
      // this.$forceUpdate();
      this.$nextTick().then(() => {
        this.$refs.billTable.refresh();
        if (products.length) {
          let requests = [];
          products.forEach((product, index) => {
            self.form[index] = product;
            // console.log(product);
            requests.push(
              self.fetchProductDetails(self.form[index].product.id, index)
            );
          });

          Promise.all(requests)
            .then(() => {
              self.isPreloading = false;
              self.$forceUpdate();
              self.$nextTick.then(() => {
                self.$refs.billTable.refresh();
              });
            })
            .catch(() => {
              self.isPreloading = false;
            });
        } else {
          self.isPreloading = false;
        }
      });
    },
    saleFlag() {
      this.fetchBusinessList();
    },
    godownId() {
      // this.fetchStockOnHandData();
      this.fetchAllStockOnHand();
    },
    invDate() {
      let length = this.form.length;
      while (length--) {
        this.updateTaxAndTotal(length);
      }
    },
  },
  methods: {
    /**
     * formItems()
     *
     * provider method for vue bootstrap table
     *
     * params: ctx, callback (in order)
     * */
    formItems() {
      let result = [
        {
          rowSelected: false,
          product: { id: '', name: '' },
          hsn: '',
          qty: null,
          packageCount: null,
          rejectedQty: null,
          dcValue: null,
          fqty: 0,
          rate: null,
          discount: { rate: 0, amount: null },
          taxable: null,
          cgst: { rate: 0, amount: 0 },
          sgst: { rate: 0, amount: 0 },
          igst: { rate: 0, amount: 0 },
          cess: { rate: 0, amount: 0 },
          vat: { rate: 0, amount: 0 },
          vatMap: {},
          total: 0,
          pid: null,
        },
      ];
      if (this.form.length) {
        result = this.form;
      }
      // console.log(JSON.stringify(result));
      return result;
    },
    updateCheckStock() {
      this.config.qty.checkStock = !this.form.allowNegativeStock;
    },
    /**
     * checkProductValidity()
     *
     * Checks if the product is valid for selection based on the stock qty data.
     *
     * Method used as selectable prop for v-select component
     */
    checkProductValidity(product) {
      let id = product.id;
      // let prodOptions = this.options.products;

      let valid = true;
      if (
        this.options.productData[id] &&
        this.options.productData[id].gsflag !== 19 &&
        this.saleFlag
      ) {
        if (!(this.options.stock[id] > 0)) {
          valid = false;
        }
      }

      return valid;
    },
    onQtyUpdate(index, pid) {
      if (
        parseFloat(this.form[index].qty) <= this.options.stock[pid] ||
        !this.saleFlag
      ) {
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
        stockParams += `&goid=${this.godownId}&type=pg`;
      }
      const requests = [
        axios.get(`/product/${id}`).catch((error) => {
          return error;
        }),
        axios.get(`/tax/search/p?productcode=${id}`).catch((error) => {
          return error;
        }),
        axios.get(`${stockPath}${stockParams}`).catch((error) => {
          return error;
        }),
      ];
      return Promise.all(requests).then(([resp1, resp2, resp3]) => {
        self.isLoading = false;
        // Product Data
        if (resp1.status === 200) {
          if (resp1.data.gkstatus === 0) {
            let data = resp1.data.gkresult;
            if (!self.editCounter) {
              Object.assign(self.form[index], {
                hsn: data.gscode,
                isService: data.gsflag === 19,
                rate: data.prodsp,
                qty: 1,
                discount: {
                  rate: data.discountpercent,
                  discountamount: self.config.discount ? data.discountamount : 0,
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
                taxes: {},
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
                ? data.filter((item) => item.taxname === 'VAT')
                : 0;

            if (igst.length) {
              igst.forEach((igst2) => {
                tax['taxes'][igst2.taxfromdate] = {
                  igst: {
                    rate: igst2.taxrate,
                    amount: 0,
                  },
                  cgst: {
                    rate: igst2.taxrate / 2,
                    amount: 0,
                  },
                  sgst: {
                    rate: igst2.taxrate / 2,
                    amount: 0,
                  },
                };
              });
              // old tax rates without applicability date, legacy code
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
              cgst.forEach((cgst2) => {
                tax['taxes'][cgst2.taxfromdate] = {
                  cgst: {
                    rate: cgst2.taxrate,
                    amount: 0,
                  },
                  sgst: {
                    rate: cgst2.taxrate,
                    amount: 0,
                  },
                };
              });
              // old tax rates without applicability date, legacy code
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
              tax['vatMap'] = {};
              vat.forEach((vatItem) => {
                tax['vatMap'][vatItem.state] = {
                  rate: parseFloat(vatItem.taxrate),
                  amount: 0,
                };
              });
              if (this.taxState) {
                tax['vat'] = tax['vatMap'][this.taxState];
              }
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

        self.$forceUpdate();
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
      this.$forceUpdate();
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
      } else {
        Object.assign(this.form[index], {
          rowSelected: false,
          product: { id: '', name: '' },
          hsn: '',
          qty: null,
          packageCount: null,
          rejectedQty: null,
          dcValue: null,
          fqty: 0,
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
          isService: false,
        });
        this.updateTaxAndTotal(index);
      }
    },
    onBusinessSave(invalidProduct) {
      this.showBusinessForm = false;
      let self = this;

      if (!invalidProduct) {
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
            self.options.products[productCount - 1];
          self.fetchProductDetails(
            self.options.products[productCount - 1].id,
            billCount - 1
          );
          self.$forceUpdate();
        });
      }
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
        fqty: 0,
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
    updateRateField(index, path, flag) {
      let item = this.form[index];
      if (!item.pid) {
        return;
      }
      // init item and path
      // item will be an object which will have the path key in it
      // sometimes, the object could be nested with multiple keys to traverse through to get to the leaf node
      let pathLength = path.length - 1,
        i = -1;
      while (++i < pathLength) {
        item = item[path[i]];
      }
      path = path[i]; // the last path key is going to be a storing a number like rate or discount amount

      // update the rate field based on the click action and its value
      if (!parseFloat(item[path]) > 0) {
        if (flag === 'clickin') {
          item[path] = null;
        }
      }

      if (flag === 'clickout') {
        if (!item[path]) {
          item[path] = '0.00';
        }
      }
    },
    updateAllTaxAndTotal() {
      let length = this.form.length;
      while (length--) {
        this.updateTaxAndTotal(length);
      }
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
      let inclusiveFlag = this.inclusiveFlag; // sale price is inclusive of tax
      let item = this.form[index];
      if (item) {
        if (this.gstFlag) {
          if (item.taxes) {
            // find the appropriate tax based on the date of the invoice
            let taxDates = Object.keys(item.taxes);
            if (taxDates.length && this.invDate) {
              // Sort the tax dates in descending order
              taxDates.sort(
                (a, b) => new Date(b).getTime() - new Date(a).getTime()
              );
              let invDate = new Date(this.invDate).getTime();
              let taxDate = taxDates.find((date) => {
                let tDate = new Date(date).getTime();
                return tDate <= invDate;
              });
              if (taxDate) {
                let taxes = item.taxes[taxDate];
                if (taxes.igst) {
                  item.igst = taxes.igst;
                }

                if (taxes.cgst) {
                  item.cgst = taxes.cgst;
                }

                if (taxes.sgst) {
                  item.sgst = taxes.sgst;
                }
              } else {
                item.cgst = { rate: 0, amount: 0 };
                item.sgst = { rate: 0, amount: 0 };
                item.igst = { rate: 0, amount: 0 };
              }
            }

            // calculate taxable
            let rate = parseFloat(item.rate);
            let igst = parseFloat(item.igst.rate) || 0;
            let cess = parseFloat(item.cess.rate) || 0;
            let discountamount = parseFloat(item.discount.amount) || 0;
            if (item.rate > 0) {
              let qty = item.qty;
              if (this.config.rejectedQty) {
                qty = item.rejectedQty;
              }

              const discount = this.config.dcValue ? 0 : discountamount;
              item.discount.amount = parseFloat(discount) * qty
              if (inclusiveFlag) {
                // cess + gst + rate = item rate
                let inclusiveRate = item.rate;
                rate = inclusiveRate / (0.01 * igst + 0.01 * cess + 1);
              }

              item.taxable = parseFloat((rate * qty - discount * qty).toFixed(2));

              if (this.config.dcValue) {
                item.taxable = parseFloat(item.dcValue || 0) * qty;
              }
            } else {
              item.taxable = 0;
            }

            item.igst.amount = parseFloat(
              (item.taxable * (igst * 0.01)).toFixed(2)
            );
            item.cess.amount = parseFloat(
              (item.taxable * (cess * 0.01)).toFixed(2)
            );

            item.total = (
              item.taxable +
              item.igst.amount +
              item.cess.amount
            ).toFixed(2);
          } else {
            item.taxable = (0).toFixed(2);
            item.total = (0).toFixed(2);
            item.discount.amount = (0).toFixed(2);
          }
        } else {
          item.vat =
            this.taxState && item.vatMap
              ? item.vatMap[this.taxState]
              : { rate: 0, amount: 0 };

          // calculate taxable
          let rate = parseFloat(item.rate);
          let vat = parseFloat(item.vat.rate) || 0;
          let discountamount = parseFloat(item.discount.amount) || 0;
          if (item.rate > 0) {
            let qty = item.qty;
            if (this.config.rejectedQty) {
              qty = item.rejectedQty;
            }

            const discount = this.config.dcValue ? 0 : discountamount;
            item.discount.amount = parseFloat(discount) * qty
            if (inclusiveFlag) {
              // vat + rate = item rate
              let inclusiveRate = item.rate;
              rate = inclusiveRate / (0.01 * vat + 1);
            }

            item.taxable = parseFloat((rate * qty - discount * qty).toFixed(2));

            if (this.config.dcValue) {
              item.taxable = parseFloat(item.dcValue || 0) * qty;
            }
          } else {
            item.taxable = 0;
          }

          item.vat.amount = item.taxable * (vat * 0.01);
          item.total = (parseFloat(item.taxable) + item.vat.amount).toFixed(2);
        }
      } else {
        item.taxable = (0).toFixed(2);
        item.total = (0).toFixed(2);
      }
      if (isNaN(item.taxable) || isNaN(item.total)) {
        item.total = '';
      }
      this.onUpdateDetails();
      this.$forceUpdate();
    },

    /**
     * fetchAllStockOnHand()
     *
     * Description: Fetches the stock on hand for all the products in the org.
     * Fetches godown based stock on hand if it exists, else fetches normal stock on hand
     */
    fetchAllStockOnHand(forceFetch) {
      if (this.godownId === -1) {
        return;
      }

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
        } else if (this.options.godownStock[this.godownId] && !forceFetch) {
          this.options.stock = this.options.godownStock[this.godownId];
          // this.setStockStatus();
          return;
        }
      }

      this.isPreloading = true;

      params = `&enddate=${this.endDate}`;
      if (self.godownId !== -1) {
        params += `&goid=${self.godownId}&type=apg`;
      } else {
        params += '&productcode=all';
      }

      return axios
        .get(`${url}${params}`)
        .then((resp) => {
          self.options.godownStock[self.godownId] = {};
          self.options.stock = {};
          let stock = self.options.stock;
          let godownStock = {};
          // let prodOptions = self.options.products;
          let id;
          if (resp.data.gkstatus === 0) {
            resp.data.gkresult.forEach((soh) => {
              id = soh.productcode;
              stock[id] = parseFloat(soh.balance);
              // option is marked active if stock is greater than 1 or its a service (gsflag=19)
              // if(productMap[id]) {
              //   productMap[id].active = stock[id] > 0;
              // }
              godownStock[id] = stock[id];
            });
            self.options.godownStock[self.godownId] = godownStock;
            // self.setStockStatus();
            self.isPreloading = false;
          }
        })
        .catch((error) => {
          self.isPreloading = false;
          console.log(error);
          return error;
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
        // console.log(`${self.options.stock[id]} - ${prodOptions[index].active}`)
        if (product.gsflag === 19) {
          prodOptions[index].active = true;
        }
      });
    },
    fetchBusinessList() {
      let self = this;
      this.isPreloading = true;
      return axios
        .get('/product')
        .then((resp) => {
          self.isPreloading = false;
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              resp.data.gkresult.sort((a, b) => a.productcode - b.productcode);
              self.options.products = [];
              self.options.productData = {};
              resp.data.gkresult.forEach((item) => {
                if (((this.saleFlag && parseInt(item.productquantity, 10) > 0) || (!this.saleFlag)) || (item.gsflag === 19)) {
                  self.options.products.push({
                    id: item.productcode,
                    name: item.productdesc,
                    quantity: item.productquantity,
                  });
                  self.options.productData[item.productcode] = {
                    gsflag: item.gsflag,
                  };
                }
              });
              if (self.config.qty.checkStock) {
                // self.fetchStockOnHandData();
                self.fetchAllStockOnHand(true);
              }
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
          self.isPreloading = false;
          this.displayToast(
            this.$gettext('Fetch Product Data Failed!'),
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
    this.mobileMode = this.is_mobile();
    debounceEvent(
      window,
      'resize',
      () => {
        self.mobileMode = self.is_mobile();
        if (!self.mobileMode) {
          self.currentPage = 1;
          self.editMode = false;
        }
      },
      100
    );
  },
};
</script>

<style>
@media screen and (min-width: 576px) {
  .bt-cell-qty {
    max-width: 100px;
  }
}
.item {
  height: calc(1.5em + 0.45rem);
}
</style>
