import Invoice from './invoice.js';
import DebitCreditNote from './debitCreditNote.js';
import CashMemo from './cashMemo.js';
import DeliveryNote from './deliveryNote.js';
import PurchaseSalesOrder from './purchaseSalesOrder.js';
import RejectionNote from './rejectionNote.js';
import TransferNote from './transferNote.js';
import Voucher from './voucher.js';

export default {
  icon: 'receipt',
  color: 'success',
  tabs: {
    Invoice,
    DebitCreditNote,
    CashMemo,
    DeliveryNote,
    PurchaseSalesOrder,
    RejectionNote,
    TransferNote,
    Voucher,
  },
};
