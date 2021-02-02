<!-- ToDo
    Add free qty field
    Make the table fixed height
    Print screen
    Display transaction in print screen
    Add customer and Products
    Add round off switch
    Add discount percent
    Store financial year, Org name and year in vuex
    Add check conditions for the dates used in the form
 -->
<template>
  <b-container fluid class="mt-2">
    <b-card style="min-width: 300px">
      <div class="mb-2">
        <b-form-radio-group
          v-model="form.inv.type"
          @input="fetchInvoiceId()"
          button-variant="outline-success"
          size="sm"
          buttons
        >
          <b-form-radio value="sale">Sale</b-form-radio>
          <b-form-radio value="purchase">Purchase</b-form-radio>
        </b-form-radio-group>
      </div>
      <b-form @submit.prevent="onSubmit">
        <b-card-group class="d-block d-md-flex" deck>
          <!-- Invoice Details -->
          <b-card
            class="mr-md-1 mb-2 mb-md-0"
            border-variant="secondary"
            no-body
          >
            <div class="p-3">
              <div class="mb-3">
                <b>Invoice Details</b>
              </div>
              <b-row>
                <b-col class="pr-lg-2" cols="12" lg="6">
                  <b-form-group
                    label="Inv. No."
                    label-for="input-1"
                    label-cols-lg="4"
                    label-cols="3"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-1"
                      v-model="form.inv.no"
                      trim
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col class="pl-lg-2">
                  <b-form-group
                    id="input-group-3"
                    label="Date"
                    label-cols-lg="4"
                    label-cols="3"
                    label-for="date-1"
                    label-size="sm"
                  >
                    <b-input-group>
                      <b-form-input
                        size="sm"
                        id="date-1"
                        v-model="form.inv.date"
                        type="text"
                        placeholder="YYYY-MM-DD"
                        autocomplete="off"
                        required
                      ></b-form-input>
                      <b-input-group-append>
                        <b-form-datepicker
                          size="sm"
                          v-model="form.inv.date"
                          button-only
                          right
                          locale="en-GB"
                          aria-controls="date-1"
                        >
                        </b-form-datepicker>
                      </b-input-group-append>
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col class="pr-lg-2" cols="12" lg="6">
                  <b-form-group
                    label="Del. Note"
                    label-for="input-2"
                    label-cols-lg="4"
                    label-cols="3"
                    label-size="sm"
                  >
                    <b-form-select
                      size="sm"
                      id="input-2"
                      v-model="form.inv.delNote"
                    ></b-form-select>
                  </b-form-group>
                </b-col>
                <b-col class="pl-lg-2" v-if="isSale">
                  <b-form-group
                    label="EBN"
                    label-for="input-3"
                    label-cols-lg="4"
                    label-cols="3"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-3"
                      v-model="form.inv.ebn"
                      trim
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
              <hr
                :style="{ marginLeft: '-1rem', marginRight: '-1rem' }"
                class="mt-0 border-secondary"
              />
              <b-form-group
                label-cols-lg="2"
                label-cols="3"
                label="Address"
                label-for="input-4"
                label-size="sm"
                v-if="isSale"
              >
                <b-form-textarea
                  size="sm"
                  id="input-4"
                  v-model="form.inv.addr"
                  rows="2"
                  max-rows="2"
                  trim
                  required
                ></b-form-textarea>
              </b-form-group>
              <b-row>
                <b-col class="pr-lg-2" cols="12" lg="6" v-if="isSale">
                  <b-form-group
                    label-cols-lg="4"
                    label-cols="3"
                    label="PIN"
                    label-for="input-5"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-5"
                      v-model="form.inv.pin"
                      trim
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col class="pl-lg-2">
                  <b-form-group
                    label="State"
                    label-for="input-6"
                    label-size="sm"
                    label-cols-lg="4"
                    label-cols="3"
                  >
                    <b-form-select
                      size="sm"
                      id="input-6"
                      v-model="form.inv.state"
                      :options="options.states"
                      required
                    ></b-form-select>
                  </b-form-group>
                </b-col>
              </b-row>
              <hr
                :style="{ marginLeft: '-1rem', marginRight: '-1rem' }"
                class="mt-0 border-secondary"
              />
              <b-row v-if="isSale">
                <b-col class="pr-lg-2" cols="12" lg="6">
                  <b-form-group
                    label="Issuer"
                    label-for="input-7"
                    label-cols="3"
                    label-size="sm"
                    label-cols-lg="4"
                  >
                    <b-form-input
                      size="sm"
                      id="input-7"
                      v-model="form.inv.issuer"
                      trim
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col class="pl-lg-2" cols="12" lg="6">
                  <b-form-group
                    label="Role"
                    label-for="input-8"
                    label-cols="3"
                    label-cols-lg="4"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-8"
                      v-model="form.inv.role"
                      trim
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </div>
          </b-card>
          <!-- Buyer/Seller Details -->
          <b-card
            class="mx-md-1 mb-2 mb-md-0"
            border-variant="secondary"
            no-body
          >
            <div class="p-3">
              <div class="mb-3">
                <b v-if="isSale"> Billed To</b>
                <b v-else> Billed By</b>
              </div>
              <b-row>
                <b-col cols="12">
                  <b-form-group>
                    <b-form-radio-group
                      button-variant="outline-success"
                      size="sm"
                      buttons
                      v-model="form.party.type"
                      @input="resetPartyDetails()"
                    >
                      <b-form-radio value="customer">Customer</b-form-radio>
                      <b-form-radio value="supplier">Supplier</b-form-radio>
                    </b-form-radio-group>
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label="Name"
                    label-for="input-9"
                    label-cols="3"
                    label-size="sm"
                  >
                    <b-form-select
                      size="sm"
                      id="input-9"
                      v-model="form.party.name"
                      :options="
                        form.party.type === 'customer'
                          ? options.customers
                          : options.suppliers
                      "
                      @input="fetchCustomerData(form.party.name.id)"
                      required
                    ></b-form-select>
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label-cols="3"
                    label="Address"
                    label-for="input-10"
                    label-size="sm"
                  >
                    <b-form-textarea
                      size="sm"
                      id="input-10"
                      v-model="form.party.addr"
                      rows="2"
                      max-rows="2"
                      trim
                      plaintext
                    ></b-form-textarea>
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label-cols="3"
                    label="PIN"
                    label-for="input-11"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-11"
                      v-model="form.party.pin"
                      trim
                      plaintext
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label="State"
                    label-for="input-12"
                    label-size="sm"
                    label-cols="3"
                  >
                    <b-form-select
                      size="sm"
                      id="input-12"
                      v-model="form.party.state"
                      :options="form.party.options.states"
                      @input="setPartyGst()"
                      trim
                    ></b-form-select>
                  </b-form-group>
                </b-col>
                <b-col v-if="isGst" cols="12">
                  <b-form-group
                    label-cols="3"
                    label="GSTIN"
                    label-for="input-13"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-13"
                      v-model="form.party.gstin"
                      trim
                      plaintext
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col v-else cols="12">
                  <b-form-group
                    label-cols="3"
                    label="TIN"
                    label-for="input-13"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-13"
                      v-model="form.party.tin"
                      trim
                      plaintext
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </div>
          </b-card>
          <!-- Shipping Details -->
          <b-card
            class="ml-md-1 mb-2 mb-md-0"
            border-variant="secondary"
            no-body
          >
            <div class="p-3">
              <div class="mb-3"><b>Shipping Details</b></div>
              <b-form-checkbox
                id="checkbox-1"
                v-model="sameBillAddress"
                name="checkbox-1"
                class="mb-3"
                size="sm"
                switch
                v-if="isSale"
              >
                Same as Billing Address
              </b-form-checkbox>
              <b-row>
                <b-col cols="12">
                  <b-form-group
                    label="Name"
                    label-for="input-14"
                    label-cols="3"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-14"
                      v-model="form.ship.name"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label-cols="3"
                    label="Address"
                    label-for="input-15"
                    label-size="sm"
                  >
                    <b-form-textarea
                      size="sm"
                      id="input-15"
                      v-model="form.ship.addr"
                      rows="2"
                      max-rows="2"
                      trim
                    ></b-form-textarea>
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label-cols="3"
                    label="PIN"
                    label-for="input-16"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-16"
                      v-model="form.ship.pin"
                      trim
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col cols="12">
                  <b-form-group
                    label="State"
                    label-for="input-17"
                    label-size="sm"
                    label-cols="3"
                  >
                    <b-form-select
                      size="sm"
                      id="input-17"
                      v-model="form.ship.state"
                      :options="options.states"
                      trim
                    ></b-form-select>
                  </b-form-group>
                </b-col>
                <b-col v-if="isGst" cols="12">
                  <b-form-group
                    label-cols="3"
                    label="GSTIN"
                    label-for="input-18"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-18"
                      v-model="form.ship.gstin"
                      trim
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col v-else cols="12">
                  <b-form-group
                    label-cols="3"
                    label="TIN"
                    label-for="input-18"
                    label-size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="input-18"
                      v-model="form.ship.tin"
                      trim
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </div>
          </b-card>
        </b-card-group>
        <div class="my-2">
          <b-form-radio-group
            button-variant="outline-success"
            size="sm"
            buttons
            v-model="form.taxType"
          >
            <b-form-radio value="gst">GST</b-form-radio>
            <b-form-radio value="vat">VAT</b-form-radio>
          </b-form-radio-group>
        </div>
        <b-table-simple hover small caption-top responsive bordered>
          <b-thead head-variant="dark">
            <!-- table header -->
            <b-tr class="text-center">
              <b-th :style="{ maxWidth: '40px', width: '40px' }" rowspan="2"
                >No</b-th
              >
              <b-th
                :style="{
                  maxWidth: '300px',
                  width: '150px',
                  minWidth: '100px',
                }"
                rowspan="2"
                >Item</b-th
              >
              <b-th
                :style="{ maxWidth: '200px', width: '150px', minWidth: '80px' }"
                rowspan="2"
                >HSN/SAC</b-th
              >
              <b-th
                :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
                rowspan="2"
                >Qty</b-th
              >
              <b-th
                :style="{ maxWidth: '200px', width: '150px', minWidth: '80px' }"
                rowspan="2"
                >Rate</b-th
              >
              <b-th
                :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
                rowspan="2"
                >Discount</b-th
              >
              <b-th
                :style="{ maxWidth: '200px', width: '80px', minWidth: '50px' }"
                rowspan="2"
                >Taxable Amt</b-th
              >
              <b-th
                :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
                colspan="2"
                v-if="isGst"
                >IGST</b-th
              >
              <b-th
                :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
                colspan="2"
                v-if="isGst"
                >CESS</b-th
              >
              <b-th
                :style="{ maxWidth: '100px', width: '80px', minWidth: '80px' }"
                colspan="2"
                v-if="!isGst"
                >TAX</b-th
              >
              <b-th
                :style="{
                  maxWidth: '300px',
                  width: '150px',
                  minWidth: '100px',
                }"
                rowspan="2"
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
                v-if="isGst"
                >%</b-th
              >
              <b-th
                :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
                v-if="isGst"
                >Rs</b-th
              >
              <b-th
                :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
                v-if="isGst"
                >%</b-th
              >
              <b-th
                :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
                v-if="isGst"
                >Rs</b-th
              >
              <b-th
                :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
                v-if="!isGst"
                >%</b-th
              >
              <b-th
                :style="{ maxWidth: '50px', width: '30px', minWidth: '30px' }"
                v-if="!isGst"
                >Rs</b-th
              >
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr
              class="text-center"
              v-for="(field, index) in form.bill"
              :key="index"
            >
              <!-- No.  -->
              <b-td>
                {{ index + 1 }}
              </b-td>

              <!-- Item -->
              <b-td>
                <b-form-select
                  size="sm"
                  v-model="field.product"
                  :options="options.products"
                  @input="fetchProductDetails(field.product.id, index)"
                  required
                ></b-form-select>
              </b-td>

              <!-- HSN/SAC -->
              <b-td>
                <b>{{ field.hsn }}</b>
              </b-td>

              <!-- Qty -->
              <b-td>
                <b-input
                  v-model="field.qty"
                  class="hide-spin-button text-right"
                  type="number"
                  step="0.01"
                  min="0.01"
                  @input="updateTaxAndTotal(index)"
                  :readonly="field.isService"
                ></b-input>
              </b-td>

              <!-- Rate -->
              <b-td>
                <b-input
                  v-model="field.rate"
                  class="hide-spin-button text-right"
                  type="number"
                  step="0.01"
                  min="0.01"
                  @input="updateTaxAndTotal(index)"
                ></b-input>
              </b-td>

              <!-- Discount -->
              <b-td>
                <b-input
                  v-model="field.discount.amount"
                  class="hide-spin-button text-right"
                  type="number"
                  step="0.01"
                  min="0.00"
                  @input="updateTaxAndTotal(index)"
                ></b-input>
              </b-td>

              <!-- Taxable Amt -->
              <b-td>
                {{ field.taxable }}
              </b-td>

              <!-- GST % -->
              <b-td v-if="isGst">
                {{ field.igst.rate }}
              </b-td>

              <!-- GST $ -->
              <b-td v-if="isGst">
                {{ field.igst.amount }}
              </b-td>

              <!-- CESS % -->
              <b-td v-if="isGst">
                {{ field.cess.rate }}
              </b-td>

              <!-- CESS $ -->
              <b-td v-if="isGst">
                {{ field.cess.amount }}
              </b-td>

              <!-- VAT Tax % -->
              <b-td v-if="!isGst">
                {{ field.vat.rate }}
              </b-td>

              <!-- VAT Tax $ -->
              <b-td v-if="!isGst">
                {{ field.vat.amount }}
              </b-td>

              <!-- Total -->
              <b-td>
                {{ field.total }}
              </b-td>

              <!-- +/- Buttons -->
              <b-td>
                <b-button
                  v-if="index < billLength - 1"
                  @click.prevent="deleteBillItem()"
                  size="sm"
                  >-</b-button
                >
                <b-button v-else @click.prevent="addBillItem()" size="sm"
                  >+</b-button
                >
              </b-td>
            </b-tr>
          </b-tbody>
          <b-tfoot>
            <b-tr variant="secondary" class="text-right">
              <b-th colspan="5"> Total </b-th>
              <b-th> ₹ {{ getTotal("discount", "amount") }}</b-th>
              <b-th> ₹ {{ getTotal("taxable") }}</b-th>
              <b-th colspan="2" v-if="isGst"
                >₹ {{ getTotal("igst", "amount") }}</b-th
              >
              <b-th colspan="2" v-if="isGst"
                >₹ {{ getTotal("cess", "amount") }}</b-th
              >
              <b-th colspan="2" v-else>{{ getTotal("vat", "amount") }}</b-th>
              <b-th> ₹ {{ getTotal("total") }}</b-th>
              <b-th></b-th>
            </b-tr>
          </b-tfoot>
        </b-table-simple>

        <b-row class="mt-5">
          <b-col cols="12" lg="7"></b-col>
          <b-col cols="12" lg="5">
            <b-table-simple responsive>
              <b-tbody>
                <b-tr>
                  <b-th colspan="3">Taxable Amount</b-th>
                  <b-th class="text-right">₹ {{ getTotal("taxable") }}</b-th>
                </b-tr>
                <b-tr>
                  <b-th colspan="3">Total IGST</b-th>
                  <b-th class="text-right"
                    >₹ {{ getTotal("igst", "amount") }}</b-th
                  >
                </b-tr>
                <b-tr>
                  <b-th colspan="3">Total CESS</b-th>
                  <b-th class="text-right"
                    >₹ {{ getTotal("cess", "amount") }}</b-th
                  >
                </b-tr>
                <b-tr>
                  <b-th colspan="3">Total Discount</b-th>
                  <b-th class="text-right"
                    >₹ {{ getTotal("discount", "amount") }}</b-th
                  >
                </b-tr>
                <b-tr>
                  <b-th colspan="3">Total Invoice Value</b-th>
                  <b-th class="text-right">₹ {{ getTotal("total") }}</b-th>
                </b-tr>
                <b-tr>
                  <b-th colspan="3">Total Invoice Value (Rounded Off)</b-th>
                  <b-th class="text-right"
                    >₹ {{ Math.round(getTotal("total")) }}</b-th
                  >
                </b-tr>
              </b-tbody>
            </b-table-simple>
          </b-col>
        </b-row>
        <b-card-group class="d-block d-md-flex" deck>
          <b-card class="mr-md-1 mb-2 mb-md-0" border-variant="secondary">
            <div class="mb-3">
              <b>Payment Details</b>
            </div>
            <b-form-group
              label="Mode of Payment"
              label-for="input-19"
              label-size="sm"
              label-cols="auto"
            >
              <b-form-select
                size="sm"
                id="input-19"
                v-model="form.payment.mode"
                :options="options.payModes"
                required
              ></b-form-select>
            </b-form-group>
            <b v-if="form.payment.mode === 3">CASH RECEIVED</b>
            <div v-if="form.payment.mode === 2">
              <b>Bank Details</b>
              <b-form-group
                label="Acc. No."
                label-for="input-20"
                label-cols="3"
                label-size="sm"
                label-cols-lg="autauto"
              >
                <b-form-input
                  size="sm"
                  id="input-20"
                  v-model="form.payment.bank.no"
                  trim
                  required
                ></b-form-input>
              </b-form-group>
              <b-form-group
                label="Bank Name"
                label-for="input-21"
                label-cols="3"
                label-size="sm"
                label-cols-lg="autauto"
              >
                <b-form-input
                  size="sm"
                  id="input-21"
                  v-model="form.payment.bank.name"
                  trim
                  required
                ></b-form-input>
              </b-form-group>
              <b-form-group
                label="Branch"
                label-for="input-22"
                label-cols="3"
                label-size="sm"
                label-cols-lg="autauto"
              >
                <b-form-input
                  size="sm"
                  id="input-22"
                  v-model="form.payment.bank.branch"
                  trim
                  required
                ></b-form-input>
              </b-form-group>
              <b-form-group
                label="IFSC"
                label-for="input-23"
                label-cols="3"
                label-size="sm"
                label-cols-lg="autauto"
              >
                <b-form-input
                  size="sm"
                  id="input-23"
                  v-model="form.payment.bank.ifsc"
                  trim
                  required
                ></b-form-input>
              </b-form-group>
            </div>
            <b v-if="form.payment.mode === 15">ON CREDIT</b>
          </b-card>
          <b-card class="mx-md-1 mb-2 mb-md-0" border-variant="secondary">
            <div class="mb-3">
              <b>Transport Details</b>
            </div>
            <b-form-group
              label="Mode of Transport"
              label-for="input-24"
              label-size="sm"
              label-cols="auto"
            >
              <b-form-select
                size="sm"
                id="input-24"
                v-model="form.transport.mode"
                :options="options.transportModes"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label="Vehicle No."
              label-for="input-25"
              label-cols="auto"
              label-size="sm"
              label-cols-lg="autauto"
              v-if="form.transport.mode === 'Road'"
            >
              <b-form-input
                size="sm"
                id="input-25"
                v-model="form.transport.vno"
                trim
              ></b-form-input>
            </b-form-group>
            <b-form-group
              id="input-group-3"
              label="Date of Supply"
              label-cols="auto"
              label-for="date-2"
              label-size="sm"
            >
              <b-input-group>
                <b-form-input
                  size="sm"
                  id="date-2"
                  v-model="form.transport.date"
                  type="text"
                  placeholder="YYYY-MM-DD"
                  autocomplete="off"
                ></b-form-input>
                <b-input-group-append>
                  <b-form-datepicker
                    size="sm"
                    v-model="form.transport.date"
                    button-only
                    right
                    locale="en-GB"
                    aria-controls="date-1"
                  >
                  </b-form-datepicker>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <b-form-checkbox size="sm" name="check-button" switch>
              Reverse Charge
            </b-form-checkbox>
          </b-card>
          <b-card class="ml-md-1 mb-2 mb-md-0" border-variant="secondary">
            <div class="mb-3">
              <b>Invoice Comments</b>
            </div>
            <b-form-group
              label="Comments"
              label-for="input-27"
              label-cols="auto"
              label-size="sm"
              label-cols-lg="autauto"
            >
              <b-form-textarea
                size="sm"
                id="input-27"
                v-model="form.narration"
                trim
              ></b-form-textarea>
            </b-form-group>
          </b-card>
        </b-card-group>
        <hr />
        <div class="float-right">
          <b-button
            class="m-1"
            size="sm"
            variant="danger"
            :to="{ name: 'Workflow' }"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-left"
            ></b-icon>
            <span class="align-middle"> Back</span>
          </b-button>
          <b-button
            class="m-1"
            size="sm"
            variant="warning"
            @click.prevent="resetForm"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-repeat"
            ></b-icon>
            <span class="align-middle"> Reset</span>
          </b-button>
          <b-button type="submit" size="sm" class="m-1" variant="success">
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Save</span>
          </b-button>
        </div>
      </b-form>
    </b-card>
  </b-container>
