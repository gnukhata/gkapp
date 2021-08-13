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
    <div id="transaction-print-page">
      <b-container fluid>
        <h3 class="text-center">{{ title || name }}</h3>
        <br />
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
      </b-container>
      <br />
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
        <print-helper contentId="transaction-print-page" :printStyles="printStyles"> </print-helper>
      </div>
    </div>
  </b-modal>
</template>

<script>
import axios from 'axios';
import TransactionProfile from '../workflow/profile/Transaction.vue';
import PrintHelper from '../PrintHelper.vue';
export default {
  name: 'PrintPage',
  components: {
    TransactionProfile,
    PrintHelper
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
      validator: function(value) {
        return (
          [
            'Invoice',
            'DebitCreditNote',
            'CashMemo',
            'DeliveryNote',
            'PurchaseSalesOrder',
            'RejectionNote',
            'TransferNote',
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
      printStyles: `.table .thead-dark th {
          color: #fff !important;
          background-color: #343a40 !important;
          border-color: #454d55 !important;
      }`,
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
          let stateCode = states[details.orgstate] || null;
          this.orgDetails = {
            name: details.orgname,
            addr1: `${details.orgaddr},`,
            addr2: `${details.orgcity} - ${details.orgpincode}. ${details.orgstate}.`,
            phone: details.orgtelno,
            gstin: details.gstin && stateCode ? details.gstin[stateCode] : '',
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
