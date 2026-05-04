import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until, By } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { PatientsPage } from '../pages/PatientsPage.js';

jest.setTimeout(120000);

describe('iougurt - Pacientes Avancado', () => {
  let driver: WebDriver;
  let patientsPage: PatientsPage;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    const loginPage = new LoginPage(driver);
    const registerPage = new RegisterPage(driver);
    patientsPage = new PatientsPage(driver);

    await registerPage.navigate();
    const email = `qa-pat-adv-${Date.now()}@test.com`;
    await registerPage.register('QA Tester', 'Clinic', email, 'password123');
    await driver.wait(until.urlContains('/login'), 15000);
    await loginPage.login(email, 'password123');
    await driver.wait(until.urlMatches(/(\/|\/dashboard)$/), 15000);

    await patientsPage.navigateToRegister();
    await patientsPage.fillPetAndTutorData('Original Pet', '01012020', 'Cachorro', 'Misto', '10', false, 'Tutor Master', '00000000000', '61900000000');
    await patientsPage.submit();
    await driver.wait(until.elementLocated(By.id('patient-search')), 15000);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Deve cadastrar paciente vinculando a um tutor existente', async () => {
    await patientsPage.navigateToRegister();
    await patientsPage.selectExistingTutor('00000000000');
    await patientsPage.fillPetAndTutorData('Novo Pet', '02022022', 'Gato', 'Siames', '5', false, '', '', '');
    await patientsPage.submit();
    
    await driver.wait(until.elementLocated(By.id('patient-search')), 15000);
    
    await patientsPage.search('Novo Pet');
    const rows = await patientsPage.getTableRows();
    expect(await rows[0].getText()).toContain('Tutor Master');
  });

  test('Deve editar os dados de um paciente com sucesso', async () => {
    await patientsPage.navigateToList();
    await patientsPage.search('Original Pet');
    await patientsPage.clickDetails();
    await patientsPage.clickEdit();
    
    await patientsPage.fillPetAndTutorData('Pet Editado', '01012020', 'Cachorro', 'Misto', '12', false, 'Tutor Master', '00000000000', '61900000000');
    await patientsPage.submit();
    
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/pacientes/') && !url.includes('editar');
    }, 15000);
    
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    expect(bodyText).toContain('Pet Editado');
  });
});