import { expect } from '@playwright/test';
import test from '../fixtures/business-item';
import Invoice from '../models/invoice';
import invoiceTestData from '../data/invoice';
import DebitCreditNote from '../models/debit-credit-note';
import dcNoteTestData from '../data/debit-credit-note';

test.describe('should allow to create invoices, delivery note and debit/credit notes', async () => {
  test.describe.configure({ mode: 'serial' });

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

  test('invoice should have delivery note',
       async ({ businessItem, baseURL }) => {
         const page = await businessItem.page;
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

  test('should allow to create debit and credit notes',
       async ({ businessItem, baseURL }) => {
         const page = await businessItem.page;
         const dcNote = new DebitCreditNote(page, baseURL);
         for (const item of dcNoteTestData) {
           const noteNumber = await dcNote.create(item);
           await page.goto(`${baseURL}#/workflow/Transactions-DebitCreditNote/-1`);
           const noteLocator = page.getByRole('heading', { name: noteNumber, exact: true }).locator('span');
           await expect(noteLocator).toHaveText(noteNumber);
         }
       }
      );

})
