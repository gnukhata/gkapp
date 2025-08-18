export default class Dashboard {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async login(username, password) {
    await this.page.goto(this.baseURL);
    await this.page.getByRole('textbox', { name: 'Enter Username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password input' }).fill(password);
    await this.page.getByRole('button', { name: 'box arrow in right Login' }).click();
  }

  async logout(username) {
    await this.page.getByRole('button', { name: username }).click();
    await this.page.getByRole('menuitem', { name: 'box arrow in left Logout' }).click();
  }
}
