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
  'workflow-business': 20,
  'workflow-contacts': 20,
};

const CONFIGS = {
  'workflow-left-pane-columns': 100,
};

Object.freeze(PAGES);
Object.freeze(CONFIGS);

export { PAGES, CONFIGS };
