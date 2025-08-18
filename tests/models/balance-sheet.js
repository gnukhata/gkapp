export default class BalanceSheet {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async getTotal() {
    await this.page.goto(`${this.baseURL}#/balance-sheet`);
    const capitalAndLiabilitiesTable = await this.page.locator('#capital-and-liabilities-table');
    const capitalAndLiabilities = await capitalAndLiabilitiesTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    const propertyAndAssetsTable = await this.page.locator('#property-and-assets-table');
    const propertyAndAssets = await propertyAndAssetsTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    return { capitalAndLiabilities, propertyAndAssets };
  }
}

