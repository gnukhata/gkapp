<template>
  <b-modal
    size="xl"
    v-model="showModal"
    centered
    static
    body-class="px-0"
    id="print-page-modal"
    hide-footer
    hide-header
  >
    <b-container fluid>
      <h3 class="text-center">{{ title || name }}</h3>
      <br>
      <div class="text-md-right">
        <img
          v-if="orgDetails.logo"
          :src="orgDetails.logo"
          width="30"
          height="30"
          class="rounded d-inline-block align-top"
          alt="Logo"
        />
        <h5 class="d-inline-block ml-2">{{ orgDetails.name }}</h5>
        <br />
        <p class="ml-3">
          <small>{{ orgDetails.addr1 }}</small> <br />
          <small>{{ orgDetails.addr2 }}</small> <br />
          <small>Contact No: {{ orgDetails.phone }}</small> <br />
          <small>GSTIN: {{ orgDetails.gstin }}</small>
        </p>
      </div>
    </b-container> <br>
    <transaction-profile
      :name="name"
      :id="id"
      :pdata="pdata"
    ></transaction-profile>
    <div id="button-wrapper" class="d-print-none">
      <b-button
        @click.prevent="closeModal"
        class="m-1"
        size="sm"
        variant="danger"
      >
        <b-icon
          aria-hidden="true"
          class="align-middle"
          icon="x-circle"
        ></b-icon>
      </b-button>
      <br />
      <b-button
        @click.prevent="onPrint"
        class="m-1"
        size="sm"
        variant="primary"
      >
        <b-icon aria-hidden="true" class="align-middle" icon="printer"></b-icon>
      </b-button>
    </div>
  </b-modal>
</template>

<script>
import axios from 'axios';
import TransactionProfile from '../workflow/profile/Transaction.vue';
export default {
  name: 'PrintPage',
  components: {
    TransactionProfile,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
    name: {
      type: String,
      required: true,
      validator: function (value) {
        return (
          [
            'Invoice',
            'DebitCreditNote',
            'CashMemo',
            'DeliveryNote',
            'PurchaseSalesOrder',
            'RejectionNote',
          ].indexOf(value) !== -1
        );
      },
    },
    id: {
      type: Number,
      required: true,
      note: 'Transaction Id',
    },
    pdata: {
      type: Object,
      required: true,
      note: 'Data for the Transaction Profiles',
    },
  },
  data() {
    return {
      showModal: false,
      orgDetails: {
        name: '',
        addr1: '',
        addr2: '',
        phone: '',
        gstin: '',
        logo: 'img/gk.png',
      },
    };
  },
  watch: {
    show() {
      this.showModal = this.show;
    },
  },
  methods: {
    getOrgDetails() {
      const requests = [
        axios.get('/state').catch((e) => e),
        axios.get(`/organisation`).catch((e) => {
          return e;
        }),
        axios.get('/organisation?attach=image').catch((e) => e),
      ];
      Promise.all([...requests]).then(([resp1, resp2, resp3]) => {
        let states = {};
        if (resp1.data.gkstatus === 0) {
          resp1.data.gkresult.forEach((state) => {
            states[Object.values(state)[0]] = Object.keys(state)[0];
          });
        }

        if (resp2.data.gkstatus === 0) {
          const details = resp2.data.gkdata;
          let stateCode = states[details.orgstate];
          this.orgDetails = {
            name: details.orgname,
            addr1: `${details.orgaddr},`,
            addr2: `${details.orgcity} - ${details.orgpincode}. ${details.orgstate}.`,
            phone: details.orgtelno,
            gstin: details.gstin[stateCode],
          };
        }
        if (resp3.data.logo !== null) {
          this.orgDetails.logo = `data:image/png;base64,${resp3.data.logo}`;
        } else {
          this.orgDetails.logo = `img/gk.png`;
        }
      });
    },
    closeModal() {
      this.showModal = false;
    },
    onPrint() {
      let printWindow = window.open(
        '',
        `Print ${this.name} - GNUKhata`,
        'scrollbars=1,resizable=1'
      );
      let printContent = document.getElementById(
        'print-page-modal___BV_modal_content_'
      ).innerHTML;
      let styles = '';
      document.getElementsByTagName('style').forEach((style) => {
        styles += style.innerHTML;
      });
      // styles for printing table row bg
      styles +=
        '@media print {*{ color-adjust: exact;  -webkit-print-color-adjust: exact; print-color-adjust: exact; }}';

      printWindow.document.open();
      printWindow.document.write(`<html><head><style>${styles}</style></head>`);
      printWindow.document.write(`<body>${printContent}</body>`);
      printWindow.document.write(`</html>`);
      printWindow.document.close();

      printWindow.print();

      printWindow.onafterprint = () => {
        printWindow.close();
      };
    },
  },
  mounted() {
    this.getOrgDetails();
  },
};
</script>

<style>
#button-wrapper {
  position: fixed;
  right: 25px;
  top: 50px;
}
@media screen and (max-width: 576px) {
  #button-wrapper {
    right: 10px;
  }
}
</style>