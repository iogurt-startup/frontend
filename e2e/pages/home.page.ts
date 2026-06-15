import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  private dashboard = By.css('.home-dashboard');
  private sections = By.css('.home-section');
  private sectionHeaders = By.css('.home-section-header');
  private verMaisButtons = By.css('.home-btn-more');
  private appointmentCards = By.css('.appointment-card');
  private timelineItems = By.css('.timeline-item');
  private loadingSpinner = By.css('.care-spin');

  async open(): Promise<void> {
    await this.navigate('/home');
  }

  async isDashboardVisible(): Promise<boolean> {
    return this.isDisplayed(this.dashboard);
  }

  async getSections(): Promise<WebElement[]> {
    return this.findElements(this.sections);
  }

  async getSectionHeaders(): Promise<string[]> {
    const headers = await this.findElements(this.sectionHeaders);
    return Promise.all(headers.map((h) => h.getText()));
  }

  async getVerMaisButtons(): Promise<WebElement[]> {
    return this.findElements(this.verMaisButtons);
  }

  async clickVerMais(index: number): Promise<void> {
    const buttons = await this.findElements(this.verMaisButtons);
    if (buttons[index]) {
      await buttons[index].click();
    }
  }

  async getAppointmentCards(): Promise<WebElement[]> {
    return this.findElements(this.appointmentCards);
  }

  async getTimelineItems(): Promise<WebElement[]> {
    return this.findElements(this.timelineItems);
  }

  async isLoading(): Promise<boolean> {
    return this.isDisplayed(this.loadingSpinner, 2000);
  }
}
