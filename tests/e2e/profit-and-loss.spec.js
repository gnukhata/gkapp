import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import BusinessItem from '../models/business-item';
import Invoice from '../models/invoice';
import ProfitAndLoss from '../models/profit-and-loss';
import businessTestData from '../data/business-item';
import invoiceTestData from '../data/invoice';

test('gross/net credits should match debits in profit and loss report',
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

    const profitAndLoss = new ProfitAndLoss(page, baseURL);
    const {
      grossCrs,
      grossDrs,
      netCrs,
      netDrs,
    } = await profitAndLoss.getTotal();
    expect(grossCrs).toEqual(grossDrs);
    expect(netCrs).toEqual(netDrs);
  }
);


