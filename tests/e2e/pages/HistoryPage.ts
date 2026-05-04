import { By, WebDriver, until } from 'selenium-webdriver';

export class HistoryPage {
  private driver: WebDriver;
  private searchInput = By.css('.search-bar input');
  private tableRows = By.css('.history-table tbody tr');
  private viewDetailsBtn = By.className('history-action-button');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigate() {
    await this.driver.get('http://localhost:5173/historico');
    await this.driver.wait(until.elementLocated(By.tagName('h1')), 10000);
  }

  async search(query: string) {
    const input = await this.driver.wait(until.elementLocated(this.searchInput), 5000);
    await input.clear();
    await input.sendKeys(query);
    await this.driver.sleep(1000);
  }

  async getTableRows() {
    return await this.driver.findElements(this.tableRows);
  }

  async openDetails() {
    const btn = await this.driver.wait(until.elementLocated(this.viewDetailsBtn), 5000);
    await btn.click();
  }
}