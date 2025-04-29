export default class Organisation {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async create({ name, country, state, orgType }) {
    await this.page.goto(`${this.baseURL}/#/user-login`);
    await this.page.getByRole('button', { name: 'Create Org' }).click();
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(name);
    await this.page.locator('#select-1').click();
    await this.page.getByRole('option', { name: country, exact: true }).click();
    await this.page.locator('#select-2').click();
    await this.page.getByRole('option', { name: state }).click();
    await this.page.getByText(orgType).click();
    await this.page.getByRole('button', { name: 'Create & Login' }).click();
  }

  async update({ address, pin, gstin, pan }) {
    await this.page.getByRole('button', { name: 'caret right fill Administration' }).click();
    await this.page.getByRole('link', { name: 'building Organisation Profile' }).click();
    let orgAddr = this.page.getByRole('group').filter({ hasText: 'Address' }).getByRole('textbox').first();
    let orgPostal = this.page.getByRole('group').filter({ hasText: 'Postal code' }).getByRole('textbox').first();
    await this.page.getByRole('group').filter({ hasText: 'Tax Mode' }).getByRole('combobox').first().selectOption('GST');
    let orgGST = this.page.getByRole('group').filter({ hasText: 'GSTIN' }).getByRole('textbox').first();
    let orgPan = this.page.getByRole('group').filter({ hasText: 'PAN' }).getByRole('textbox').first();
    await orgAddr.fill(address);
    await orgPostal.fill(pin);
    await orgGST.fill(gstin);
    await orgPan.fill(pan);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }

  async login(orgName) {
    await this.page.getByRole('row', { name: `${orgName} Admin Open` }).getByRole('button').click();
  }

  async delete() {
    await this.page.goto(`${this.baseURL}/#/orgprofile`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.getByRole('button', { name: 'Delete Organisation' }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }
}
