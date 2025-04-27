import { chromium, firefox, webkit } from '@playwright/test';
import Dashboard from './models/dashboard';
import fs from 'fs';

async function globalSetup(config) {
  const { baseURL, storageState } = config.projects[0].use;
  const availableBrowsers = { chromium, firefox, webkit };
  const enabledBrowser = config.projects[0].name;
  const browser = await availableBrowsers[enabledBrowser].launch();
  const page = await browser.newPage();
  const dashboard = new Dashboard(page, baseURL);
  await dashboard.login('gkadmin', 'gkpass');
  await page.context().storageState({ path: storageState });

  // Save session state with authentication details to an external file
  const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
  fs.writeFileSync('./tests/data/auth.json', sessionStorage, 'utf-8');

  await browser.close();
}

export default globalSetup;
