import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until, By } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { HomePage } from '../pages/HomePage.js';

jest.setTimeout(60000);

describe('Fluxo Completo de Autenticacao e Navegacao', () => {
  let driver: WebDriver;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let homePage: HomePage;

  const testUser = {
    name: 'Usuario Teste',
    clinic: 'Clinica Veterinaria Teste',
    email: `teste-${Date.now()}@example.com`,
    password: 'password123'
  };

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    loginPage = new LoginPage(driver);
    registerPage = new RegisterPage(driver);
    homePage = new HomePage(driver);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Deve cadastrar um novo usuario com sucesso', async () => {
    await registerPage.navigate();
    await registerPage.register(testUser.name, testUser.clinic, testUser.email, testUser.password);

    await driver.wait(until.urlContains('/login'), 15000);
    expect(await driver.getCurrentUrl()).toContain('/login');
  });

  test('Deve fazer login com o usuario recem-criado', async () => {
    await loginPage.navigate();
    await loginPage.login(testUser.email, testUser.password);

    await driver.wait(until.urlMatches(/(\/|\/portal|\/dashboard)$/), 15000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toMatch(/\/($|portal$|dashboard$)/);

    await homePage.waitForDashboard();
    
    const dashboardTitle = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(), 'Últimos atendimentos')]")), 
      5000
    );
    expect(dashboardTitle).toBeTruthy();
  });

  test('Deve proteger rota de dashboard para usuario nao autenticado', async () => {
    await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
    
    await homePage.navigate();
    
    await driver.wait(until.urlContains('/login'), 10000);
    expect(await driver.getCurrentUrl()).toContain('/login');
  });

  test('Deve redirecionar usuario logado que tenta acessar login ou register', async () => {
    await loginPage.navigate();
    await loginPage.login(testUser.email, testUser.password);
    
    await homePage.waitForDashboard();

    await loginPage.navigate();

    await driver.wait(until.urlMatches(/(\/|\/portal|\/dashboard)$/), 10000);
    let currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toMatch(/\/($|portal$|dashboard$)/);

    await registerPage.navigate();

    await driver.wait(until.urlMatches(/(\/|\/portal|\/dashboard)$/), 10000);
    currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toMatch(/\/($|portal$|dashboard$)/);
  });
});