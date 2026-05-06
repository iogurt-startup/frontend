import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { PatientsPage } from '../pages/PatientsPage.js';
import { ClinicalPage } from '../pages/ClinicalPage.js';

jest.setTimeout(120000);

describe('iougurt - Finalizacao Clinica', () => {
  let driver: WebDriver;
  let clinicalPage: ClinicalPage;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    const loginPage = new LoginPage(driver);
    const registerPage = new RegisterPage(driver);
    const patientsPage = new PatientsPage(driver);
    clinicalPage = new ClinicalPage(driver);

    await registerPage.navigate();
    const email = `qa-clin-fin-${Date.now()}@test.com`;
    await registerPage.register('QA', 'Clinic', email, 'password123');
    await driver.wait(until.urlContains('/login'), 15000);
    await loginPage.login(email, 'password123');
    await driver.wait(until.urlMatches(/(\/|\/dashboard)$/), 15000);

    await patientsPage.navigateToRegister();
    await patientsPage.fillPetAndTutorData('Doente', '01012020', 'Cachorro', 'Pug', '5', false, 'Tutor', '12312312312', '61912341234');
    await patientsPage.submit();
    await driver.wait(until.urlContains('/pacientes'), 15000);
    await patientsPage.startAtendimento();
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Deve preencher dados clinicos e finalizar o atendimento', async () => {
    await clinicalPage.fillClinicalData('Tosse', 'Pulmões limpos', 'Gripe');
    await clinicalPage.finalizeCare();
    const isSuccess = await clinicalPage.isSuccessToastVisible();
    expect(isSuccess).toBe(true);
  });
});