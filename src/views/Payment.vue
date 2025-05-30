<template>
  <section>
    <h2 class="my-4 text-muted display-5">
      {{ `Payments ${type === 'dr' ? 'Received' : 'Made'}` }}
    </h2>
    <div class="d-flex d-print-none justify-content-between align-items-center mb-2">
      <!-- Search Field -->
      <b-input-group size="sm">
        <b-form-input
          class="col-2"
          size="sm"
          v-model="search"
          placeholder="Search Table"
          style="align-self:center"
        />
      </b-input-group>
      <b-button
        variant="success"
        size="sm"
        style="min-width: 128px"
        @click="showPaymentModal = true"
      >
        {{ `${type === 'cr' ? 'Make' : 'Receive'} Payment` }}
      </b-button>
    </div>
    <b-table
      head-variant="light"
      hover
      outlined
      small
      responsive="sm"
      :filter="search"
      :fields="fields"
      :items="paginatedItems"
      :per-page="perPage"
      show-empty
    >
      <template #cell(voucherNumber)="data">
        <router-link :to="`/Workflow/Transactions-Voucher/${data.item.voucherId}`">
          {{ data.value }}
        </router-link>
      </template>
    </b-table>
    <div
        class="d-print-none d-flex align-items-center justify-content-end"
      >
        <b-pagination
          v-if="filteredItems.length > perPage"
          v-model="currentPage"
          :total-rows="filteredItems.length"
          :per-page="perPage"
          align="center"
          limit="4"
        />
      </div>
    <b-modal
      size="lg"
      v-model="showPaymentModal"
      centered
      static
      id="contact-item-modal"
      :title="`${type === 'cr' ? 'Make' : 'Receive' } Payment`"
      hide-footer
    >
      <voucher
        :type="type === 'cr' ? 'payment' : 'receipt'"
        mode="create"
      />
    </b-modal>
  </section>
</template>

<script>
import Voucher from "../components/form/Voucher.vue";

export default {
  name: 'Payment',
  components: { Voucher },
  props: {
    type: {
      type: String,
      validator: function (value) {
        return ["dr", "cr"].indexOf(value) !== -1;
      },
      required: true,
      default: null,
    },
  },
  data() {
    return {
      parentMessage: '',
      transactions: [],
      search: '',
      isLoading: false,
      showPaymentModal: false,
      currentPage: 1,
      perPage: 15,
      fields: [
        {
          key: "voucherNumber",
          label: "Voucher No.",
          sortable: true,
          class: 'col-2',
        },
        {
          key: "voucherDate",
          label: "Date",
          sortable: true,
          class: 'col-2',
        },
        {
          key: "account",
          label: "Account",
          class: 'col-5',
          sortable: true,
        },
        {
          key: "amount",
          label: "Amount",
          class: 'col-3',
          sortable: true,
        },
      ],
    };
  },
  methods: {
    // get users who are part of the org
    getTransactions() {
      this.isLoading = true;
      const paymentType = this.type === 'cr' ? 'payment' : 'receipt';
      this.$axios
        .get(`/transaction?searchby=type&vouchertype=${paymentType}`)
        .then((resp) => {
          this.transactions = [];
          resp.forEach((item) => {
            this.transactions.push({
              voucherId: item.vouchercode,
              voucherNumber: item.vouchernumber,
              voucherDate: item.voucherdate,
              account: this.type === 'cr' ? (
                Object.keys(item.crs ?? {}).join(', ')
              ) : (
                Object.keys(item.drs ?? {}).join(', ')
              ),
              amount: this.type === 'cr' ? (
                Object.values(item.crs ?? {})
                  .reduce((acc, val) => parseFloat(acc) + parseFloat(val), 0)
                  .toFixed(2)
              ) : (
                Object.values(item.drs ?? {})
                  .reduce((acc, val) => parseFloat(acc) + parseFloat(val), 0)
                  .toFixed(2)
              ),
            });
          });
        });
      this.isLoading = false;
    },
  },
  computed:{
    filteredItems() {
      return this.transactions;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredItems.slice(start, start + this.perPage);
    },
  },
  watch: {
    type() {
      this.getTransactions();
    },
  },
  mounted() {
    this.getTransactions();
  },
};
</script>
