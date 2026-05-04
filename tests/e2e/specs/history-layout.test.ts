import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { PatientsPage } from '../pages/PatientsPage.js';
import { ClinicalPage } from '../pages/ClinicalPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';
import { LayoutPage } from '../pages/LayoutPage.js';

jest.setTimeout(120000);

describe('iougurt - Historico e Layout', () => {
  let driver: WebDriver;
  let historyPage: HistoryPage;
  let layoutPage: LayoutPage;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    const loginPage = new LoginPage(driver);
    const registerPage = new RegisterPage(driver);
    const patientsPage = new PatientsPage(driver);
    const clinicalPage = new ClinicalPage(driver);
    historyPage = new HistoryPage(driver);
    layoutPage = new LayoutPage(driver);

    await registerPage.navigate();
    const email = `qa-hist-${Date.now()}@test.com`;
    await registerPage.register('QA', 'Clinic', email, 'password123');
    await driver.wait(until.urlContains('/login'), 15000);
    await loginPage.login(email, 'password123');
    await driver.wait(until.urlMatches(/(\/|\/dashboard)$/), 15000);

    await patientsPage.navigateToRegister();
    await patientsPage.fillPetAndTutorData('Hist Pet', '01012020', 'Peixe', 'Betta', '1', false, 'Hist Tutor', '11111111111', '61911111111');
    await patientsPage.submit();
    await driver.wait(until.urlContains('/pacientes'), 15000);
    
    await patientsPage.startAtendimento();
    await clinicalPage.fillClinicalData('Checkup', 'Ok', 'Saudavel');
    await clinicalPage.finalizeCare();
    await driver.sleep(2000);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Deve buscar atendimento finalizado no historico', async () => {
    await historyPage.navigate();
    await historyPage.search('Hist Pet');
    const rows = await historyPage.getTableRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(await rows[0].getText()).toContain('Peixe');
  });

  test('Deve fazer logout e redirecionar para tela de login', async () => {
    await layoutPage.logout();
    await driver.wait(until.urlContains('/login'), 10000);
    expect(await driver.getCurrentUrl()).toContain('/login');
  });
});