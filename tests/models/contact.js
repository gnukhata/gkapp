export default class Contact {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async create({
    contactType,
    gstin,
    name,
    address,
    pincode,
    email,
    phoneNo,
  }) {
    await this.page.goto(`${this.baseURL}/#/contact-details/create?type=${contactType}`);
    await this.page.getByRole('group', { name: 'GSTIN' }).locator('div').getByRole('textbox').fill(gstin);
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(name);
    await this.page.getByRole('textbox', { name: 'Address' }).fill(address);
    await this.page.getByRole('textbox', { name: 'Postal Code' }).fill(pincode);
    await this.page.getByRole('checkbox', { name: 'Contact Details' }).focus();
    await this.page.keyboard.press('Space');
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Phone' }).fill(phoneNo);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }
}
