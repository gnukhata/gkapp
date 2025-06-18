export default class CashFlow {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async getTotal() {
    await this.page.goto(`${this.baseURL}#/cash-flow`);
    const inflowTable = await this.page.locator('#inflows-table');
    const totalInflows = await inflowTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    const outflowTable = await this.page.locator('#outflows-table');
    const totalOutflows = await outflowTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    return { totalInflows, totalOutflows };
  }
}
