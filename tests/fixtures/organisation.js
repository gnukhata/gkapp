import login from './login';
import Organisation from '../models/organisation';
import { createOrgData, updateOrgData } from '../data/organisation';
import config from '../../playwright.config';
import fs from 'fs';
import { SESSION_STORAGE_FILE } from '../utils/storagePaths';


const test = login.extend({
  organisation: [async ({ login, browser }, use) => {

    const sessionStorage = JSON.parse(fs.readFileSync(SESSION_STORAGE_FILE, 'utf-8'));
    const context = await browser.newContext({ storageState: login });

    // Inject sessionStorage before any page runs
    await context.addInitScript(storage => {
      for (const [key, value] of Object.entries(storage)) {
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);

    const page = await context.newPage();
    const { baseURL } = config.use;
    const organisation = new Organisation(page, baseURL);
    await organisation.create(createOrgData);
    await organisation.login(createOrgData.name);
    await organisation.update(updateOrgData);
    await use(organisation);
    await organisation.delete();
    await context.close();
  }, { scope: 'worker', auto: true }],
});

export default test;
