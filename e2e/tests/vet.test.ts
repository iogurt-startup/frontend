import { By, until, WebDriver } from 'selenium-webdriver';
import { expect } from 'chai';
import { getGlobalDriver, getSharedData } from '../helpers/global-fixture';
import { ENV } from '../config/test.config';
import { generateRandomCpf } from '../helpers/api.helper';
import { LoginPage } from '../pages/login.page';
import { PatientsListPage } from '../pages/patients-list.page';
import { PatientRegisterPage } from '../pages/patient-register.page';
import { PatientDetailsPage } from '../pages/patient-details.page';
import { SidebarPage } from '../pages/sidebar.page';

async function selectCustomOption(driver: WebDriver, labelText: string, optionText: string) {
  const labelXPath = `//div[contains(@class, "form-group") and ./label[contains(text(), "${labelText}")]]//div[contains(@class, "custom-select-button")]`;
  const selectButton = await driver.wait(until.elementLocated(By.xpath(labelXPath)), 8000);
  await driver.wait(until.elementIsVisible(selectButton), 8000);
  
  if (labelText === 'Tutor') {
    await driver.wait(async () => {
      const text = await selectButton.getText();
      return !text.includes('Carregando');
    }, 8000);
  } else if (labelText === 'Paciente') {
    await driver.wait(async () => {
      const text = await selectButton.getText();
      return !text.includes('Carregando') && !text.includes('primeiro');
    }, 8000);
  }

  await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", selectButton);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await selectButton.click();
  
  const optionXPath = `//div[contains(@class, "form-group") and ./label[contains(text(), "${labelText}")]]//div[contains(@class, "dropdown-overlay")]//div[contains(@class, "dropdown-item") and contains(text(), "${optionText}")]`;
  const optionEl = await driver.wait(until.elementLocated(By.xpath(optionXPath)), 8000);
  await driver.wait(until.elementIsVisible(optionEl), 8000);
  await optionEl.click();
}

