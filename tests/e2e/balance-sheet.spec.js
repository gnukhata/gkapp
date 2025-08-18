import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import BusinessItem from '../models/business-item';
import Invoice from '../models/invoice';
import BalanceSheet from '../models/balance-sheet';
import businessTestData from '../data/business-item';
import invoiceTestData from '../data/invoice';

test('capital and liabilities should match property and assets in balance sheet',
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

    const balanceSheet = new BalanceSheet(page, baseURL);
    const { capitalAndLiabilities, propertyAndAssets } = await balanceSheet.getTotal();
    expect(capitalAndLiabilities).toEqual(propertyAndAssets);
  }
);


