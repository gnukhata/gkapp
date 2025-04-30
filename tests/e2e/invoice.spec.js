import { expect } from '@playwright/test';
import test from '../fixtures/business-item';
import Invoice from '../models/invoice';
import invoiceTestData from '../data/invoice';

test(
  'should allow to create invoices',
  async ({ businessItem, baseURL }) => {

    const page = await businessItem.page;
    const invoice = new Invoice(page, baseURL);

    for (const item of invoiceTestData) {
      const invoiceNumber = await invoice.create(item);
      await page.goto(`${baseURL}#/workflow/Transactions-Invoice/-1`);
      const invoiceLocator = page.getByRole(
        'heading',
        { name: invoiceNumber, exact: true }
      ).locator('span');
      await expect(invoiceLocator).toHaveText(invoiceNumber);
    }

  }
);