</template>

<script>
import Axios from "axios";
import { mapState } from "vuex";
export default {
  name: "Invoice",
  data() {
    return {
      form: {
        inv: {
          type: "sale", // purchase
          no: null,
          date: this.formatDateObj(new Date()),
          delNote: null,
          ebn: null,
          addr: null,
          pin: null,
          state: null,
          issuer: null,
          role: null,
        },
        party: {
          type: "customer", // supplier
          options: {
            states: [],
            gstin: [],
          },
          custid: null,
          name: null,
          addr: null,
          state: null,
          gstin: null,
          tin: null,
          pin: null,
        },
        ship: {
          copyFlag: true,
          name: null,
          addr: null,
          state: null,
          gstin: null,
          tin: null,
          pin: null,
        },
        taxType: "gst", // vat
        bill: [
          {
            product: "",
            hsn: "",
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
        payment: {
          mode: 3,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        },
        transport: {
          mode: "Road",
          vno: null,
          date: null,
          reverseCharge: null,
        },
        narration: null,
        total: {
          words: "",
          rounded: null,
          roundFlag: false,
        },
      },
      isLoading: false,
      temp: null,
      options: {
        customers: [],
        suppliers: [],
        products: [],
        services: [],
        states: [],
        payModes: [
          { text: "-- Payment Mode --", value: null },
          { text: "Cash", value: 3 },
          { text: "Bank", value: 2 },
          { text: "On Credit", value: 15 },
        ],
        transportModes: [
          { text: "-- Transport Mode --", value: null },
          "Road",
          "Rail",
          "Air",
          "Ship",
          "Other",
        ],
      },
    };
  },
  computed: {
    billLength: (self) => self.form.bill.length,
    height: () =>
      window.innerHeight -
      document.getElementById("app-header").offsetHeight -
      30,
    party: (self) =>
      self.form.party.type === "customer" ? "Customer" : "Supplier",
    isSale: (self) => self.form.inv.type === "sale",
    isGst: (self) => self.form.taxType === "gst",
    sameBillAddress: {
      get: function () {
        return this.form.ship.copyFlag;
      },
      set: function (flag) {
        this.form.ship.copyFlag = !!flag;
        this.setShippingDetails();
      },
    },
    ...mapState(["authToken", "gkCoreUrl", "userName", "yearEnd"]),
  },
  methods: {
    /**
     * getTotal(key)
     *
     * returns the total sum of the given key for all items in bill
     */
    getTotal(key, subKey) {
      let total = 0;
      if (subKey) {
        total = this.form.bill.reduce(
          (acc, curr) => parseFloat(acc) + parseFloat(curr[key][subKey]),
          0
        );
      } else {
        total = this.form.bill.reduce(
          (acc, curr) => parseFloat(acc) + parseFloat(curr[key]),
          0
        );
      }
      return total.toFixed(2);
    },
    addBillItem() {
      this.form.bill.push({
        product: { id: null, name: "" },
        hsn: "",
        qty: 0,
        fqty: 0,
        rate: 0,
        discount: { rate: 0, amount: 0 },
        taxable: 0,
        igst: { rate: 0, amount: 0 },
        cess: { rate: 0, amount: 0 },
        vat: { rate: 0, amount: 0 },
        total: 0,
      });
    },
    deleteBillItem(index) {
      this.form.bill.splice(index, 1);
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
      let item = this.form.bill[index];
      if (item) {
        if (item.rate > 0) {
          if (item.qty > 0) {
            item.taxable = parseFloat(
              (item.rate * item.qty - item.discount.amount).toFixed(2)
            );
          } else if (item.isService) {
            item.taxable = parseFloat(
              (item.rate - item.discount.amount).toFixed(2)
            );
          }

          if (this.form.taxType === "gst") {
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
            if (item.tax.rate > 0) {
              item.vat.amount = (item.taxable * (item.vat.rate * 0.01)).toFixed(
                2
              );
            }
            item.total = (item.taxable + item.vat.amount).toFixed(2);
          }
        }
      }
    },
    preloadData() {
      let config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      const requests = [
        Axios.get(
          `${this.gkCoreUrl}/customersupplier?qty=custall`,
          config
        ).catch((error) => {
          this.displayToast(
            "Fetch Customer Data Failed!",
            error.message,
            "danger"
          );
          return error;
        }),
        Axios.get(
          `${this.gkCoreUrl}/customersupplier?qty=supall`,
          config
        ).catch((error) => {
          this.displayToast(
            "Fetch Supplier Data Failed!",
            error.message,
            "danger"
          );
          return error;
        }),
        Axios.get(`${this.gkCoreUrl}/products`, config).catch((error) => {
          this.displayToast(
            "Fetch Product Data Failed!",
            error.message,
            "danger"
          );
          return error;
        }),
        Axios.get(`${this.gkCoreUrl}/state`, config).catch((error) => {
          this.displayToast(
            "Fetch State Data Failed!",
            error.message,
            "danger"
          );
          return error;
        }),
      ];

      const self = this;
      Promise.all([...requests]).then(([resp1, resp2, resp3, resp4]) => {
        self.isLoading = false;

        let preloadErrorList = ""; // To handle the unloaded data, at once than individually

        /**
         * The data obtained are updated, to be comptaible with the
         * component they are used with (<b-form-select>)
         * and based on requirement
         */

        // === Customer List ===
        if (resp1.status === 200) {
          if (resp1.data.gkstatus === 0) {
            self.options.customers = resp1.data.gkresult.map((item) => {
              return {
                text: item.custname,
                value: {
                  id: item.custid,
                  name: item.custname,
                },
              };
            });
          } else {
            preloadErrorList += " Customers,";
          }
        } else {
          preloadErrorList += " Customers,";
        }

        // === Supplier List ===
        if (resp2.status === 200) {
          if (resp2.data.gkstatus === 0) {
            self.options.suppliers = resp2.data.gkresult.map((item) => {
              return {
                text: item.custname,
                value: {
                  id: item.custid,
                  name: item.custname,
                },
              };
            });
          } else {
            preloadErrorList += " Suppliers,";
          }
        } else {
          preloadErrorList += " Suppliers,";
        }

        // === Products & Services List ===
        if (resp3.status === 200) {
          if (resp3.data.gkstatus === 0) {
            self.options.products = resp3.data.gkresult.map((item) => {
              return {
                text: item.productdesc,
                value: {
                  id: item.productcode,
                  name: item.productdesc,
                },
              };
            });
          } else {
            preloadErrorList += " Products/Services,";
          }
        } else {
          preloadErrorList += " Products/Services,";
        }

        // === State List ===
        if (resp4.status === 200) {
          if (resp4.data.gkstatus === 0) {
            self.options.states = resp4.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: {
                  id: Object.keys(item)[0],
                  name: Object.values(item)[0],
                },
              };
            });
          } else {
            preloadErrorList += " States,";
          }
        } else {
          preloadErrorList += " States,";
        }

        if (preloadErrorList !== "") {
          this.displayToast(
            "Error: Unable to Preload Data",
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            "danger"
          );
        }
      });
    },
    /**
     * fetchCustomerData(id)
     *
     * Description: Fetch customer/supplier data, for 'Billed To/By' section
     */
    fetchCustomerData(id) {
      if (id !== null) {
        let self = this;
        let config = {
          headers: {
            gktoken: this.authToken,
          },
        };
        Axios.get(
          `${this.gkCoreUrl}/customersupplier?qty=single&custid=${id}`,
          config
        )
          .then((resp) => {
            switch (resp.data.gkstatus) {
              case 0:
                // convert [{id: name}, {id2: name}] to {id: name, id2: name}, to remove duplicates
                var stateList =
                  resp.data.gkresult.statelist.reduce((acc, item) => {
                    acc[Object.keys(item)[0]] = Object.values(item)[0];
                    return acc;
                  }, {}) || {};
                // convert it back to array format for <b-form-select> options
                var states = Object.keys(stateList).map((key) => {
                  return {
                    text: stateList[key],
                    value: { id: key, name: stateList[key] },
                  };
                });
                Object.assign(self.form.party, {
                  addr: resp.data.gkresult.custaddr,
                  options: {
                    states,
                    gstin: resp.data.gkresult.gstin,
                  },
                  state: states[0].value,
                  pin: resp.data.gkresult.pincode,
                  gstin: null,
                  tin: resp.data.gkresult.custtan || null,
                });
                self.setPartyGst(); // set gstin based on state

                break;
              case 2:
                self.resetPartyDetails(); // if there no data, then reset the fields
                this.displayToast(
                  "Fetch Customer/Supplier Data Error!",
                  "Unauthorized Access, Please contact Admin",
                  "warning"
                );
                break;
              case 3:
              default:
                self.resetPartyDetails(); // if there no data, then reset the fields
                this.displayToast(
                  "Fetch Customer/Supplier Data Error!",
                  "Unable to Fetch Customer/Supplier Data, Please try again",
                  "danger"
                );
            }
            self.setShippingDetails(); // updates shipping details as well if flag is set
          })
          .catch((error) => {
            this.displayToast(
              "Fetch Customer/Supplier Data Error!",
              error.message,
              "warning"
            );
          });
      }
    },
    /**
     * fetchProductDetails(id, index)
     *
     * Description: Fetches product details like price, discount and taxes,
     * when a product is selected in the bill area
     */
    fetchProductDetails(id, index) {
      let self = this;
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      const requests = [
        Axios.get(
          `${this.gkCoreUrl}/products?qty=single&productcode=${id}`,
          config
        ).catch((error) => {
          return error;
        }),
        Axios.get(
          `${this.gkCoreUrl}/tax?pscflag=p&productcode=${id}`,
          config
        ).catch((error) => {
          return error;
        }),
      ];
      Promise.all([...requests]).then(([resp1, resp2]) => {
        self.isLoading = false;

        // Product Data
        if (resp1.status === 200) {
          if (resp1.data.gkstatus === 0) {
            let data = resp1.data.gkresult;
            Object.assign(self.form.bill[index], {
              hsn: data.gscode,
              rate: data.prodmrp,
              discount: {
                rate: data.discountpercent,
                amount: data.discountamount,
              },
              isService: data.gsflag === 19,
            });
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
              igst = data.filter((item) => item.taxname === "IGST"),
              cess = data.filter((item) => item.taxname === "CESS"),
              vat = data.filter((item) => item.taxname === "CVAT");

            if (igst.length) {
              tax["igst"] = {
                rate: igst[0].taxrate,
                amount: 0,
              };
            }
            if (cess.length) {
              tax["cess"] = {
                rate: cess[0].taxrate,
                amount: 0,
              };
            }
            if (vat.length) {
              tax["vat"] = {
                rate: vat[0].taxrate,
                amount: 0,
              };
            }
            Object.assign(self.form.bill[index], tax);
          }
        } else {
          console.log(resp2.message);
        }

        self.updateTaxAndTotal(index);
      });
    },
    /**
     * fetchInvoiceId()
     *
     * Description: Auto invoice numbering, based on invoice type
     * Using the /invoice?getinvid API
     */
    fetchInvoiceId() {
      // inoutflag = 9-purchase, 15-sale
      let self = this;
      let invid = "";
      let inoutflag = this.isSale ? 15 : 9;
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      Axios.get(`${this.gkCoreUrl}/invoice?getinvid&type=${inoutflag}`, config)
        .then((resp) => {
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              invid = resp.data.invoiceid + "/";
              invid += this.isSale ? "SL" : "PU";
              invid += "-" + String(this.yearEnd).substring(2, 4);
              self.form.inv.no = invid;
            }
          }
        })
        .catch((error) => {
          return error;
        });
    },
    fetchUserData() {
      let config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      let self = this;
      Axios.get(`${this.gkCoreUrl}/users?user=single`, config)
        .then((resp) => {
          // === User name and role ===
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              self.form.inv.issuer = resp.data.gkresult.username;
              self.form.inv.role = resp.data.gkresult.userroleName;
            } else {
              // User data not available, check again
            }
          } else {
            // User data not available, check again
          }
        })
        .catch((error) => {
          this.displayToast("Fetch User Data Failed!", error.message, "danger");
          return error;
        });
    },
    /**
     * setPartyGst()
     *
     * Description: Sets the party GSTIN field, based on the state chosen
     */
    setPartyGst() {
      if (this.form.party.options.gstin) {
        this.form.party.gstin =
          this.form.party.options.gstin[this.form.party.state] || null;
      }
    },
    setShippingDetails() {
      if (this.form.ship.copyFlag) {
        Object.assign(this.form.ship, this.form.party);
        this.form.ship.name = this.form.party.name.name;
        delete this.form.ship.type;
      } else {
        this.form.ship = {
          copyFlag: false,
          name: null,
          addr: null,
          state: null,
          gstin: null,
          pin: null,
        };
      }
    },
    resetPartyDetails() {
      Object.assign(this.form.party, {
        addr: null,
        options: {
          states: null,
          gstin: null,
        },
        state: null,
        pin: null,
        gstin: null,
      });
    },
    /**
     * formatDateObj(date)
     *
     * Description: Converts a js Date object, into yyyy-mm-dd string
     */
    formatDateObj(date) {
      let month = date.getMonth() + 1;
      month = month > 9 ? month : "0" + month;
      let day = date.getDate();
      day = day > 9 ? day : "0" + day;
      return `${date.getFullYear()}-${month}-${day}`;
    },
    onSubmit() {
      let self = this;
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      this.isLoading = true;

      const payload = this.initPayload();

      Axios.post(`${this.gkCoreUrl}/invoice`, payload, config)
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
              case 0:
                // success
                this.displayToast(
                  "Create Invoice Successfull!",
                  `Invoice saved with entry no. ${resp.data.gkresult.invoiceid}`,
                  "success"
                );
                this.resetForm();
                break;
              case 1:
                // Duplicate entry
                this.displayToast(
                  "Create Invoice Failed!",
                  "Duplicate Entry, Check Invoice Id",
                  "warning"
                );
                break;
              case 2:
                // Unauthorized access
                this.displayToast(
                  "Create Invoice Failed!",
                  "Unauthorized Access, Contact Admin",
                  "warning"
                );
                break;
              case 3:
                // Connection failed, Check inputs and try again
                this.displayToast(
                  "Create Invoice Failed!",
                  "Please check your input and try again later",
                  "danger"
                );
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast("Create Invoice Error!", error.message, "warning");
        });
    },
    initPayload() {
      let invoice = {
        dcid: null,
        invoiceno: this.form.inv.no,
        ewaybillno: this.form.inv.ebn,
        invoicedate: this.form.inv.date,
        sourcestate: this.form.inv.state.name,
        orgstategstin: null,
        issuername: this.form.inv.issuer,
        designation: this.form.inv.role,
        address: this.form.inv.addr,
        pincode: this.form.inv.pin,

        custid: this.form.party.name.id,
        consignee: {},

        roundoffflag: 1,
        invtotal: this.getTotal("total"),
        invtotalword: null,

        taxflag: null,
        taxstate: null,

        pricedetails: [],

        paymentmode: this.form.payment.mode,

        transportationmode: this.form.transport.mode,
        reversecharge: this.form.transport.reverseCharge ? 1 : 0,
        dateofsupply: this.form.transport.date,

        discflag: 1,
        invnarration: this.form.narration,
      };

      // === Sale / Purchase related data ===
      if (this.isSale) {
        invoice.sourcestate = this.form.inv.state.name;
        invoice.taxstate = this.form.party.state.name;
        invoice.inoutflag = 15; // sale
      } else {
        invoice.sourcestate = this.form.party.state.name;
        invoice.taxstate = this.form.inv.state.name;
        invoice.inoutflag = 9; // purchase
      }

      // === GST/ VAT related data ===
      if (this.isGst) {
        invoice.taxflag = 7;
      } else {
        invoice.taxflag = 22;
      }

      // === Total Invoice price data ===
      let total = this.getTotal("total");
      let roundoff = Math.round(total);
      let words = this.numToWords(roundoff) + " Rupees";

      invoice.invoicetotal = total;
      invoice.invoicetotalword = words;

      // === Consignee data ===
      if (this.form.ship.name) {
        invoice.consignee = {
          consigneename: this.form.ship.name,
          tinconsignee: this.form.ship.tin || "",
          gstinconsignee: this.form.ship.gstin || "",
          consigneeaddress: this.form.ship.addr,
          consigneestate: this.form.ship.state.name,
          consigneestatecode: this.form.ship.state.id,
          consigneepincode: this.form.ship.pin,
        };
      }

      // === Bill data ===
      let contents = {};
      let stock = { items: {}, inout: 9 };
      let pricedetails = [];
      let tax = {};
      let cess = {};
      let av = {
        product: {},
        prodData: {},
        taxpayment: 0,
        totaltaxable: 0,
      };
      let freeqty = {};
      let discount = {};
      this.form.bill.forEach((item) => {
        let taxable = item.total * item.qty - item.discount.amount;

        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][item.rate] = parseFloat(item.qty).toFixed(2);
        stock.items[item.product.id] = parseFloat(item.qty).toFixed(2);

        if (this.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
          av.avtax = { GSTName: "IGST", CESSName: "CESS" };
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
          av.taxpayment += taxable;
        }

        freeqty[item.product.id] = parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.amount).toFixed(2);

        av.product[item.product.name] = parseFloat(taxable).toFixed(2);
        av.prodData[item.product.id] = parseFloat(taxable).toFixed(2);
        av.totaltaxable += taxable;

        pricedetails.push({
          custid: this.form.party.name.id,
          productcode: item.product.id,
          inoutflag: invoice.inoutflag,
          lastprice: item.rate,
        });
      });

      av.taxpayment = parseFloat(av.taxpayment).toFixed(2);
      av.totaltaxable = parseFloat(av.totaltaxable).toFixed(2);

      Object.assign(invoice, {
        contents,
        pricedetails,
        tax,
        cess,
        av,
        freeqty,
        discount,
      });

      // === payment details, mode = 2 ===
      if (this.form.payment.mode === 2) {
        invoice.bankdetails = {
          accountno: this.form.payment.bank.no,
          bankname: this.form.payment.bank.name,
          ifsc: this.form.payment.bank.ifsc,
          branch: this.form.payment.bank.branch,
        };
      }

      if (this.form.transport.mode === "Road") {
        invoice.vehicleno = this.form.transport.vno;
      }

      console.log({ invoice, stock });
      return { invoice, stock };
    },
    resetForm() {
      this.form = {
        inv: {
          // type: "sale", // purchase
          no: null,
          date: this.formatDateObj(new Date()),
          delNote: null,
          ebn: null,
          addr: null,
          pin: null,
          state: null,
          issuer: null,
          role: null,
        },
        party: {
          // type: "customer", // supplier
          options: {
            states: [],
            gstin: [],
          },
          custid: null,
          name: { id: null, name: null },
          addr: null,
          state: null,
          gstin: null,
          tin: null,
          pin: null,
        },
        ship: {
          copyFlag: true,
          name: null,
          addr: null,
          state: null,
          gstin: null,
          tin: null,
          pin: null,
        },
        // taxType: "gst", // vat
        bill: [
          {
            product: "",
            hsn: "",
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
        payment: {
          mode: 3,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        },
        transport: {
          mode: "Road",
          vno: null,
          date: null,
          reverseCharge: null,
        },
        narration: null,
        total: {
          words: "",
          rounded: null,
          roundFlag: false,
        },
      };

      this.fetchInvoiceId();
      this.fetchUserData();
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
    numToWords(number) {
      // https://stackoverflow.com/questions/5529934/javascript-numbers-to-words/46221860#46221860
      var NS = [
        { value: 10000000, str: "Crore" },
        { value: 100000, str: "Lakhs" },
        { value: 1000, str: "Thousand" },
        { value: 100, str: "Hundred" },
        { value: 90, str: "Ninety" },
        { value: 80, str: "Eighty" },
        { value: 70, str: "Seventy" },
        { value: 60, str: "Sixty" },
        { value: 50, str: "Fifty" },
        { value: 40, str: "Forty" },
        { value: 30, str: "Thirty" },
        { value: 20, str: "Twenty" },
        { value: 19, str: "Nineteen" },
        { value: 18, str: "Eighteen" },
        { value: 17, str: "Seventeen" },
        { value: 16, str: "Sixteen" },
        { value: 15, str: "Fifteen" },
        { value: 14, str: "Fourteen" },
        { value: 13, str: "Thirteen" },
        { value: 12, str: "Twelve" },
        { value: 11, str: "Eleven" },
        { value: 10, str: "Ten" },
        { value: 9, str: "Nine" },
        { value: 8, str: "Eight" },
        { value: 7, str: "Seven" },
        { value: 6, str: "Six" },
        { value: 5, str: "Five" },
        { value: 4, str: "Four" },
        { value: 3, str: "Three" },
        { value: 2, str: "Two" },
        { value: 1, str: "One" },
      ];

      var result = "";
      for (var n of NS) {
        if (number >= n.value) {
          if (number <= 90) {
            result += n.str;
            number -= n.value;
            if (number > 0) result += " ";
          } else {
            var t = Math.floor(number / n.value);
            // console.log(t);
            var d = number % n.value;
            if (d > 0) {
              return (
                this.numToWords(t) + " " + n.str + " " + this.numToWords(d)
              );
            } else {
              return this.numToWords(t) + " " + n.str;
            }
          }
        }
      }
      return result;
    },
  },
  mounted() {
    this.preloadData();
    this.fetchInvoiceId();
    this.fetchUserData();
  },
};
</script>