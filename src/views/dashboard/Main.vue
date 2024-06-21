<template>
  <section class="m-2">
    <Balance />
    <!-- bank / cash stats -->
    <div v-if="dataIsFetched">
      <b-card-group deck>
        <!-- Tiles -->
        <b-card class="shadow p-0">
          <Tiles />
        </b-card>
        <!-- Bank/Cash Balance graph -->
        <b-card class="shadow" no-body>
          <BankCashBalanceGraph :chartInput="dashboardData.balancedata" />
        </b-card>
      </b-card-group>
      <!-- Sale/Purchase Invoice Graphs -->
      <SalePurchaseInvoiceGraph :info="dashboardData.monthly_balance" />
      <!-- Make / Recieve Payment -->
      <MakeRecievePayment :info="dashboardData" :onPayment="onPayment" />
      <!-- Most Valued Customers / suppliers -->
      <MostValuedCS :info="dashboardData" />
      <!-- Most Sold Produc/ Services -->
      <MostSoldPS :info="dashboardData" />
      <!-- Income / Assets Chart -->
      <IncomeAssetsChart />

      <b-modal
        size="lg"
        v-model="showVoucherModal"
        centered
        static
        body-class="p-0"
        id="contact-item-modal"
        hide-footer
        hide-header
      >
        <easy-voucher
          :type="voucherType"
          :invId="voucherInvId"
          :onSave="onPaymentComplete"
        ></easy-voucher>
      </b-modal>
    </div>
  </section>
</template>
<script>
import axios from 'axios';
import Tiles from './Tiles.vue';
import BankCashBalanceGraph from './BankCashBalanceGraph.vue';
import MostValuedCS from './MostValuedCS.vue';
import Balance from './Balance.vue';
import MostSoldPS from './MostSoldPS.vue';
import SalePurchaseInvoiceGraph from './SalePurchaseInvoiceGraph.vue';
import MakeRecievePayment from './MakeRecievePayment.vue';
import IncomeAssetsChart from './IncomeAssetsChart.vue';
import EasyVoucher from '@/components/form/VoucherEasy.vue';

export default {
  components: {
    Tiles,
    BankCashBalanceGraph,
    MostValuedCS,
    Balance,
    MostSoldPS,
    SalePurchaseInvoiceGraph,
    MakeRecievePayment,
    IncomeAssetsChart,
    EasyVoucher,
  },
  name: 'Main',
  data() {
    return {
      dashboardData: {},
      dataIsFetched: false,
      showVoucherModal: false,
      voucherType: 'payment',
      voucherInvId: -1,
    };
  },
  methods: {
    onPayment(type, id) {
      this.voucherType = type;
      this.voucherInvId = id;
      this.showVoucherModal = true;
    },
    onPaymentComplete() {
      this.showVoucherModal = false;
      this.voucherInvId = -1;
      this.getDashboardData();

    },
    getDashboardData() {
      axios
        .get('/dashboard?type=dashboarddata')
        .then((r) => {
          if (r.status == 200) {
            this.dashboardData = r.data.gkresult;
            this.dataIsFetched = true;
            this.$forceUpdate();
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  created() {
    this.getDashboardData();
  },
};
</script>
