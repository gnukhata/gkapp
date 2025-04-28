import { test as base } from '@playwright/test';
import Dashboard from '../models/dashboard';

const test = base.extend({
  login: async ({ page, baseURL }, use) => {
    const dashboard = new Dashboard(page, baseURL);
    await dashboard.login('gkadmin', 'gkpass');
    await use();
  },
});

export default test;
