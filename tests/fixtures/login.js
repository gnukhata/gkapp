import { test as base } from '@playwright/test';
import Dashboard from '../models/dashboard';
import config from '../../playwright.config';
import fs from 'fs';
import { STORAGE_STATE, SESSION_STORAGE_FILE } from '../utils/storagePaths';

const test = base.extend({
  login: [async ({browser}, use) => {

    if (fs.existsSync(STORAGE_STATE) && fs.existsSync(SESSION_STORAGE_FILE)) {
      await use(STORAGE_STATE);
      return;
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    const { baseURL } = config.use;
    const dashboard = new Dashboard(page, baseURL);
    await dashboard.login('gkadmin', 'gkpass');

    // Save localStorage + cookies
    await context.storageState({ path: STORAGE_STATE });

    const sessionStorage = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < sessionStorage.length; ++i) {
        const key = sessionStorage.key(i);
        if (key) {
          data[key] = sessionStorage.getItem(key);
        }
      }
      return data;
    });
    fs.writeFileSync(SESSION_STORAGE_FILE, JSON.stringify(sessionStorage), 'utf-8');

    await context.close();
    await use();
    if (fs.existsSync(STORAGE_STATE)) fs.unlinkSync(STORAGE_STATE);
    if (fs.existsSync(SESSION_STORAGE_FILE)) fs.unlinkSync(SESSION_STORAGE_FILE);
  }, { scope: 'worker', auto: true }],
});

export default test;