describe('Veterinarian Flow E2E - Continuous Journey', function () {
  let driver: WebDriver;
  let petName: string;
  let tutorName: string;
  let tutorCpf: string;
  let tutorPhone: string;

  before(async function () {
    driver = await getGlobalDriver();

    await driver.get(`${ENV.BASE_URL}/login`);
    try {
      await driver.executeScript('window.localStorage.clear();');
    } catch { /* ignore */ }

    const randId = Math.floor(Math.random() * 9000) + 1000;
    petName = `AAA Amora E2E ${randId}`;
    tutorName = `AAA Ricardo Oliveira E2E ${randId}`;
    tutorCpf = generateRandomCpf();
    tutorPhone = '11999998888';
  });

  beforeEach(async function () {
    try {
      await driver.executeScript('window.onbeforeunload = null; window.__hasBeforeUnload = false;');
    } catch { /* ignore */ }

    try {
      const overlays = await driver.findElements(By.css('.modal-overlay, .agenda-confirm-overlay, .care-modal-overlay, .patient-edit-modal-overlay'));
      for (const overlay of overlays) {
        if (await overlay.isDisplayed()) {
          await driver.navigate().refresh();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          break;
        }
      }
    } catch { /* ignore */ }
  });

  it('Passo 1: Deve realizar login com e-mail e senha válidos do owner', async function () {
    const sharedData = getSharedData();
    const loginPage = new LoginPage(driver);
    await loginPage.open();
    await loginPage.login(sharedData.owner.email, sharedData.owner.password);
    
    await loginPage.waitForUrlContains('/home');
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/home');
  });

  it('Passo 2: Deve cadastrar um novo pet e tutor com informações obrigatórias', async function () {
    const sidebar = new SidebarPage(driver);
    await sidebar.navigateTo('pacientes');
    
    const patientsList = new PatientsListPage(driver);
    await patientsList.waitForTableOrEmpty();
    await patientsList.clickNewPatient();
    
    const registerPage = new PatientRegisterPage(driver);
    await registerPage.waitForUrlContains('/pacientes/cadastrar');

    const petNameInput = await driver.wait(until.elementLocated(By.id('pet-name')), 8000);
    await petNameInput.sendKeys(petName);

    const birthDateInput = await driver.findElement(By.id('birth-date'));
    await birthDateInput.sendKeys('15062020');

    await registerPage.selectOption(By.id('species'), 'Cachorro');

    const breedInput = await driver.findElement(By.id('breed'));
    await breedInput.sendKeys('Vira-lata');
    
    const sexRadio = await driver.wait(until.elementLocated(By.css('input[name="sex"][value="Feminino"]')), 8000);
    await sexRadio.click();

    const microchipRadio = await driver.wait(until.elementLocated(By.css('input[name="microchip"][value="Não"]')), 8000);
    await microchipRadio.click();

    const tutorModeNewRadio = await driver.wait(until.elementLocated(By.xpath('//label[contains(., "Cadastrar novo tutor")]/input')), 8000);
    await tutorModeNewRadio.click();

    const tutorNameInput = await driver.wait(until.elementLocated(By.id('tutor-name')), 8000);
    await tutorNameInput.sendKeys(tutorName);

    const tutorCpfInput = await driver.findElement(By.id('tutor-cpf'));
    await tutorCpfInput.sendKeys(tutorCpf);

    const tutorPhoneInput = await driver.findElement(By.id('tutor-phone'));
    await tutorPhoneInput.sendKeys(tutorPhone);

    await registerPage.submit();

    try {
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.endsWith('/pacientes') || url.endsWith('/pacientes/');
      }, 15000);
    } catch (err) {
      const errors = await driver.findElements(By.className('field-error'));
      const errorTexts = await Promise.all(errors.map(e => e.getText()));
      console.log('--- VET REGISTRATION FAILED ---');
      console.log('Field errors:', errorTexts);
      
      const toast = await driver.findElements(By.className('register-toast'));
      if (toast.length > 0) {
        console.log('Toast Message:', await toast[0].getText());
      }
      throw err;
    }
  });

  it('Passo 3: Deve realizar um agendamento para o pet recém-criado', async function () {
    const sidebar = new SidebarPage(driver);
    await sidebar.navigateTo('agenda');
    
    const agendarBtn = await driver.wait(until.elementLocated(By.css('.btn-agendar-header')), 10000);
    await driver.wait(until.elementIsVisible(agendarBtn), 8000);
    await driver.executeScript('arguments[0].click();', agendarBtn);

    await driver.wait(until.elementLocated(By.css('.schedule-modal-content')), 8000);

    await selectCustomOption(driver, 'Tutor', tutorName);
    await selectCustomOption(driver, 'Paciente', petName);

    await selectCustomOption(driver, 'Início', '14:00');
    await selectCustomOption(driver, 'Fim', '14:30');
    await selectCustomOption(driver, 'Tipo de atendimento', 'Consulta');

    const submitBtn = await driver.wait(until.elementLocated(By.css('.modal-footer .btn-submit')), 8000);
    await submitBtn.click();

    const apptCardXPath = `//div[contains(@class, "agenda-card") and .//span[contains(@class, "pet-name") and contains(text(), "${petName}")]]`;
    const apptCard = await driver.wait(until.elementLocated(By.xpath(apptCardXPath)), 10000);
    void expect(await apptCard.isDisplayed()).to.be.true;
  });

  it('Passo 4: Deve cancelar o agendamento recém-criado com justificativa', async function () {
    const apptCardXPath = `//div[contains(@class, "agenda-card") and .//span[contains(@class, "pet-name") and contains(text(), "${petName}")]]`;
    const apptCard = await driver.wait(until.elementLocated(By.xpath(apptCardXPath)), 8000);
    await apptCard.click();

    await driver.wait(until.elementLocated(By.css('.agenda-confirm-modal')), 8000);
    const cancelBtn = await driver.wait(until.elementLocated(By.css('.agenda-action-cancelar')), 8000);
    await cancelBtn.click();

    const textarea = await driver.wait(until.elementLocated(By.css('textarea.agenda-form-textarea')), 8000);
    await textarea.sendKeys('Tutor informou que precisou viajar a trabalho.');

    const confirmCancelBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Confirmar Cancelamento")]')), 8000);
    await confirmCancelBtn.click();

    await driver.wait(until.stalenessOf(apptCard), 12000);
    const elements = await driver.findElements(By.xpath(apptCardXPath));
    expect(elements.length).to.equal(0);
  });

  it('Passo 5: Deve criar um novo agendamento e realizar o reagendamento', async function () {
    const sidebar = new SidebarPage(driver);
    await sidebar.navigateTo('agenda');

    const agendarBtn = await driver.wait(until.elementLocated(By.css('.btn-agendar-header')), 8000);
    await driver.executeScript('arguments[0].click();', agendarBtn);
    await driver.wait(until.elementLocated(By.css('.schedule-modal-content')), 8000);

    await selectCustomOption(driver, 'Tutor', tutorName);
    await selectCustomOption(driver, 'Paciente', petName);
    await selectCustomOption(driver, 'Início', '16:00');
    await selectCustomOption(driver, 'Fim', '16:30');
    await selectCustomOption(driver, 'Tipo de atendimento', 'Consulta');

    const submitBtn = await driver.wait(until.elementLocated(By.css('.modal-footer .btn-submit')), 8000);
    await submitBtn.click();

    const apptCardXPath = `//div[contains(@class, "agenda-card") and .//span[contains(@class, "pet-name") and contains(text(), "${petName}")]]`;
    const apptCard = await driver.wait(until.elementLocated(By.xpath(apptCardXPath)), 10000);
    await apptCard.click();

    await driver.wait(until.elementLocated(By.css('.agenda-confirm-modal')), 8000);
    const rescheduleBtn = await driver.wait(until.elementLocated(By.css('.agenda-action-reagendar')), 8000);
    await rescheduleBtn.click();

    const startSelect = await driver.wait(until.elementLocated(By.xpath('//div[label[contains(text(), "Novo Horário")]]/select')), 8000);
    await startSelect.click();
    const optionStart = await driver.wait(until.elementLocated(By.xpath('//div[label[contains(text(), "Novo Horário")]]/select/option[@value="17:00"]')), 8000);
    await optionStart.click();

    const endSelect = await driver.wait(until.elementLocated(By.xpath('//div[label[contains(text(), "Novo Fim")]]/select')), 8000);
    await endSelect.click();
    const optionEnd = await driver.wait(until.elementLocated(By.xpath('//div[label[contains(text(), "Novo Fim")]]/select/option[@value="17:30"]')), 8000);
    await optionEnd.click();

    const confirmRescheduleBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Confirmar Reagendamento")]')), 8000);
    await confirmRescheduleBtn.click();

    const timeSpanXPath = `${apptCardXPath}//span[contains(@class, "agenda-card-time")]`;
    const timeSpan = await driver.wait(until.elementLocated(By.xpath(timeSpanXPath)), 10000);
    await driver.wait(async () => {
      const text = await timeSpan.getText();
      return text.includes('17:00');
    }, 10000);
    
    const finalTimeText = await timeSpan.getText();
    expect(finalTimeText).to.include('17:00');
  });

  it('Passo 6: Deve criar um terceiro agendamento e iniciar atendimento clínico', async function () {
    const sidebar = new SidebarPage(driver);
    await sidebar.navigateTo('agenda');

    const agendarBtn = await driver.wait(until.elementLocated(By.css('.btn-agendar-header')), 8000);
    await driver.executeScript('arguments[0].click();', agendarBtn);
    await driver.wait(until.elementLocated(By.css('.schedule-modal-content')), 8000);

    await selectCustomOption(driver, 'Tutor', tutorName);
    await selectCustomOption(driver, 'Paciente', petName);
    await selectCustomOption(driver, 'Início', '08:00');
    await selectCustomOption(driver, 'Fim', '08:30');
    await selectCustomOption(driver, 'Tipo de atendimento', 'Consulta');

    const submitBtn = await driver.wait(until.elementLocated(By.css('.modal-footer .btn-submit')), 8000);
    await submitBtn.click();

    const apptCardXPath = `//div[contains(@class, "agenda-card") and .//span[contains(@class, "pet-name") and contains(text(), "${petName}")]]`;
    const apptCard = await driver.wait(until.elementLocated(By.xpath(apptCardXPath)), 10000);
    await apptCard.click();

    await driver.wait(until.elementLocated(By.css('.agenda-confirm-modal')), 8000);
    const startCareBtn = await driver.wait(until.elementLocated(By.css('.agenda-action-atender')), 8000);
    await startCareBtn.click();

    await driver.wait(until.urlContains('/atendimentos/'), 12000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/atendimentos/');

    const finalizeBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(@class, "care-top-action") and contains(text(), "Finalizar atendimento")]')), 12000);
    await finalizeBtn.click();

    const confirmFinalizeBtn = await driver.wait(until.elementLocated(By.xpath('//div[contains(@class, "care-modal-actions")]/button[contains(@class, "primary") and contains(text(), "Finalizar")]')), 8000);
    await confirmFinalizeBtn.click();

    await new Promise((resolve) => setTimeout(resolve, 1500));
  });

  it('Passo 7: Deve filtrar pacientes, acessar a ficha do paciente e navegar nas abas', async function () {
    const sidebar = new SidebarPage(driver);
    await sidebar.navigateTo('pacientes');

    const patientsList = new PatientsListPage(driver);
    await patientsList.waitForTableOrEmpty();

    const searchInput = await driver.wait(until.elementLocated(By.id('patient-search')), 8000);
    await searchInput.clear();
    await searchInput.sendKeys(petName);
    await new Promise((resolve) => setTimeout(resolve, 800));

    await patientsList.openFilters();
    
    await patientsList.selectSpeciesFilter('Cachorro');
    await patientsList.applyFilters();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const detailsBtnXPath = `//tr[td[contains(text(), "${petName}")]]//button[contains(@class, "table-action-btn")]`;
    const detailsBtn = await driver.wait(until.elementLocated(By.xpath(detailsBtnXPath)), 8000);
    await detailsBtn.click();

    const patientDetails = new PatientDetailsPage(driver);
    await patientDetails.waitForLoaded();

    let activeTab = await patientDetails.getActiveTabText();
    expect(activeTab).to.include('Dados');

    await patientDetails.switchTab('Prontuário');
    activeTab = await patientDetails.getActiveTabText();
    expect(activeTab).to.include('Prontuário');

    await patientDetails.switchTab('Exames');
    activeTab = await patientDetails.getActiveTabText();
    expect(activeTab).to.include('Exames');

    await patientDetails.switchTab('Dados');
    activeTab = await patientDetails.getActiveTabText();
    expect(activeTab).to.include('Dados');

    const accessBtn = await driver.wait(until.elementLocated(By.css('.patient-details-tutor-access-btn')), 8000);
    await accessBtn.click();

    const emailModalInput = await driver.wait(until.elementLocated(By.id('tutor-access-email')), 8000);
    const randId = Math.floor(Math.random() * 9000) + 1000;
    const tutorEmail = `tutor.${randId}@test.com`;
    await emailModalInput.sendKeys(tutorEmail);

    const generateBtn = await driver.findElement(By.css('.patient-edit-modal .confirm.save'));
    await generateBtn.click();

    const resultContainer = await driver.wait(until.elementLocated(By.css('.patient-details-access-result')), 10000);
    const strongs = await resultContainer.findElements(By.tagName('strong'));
    const tempPassword = await strongs[1].getText();

    const closeBtn = await driver.findElement(By.css('.patient-edit-modal button.ghost'));
    await closeBtn.click();

    const sharedData = getSharedData();
    sharedData.dynamicTutorCredentials = {
      email: tutorEmail,
      temporaryPassword: tempPassword,
      petName: petName,
      tutorName: tutorName
    };
  });

  it('Passo 8: Deve abrir edição, alterar observações do paciente e salvar com sucesso', async function () {
    const patientDetails = new PatientDetailsPage(driver);
    await patientDetails.clickEditar();

    await driver.wait(until.urlContains('/editar'), 8000);

    const weightInput = await driver.wait(until.elementLocated(By.id('weight')), 8000);
    await weightInput.clear();
    await weightInput.sendKeys('15');

    const emailInput = await driver.findElement(By.id('tutor-email'));
    await emailInput.clear();
    await emailInput.sendKeys('tutor.ricardo@gmail.com');

    const insuranceSelect = await driver.findElement(By.id('tutor-insurance'));
    await insuranceSelect.sendKeys('Nenhum');

    const cepInput = await driver.findElement(By.id('cep'));
    await cepInput.clear();
    await cepInput.sendKeys('70910900');
    await new Promise((resolve) => setTimeout(resolve, 800));

    const stateSelect = await driver.findElement(By.id('state'));
    await stateSelect.sendKeys('DF');

    const cityInput = await driver.findElement(By.id('city'));
    await cityInput.clear();
    await cityInput.sendKeys('Brasilia');

    const neighInput = await driver.findElement(By.id('neighborhood'));
    await neighInput.clear();
    await neighInput.sendKeys('Asa Norte');

    const streetInput = await driver.findElement(By.id('street'));
    await streetInput.clear();
    await streetInput.sendKeys('Campus Darcy Ribeiro');

    const numInput = await driver.findElement(By.id('address-number'));
    await numInput.clear();
    await numInput.sendKeys('123');

    const obsInput = await driver.findElement(By.id('observations'));
    await obsInput.clear();
    await obsInput.sendKeys('Paciente apresenta excelente recuperação pós-operatória. Retorno em 15 dias.');

    const saveBtn = await driver.findElement(By.css('.register-submit-btn.patient-edit-submit'));
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", saveBtn);
    await saveBtn.click();

    const confirmSaveBtn = await driver.wait(until.elementLocated(By.css('button.confirm.save')), 8000);
    await confirmSaveBtn.click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return !url.includes('/editar');
    }, 10000);
    await patientDetails.waitForLoaded();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    expect(bodyText).to.include('excelente recuperação pós-operatória');
  });

  it('Passo 9: Deve navegar para Histórico, testar filtros e abrir um atendimento histórico', async function () {
    const sidebar = new SidebarPage(driver);
    await sidebar.navigateTo('historico');

    const toggleFilterBtn = await driver.wait(until.elementLocated(By.css('.history-filter-toggle')), 10000);
    await toggleFilterBtn.click();

    const selectSpecies = await driver.wait(until.elementLocated(By.css('#history-filter-species')), 8000);
    await selectSpecies.sendKeys('Cachorro');

    const applyFilterBtn = await driver.wait(until.elementLocated(By.css('.history-filter-actions button.primary')), 8000);
    await applyFilterBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 800));

    await toggleFilterBtn.click();
    const clearFilterBtn = await driver.wait(until.elementLocated(By.css('.history-filter-actions button.ghost')), 8000);
    await clearFilterBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const historyActionBtn = await driver.wait(until.elementLocated(By.css('.history-action-button')), 8000);
    await historyActionBtn.click();

    await driver.wait(until.urlContains('/historico/'), 8000);
    const detailUrl = await driver.getCurrentUrl();
    expect(detailUrl).to.include('/historico/');
  });

  it('Passo 10: Deve acessar o Dashboard Gerencial e testar filtros de período, categoria e histórico', async function () {
    const sidebar = new SidebarPage(driver);
    await sidebar.navigateTo('dashboard');

    await driver.wait(until.elementLocated(By.css('.dashboard-chip')), 10000);

    const monthChip = await driver.wait(until.elementLocated(By.xpath('//button[contains(@class, "dashboard-chip") and contains(text(), "Mes")]')), 8000);
    await monthChip.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    const categoriesChip = await driver.wait(until.elementLocated(By.xpath('//button[contains(@class, "dashboard-chip") and contains(text(), "Categorias")]')), 8000);
    await categoriesChip.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    const weekChip = await driver.wait(until.elementLocated(By.xpath('//button[contains(@class, "dashboard-chip") and contains(text(), "Semana")]')), 8000);
    await weekChip.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    const historySelect = await driver.wait(until.elementLocated(By.xpath('//label[contains(text(), "Historico")]/select')), 8000);
    await driver.executeScript(`
      const select = arguments[0];
      select.value = "30";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    `, historySelect);
    
    const subtitle = await driver.wait(until.elementLocated(By.xpath('//p[contains(., "30 dias")]')), 8000);
    void expect(await subtitle.isDisplayed()).to.be.true;
  });
});
