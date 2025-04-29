const testData = [
  {
    invoiceType: 'sale',
    contactName: 'Retail Customer (Default)',
    items: ['TestProduct', 'TestProduct2'],
    paymentMode: 'Cash',
  },
  {
    invoiceType: 'sale',
    contactName: 'Retail Customer (Default)',
    items: ['TestProduct', 'TestProduct2'],
    paymentMode: 'Bank',
    bankDetails: {
      ifsc: 'SBIN012345',
      accountNumber: '1234567890',
      bank: 'SBI',
      branch: 'Bangalore',
    },
  },
  {
    invoiceType: 'sale',
    contactName: 'Retail Customer (Default)',
    items: ['TestProduct', 'TestProduct2'],
    paymentMode: 'On Credit',
  },
];

export default testData;
