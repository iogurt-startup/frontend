import { By, WebDriver, until } from 'selenium-webdriver';

export class LoginPage {
  private driver: WebDriver;
  private url = 'http://localhost:5173/login';

  private emailInput = By.id('login-email');
  private passwordInput = By.id('login-password');
  private submitButton = By.css('.auth-submit');
  private errorMessage = By.className('form-error');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigate() {
    await this.driver.get(this.url);
  }

  async login(email: string, password: string) {
    const emailField = await this.driver.wait(until.elementLocated(this.emailInput), 10000);
    await this.driver.wait(until.elementIsVisible(emailField), 5000);
    await emailField.clear();
    await emailField.sendKeys(email);
    
    const passwordField = await this.driver.findElement(this.passwordInput);
    await passwordField.clear();
    await passwordField.sendKeys(password);
    
    const btn = await this.driver.findElement(this.submitButton);
    await btn.click();
  }

  async getErrorMessage() {
    const errorElement = await this.driver.wait(until.elementLocated(this.errorMessage), 5000);
    return await errorElement.getText();
  }
}