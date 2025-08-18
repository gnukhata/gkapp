export default class DebitCreditNote {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async create({
    invoiceId,
    invoiceType,
    noteType,
    purpose = 'price',
    value,
  }) {
    const purposeOptions = {
      price: 'Adjust Price / Discount',
      qty: 'Adjust Qty / Return Goods',
      deficiency: 'Deficiency in services',
      correction: 'Correction in Invoice',
      pos: 'Change in POS',
      finalization: 'Finalization of Provisional assessment',
      others: 'Others',
    };
    await this.page.goto(`${this.baseURL}#/dc-note?type=${invoiceType}`);
    await this.page.locator('label').filter(
      { hasText: noteType === 'debit' ? 'Debit Note' : 'Credit Note' }
    ).click();
    await this.page.getByPlaceholder('Choose an Invoice').click();
    await this.page.locator('#input-8-2 > ul li', { hasText: `${invoiceId},` }).click();
    await this.page.getByLabel('Purpose').selectOption({ label: purposeOptions[purpose] });
    let inputColumnIndex = 3;
    if (purpose === 'qty') {
      inputColumnIndex = 2;
    }
    await this.page.getByRole('cell')
      .nth(inputColumnIndex)
      .locator('div > input[type="number"]')
      .fill(value);
    const noteNumber = await this.page.getByRole('textbox', { name: `${noteType === 'debit' ? 'Dr' : 'Cr'} Note No.` }).inputValue();
    await this.page.getByRole('button', { name: 'Create' }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.page.locator('#button-wrapper > .btn-danger').click();
    return noteNumber;
  }
}
