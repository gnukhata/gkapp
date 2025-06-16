import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import BusinessItem from '../models/business-item';
import convertCsvToJson from '../utils/csv';

test(
  'should allow to create multiple business items',
  // eslint-disable-next-line no-unused-vars
  async ({ organisation, page, baseURL }) => {
    const businessItem = new BusinessItem(page, baseURL);
    const productData = convertCsvToJson('tests/data/Product.csv');
    for(const data of productData) {
      await businessItem.create(data);
      await page.goto(`${baseURL}#/workflow/Business/-1`);
      const product = page
        .locator('#list-Business')
        .getByText(`${data.name} product`);
      if (data.isInvalid === "true") {
        await expect(product).toBeHidden();
        console.error(`${data['name']}: Failed to create product`);
      } else {
        await expect(product).toBeVisible();
      }
    }
  }
);
