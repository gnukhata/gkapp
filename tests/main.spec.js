import { test as base, expect } from '@playwright/test';
import Organisation from './organisation';

let orgName = `Org${Date.now()}`

export const test = base.extend({
  organisation: async ({ page }, use) => {
    const organisation = new Organisation(page);
    await organisation.create(orgName, "India", "Karnataka", "Profit Making");
    await organisation.login(orgName);
    await organisation.update(
      "Test address, Test place, India",
      "111111",
      "22AAAAA0000A1Z5",
      "AAAAA0000A",
    );
    await use(organisation);
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/#/user-login');
  await page.getByRole('textbox', { name: 'Enter Username' }).click();
  await page.getByRole('textbox', { name: 'Enter Username' }).fill('gkadmin');
  await page.getByRole('textbox', { name: 'Password input' }).click();
  await page.getByRole('textbox', { name: 'Password input' }).fill('gkpass');
  await page.getByRole('button', { name: 'box arrow in right Login' }).click();
});

test.afterEach(async ({ page }) => {
  await page.getByRole('button', { name: 'gkadmin' }).click();
  await page.getByRole('menuitem', { name: 'box arrow in left Logout' }).click();
});

test('basic test', async ({ organisation, page }) => {
  await page.goto('http://localhost:8080/#/dashboard');
  await expect(page.locator('#app-header')).toContainText(orgName);
  await organisation.delete();
});
