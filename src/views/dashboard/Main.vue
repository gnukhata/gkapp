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
      <SalePurchaseInvoiceGraph :info="dashboardData" />
      <!-- Make / Recieve Payment -->
      <MakeRecievePayment :info="dashboardData" />
      <!-- Most Valued Customers / suppliers -->
      <MostValuedCS :info="dashboardData" />
      <!-- Most Sold Produc/ Services -->
      <MostSoldPS :info="dashboardData" />
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
export default {
  components: {
    Tiles,
    BankCashBalanceGraph,
    MostValuedCS,
    Balance,
    MostSoldPS,
    SalePurchaseInvoiceGraph,
    MakeRecievePayment,
  },
  name: 'Main',
  data() {
    return {
      dashboardData: {},
      dataIsFetched: false,
    };
  },
  methods: {
    getDashboardData() {
      axios
        .get('/dashboard?type=dashboarddata')
        .then((r) => {
          if (r.status == 200) {
            this.dashboardData = r.data.gkresult;
            this.dataIsFetched = true;
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
