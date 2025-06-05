import { expect } from '@playwright/test';
import test from '../fixtures/invoice';

test.describe('reports test', async () => {
  test.describe.configure({ mode: 'serial' });

  test(
    'product register should be there',
    async ({ invoice, baseURL }) => {

      const page = await invoice.page;
      await page.goto(`${baseURL}#/product-register`);
      await page.getByPlaceholder('Select Product').click();
      await page.getByRole('option', { name: 'TestProduct', exact: true }).click();
      await page.getByPlaceholder('Select Godown').click();
      await page.getByRole('option', { name: 'Primary Godown (Primary' }).click();
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByRole('cell', { name: 'opening stock' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Total' })).toBeVisible();

    }
  );

  test(
    'stock on hand report should be there',
    async ({ invoice, baseURL }) => {

      const page = await invoice.page;
      await page.goto(`${baseURL}#/stock-on-hand`);
      await expect(
        page.getByRole('link', { name: 'TestProduct', exact: true })
      ).toBeVisible();

    }
  );

  test(
    'view register should be there',
    async ({ invoice, baseURL }) => {

      const page = await invoice.page;
      await page.goto(`${baseURL}#/registers`);
      await page.getByPlaceholder('Select Register Type').click();
      await page.getByRole('option', { name: 'Sale' }).click();
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(
        page
          .getByRole('cell', { name: 'Retail Customer (Default)', exact: true })
          .first()
      ).toBeVisible();

    }
  );

});
