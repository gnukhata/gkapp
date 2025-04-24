const yearCode = `${new Date().getFullYear()}`.slice(-2);
const testData = [
  {
    invoiceId: `1/SL-${yearCode}`,
    invoiceType: 'sale',
    noteType: 'credit',
    value: '800',
  },
  {
    invoiceId: `2/SL-${yearCode}`,
    invoiceType: 'sale',
    noteType: 'credit',
    purpose: 'qty',
    value: '1',
  },
  {
    invoiceId: `1/SL-${yearCode}`,
    invoiceType: 'sale',
    noteType: 'debit',
    value: '100',
  },
  {
    invoiceId: `2/SL-${yearCode}`,
    invoiceType: 'sale',
    noteType: 'debit',
    purpose: 'qty',
    value: '2',
  },
];

export default testData;
