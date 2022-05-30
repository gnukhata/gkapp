<template>
  <b-card-group deck class="mt-3">
    <!-- Sale Invoices -->
    <b-card no-body>
      <Bar
        :chart-options="chartOptions"
        :chart-data="saleChartData"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
    </b-card>
    <!-- Purchase Invoices -->
    <b-card no-body>
      <Bar
        :chart-options="chartOptions"
        :chart-data="purchaseChartData"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
    </b-card>
  </b-card-group>
</template>

<script>
// TODO vue3: migration
import { Bar } from 'vue-chartjs/legacy';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  name: 'SalePurchaseInvoiceGraph',
  components: { Bar },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
    chartId: {
      type: String,
      default: 'bar-chart',
    },
    datasetIdKey: {
      type: String,
      default: 'label',
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 200,
    },
    cssClasses: {
      default: '',
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      purchaseChartData: {
        labels: [
          'Jan',
          'Feb',
          'March',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Mar',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Purchase Invoices',
            backgroundColor: '#f87979',
            data: this.info.puchaseinvcount,
          },
        ],
      },
      saleChartData: {
        labels: [
          'Jan',
          'Feb',
          'March',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Mar',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Sale Invoices',
            backgroundColor: '#f87979',
            data: this.info.saleinvcount,
          },
        ],
      },
      chartOptions: {
        responsive: true,
      },
    };
  },
};
</script>
