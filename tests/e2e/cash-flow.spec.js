import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import BusinessItem from '../models/business-item';
import Invoice from '../models/invoice';
import CashFlow from '../models/cash-flow';
import businessTestData from '../data/business-item';
import invoiceTestData from '../data/invoice';

test('total inflows should match total outflows in cash flow statement',
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

    const cashFlow = new CashFlow(page, baseURL);
    const { totalInflows, totalOutflows } = await cashFlow.getTotal();
    expect(totalInflows).toEqual(totalOutflows);
  }
);

