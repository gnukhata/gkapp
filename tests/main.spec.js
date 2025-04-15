import { expect } from '@playwright/test';
import test from './fixtures/organisation';
import BusinessItem from './models/business-item';
import Invoice from './models/invoice';

// eslint-disable-next-line no-unused-vars
test('basic test', async ({ organisation, page }) => {
  await page.goto('/#/dashboard');
  await expect(page.locator('#usermenu')).toContainText('gkadmin');
});

// eslint-disable-next-line no-unused-vars
test('invoice test', async ({ organisation, page, baseURL }) => {
  const businessItem = new BusinessItem(page, baseURL);
  await businessItem.create({
    name: 'TestProduct',
    costPrice: '900',
    salePrice: '1100',
    discount: '100',
    stockQty: '100',
    hsn: '6213',
    gst: '12',
  });
  await businessItem.create({
    name: 'TestProduct2',
    costPrice: '900',
    salePrice: '1100',
    discount: '100',
    stockQty: '100',
    hsn: '6213',
    gst: '12',
  });
  const invoice = new Invoice(page, baseURL);
  await invoice.create({
    invoiceType: 'sale',
    contactName: 'Retail Customer (Default)',
    items: ['TestProduct', 'TestProduct2'],
    paymentMode: 'Cash',
  });
  await invoice.create({
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
  });
  await invoice.create({
    invoiceType: 'sale',
    contactName: 'Retail Customer (Default)',
    items: ['TestProduct', 'TestProduct2'],
    paymentMode: 'On Credit',
  });
});
