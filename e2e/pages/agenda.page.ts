import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class AgendaPage extends BasePage {
  private pageTitle = By.css('h1');
  private timelineSlots = By.css(
    '[class*="timeline"], [class*="time-slot"], [class*="agenda-slot"], [class*="agenda-grid"]'
  );
  private dateNavButtons = By.css('.agenda-date-arrow');
  private appointments = By.css(
    '[class*="appointment-card"], [class*="agenda-item"], [class*="agenda-card"]'
  );
  private agendaContainer = By.css(
    '[class*="agenda-page"], [class*="agenda"]'
  );

  async open(): Promise<void> {
    await this.navigate('/agenda');
  }

  async isPageVisible(): Promise<boolean> {
    return this.isDisplayed(this.agendaContainer);
  }

  async getPageTitle(): Promise<string> {
    return this.getText(this.pageTitle);
  }

  async getTimeSlots(): Promise<WebElement[]> {
    return this.findElements(this.timelineSlots);
  }

  async getAppointments(): Promise<WebElement[]> {
    return this.findElements(this.appointments);
  }

  async getDateNavButtons(): Promise<WebElement[]> {
    return this.findElements(this.dateNavButtons);
  }

  async clickNextDate(): Promise<void> {
    const buttons = await this.findElements(this.dateNavButtons);
    if (buttons.length > 0) {
      await buttons[buttons.length - 1].click();
    }
  }

  async clickPreviousDate(): Promise<void> {
    const buttons = await this.findElements(this.dateNavButtons);
    if (buttons.length > 0) {
      await buttons[0].click();
    }
  }
}
