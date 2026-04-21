import { By, WebDriver, until } from 'selenium-webdriver';

export class RegisterPage {
  private driver: WebDriver;
  private url = 'http://localhost:5173/register';

  private nameInput = By.id('register-name');
  private clinicInput = By.id('register-clinic');
  private emailInput = By.id('register-email');
  private passwordInput = By.id('register-password');
  private submitButton = By.css('.auth-submit');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigate() {
    await this.driver.get(this.url);
  }

  async register(name: string, clinic: string, email: string, pass: string) {
    await this.driver.wait(until.elementLocated(this.nameInput), 10000);
    await this.driver.findElement(this.nameInput).sendKeys(name);
    await this.driver.findElement(this.clinicInput).sendKeys(clinic);
    await this.driver.findElement(this.emailInput).sendKeys(email);
    await this.driver.findElement(this.passwordInput).sendKeys(pass);
    await this.driver.findElement(this.submitButton).click();
  }
}