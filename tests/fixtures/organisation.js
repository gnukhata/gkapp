import login from './login';
import Organisation from '../models/organisation';
import { createOrgData, updateOrgData } from '../data/organisation';

const test = login.extend({
  // eslint-disable-next-line no-unused-vars
  organisation: async ({ login, page, baseURL }, use) => {
    const organisation = new Organisation(page, baseURL);
    await organisation.create(createOrgData);
    await organisation.login(createOrgData.name);
    await organisation.update(updateOrgData);
    await use();
    await organisation.delete();
  },
});

export default test;
