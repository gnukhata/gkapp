export default class Invoice {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async create({
    invoiceType,
    contactName,
    items,
    paymentMode,
    bankDetails = {},
  }) {
    await this.page.goto(`${this.baseURL}#/invoice?type=${invoiceType}`);
    await this.page.getByRole('group').filter({ hasText: 'Name' }).getByRole('combobox').click();
    await this.page.getByRole('option', { name: contactName }).click();
    let itemIndex = 0;
    for (const item of items) {
      const optionLocator = this.page.locator('table .custom-select option', { hasText: `${item} (` }).nth(itemIndex);
      const optionValue = await optionLocator.evaluate(option => option.value);
      const selectLocator = this.page.locator('table .custom-select').nth(itemIndex);
      await selectLocator.selectOption(optionValue);
      itemIndex++;
      if (itemIndex < items.length) {
        await this.page.getByRole('button', { name: 'Add Item' }).click();
      }
    }
    await this.page.getByLabel('Mode Of Receipt').selectOption({ label: paymentMode });
    if (paymentMode === 'Bank') {
      const {
        ifsc,
        accountNumber,
        bank,
        branch,
      } = bankDetails;
      await this.page.getByRole('textbox', { name: 'eg: KARB0000001' }).fill(ifsc);
      await this.page.getByRole('textbox', { name: 'Account Number' }).fill(accountNumber);
      await this.page.getByRole('textbox', { name: 'Bank Name' }).fill(bank);
      await this.page.getByRole('textbox', { name: 'Branch' }).fill(branch);
    }
    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.page.locator('#button-wrapper > .btn-danger').click();
  }
}
