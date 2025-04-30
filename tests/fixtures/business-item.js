import BusinessItem from '../models/business-item';
import testData from '../data/business-item';
import organisation from './organisation';
import config from '../../playwright.config';

const test = organisation.extend({
  businessItem: [async ({ organisation }, use) => {

    const page = await organisation.page;
    const { baseURL } = config.use;
    const businessItem = new BusinessItem(page, baseURL);

    for (const item of testData) {
      await businessItem.create(item);
    }
    await use(businessItem);
  }, { scope: 'worker', auto: true }],
});

export default test;
