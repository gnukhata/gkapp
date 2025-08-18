import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import BusinessItem from '../models/business-item';
import Invoice from '../models/invoice';
import DebitCreditNote from '../models/debit-credit-note';
import businessTestData from '../data/business-item';
import invoiceTestData from '../data/invoice';
import dcNoteTestData from '../data/debit-credit-note';

test('should allow to create debit and credit notes',
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

    const dcNote = new DebitCreditNote(page, baseURL);
    for (const item of dcNoteTestData) {
      const noteNumber = await dcNote.create(item);
      await page.goto(`${baseURL}#/workflow/Transactions-DebitCreditNote/-1`);
      const noteLocator = page.getByRole('heading', { name: noteNumber, exact: true }).locator('span');
      await expect(noteLocator).toHaveText(noteNumber);
    }
  }
);
