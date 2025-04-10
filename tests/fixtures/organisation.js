import base from './base';
import Organisation from '../models/organisation';

const test = base.extend({
  // eslint-disable-next-line no-unused-vars
  organisation: async ({ base, page, baseURL }, use) => {
    const organisation = new Organisation(page, baseURL);
    const orgName = `Org${Date.now()}`;
    await organisation.create({
      name: orgName,
      country: "India",
      state: "Karnataka",
      orgType: "Profit Making",
    });
    await organisation.login(orgName);
    await organisation.update({
      address: "Test address, Test place, India",
      pin: "111111",
      gstin: "22AAAAA0000A1Z5",
      pan: "AAAAA0000A",
    });
    await use();
    await organisation.delete();
  },
});

export default test;
