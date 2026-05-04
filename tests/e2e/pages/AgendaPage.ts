import { By, WebDriver, until } from 'selenium-webdriver';

export class AgendaPage {
  private driver: WebDriver;
  private nextDayBtn = By.xpath("//span[contains(@class, 'agenda-date-arrow') and text()='>']");
  private agendaCards = By.className('agenda-card');
  private confirmAtenderBtn = By.xpath("//div[contains(@class, 'agenda-confirm-actions')]//button[contains(@class, 'primary')]");

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigate() {
    await this.driver.get('http://localhost:5173/agenda');
    await this.driver.wait(until.elementLocated(By.tagName('h1')), 10000);
  }

  async nextDay() {
    const btn = await this.driver.wait(until.elementLocated(this.nextDayBtn), 5000);
    await btn.click();
    await this.driver.sleep(1000);
  }

  async getAgendaCards() {
    return await this.driver.findElements(this.agendaCards);
  }

  async clickFirstAgendaCard() {
    const cards = await this.driver.wait(until.elementsLocated(this.agendaCards), 10000);
    await cards[0].click();
  }

  async confirmStartCare() {
    const btn = await this.driver.wait(until.elementLocated(this.confirmAtenderBtn), 5000);
    await btn.click();
  }
}