import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until, By } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { PatientsPage } from '../pages/PatientsPage.js';
import { SchedulingPage } from '../pages/SchedulingPage.js';

jest.setTimeout(120000);

describe('iougurt - Módulo de Agenda', () => {
  let driver: WebDriver;
  let schedulingPage: SchedulingPage;
  
  const patientData = { pet: 'Bolinha', tutor: 'Tutor Agenda' };

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    const loginPage = new LoginPage(driver);
    const registerPage = new RegisterPage(driver);
    const patientsPage = new PatientsPage(driver);
    schedulingPage = new SchedulingPage(driver);

    await registerPage.navigate();
    const email = `qa-agenda-${Date.now()}@test.com`;
    await registerPage.register('QA Agenda', 'Agenda Clinic', email, 'password123');
    await driver.wait(until.urlContains('/login'), 15000);
    await loginPage.login(email, 'password123');
    await driver.wait(until.urlMatches(/(\/|\/dashboard)$/), 15000);

    await patientsPage.navigateToRegister();
    await patientsPage.fillPetAndTutorData(patientData.pet, '01012021', 'Gato', 'SRD', '4', false, patientData.tutor, '11122233344', '61988887777');
    await patientsPage.submit();
    await driver.wait(until.elementLocated(By.id('patient-search')), 15000);
  });

  afterAll(async () => { 
    if (driver) await driver.quit(); 
  });

  test('Deve realizar um agendamento com sucesso', async () => {
    await schedulingPage.navigate();
    await schedulingPage.openModal();
    
    await schedulingPage.selectOption(0, patientData.tutor);
    await schedulingPage.selectOption(1, patientData.pet);
    
    // Calcula uma data sempre 2 dias no futuro 
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];
    await schedulingPage.fillDate(dateStr);

    await schedulingPage.selectOption(2, '09:00');
    await schedulingPage.selectOption(3, 'Consulta');

    await schedulingPage.submit();
    
    const errorMsg = await schedulingPage.getSubmitError();
    expect(errorMsg).toBeNull();
    
    const isSuccess = await schedulingPage.isSuccessToastVisible();
    expect(isSuccess).toBe(true);
  });
});