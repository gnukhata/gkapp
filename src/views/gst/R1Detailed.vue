<template>
  <section>
    <!-- Headings -->
    <h2 class="text-muted  text-uppercase display-5">
      GST R1 {{ tableInfo.type }}
    </h2>
    <h6 class="text-muted text-uppercase">
      {{ dateReverse(tableInfo.fd) }} to
      {{ dateReverse(tableInfo.td) }}
    </h6>
    <!-- report  -->
    <div class="d-flex d-print-none justify-content-between align-items-center mb-2 mt-4">
      <!-- Search Field -->
      <div>
        <b-input-group size="sm">
          <b-form-input
            size="sm"
            v-model="search"
            placeholder="Search Table"
            style="align-self:center"
          />
        </b-input-group>
      </div>
    </div>
    <b-table
      v-if="items.length"
      class="mt-3"
      head-variant="light"
      small
      outlined
      :current-page="currentPage"
      :filter="search"
      :busy="loading"
      :per-page="perPage"
      :items="items"
      :fields="fields"
      :sort-desc="true"
      sort-by="invoice_date"
      no-border-collapse
      @filtered="onFiltered"
      responsive
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            type="grow"
            class="align-middle"
          />
          <strong> Fetching data</strong>
        </div>
      </template>
      <template #cell(invoice_number)="data">
        <router-link
          v-if="data.item.icflag && data.item.icflag === 3"
          :to="'/workflow/Transactions-CashMemo/' + data.item.invid"
        >
          {{ data.item.invoice_number }}
        </router-link>
        <router-link
          v-else
          :to="'/workflow/Transactions-Invoice/' + data.item.invid"
        >
          {{ data.item.invoice_number }}
        </router-link>
      </template>
      <template #cell(voucher_number)="data">
        <router-link
          :to="'/workflow/Transactions-DebitCreditNote/' + data.item.drcrid"
        >
          {{ data.item.voucher_number }}
        </router-link>
      </template>
    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      align="right"
      class="my-0"
    />
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'R1Detailed',
  props: {
    td: {
      type: String,
    },
    fd: {
      type: String,
    },
    type:{
      type: String,
    },
  },
  data() {
    return {
      currentPage: 1,
      totalRows: 1,
      perPage: 15,
      fields: [],
      items: [],
      list: [],
      search: "",
      tableInfo: null,
      loading: false,
    };
  },
  computed: {
    ...mapState(['orgName']),
  },
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    getGstR1Report() {
      this.loading = true;
      axios
        .get(`/gst/returns/r1?start=${this.tableInfo.fd}&end=${this.tableInfo.td}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.list = r.data.gkdata;
              if (this.type === "hsn_b2b") {
                this.items = this.list?.hsn1?.b2b || [];
              } else if (this.type === "hsn_b2c") {
                this.items = this.list?.hsn1?.b2c || [];
              } else {
                this.items = this.list[this.tableInfo.type];
              }
              // remove drilldown id columns
              if (this.items.length) {
                let fields = Object.keys(this.items[0]);
                this.totalRows = this.items.length
                fields = fields.filter(item => item !== "cess");
                this.fields = fields;

                let rightAlignFields = {
                  rate: true,
                  taxable_value: true,
                  applicable_tax_rate: true,
                  refund_voucher_value: true,
                  invoice_value: true,
                  qty: true,
                  totalvalue: true,
                  taxableamt: true,
                  SGSTamt: true,
                  IGSTamt: true,
                };

                // remove ids from display as they will be used for drop down purposes with respective document no.
                let index = this.fields.findIndex(
                  (field) => field === 'invid'
                );
                if (index >= 0) this.fields.splice(index, 1);

                index = this.fields.findIndex((field) => field === 'drcrid');
                if (index >= 0) this.fields.splice(index, 1);

                index = this.fields.findIndex((field) => field === 'icflag');
                if (index >= 0) this.fields.splice(index, 1);

                // move invoice_number to first column
                index = this.fields.findIndex(
                  (field) => field === 'invoice_number'
                );
                if (index >= 0) {
                  this.fields.splice(index, 1);
                  this.fields.unshift('invoice_number');
                }

                // update labels
                for (let i = 0, l = this.fields.length; i < l; i++) {
                  let field = this.fields[i];
                  let label = '';
                  switch (field) {
                  case 'voucher_number':
                    label = 'Note Number';
                    break;
                  case 'voucher_date':
                    label = 'Note Date';
                    break;
                  case 'prodctname':
                    label = 'Description';
                    break;
                  case 'hsnsac':
                    label = 'HSN';
                    break;
                  case 'totalvalue':
                    label = 'Total Value';
                    break;
                  case 'taxableamt':
                    label = 'Taxable Amount';
                    break;
                  case 'IGSTamt':
                    label = 'Integrated Tax';
                    break;
                  case 'uqc':
                    label = 'UQC';
                    break;
                  case 'qty':
                    label = 'Total Quantity';
                    break;
                  case 'SGSTamt':
                    label = 'State/UT tax';
                    break;
                  case 'pregst':
                    label = 'Pre GST';
                    break;
                  case 'receiver':
                    label = 'Receiver Name';
                    break;
                  case 'gstin':
                    label = 'GSTIN/UIN of Recipient';
                    break;
                  case 'ecommerce_gstin':
                    label = 'E-Commerce GSTIN';
                    break;
                  case 'applicable_tax_rate':
                    label = 'Applicable % of Tax Rate';
                    break;
                  case 'document_type':
                    label = 'Note Type';
                    break;
                  case 'refund_voucher_value':
                    label = 'Note Value';
                    break;
                  }
                  if (label) {
                    this.fields[i] = {
                      key: field,
                      label: label,
                      sortable: true,
                    };
                  } else {
                    this.fields[i] = {
                      key: field,
                      sortable: true,
                    };
                  }

                  if (field === 'invoice_number') {
                    this.fields[i].stickyColumn = true;
                  }

                  // adds right align class for numerical fields
                  if (rightAlignFields[field]) {
                    this.fields[i].tdClass = ['text-right'];
                  }
                }

                if (this.type === 'hsn_b2b' || this.type === 'hsn_b2c' ) {
                  this.items.forEach((item) => {
                    if (item.hsnsac && typeof item.hsnsac === 'object') {
                      let hsn = JSON.parse(item.hsnsac || '{}');
                      if (typeof hsn === 'object') {
                        hsn = hsn.hsn_code || '';
                      }
                      item.hsnsac = hsn;
                    }
                  });
                }
              }
              break;
            case 1:
              this.$bvToast.toast('Duplicate Entry', {
                variant: 'warning',
                solid: true,
              });
              break;
            case 2:
              this.$bvToast.toast('Unauthorised Access', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
              this.$bvToast.toast('Data error', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast('No Privilege', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 5:
              this.$bvToast.toast('Integrity error', {
                variant: 'danger',
                solid: true,
              });
              break;
            }
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    getTableInfo() {
      if (this.$route.params.lenth > 0) {
        this.tableInfo = this.$route.params;
      } else {
        this.tableInfo = {
          td: this.td,
          fd: this.fd,
          type: this.type,
        }
      }
    },
  },
  mounted() {
    this.getTableInfo();
    this.getGstR1Report();
  },
};
</script>
