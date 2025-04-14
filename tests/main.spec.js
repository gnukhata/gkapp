import { expect } from '@playwright/test';
import test from './fixtures/organisation';

// eslint-disable-next-line no-unused-vars
test('basic test', async ({ organisation, page }) => {
  await page.goto('/#/dashboard');
  await expect(page.locator('#usermenu')).toContainText('gkadmin');
});
