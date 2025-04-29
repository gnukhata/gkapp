import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import BusinessItem from '../models/business-item';
import testData from '../data/business-item';


test(
  'should allow to create business items',
  // eslint-disable-next-line no-unused-vars
  async ({ organisation, page, baseURL }) => {

    const businessItem = new BusinessItem(page, baseURL);

    for (const item of testData) {
      await businessItem.create(item);
      await page.goto(`${baseURL}#/workflow/Business/-1`);
      await expect(
        page.locator('#list-Business')
      ).toContainText(`${item.name} product`);
    }

  }
);
