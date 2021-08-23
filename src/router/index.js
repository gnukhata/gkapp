import Vue from 'vue';
import VueRouter from 'vue-router';
import OrgProfile from '@/views/OrgProfile.vue';
import Logs from '@/views/Logs.vue';
import CloseBooks from '@/views/CloseBooks.vue';
import UserManagement from '@/views/UserManagement.vue';
import UOM from '@/views/UOM.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Categories from '@/views/Categories.vue';
import AddCategory from '@/views/AddCategory.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () =>
      import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/select-org',
    name: 'Select Organisation',
    component: () =>
      import(/* webpackChunkName: "select-org" */ '../views/SelectOrg.vue'),
  },
  {
    path: '/server-setup',
    name: 'Server Setup',
    component: () =>
      import(/* webpackChunkName: "server-setup" */ '../views/ServerSetup.vue'),
  },
  {
    path: '/orgprofile',
    name: 'Organisation Profile',
    component: OrgProfile,
  },
  {
    path: '/logs',
    name: 'Organisation Logs',
    component: Logs,
  },
  {
    path: '/users',
    name: 'User Management',
    component: UserManagement,
  },
  {
    path: '/users/add',
    name: 'User Add',
    component: () =>
      import(
        /* webpackChunkName: "useradd" */ '../components/form/AddUser.vue'
      ),
  },
  {
    path: '/users/:id',
    name: 'User Edit',
    component: () =>
      import(
        /* webpackChunkName: "useredit" */ '../components/form/EditUser.vue'
      ),
  },
  {
    path: '/closebooks',
    name: 'Close Books & Roll Over',
    component: CloseBooks,
  },
  {
    path: '/uom',
    name: 'UnitOfMeasurement',
    component: UOM,
  },
  {
    path: '/uom/add',
    name: 'Unit Add',
    component: () =>
      import(/* webpackChunkName: "uomadd" */ '../components/form/AddUOM.vue'),
  },
  {
    path: '/uom/:id',
    name: 'Unit Edit',
    component: () =>
      import(
        /* webpackChunkName: "uomedit" */ '../components/form/EditUOM.vue'
      ),
  },
  {
    path: '/resetpassword',
    name: 'Reset Password',
    component: ResetPassword,
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
  },
  {
    path: '/categories/add',
    name: 'Add Category',
    component: AddCategory,
  },
  {
    path: '/stock-on-hand',
    name: 'Stock On Hand',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "stockonhand" */ '../views/StockOnHand.vue'),
  },
  {
    path: '/categorywise-stock-on-hand',
    name: 'Category Wise Stock On Hand',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "catstockonhand" */ '../views/CategorywiseStockOnHand.vue'
      ),
  },
  {
    path: '/registers',
    name: 'View Registers',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "registers" */ '../views/Registers.vue'),
  },
  {
    path: '/cost-center-statement',
    name: 'Cost Center Statement',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "costcenterstatement" */ '../components/CostCenterStatement.vue'
      ),
  },
  {
    path: '/product-register',
    name: 'Product Register',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "productregister" */ '../components/ProductRegister.vue'
      ),
  },
  {
    path: '/costcenter',
    name: 'Cost Center',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "costcenter" */ '../views/CostCenter.vue'),
  },
  {
    path: '/godowns',
    name: 'Godowns',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "godowns" */ '../views/Godowns.vue'),
  },
  {
    path: '/godowns/add',
    name: 'Add Godown',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "addgodown" */ '../components/form/Godown.vue'
      ),
  },
  {
    path: '/godowns/:id',
    name: 'Edit Godown',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "editgodown" */ '../views/GodownEdit.vue'),
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "dashboard" */ '../views/Home.vue'),
  },
  {
    path: '/createorg',
    name: 'Create_Organisation',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "createorg" */ '../views/CreateOrganisation.vue'
      ),
  },
  {
    path: '/workflow/:wfName/:wfId', // wf -> workflow
    name: 'Workflow',
    component: () =>
      import(/* webpackChunkName: "workflow" */ '../views/Workflow.vue'),
    props: true,
  },
  {
    path: '/contact-details/:mode',
    name: 'Contact_Details',
    component: () =>
      import(
        /* webpackChunkName: "contact_details" */ '../views/ContactDetails.vue'
      ),
    props: true,
  },
  {
    path: '/business-details/:mode',
    name: 'Business_Details',
    component: () =>
      import(
        /* webpackChunkName: "business_details" */ '../views/BusinessDetails.vue'
      ),
    props: true,
  },
  {
    path: '/invoice/:mode/:invid',
    name: 'Invoice',
    component: () =>
      import(
        /* webpackChunkName: "invoice" */ '../views/Transactions/Invoice.vue'
      ),
    props: true,
  },
  {
    path: '/voucher/create/:type/:customer',
    name: 'Create_Voucher',
    component: () =>
      import(
        /* webpackChunkName: "createvoucher" */ '../views/CreateVoucher.vue'
      ),
    props: true,
  },
  {
    path: '/voucher/edit/:vid',
    name: 'Edit_Voucher',
    component: () =>
      import(/* webpackChunkName: "voucheredit" */ '../views/VoucherEdit.vue'),
    props: true,
  },
  {
    path: '/billwise/:custType/:custName',
    name: 'Billwise',
    component: () =>
      import(/* webpackChunkName: "billwise" */ '../views/Billwise.vue'),
    props: true,
  },
  {
    path: '/delivery-note/:mode/:invid',
    name: 'Delivery_Note',
    component: () =>
      import(
        /* webpackChunkName: "delivery_note" */ '../views/Transactions/DeliveryNote.vue'
      ),
    props: true,
  },
  {
    path: '/cash-memo',
    name: 'Cash_Memo',
    component: () =>
      import(
        /* webpackChunkName: "cash_memo" */ '../views/Transactions/CashMemo.vue'
      ),
  },
  {
    path: '/ps-order',
    name: 'Purchase_Sales_Order',
    component: () =>
      import(
        /* webpackChunkName: "ps_order" */ '../views/Transactions/PurchaseSaleOrder.vue'
      ),
  },
  {
    path: '/dc-note',
    name: 'Debit_Credit_Note',
    component: () =>
      import(
        /* webpackChunkName: "dc_note" */ '../views/Transactions/DebitCreditNote.vue'
      ),
  },
  {
    path: '/transfer-note',
    name: 'Transfer_Note',
    component: () =>
      import(
        /* webpackChunkName: "transfer_note" */ '../views/Transactions/TransferNote.vue'
      ),
  },
  {
    path: '/rejection-note',
    name: 'Rejection_Note',
    component: () =>
      import(
        /* webpackChunkName: "rejection_note" */ '../views/Transactions/RejectionNote.vue'
      ),
  },
  {
    path: '/accounts/:group/:subGroup/:acc',
    name: 'Accounts',
    component: () =>
      import(/* webpackChunkName: "accounts-all" */ '../views/Accounts.vue'),
    props: true,
  },
  {
    path: '/account/create/:group/:subGroup',
    name: 'Create_Account',
    component: () =>
      import(
        /* webpackChunkName: "create-account" */ '../views/AccountCreate.vue'
      ),
    props: true,
  },
  {
    path: '/account/edit/:id/:sysFlag',
    name: 'Edit_Account',
    component: () =>
      import(/* webpackChunkName: "edit-account" */ '../views/AccountEdit.vue'),
    props: true,
  },
  {
    path: '/product-list',
    name: 'Product List',
    component: () =>
      import(/* webpackChunkName: "product-list" */ '../views/ProductList.vue'),
  },
  {
    path: '/contact-list',
    name: 'Contact List',
    component: () =>
      import(/* webpackChunkName: "contact-list" */ '../views/ContactList.vue'),
  },
  {
    path: '/budgets/:type/:id',
    name: 'Budget',
    component: () =>
      import(/* webpackChunkName: "budget" */ '../views/Budget.vue'),
    props: true,
  },
  {
    path: '/budget/create/:type',
    name: 'Create_Budget',
    component: () =>
      import(
        /* webpackChunkName: "create_budget" */ '../views/BudgetCreate.vue'
      ),
    props: true,
  },
  {
    path: '/budget/edit/:id',
    name: 'Edit_Budget',
    component: () =>
      import(/* webpackChunkName: "edit_budget" */ '../views/BudgetEdit.vue'),
    props: true,
  },
  {
    path: '/profit-loss',
    name: 'Profit & Loss',
    component: () =>
      import(/* webpackChunkName: "profit-loss" */ '../views/ProfitLoss.vue'),
  },
  {
    path: '/cash-flow',
    name: 'Cash Flow',
    component: () =>
      import(/* webpackChunkName: "cash-flow" */ '../views/CashFlow.vue'),
  },
  {
    path: '/trial-balance',
    name: 'Trial Balance',
    component: () =>
      import(
        /* webpackChunkName: "trial-balance" */ '../views/TrialBalance.vue'
      ),
  },
  {
    path: '/balance-sheet',
    name: 'Balance_Sheet',
    component: () =>
      import(
        /* webpackChunkName: "balance-sheet" */ '../views/BalanceSheet.vue'
      ),
  },
  {
    path: '/invoice-list',
    name: 'Invoice_List',
    component: () =>
      import(
        /* webpackChunkName: "invoice-list" */ '../views/Reports/InvoiceList.vue'
      ),
  },
  {
    path: '/delivery-note-list',
    name: 'Delivery_Note_List',
    component: () =>
      import(
        /* webpackChunkName: "delivery-note-list" */ '../views/Reports/DeliveryNoteList.vue'
      ),
  },
  {
    path: '/transfer-note-list',
    name: 'Transfer_Note_List',
    component: () =>
      import(
        /* webpackChunkName: "transfer-note-list" */ '../views/Reports/TransferNoteList.vue'
      ),
  },
  {
    path: '/dc-note-list',
    name: 'Dc_Note_List',
    component: () =>
      import(
        /* webpackChunkName: "dc-note-list" */ '../views/Reports/DcNoteList.vue'
      ),
  },
  {
    path: '/cash-memo-list',
    name: 'Cash_Memo_List',
    component: () =>
      import(
        /* webpackChunkName: "cash-memo-list" */ '../views/Reports/CashMemoList.vue'
      ),
  },
  {
    path: '/ps-order-list',
    name: 'Ps_Order_List',
    component: () =>
      import(
        /* webpackChunkName: "cash-memo-list" */ '../views/Reports/PsOrderList.vue'
      ),
  },
  {
    path: '/rejection-note-list',
    name: 'Rejection_Note_List',
    component: () =>
      import(
        /* webpackChunkName: "rejection-note-list" */ '../views/Reports/RejectionNoteList.vue'
      ),
  },
  {
    path: '/voucher-list',
    name: 'Voucher_List',
    component: () =>
      import(
        /* webpackChunkName: "voucher-list" */ '../views/Reports/VoucherList.vue'
      ),
  },
  {
    path: '/ledger',
    name: 'View Ledger',
    component: () =>
      import(/* webpackChunkName: "ledger */ '../views/Ledger.vue'),
  },
  {
    path: '/ledger/monthly/:id',
    name: 'Monthly Ledger',
    component: () =>
      import(
        /* webpackChunkName: "ledger-monthly */ '../views/LedgerMonthly.vue'
      ),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
