import { By, WebDriver, until } from 'selenium-webdriver';

export class HomePage {
  private driver: WebDriver;
  private url = 'http://localhost:5173/dashboard';

  private dashboardContainer = By.className('home-dashboard');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigate() {
    await this.driver.get(this.url);
  }

  async waitForDashboard() {
    await this.driver.wait(until.elementLocated(this.dashboardContainer), 10000);
  }
}