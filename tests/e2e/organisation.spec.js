import Organisation from '../models/organisation';
import test from '../fixtures/login';
import { expect } from '@playwright/test';

test(
  'test organisations should get deleted',
  // eslint-disable-next-line no-unused-vars
  async({ login, page, baseURL }) => {
    const organisation = new Organisation(page, baseURL);
    await page.goto(`${baseURL}#/user-login`);
    let doesTestOrgExist = true;
    while(doesTestOrgExist) {
      const testOrg = page.getByRole('row', { name: /^Org17*/ }).nth(0);
      if (testOrg) {
        await testOrg.getByRole('button').click();
        // await page.pause();
        await organisation.delete();
      } else {
        doesTestOrgExist = false;
      }
    }
    expect(doesTestOrgExist).toBe(false);
  }
);
