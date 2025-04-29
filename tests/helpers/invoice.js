import { expect } from '@playwright/test';
import Invoice from '../models/invoice';
import testData from '../data/invoice';

// eslint-disable-next-line no-unused-vars
async function createInvoice({ base, page, baseURL }) {
  const invoice = new Invoice(page, baseURL);
  for (const item of testData) {
    const invoiceNumber = await invoice.create(item);
    await page.goto(`${baseURL}#/workflow/Transactions-Invoice/-1`);
    const invoiceLocator = page.getByRole('heading', { name: invoiceNumber, exact: true }).locator('span');
    await expect(invoiceLocator).toHaveText(invoiceNumber);
  }
};

export { createInvoice };
