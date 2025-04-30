import { expect } from '@playwright/test';
import test from '../fixtures/business-item';
import testData from '../data/business-item';


test(
  'should allow to create business items',
  async ({ businessItem, baseURL }) => {

    const page = await businessItem.page;
    for (const item of testData) {
      await page.goto(`${baseURL}#/workflow/Business/-1`);
      await expect(
        page.locator('#list-Business')
      ).toContainText(`${item.name} product`);
    }

  }
);
