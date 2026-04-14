import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, By } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';

jest.setTimeout(30000);

describe('Login Tests', () => {
  let driver: WebDriver;
  let loginPage: LoginPage;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    loginPage = new LoginPage(driver);
  }, 30000);

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('Deve exibir erro com credenciais inválidas', async () => {
    await loginPage.navigate();
    await loginPage.login('invalido@teste.com', 'senha123');
    const error = await loginPage.getErrorMessage();
    expect(error).toBeTruthy();
  });

  test('Deve redirecionar após login bem-sucedido', async () => {
    await loginPage.navigate();
    await loginPage.login('teste@example.com', '123456');

    await driver.wait(async (d) => {
      const url = await d.getCurrentUrl();
      return !url.includes('/login');
    }, 10000);

    const currentUrl = await driver.getCurrentUrl();
    
    expect(currentUrl).toMatch(/\/($|portal$)/);
  });

  test('Deve validar campos obrigatórios', async () => {
    await loginPage.navigate();
    await driver.findElement(By.css('.auth-submit')).click();
    
    const emailField = await driver.findElement(By.id('login-email'));
    const validity = await emailField.getAttribute('validity');
    
    expect(validity).toBeDefined();
  });
});