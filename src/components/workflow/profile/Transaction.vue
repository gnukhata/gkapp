<template>
  <component
    v-bind:is="name"
    :pdata="pdata"
    :id="id"
    :onUpdate="onUpdate"
  ></component>
</template>

<script>
import Invoice from './Invoice.vue';
import CashMemo from './CashMemo.vue';
import DebitCreditNote from './DebitCreditNote.vue';
import DeliveryNote from './DeliveryNote.vue';
import PurchaseSalesOrder from './PurchaseSalesOrder.vue';
import RejectionNote from './RejectionNote.vue';
export default {
  name: 'TransactionProfile',
  components: {
    Invoice,
    CashMemo,
    DebitCreditNote,
    DeliveryNote,
    PurchaseSalesOrder,
    RejectionNote,
  },
  props: {
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
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of the Transaction, as a callback.
      Used to update the data used in workflow.`,
    },
  },
};
</script>