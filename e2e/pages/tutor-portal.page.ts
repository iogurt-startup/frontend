import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class TutorPortalPage extends BasePage {
  private portalContainer = By.css(
    '[class*="portal"], [class*="tutor-portal"]'
  );
  private pageTitle = By.css('h1');
  private petCards = By.css('[class*="card"]');
  private alertsSection = By.css('[class*="alert"], [class*="care"]');
  private historyLink = By.css('a[href="/portal/historico"]');
  private historyContainer = By.css(
    '[class*="history"], [class*="historico"]'
  );

  async open(): Promise<void> {
    await this.navigate('/portal');
  }

  async openHistory(): Promise<void> {
    await this.navigate('/portal/historico');
  }

  async isPortalVisible(): Promise<boolean> {
    return this.isDisplayed(this.pageTitle);
  }

  async getPageTitle(): Promise<string> {
    return this.getText(this.pageTitle);
  }

  async getPetCards(): Promise<WebElement[]> {
    return this.findElements(this.petCards);
  }

  async getAlertsElements(): Promise<WebElement[]> {
    return this.findElements(this.alertsSection);
  }

  async isHistoryLinkVisible(): Promise<boolean> {
    return this.isDisplayed(this.historyLink);
  }

  async clickHistoryLink(): Promise<void> {
    await this.click(this.historyLink);
  }

  async isHistoryVisible(): Promise<boolean> {
    return this.isDisplayed(this.historyContainer);
  }
}
