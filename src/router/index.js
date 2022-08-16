import Vue from 'vue';
import VueRouter from 'vue-router';
import OrgProfile from '@/views/OrgProfile.vue';
import Logs from '@/views/Logs.vue';
import CloseBooks from '@/views/CloseBooks.vue';
import UserManagement from '@/views/UserManagement.vue';
import UOM from '@/views/UOM.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Categories from '@/views/Categories.vue';
import AddCategory from '@/views/CategoryCreate.vue';

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
    path: '/settings',
    name: 'Settings',
    component: () =>
      import(/* webpackChunkName: "workflow" */ '../views/Settings.vue'),
  },
  // User Management
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
    name: 'Unit Of Measurement',
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
    path: '/categories/edit/:id',
    name: 'Edit_Category',
    component: () =>
      import(
        /* webpackChunkName: "edit_category" */ '../views/CategoryEdit.vue'
      ),
    props: true,
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
      import(/* webpackChunkName: "dashboard" */ '../views/dashboard/Main.vue'),
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
    path: '/contact-details/:mode/:type', // mode = create/edit, type = customer/supplier
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
  // Reports
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
    path: '/ledger',
    name: 'View Ledger',
    component: () =>
      import(/* webpackChunkName: "ledger" */ '../views/Ledger.vue'),
  },
  {
    path: '/ledger/monthly/:id',
    name: 'Monthly Ledger',
    component: () =>
      import(
        /* webpackChunkName: "ledger-monthly" */ '../views/LedgerMonthly.vue'
      ),
  },
  {
    // ac=accountcode, pc=productcode, fs=financialstart, fd=fromdate, td=todate,
    path: '/ledger/:ac&:pc&:fd&:td',
    name: 'Ledger Full',
    component: () =>
      import(/* webpackChunkName: "ledger-full" */ '../views/LedgerFull.vue'),
  },
  {
    // ac=accountcode
    path: '/ledger/:ac',
    name: 'Ledger Single',
    component: () =>
      import(/* webpackChunkName: "ledger-ac" */ '../views/LedgerFull.vue'),
  },
  {
    // ac=accountcode
    path: '/bank-recon',
    name: 'Bank_Reconc',
    component: () =>
      import(/* webpackChunkName: "bank-recon" */ '../views/BankRecon.vue'),
  },

  // GST
  {
    path: '/gst/r1',
    name: 'GST R1 Report',
    component: () =>
      import(/* webpackChunkName: "gst-r1" */ '../views/gst/R1.vue'),
  },
  {
    path: '/gst/r1/summary/from=:fd&to=:td',
    name: 'GST R1 Summary',
    component: () =>
      import(
        /* webpackChunkName: "gst-r1-summary" */ '../views/gst/R1Summary.vue'
      ),
    props: true,
  },
  {
    path: '/gst/r1/:type/:fd&:td',
    name: 'GST R1 Detailed',
    component: () =>
      import(
        /* webpackChunkName: "gst-r1-detailed" */ '../views/gst/R1Detailed.vue'
      ),
  },
  {
    path: '/gst/3b',
    name: 'GST 3B Report',
    component: () =>
      import(/* webpackChunkName: "gst-3b" */ '../views/gst/3B/Main.vue'),
  },
  {
    path: '/gst/3b/from=:fd&to=:td&state=:state',
    name: 'GST 3B Full',
    component: () =>
      import(
        /* webpackChunkName: "gst-3b-full" */ '../views/gst/3B/Report.vue'
      ),
  },
  {
    path: '/data/export',
    name: 'Export Data',
    component: () =>
      import(/* webpackChunkName: "export-data" */ '../views/data/Export.vue'),
  },
  {
    path: '/data/import',
    name: 'Import Data',
    component: () =>
      import(/* webpackChunkName: "import-data" */ '../views/data/Import.vue'),
  },
  {
    path: '/data/import/help/:help_type',
    name: 'Import Data Help',
    component: () =>
      import(
        /* webpackChunkName: "import-data-help" */ '../views/data/Help.vue'
      ),
  },
  {
    path: '/gst/news',
    name: 'GST News',
    component: () =>
      import(
        /* webpackChunkName: "gstnews-all-posts" */ '../views/gst-news/AllPosts.vue'
      ),
  },
  {
    path: '/gst/news/:id',
    name: 'GST News Single',
    props: true,
    component: () =>
      import(
        /* webpackChunkName: "gstnews-single-post" */ '../views/gst-news/SinglePost.vue'
      ),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
