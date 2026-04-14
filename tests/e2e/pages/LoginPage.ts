import { By, WebDriver, until } from 'selenium-webdriver';

export class LoginPage {
  private driver: WebDriver;
  private url = 'http://localhost:5173/login';

  private emailInput = By.id('login-email');
  private passwordInput = By.id('login-password');
  private submitButton = By.css('.auth-submit');
  private errorMessage = By.className('form-error');
  private googleButton = By.className('auth-google-btn');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigate() {
    await this.driver.get(this.url);
  }

  async login(email: string, password: string) {
    await this.driver.wait(until.elementLocated(this.emailInput), 10000);
    const emailField = await this.driver.findElement(this.emailInput);
    await emailField.clear();
    await emailField.sendKeys(email);
    
    const passwordField = await this.driver.findElement(this.passwordInput);
    await passwordField.clear();
    await passwordField.sendKeys(password);
    
    await this.driver.findElement(this.submitButton).click();
  }

  async getErrorMessage() {
    const errorElement = await this.driver.wait(until.elementLocated(this.errorMessage), 5000);
    return await errorElement.getText();
  }

  async clickGoogleLogin() {
    await this.driver.wait(until.elementLocated(this.googleButton), 5000);
    await this.driver.findElement(this.googleButton).click();
  }
}