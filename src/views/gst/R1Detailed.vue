<template>
  <section class="m-2">
    <!-- Headings -->
    <div class="text-center">
      <h4>{{ orgName }}</h4>
      <h5 class="text-muted text-center text-uppercase">
        GSTR-1 {{ params.type !== 'hsn1' ? params.type : 'HSN' }} ({{
          dateReverse(params.fd)
        }}
        to {{ dateReverse(params.td) }})
      </h5>
    </div>
    <div class="gkcard mx-auto">
      <b-form-input type="text" v-model="search" placeholder="Search">
      </b-form-input>
    </div>
    <!-- report table  -->
    <!-- B2B -->
    <b-table
      v-if="params.type == 'b2b'"
      class="mt-3"
      head-variant="dark"
      small
      bordered
      striped
      :items="list[this.params.type]"
      responsive="sm"
      :filter="search"
      :busy="loading"
      :fields="b2b_fields"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner type="grow" class="align-middle"></b-spinner>
          <strong> Fetching data</strong>
        </div>
      </template>
      <template #cell(invoice_value)="data">
        <div class="text-right">
          {{ data.item.invoice_value }}
        </div>
      </template>
      <template #cell(invoice_number)="data">
        <router-link
          :to="'/workflow/Transactions-Invoice/' + data.item.invoice_id"
        >
          {{ data.item.invoice_number }}
        </router-link>
      </template>
      <template #cell(voucher_number)="data">
        <router-link
          :to="'/workflow/Transactions-DebitCreditNote/' + data.item.voucher_id"
        >
          {{ data.item.voucher_number }}
        </router-link>
      </template>
      <template #cell(taxable_value)="data">
        <div class="text-right">
          {{ data.item.taxable_value }}
        </div>
      </template>
    </b-table>
    <!-- HSN -->
    <b-table
      v-if="params.type == 'hsn1'"
      class="mt-3"
      head-variant="dark"
      small
      bordered
      striped
      :items="list['hsn1']"
      responsive="sm"
      :filter="search"
      :busy="loading"
      :fields="hsn_fields"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner type="grow" class="align-middle"></b-spinner>
          <strong> Fetching data</strong>
        </div>
      </template>
      <template #cell(prodctname)="data">
        <b-link
          @click="$router.push(`/Workflow/Business/${data.item.product_id}`)"
        >
          {{ data.item.prodctname }}
        </b-link>
      </template>
    </b-table>
    <!-- B2CS -->
    <b-table
      v-if="params.type == 'b2cs'"
      class="mt-3"
      head-variant="dark"
      small
      bordered
      striped
      :items="list[this.params.type]"
      responsive="sm"
      :filter="search"
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner type="grow" class="align-middle"></b-spinner>
          <strong> Fetching data</strong>
        </div>
      </template>
      <template #cell(invoice_value)="data">
        <div class="text-right">
          {{ data.item.invoice_value }}
        </div>
      </template>
      <template #cell(invoice_number)="data">
        <router-link
          :to="'/workflow/Transactions-Invoice/' + data.item.invoice_id"
        >
          {{ data.item.invoice_number }}
        </router-link>
      </template>
      <template #cell(voucher_number)="data">
        <router-link
          :to="'/workflow/Transactions-DebitCreditNote/' + data.item.voucher_id"
        >
          {{ data.item.voucher_number }}
        </router-link>
      </template>
      <template #cell(taxable_value)="data">
        <div class="text-right">
          {{ data.item.taxable_value }}
        </div>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'R1Detailed',
  data() {
    return {
      list: [],
      search: null,
      params: null,
      loading: false,
      b2b_fields: [
        {
          key: 'gstin',
          label: 'GSTIN',
        },
        {
          key: 'reciever',
          label: 'Receiver',
        },
        {
          key: 'invoice_number',
          label: 'Invoice Number',
        },
        {
          key: 'invoice_date',
          label: 'Date',
        },
        {
          key: 'invoice_value',
          label: 'Invoice Value',
        },
        {
          key: 'place_of_supply',
          label: 'Place Of Supply',
        },
        {
          key: 'applicable_tax_rate',
          label: 'Applicable Tax Rate',
        },
        {
          key: 'invoice_type',
          label: 'Invoice Type',
        },
        {
          key: 'ecommerce_gstin',
          label: 'Ecommerce GSTIN',
        },
        {
          key: 'reverse_charge',
          label: 'Reverse Charge',
        },
        {
          key: 'taxable_value',
          label: 'Taxable Value',
        },
        {
          key: 'rate',
          label: 'Rate',
        },
        {
          key: 'cess',
          label: 'CESS',
        },
      ],
      hsn_fields: [
        {
          key: 'hsnsac',
          label: 'HSN',
        },
        {
          key: 'prodctname',
          label: 'Name',
        },
        {
          key: 'uqc',
          label: 'UQC',
        },
        {
          key: 'qty',
          label: 'QTY',
        },
        {
          key: 'totalvalue',
          label: 'Total',
          class: 'gk-currency',
        },
        {
          key: 'taxableamt',
          label: 'Taxable Amount',
          class: 'gk-currency',
        },
        {
          key: 'SGSTamt',
          label: 'SGST',
          class: 'gk-currency',
        },
        {
          key: 'IGSTamt',
          label: 'IGST',
          class: 'gk-currency',
        },
        {
          key: 'CESSamt',
          label: 'CESS',
          class: 'gk-currency',
        },
      ],
    };
  },
  computed: {
    ...mapState(['orgName']),
  },
  methods: {
    getGstR1Report() {
      this.loading = true;
      axios
        .get(
          `/gstreturns?type=r1&start=${this.params.fd}&end=${this.params.td}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkresult) {
              case 0:
                this.list = r.data.gkdata;
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
          } else {
            console.log(r);
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
  },
  created() {
    this.params = this.$route.params;
    this.getGstR1Report();
  },
};
</script>
