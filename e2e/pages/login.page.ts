import { By } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private emailInput = By.id('login-email');
  private passwordInput = By.id('login-password');
  private submitBtn = By.css('button.auth-submit');
  private togglePasswordBtn = By.css('.form-input-icon');
  private errorMessage = By.css('.form-error');
  private forgotPasswordLink = By.css('a[href="/forgot-password"]');
  private registerLink = By.css('a[href="/register"]');
  private successToast = By.css('.auth-success-toast');

  async open(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.clearAndType(this.emailInput, email);
    await this.clearAndType(this.passwordInput, password);
    await this.click(this.submitBtn);
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.click(this.togglePasswordBtn);
  }

  async getPasswordInputType(): Promise<string> {
    return this.getAttribute(this.passwordInput, 'type');
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.errorMessage);
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  async clickRegister(): Promise<void> {
    await this.click(this.registerLink);
  }

  async isSuccessToastDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.successToast);
  }
}
