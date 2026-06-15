import { By } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  private emailInput = By.id('forgot-email');
  private submitBtn = By.css('button.auth-submit');
  private successMessage = By.css('.forgot-success');
  private backLink = By.css('.forgot-back-link');
  private errorMessage = By.css('.form-error');

  async open(): Promise<void> {
    await this.navigate('/forgot-password');
  }

  async requestReset(email: string): Promise<void> {
    await this.clearAndType(this.emailInput, email);
    await this.click(this.submitBtn);
  }

  async getSuccessMessage(): Promise<string> {
    return this.getText(this.successMessage);
  }

  async isSuccessDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.successMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.errorMessage);
  }

  async clickBackToLogin(): Promise<void> {
    await this.click(this.backLink);
  }
}
