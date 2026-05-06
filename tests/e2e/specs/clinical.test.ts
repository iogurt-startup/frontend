import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { PatientsPage } from '../pages/PatientsPage.js';
import { ClinicalPage } from '../pages/ClinicalPage.js';

jest.setTimeout(120000);

describe('iougurt - Regras de Negócio e Fluxo Clínico', () => {
  let driver: WebDriver;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let patientsPage: PatientsPage;
  let clinicalPage: ClinicalPage;

  const testUser = {
    name: 'QA Clinical',
    clinic: 'Iougurt Test Clinic',
    email: `qa-clinical-${Date.now()}@example.com`,
    password: 'password123'
  };

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    loginPage = new LoginPage(driver);
    registerPage = new RegisterPage(driver);
    patientsPage = new PatientsPage(driver);
    clinicalPage = new ClinicalPage(driver);

    await registerPage.navigate();
    await registerPage.register(testUser.name, testUser.clinic, testUser.email, testUser.password);
    await driver.wait(until.urlContains('/login'), 15000);
    await loginPage.navigate();
    await loginPage.login(testUser.email, testUser.password);
    await driver.wait(until.urlMatches(/(\/|\/portal|\/dashboard)$/), 15000);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Deve pedir limite de peso (<= 999,99kg)', async () => {
    await patientsPage.navigateToRegister();
    await patientsPage.fillPetAndTutorData(
      'Rex', 
      '01012020', 
      'Cachorro', 
      'Vira-lata', 
      '1500', 
      false,
      'Tutor Teste', 
      '12345678901', 
      '61999999999'
    );
    await patientsPage.submit();
    
    const errors = await patientsPage.getErrors();
    let found = false;
    for (const error of errors) {
      if ((await error.getText()).includes('menor ou igual a 999,99')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test('Deve alertar alteração não salva ao sair', async () => {
    await patientsPage.navigateToRegister();
    await patientsPage.fillPetAndTutorData(
      'Sticky', 
      '02022022', 
      'Gato', 
      'Siamês', 
      '5', 
      false,
      'Outro Tutor', 
      '98765432100', 
      '61888888888'
    );
    await patientsPage.submit();
    
    await driver.wait(until.urlContains('/pacientes'), 15000);
    await patientsPage.startAtendimento();
    
    await clinicalPage.typeNotes('Unsaved clinical notes');
    await clinicalPage.clickBack();
    
    const isVisible = await clinicalPage.isExitModalVisible();
    expect(isVisible).toBe(true);
  });
});