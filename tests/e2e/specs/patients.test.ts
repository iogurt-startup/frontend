import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { PatientsPage } from '../pages/PatientsPage.js';

jest.setTimeout(120000);

describe('iougurt - Módulo de Pacientes', () => {
  let driver: WebDriver;
  let patientsPage: PatientsPage;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    const loginPage = new LoginPage(driver);
    const registerPage = new RegisterPage(driver);
    patientsPage = new PatientsPage(driver);

    await registerPage.navigate();
    const email = `qa-patients-${Date.now()}@test.com`;
    await registerPage.register('QA Tester', 'Clinic Test', email, 'password123');
    await driver.wait(until.urlContains('/login'), 10000);
    await loginPage.login(email, 'password123');
    await driver.wait(until.urlMatches(/(\/|\/dashboard)$/), 15000);
  });

  afterAll(async () => { if (driver) await driver.quit(); });

  test('Deve cadastrar paciente e tutor e verificar na listagem', async () => {
    await patientsPage.navigateToRegister();
    const petName = 'Rex Teste';
    await patientsPage.fillPetAndTutorData(petName, '01012020', 'Cachorro', 'Poodle', '10', false, 'Tutor Teste', '12345678901', '61911112222');
    await patientsPage.submit();
    await driver.wait(until.urlContains('/pacientes'), 15000);
    await patientsPage.search(petName);
    const rows = await patientsPage.getTableRows();
    expect(await rows[0].getText()).toContain(petName);
  });
});