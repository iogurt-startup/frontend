import { By } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  private nameInput = By.id('register-name');
  private clinicInput = By.id('register-clinic');
  private emailInput = By.id('register-email');
  private passwordInput = By.id('register-password');
  private submitBtn = By.css('button.auth-submit');
  private togglePasswordBtn = By.css('.form-input-icon');
  private errorMessage = By.css('.form-error');
  private loginLink = By.css('.auth-switch a[href="/login"]');

  async open(): Promise<void> {
    await this.navigate('/register');
  }

  async register(
    name: string,
    clinic: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.clearAndType(this.nameInput, name);
    await this.clearAndType(this.clinicInput, clinic);
    await this.clearAndType(this.emailInput, email);
    await this.clearAndType(this.passwordInput, password);
    await this.click(this.submitBtn);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.errorMessage);
  }

  async clickLoginLink(): Promise<void> {
    await this.click(this.loginLink);
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.click(this.togglePasswordBtn);
  }

  async getPasswordInputType(): Promise<string> {
    return this.getAttribute(this.passwordInput, 'type');
  }
}
