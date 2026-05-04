import { By, WebDriver, until } from 'selenium-webdriver';

export class LayoutPage {
  private driver: WebDriver;
  private logoutBtn = By.className('sidebar-logout');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async logout() {
    const btn = await this.driver.wait(until.elementLocated(this.logoutBtn), 5000);
    await btn.click();
  }
}