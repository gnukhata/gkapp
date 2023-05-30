<template>
  <!--add custom data here  -->
  <div>
    <!-- org details card, appears while printing only -->
    <div class="d-flex flex-row-reverse">
      <div class="d-none d-print-block w-50 border mb-2 p-1 mr-1">
        <img
          :src="orgImg"
          width="30"
          height="30"
          class="rounded d-inline-block align-top"
          alt="Logo"
        />
        <h5 class="d-inline-block ml-1">{{ orgAddress.orgname || 'N/A' }}</h5>
        <br />
        <small><b>Address: </b> {{ orgAddress.orgaddr || 'N/A' }}</small>
        <br />
        <small><b>City: </b>{{ orgAddress.orgcity || 'N/A' }}</small> <br />
        <small><b>State: </b>{{ orgAddress.orgstate || 'N/A' }}</small> <br />
        <small><b>Contact No: </b> {{ orgAddress.orgtelno || 'N/A' }}</small>
        <br />
        <small v-if="orgAddress.gstin != null"
          ><b>GSTIN: </b>
          {{ Object.values(orgAddress.gstin)[0] || 'N/A' }}</small
        >
      </div>
    </div>
    <component v-bind:is="name" :pdata="pdata" :id="id" :onUpdate="onUpdate">
    </component>
  </div>
</template>

<script>
import Invoice from './InvoiceProfile.vue';
import CashMemo from './CashMemoProfile.vue';
import DebitCreditNote from './DcNoteProfile.vue';
import DeliveryNote from './DeliveryNoteProfile.vue';
import PurchaseSalesOrder from './PsOrderProfile.vue';
import RejectionNote from './RejectionNoteProfile.vue';
import TransferNote from './TransferNoteProfile.vue';
import Voucher from './VoucherProfile.vue';
import { mapState } from 'vuex';
export default {
  name: 'TransactionProfile',
  components: {
    Invoice,
    CashMemo,
    DebitCreditNote,
    DeliveryNote,
    PurchaseSalesOrder,
    RejectionNote,
    TransferNote,
    Voucher,
  },
  props: {
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
            'Voucher',
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
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of the Transaction, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  computed: {
    ...mapState(['orgAddress', 'orgImg', 'orgGstin']),
  },
};
</script>
