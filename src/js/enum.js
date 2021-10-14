const PAGES = {
  workflow: 10,
  'workflow-invoice': 20,
  'workflow-dc-note': 30,
  'workflow-cash-memo': 40,
  'workflow-delivery-note': 50,
  'workflow-ps-order': 60,
  'workflow-rejection-note': 70,
  'workflow-transfer-note': 80,
  'workflow-voucher': 90,
  'workflow-business': 100,
  'workflow-contacts': 110,
  'create-invoice': 120,
  "create-dcnote": 130,
  "create-cash-memo": 140,
  "create-delivery-note": 150,
  "create-psorder": 160,
  "create-rejection-note": 170,
  "create-transfer-note": 180,
  "create-voucher": 190,
};

const CONFIGS = {
  'workflow-left-pane-columns': 11,
  'page-layout': 121
};

Object.freeze(PAGES);
Object.freeze(CONFIGS);

export { PAGES, CONFIGS };
