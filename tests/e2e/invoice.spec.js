import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import Invoice from '../models/invoice';
import BusinessItem from '../models/business-item';
import invoiceTestData from '../data/invoice';
import businessTestData from '../data/business-item';

test(
  'should allow to create invoices',
  // eslint-disable-next-line no-unused-vars
  async ({ organisation, page, baseURL }) => {

    const businessItem = new BusinessItem(page, baseURL);

    for (const item of businessTestData) {
      await businessItem.create(item);
    }

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
