import Invoice from '../models/invoice';
import testData from '../data/invoice';
import businessItem from './business-item';
import config from '../../playwright.config';

const test = businessItem.extend({
  invoice: [async ({ businessItem }, use) => {

    const page = await businessItem.page;
    const { baseURL } = config.use;
    const invoice = new Invoice(page, baseURL);

    for (const item of testData) {
      await invoice.create(item);
    }
    await use(invoice);
  }, { scope: 'worker', auto: true }],
});

export default test;
