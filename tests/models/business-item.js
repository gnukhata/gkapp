export default class BusinessItem {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async create({
    name,
    costPrice,
    salePrice,
    discount,
    stockQty,
    hsn,
    gst,
  }) {
    await this.page.goto(`${this.baseURL}#/business-details/create`);
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(name);
    await this.page.getByRole('spinbutton', { name: 'Cost Price' }).fill(costPrice);
    await this.page.getByRole('spinbutton', { name: 'Sale Price' }).fill(salePrice);
    await this.page.getByRole('spinbutton', { name: 'Discount' }).fill(discount);
    await this.page.getByPlaceholder('Stock Qty', { exact: true }).fill(stockQty);
    await this.page.getByRole('textbox', { name: 'Enter HSN/SAC code or' }).fill(hsn);
    await this.page.getByLabel('GST', { exact: true }).selectOption(gst);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }

  async delete(name) {
    await this.page.goto(`${this.baseURL}#/workflow/Business/-1`);
    await this.page.locator('#list-Business').getByText(name).click();
    await this.page.getByRole('button', { name: 'Delete Product' }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }
}
