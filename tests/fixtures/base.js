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
    const localStorage = JSON.parse(fs.readFileSync('./tests/data/local-storage.json', 'utf-8'));
    await context.addInitScript((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.localStorage.setItem(key, value);
      }
    }, localStorage);
    await use();
  },
});

export default test;
