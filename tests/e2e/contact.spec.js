import { expect } from '@playwright/test';
import test from '../fixtures/organisation';
import Contact from '../models/contact';
import testData from '../data/contact';


test(
  'should allow to create contacts',
  // eslint-disable-next-line no-unused-vars
  async ({ organisation, page, baseURL }) => {
    const contact = new Contact(page, baseURL);
    for (const data of testData) {
      await contact.create(data);
      await page.goto(`${baseURL}#/workflow/Contacts/-1`);
      await expect(
        page.getByRole('cell', { name: `${data.name} ₹` })
      ).toBeVisible();
    }
  }
);

