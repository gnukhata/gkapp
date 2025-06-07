export default class ProfitAndLoss {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async getTotal() {
    await this.page.goto(`${this.baseURL}#/profit-loss`);
    await this.page.getByRole('group', { name: 'Type' }).locator('svg').nth(1).click();
    await this.page.getByRole('option', { name: 'Horizontal' }).click();
    const grossCrsTable = await this.page.locator('#trading-left');
    const grossCrs = await grossCrsTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    const grossDrsTable = await this.page.locator('#trading-right');
    const grossDrs  = await grossDrsTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    const netCrsTable = await this.page.locator('#pnl-left');
    const netCrs = await netCrsTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    const netDrsTable = await this.page.locator('#pnl-right');
    const netDrs = await netDrsTable
      .locator('tr').last()
      .locator('td').last()
      .innerText();
    return {
      grossCrs,
      grossDrs,
      netCrs,
      netDrs,
    };
  }
}

