import { test as base } from '@playwright/test';
import fs from 'fs';

const test = base.extend({
  base: async ({ context }, use) => {
    const sessionStorage = JSON.parse(fs.readFileSync('./tests/data/auth.json', 'utf-8'));
    await context.addInitScript(storage => {
      for (const [key, value] of Object.entries(storage)) {
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);
    await use();
  },
});

export default test;
