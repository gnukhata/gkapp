<template>
  <div>
    <title-bar :title-stack="titleStack"/>
    <!-- <hero-bar :has-right-visible="false">
      Dashboard
    </hero-bar> -->
    <section class="section is-main-section">
      <tiles>
        <card-widget class="tile is-child" type="is-success" icon="currency-inr" :number="this.company.balancedata.bankbalancedata[0]" label="Bank Balance"/>
        <card-widget class="tile is-child" type="is-success" icon="currency-inr" :number="this.company.balancedata.bankbalancedata[0]" label="Cash Balance"/>
        <router-link to="/CustomersSuppliers">
          <card-widget class="tile is-child" type="is-primary" icon="card-account-details" label="Customers / Suppliers"/>
        </router-link>
        <!-- <card-widget class="tile is-child" type="is-primary" icon="cart-outline" label="Product / Service"/>
        <card-widget class="tile is-child" type="is-info" icon="file-chart" label="Report"/> -->
      </tiles>
      <div class="columns">
        <div class="column is-half">
          <card-component title="Sale Invoice" @header-icon-click="fillChartData" icon="finance" header-icon="reload">
            <div v-if="defaultChart.chartData" class="chart-area">
              <line-chart style="height: 100%"
                          ref="bigChart"
                          chart-id="big-line-chart"
                          :chart-data="defaultChart.chartData"
                          :extra-options="defaultChart.extraOptions">
              </line-chart>
            </div>
          </card-component>
        </div>
        <div class="column is-half">
          <card-component title="Purchase Invoice" @header-icon-click="fillChartData" icon="finance" header-icon="reload">
            <div v-if="defaultChart.chartData" class="chart-area">
              <line-chart style="height: 100%"
                          ref="bigChart"
                          chart-id="big-line-chart"
                          :chart-data="defaultChart.chartData"
                          :extra-options="defaultChart.extraOptions">
              </line-chart>
            </div>
          </card-component>
        </div>
      </div>
      <!-- <card-component title="Clients" class="has-table has-mobile-sort-spaced">
        <clients-table-sample :data-url="`${$router.options.base}data-sources/clients.json`"/>
      </card-component> -->
    </section>
  </div>
</template>

<script>
import * as chartConfig from '@/components/Charts/chart.config'
import TitleBar from '@/components/TitleBar'
// import HeroBar from '@/components/HeroBar'
import Tiles from '@/components/Tiles'
import CardWidget from '@/components/CardWidget'
import { mapState } from 'vuex'
import CardComponent from '@/components/CardComponent'
import LineChart from '@/components/Charts/LineChart'
import Axios from 'axios'
// import ClientsTableSample from '@/components/ClientsTableSample'

export default {
  name: 'home',
  components: {
    // ClientsTableSample,
    LineChart,
    CardComponent,
    CardWidget,
    Tiles,
    // HeroBar,
    TitleBar
  },
  data () {
    return {
      defaultChart: {
        chartData: null,
        extraOptions: chartConfig.chartOptionsMain
      },
      company: Object
    }
  },
  computed: {
    titleStack () {
      return [
        this.userName,
        'Dashboard'
      ]
    },
    ...mapState([
      'isNavBarVisible',
      'isAsideMobileExpanded',
      'isDarkModeActive',
      'userName',
      'authToken',
      'gkCoreUrl'
    ])
  },
  mounted () {
    this.fillChartData()
    this.getCompanyData()
  },
  methods: {
    getCompanyData () {
      Axios.get(`${this.gkCoreUrl}/dashboard?type=dashboarddata`, {
        headers: {
          gktoken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmdjb2RlIjoxLCJ1c2VyaWQiOjF9.TMPTw51qwCSp-z3U2LgpVuBKE0aPf12Y2QMnlFVleMo'
        }
      }).then((res) => {
        this.company = res.data.gkresult
        // console.log(res.data.gkresult.)
      }).catch((err) => {
        console.log(err)
      })
    },
    randomChartData (n) {
      const data = []

      for (let i = 0; i < n; i++) {
        data.push(Math.round(Math.random() * 200))
      }

      return data
    },
    fillChartData () {
      this.defaultChart.chartData = {
        datasets: [
          {
            fill: false,
            borderColor: chartConfig.chartColors.default.primary,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: chartConfig.chartColors.default.primary,
            pointBorderColor: 'rgba(255,255,255,0)',
            pointHoverBackgroundColor: chartConfig.chartColors.default.primary,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.randomChartData(9)
          },
          {
            fill: false,
            borderColor: chartConfig.chartColors.default.info,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: chartConfig.chartColors.default.info,
            pointBorderColor: 'rgba(255,255,255,0)',
            pointHoverBackgroundColor: chartConfig.chartColors.default.info,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.randomChartData(9)
          },
          {
            fill: false,
            borderColor: chartConfig.chartColors.default.danger,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: chartConfig.chartColors.default.danger,
            pointBorderColor: 'rgba(255,255,255,0)',
            pointHoverBackgroundColor: chartConfig.chartColors.default.danger,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.randomChartData(9)
          }
        ],
        labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09']
      }
    }
  }
}
</script>
