import { expect } from '@playwright/test';
import { chromium, firefox, webkit } from 'playwright';
import config from '../playwright.config';
import fs from 'fs';
import Organisation from './models/organisation';
import test from './fixtures/base';
import testOrg from './fixtures/organisation';
import { createProduct } from './helpers/business-item';
import { createInvoice } from './helpers/invoice';
import { createOrgData, updateOrgData } from './data/organisation';

// eslint-disable-next-line no-unused-vars
testOrg('basic test', async ({ organisation, page }) => {
  await page.goto('/#/dashboard');
  await expect(page.locator('#usermenu')).toContainText('gkadmin');
});

test.describe('full test', () => {
  test.describe.configure({ mode: 'serial' });
  const orgName = `Org${Date.now()}`;
  test.beforeAll('Create and log in to organisation', async () => {
    const { baseURL } = config.use;
    const availableBrowsers = { chromium, firefox, webkit };
    const enabledBrowser = config.projects[0].name;
    const browser = await availableBrowsers[enabledBrowser].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const sessionStorage = JSON.parse(fs.readFileSync('./tests/data/auth.json', 'utf-8'));
    await context.addInitScript((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);
    const organisation = new Organisation(page, baseURL);
    await organisation.create({ ...createOrgData, name: orgName });
    await organisation.login(orgName);
    await organisation.update(updateOrgData);
    await page.context().storageState();
    const currentSessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
    fs.writeFileSync('./tests/data/auth.json', currentSessionStorage, 'utf-8');
    const localStorage = await page.evaluate(() => JSON.stringify(localStorage));
    fs.writeFileSync('./tests/data/local-storage.json', localStorage, 'utf-8');
    await context.addInitScript((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.localStorage.setItem(key, value);
      }
    }, localStorage);
    await browser.close();
  });
  test.afterAll('Delete organisation', async () => {
    const { baseURL } = config.use;
    const availableBrowsers = { chromium, firefox, webkit };
    const enabledBrowser = config.projects[0].name;
    const browser = await availableBrowsers[enabledBrowser].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const sessionStorage = JSON.parse(fs.readFileSync('./tests/data/auth.json', 'utf-8'));
    await context.addInitScript((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);
    const localStorage = JSON.parse(fs.readFileSync('./tests/data/local-storage.json', 'utf-8'));
    await context.addInitScript((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.localStorage.setItem(key, value);
      }
    }, localStorage);
    const organisation = new Organisation(page, baseURL);
    await organisation.delete(orgName);
    await browser.close();
  });
  test('should allow to create products', createProduct);
  test('should allow to create invoices', createInvoice);
});
