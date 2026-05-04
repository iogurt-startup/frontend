
import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Builder, WebDriver, until } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { PatientsPage } from '../pages/PatientsPage.js';
import { SchedulingPage } from '../pages/SchedulingPage.js';
import { AgendaPage } from '../pages/AgendaPage.js';

jest.setTimeout(120000);

describe('iougurt - Agenda Navegacao e Atendimento', () => {
  let driver: WebDriver;
  let schedulingPage: SchedulingPage;
  let agendaPage: AgendaPage;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    const loginPage = new LoginPage(driver);
    const registerPage = new RegisterPage(driver);
    const patientsPage = new PatientsPage(driver);
    schedulingPage = new SchedulingPage(driver);
    agendaPage = new AgendaPage(driver);

    await registerPage.navigate();
    const email = `qa-ag-nav-${Date.now()}@test.com`;
    await registerPage.register('QA', 'Clinic', email, 'password123');
    await driver.wait(until.urlContains('/login'), 15000);
    await loginPage.login(email, 'password123');
    await driver.wait(until.urlMatches(/(\/|\/dashboard)$/), 15000);

    await patientsPage.navigateToRegister();
    await patientsPage.fillPetAndTutorData('Agendado', '01012020', 'Gato', 'SRD', '4', false, 'Tutor', '11122233344', '61988887777');
    await patientsPage.submit();
    await driver.wait(until.urlContains('/pacientes'), 15000);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Deve navegar entre as datas e iniciar atendimento via agenda', async () => {
    await schedulingPage.navigate();
    await schedulingPage.openModal();
    await schedulingPage.selectOption(0, 'Tutor');
    await schedulingPage.selectOption(1, 'Agendado');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().split('T')[0];
    await schedulingPage.fillDate(dateStr);
    await schedulingPage.selectOption(2, '09:00');
    await schedulingPage.selectOption(3, 'Consulta');
    await schedulingPage.submit();
    await driver.sleep(2000);

    await agendaPage.navigate();
    await agendaPage.nextDay();
    const cards = await agendaPage.getAgendaCards();
    expect(cards.length).toBeGreaterThan(0);

    await agendaPage.clickFirstAgendaCard();
    await agendaPage.confirmStartCare();
    await driver.wait(until.urlContains('/atendimentos'), 15000);
    expect(await driver.getCurrentUrl()).toContain('/atendimentos');
  });
});