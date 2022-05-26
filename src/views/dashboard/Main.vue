<template>
  <section class="m-2">
    <balance></balance>
    <!-- bank / cash stats -->
    <b-card-group deck>
      <!-- Tiles -->
      <b-card class="shadow p-0">
        <Tiles />
      </b-card>
      <b-card class="shadow" no-body>
        <BankCashBalanceGraph
          v-if="dataIsFetched"
          :chartInput="dashboardData.balancedata"
        />
      </b-card>
    </b-card-group>
    <!-- Most Valued Customers / suppliers -->
    <MostValuedCS v-if="dataIsFetched" :info="dashboardData" />
    <MostSoldPS v-if="dataIsFetched" :info="dashboardData" />
  </section>
</template>
<script>
import axios from 'axios';
import Tiles from './Tiles.vue';
import BankCashBalanceGraph from './BankCashBalanceGraph.vue';
import MostValuedCS from './MostValuedCS.vue';
import Balance from './Balance.vue';
import MostSoldPS from './MostSoldPS.vue';
export default {
  components: {
    Tiles,
    BankCashBalanceGraph,
    MostValuedCS,
    Balance,
    MostSoldPS,
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
