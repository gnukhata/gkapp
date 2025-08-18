import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import BusinessItem from '../models/business-item';
import Invoice from '../models/invoice';
import businessTestData from '../data/business-item';
import invoiceTestData from '../data/invoice';

// eslint-disable-next-line no-unused-vars
test('invoice should have delivery note',
  // eslint-disable-next-line no-unused-vars
  async ({ organisation, page, baseURL }) => {
    const businessItem = new BusinessItem(page, baseURL);
    for (const item of businessTestData) {
      await businessItem.create(item);
    }

    const invoice = new Invoice(page, baseURL);
    for (const item of invoiceTestData) {
      await invoice.create(item);
    }

    await page.goto(`${baseURL}#/workflow/Transactions-Invoice/-1`);
    const deliveryNoteLocator = page
      .getByRole('row')
      .filter({ hasText: 'Delivery Note No.' })
      .locator('td')
      .nth(1);
    const deliveryNoteNumber = await deliveryNoteLocator.innerText();
    await deliveryNoteLocator.click();
    await expect(
      page.getByRole('cell', { name: deliveryNoteNumber, exact: true })
    ).toHaveText(deliveryNoteNumber);
  }
);
