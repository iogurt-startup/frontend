import { By, WebDriver, until } from 'selenium-webdriver';

export class PatientsPage {
  private driver: WebDriver;
  
  private nameInput = By.id('pet-name');
  private birthDateInput = By.id('birth-date');
  private speciesSelect = By.id('species');
  private breedInput = By.id('breed');
  private sexRadioFem = By.xpath("//input[@name='sex' and @value='Feminino']");
  private weightInput = By.id('weight');
  
  private microchipSim = By.xpath("(//input[@name='microchip'])[1]");
  private microchipNao = By.xpath("(//input[@name='microchip'])[2]"); 
  
  private tutorNameInput = By.id('tutor-name');
  private tutorCpfInput = By.id('tutor-cpf');
  private tutorPhoneInput = By.id('tutor-phone');
  private tutorEmailInput = By.id('tutor-email');
  private tutorInsuranceSelect = By.id('tutor-insurance');
  private cepInput = By.id('cep');
  private stateSelect = By.id('state');
  private cityInput = By.id('city');
  private neighborhoodInput = By.id('neighborhood');
  private streetInput = By.id('street');
  private addressNumberInput = By.id('address-number');

  private finalizeBtn = By.css('.register-submit-btn, .patient-edit-submit');
  
  private fieldError = By.className('field-error');
  private searchInput = By.id('patient-search');
  private filterBtn = By.id('patient-filter-btn');
  private speciesFilterSelect = By.id('patients-filter-species');
  private applyFilterBtn = By.css('.patients-filter-actions .primary');
  private tableRows = By.css('#patients-table tbody tr');
  private viewDetailsBtn = By.css('.table-action-btn'); 
  private atenderBtn = By.xpath("//button[contains(., 'Atender')]");
  private confirmAtenderBtn = By.xpath("//div[contains(@class, 'patient-edit-modal-actions')]//button[contains(@class, 'save')]");
  private editDataBtn = By.xpath("//button[contains(., 'Editar dados')]");
  private tutorSearchInput = By.id('existing-tutor-search');
  private tutorSearchBtn = By.className('tutor-search-btn');
  private tutorSelect = By.id('existing-tutor-results');
  private tabProntuario = By.xpath("//button[contains(., 'Prontu')]");

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigateToRegister() {
    await this.driver.get('http://localhost:5173/pacientes/cadastrar');
    await this.driver.wait(until.urlContains('/pacientes/cadastrar'), 10000);
  }

  async navigateToList() {
    await this.driver.get('http://localhost:5173/pacientes');
    await this.driver.wait(until.elementLocated(this.searchInput), 10000);
  }

  async fillPetAndTutorData(petName: string, birth: string, species: string, breed: string, weight: string, hasMicrochip: boolean, tutorName: string, tutorCpf: string, tutorPhone: string) {
    await this.driver.wait(until.elementLocated(this.nameInput), 10000);
    
    const nameField = await this.driver.findElement(this.nameInput);
    await nameField.clear();
    await nameField.sendKeys(petName);
    
    const birthField = await this.driver.findElement(this.birthDateInput);
    await birthField.clear();
    await birthField.sendKeys(birth);
    
    await this.driver.findElement(this.speciesSelect).sendKeys(species);
    
    const breedField = await this.driver.findElement(this.breedInput);
    await breedField.clear();
    await breedField.sendKeys(breed);
    
    const sexElement = await this.driver.findElement(this.sexRadioFem);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", sexElement);
    await this.driver.sleep(300);
    await sexElement.click();
    
    const weightField = await this.driver.findElement(this.weightInput);
    await weightField.clear();
    await weightField.sendKeys(weight);

    const radioToClick = hasMicrochip ? this.microchipSim : this.microchipNao;
    const radioElement = await this.driver.wait(until.elementLocated(radioToClick), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", radioElement);
    await this.driver.sleep(300);
    await this.driver.executeScript("arguments[0].click();", radioElement);

    if (tutorName) {
      const tutorNameField = await this.driver.findElement(this.tutorNameInput);
      await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", tutorNameField);
      await tutorNameField.clear();
      await tutorNameField.sendKeys(tutorName);
      
      const tutorCpfField = await this.driver.findElement(this.tutorCpfInput);
      await tutorCpfField.clear();
      await tutorCpfField.sendKeys(tutorCpf);

      const tutorPhoneField = await this.driver.findElement(this.tutorPhoneInput);
      await tutorPhoneField.clear();
      await tutorPhoneField.sendKeys(tutorPhone);

      const tutorEmailField = await this.driver.findElement(this.tutorEmailInput);
      await tutorEmailField.clear();
      await tutorEmailField.sendKeys('tutor@email.com');

      await this.driver.findElement(this.tutorInsuranceSelect).sendKeys('Nenhum');

      const cepField = await this.driver.findElement(this.cepInput);
      await cepField.clear();
      await cepField.sendKeys('70000000');

      await this.driver.findElement(this.stateSelect).sendKeys('DF');

      const cityField = await this.driver.findElement(this.cityInput);
      await cityField.clear();
      await cityField.sendKeys('Brasilia');

      const neighborhoodField = await this.driver.findElement(this.neighborhoodInput);
      await neighborhoodField.clear();
      await neighborhoodField.sendKeys('Centro');

      const streetField = await this.driver.findElement(this.streetInput);
      await streetField.clear();
      await streetField.sendKeys('Rua 1');

      const addressNumField = await this.driver.findElement(this.addressNumberInput);
      await addressNumField.clear();
      await addressNumField.sendKeys('123');
    }
  }

  async selectExistingTutor(cpfOrName: string) {
    const radio = await this.driver.wait(until.elementLocated(By.xpath("(//input[@name='tutor-mode'])[2]")), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", radio);
    await this.driver.sleep(300);
    await this.driver.executeScript("arguments[0].click();", radio);
    
    const searchInput = await this.driver.wait(until.elementLocated(this.tutorSearchInput), 5000);
    await searchInput.clear();
    await searchInput.sendKeys(cpfOrName);
    
    await this.driver.findElement(this.tutorSearchBtn).click();
    await this.driver.sleep(1500); 
    
    const select = await this.driver.findElement(this.tutorSelect);
    await select.click();
    const options = await select.findElements(By.tagName('option'));
    if (options.length > 1) {
      await options[1].click();
    }
  }

  async submit() {
    const btn = await this.driver.wait(until.elementLocated(this.finalizeBtn), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
    await this.driver.sleep(500);
    await btn.click();
    
    try {
      const confirmModalBtn = await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'patient-edit-modal-actions')]//button[contains(@class, 'save')]")), 2000);
      await confirmModalBtn.click();
    } catch (e) {
    }
  }

  async search(query: string) {
    const input = await this.driver.wait(until.elementLocated(this.searchInput), 10000);
    await input.clear();
    await input.sendKeys(query);
    await this.driver.sleep(1000);
  }

  async filterBySpecies(species: string) {
    await this.driver.findElement(this.filterBtn).click();
    const select = await this.driver.wait(until.elementLocated(this.speciesFilterSelect), 5000);
    await select.sendKeys(species);
    await this.driver.findElement(this.applyFilterBtn).click();
    await this.driver.sleep(1000);
  }

  async getTableRows() {
    await this.driver.wait(until.elementLocated(this.tableRows), 10000);
    return await this.driver.findElements(this.tableRows);
  }

  async clickDetails() {
    const details = await this.driver.wait(until.elementLocated(this.viewDetailsBtn), 10000);
    await details.click();
    await this.driver.sleep(1000);
  }

  async clickEdit() {
    const editBtn = await this.driver.wait(until.elementLocated(this.editDataBtn), 10000);
    await editBtn.click();
    await this.driver.sleep(1000);
  }

  async clickProntuarioTab() {
    const tab = await this.driver.wait(until.elementLocated(this.tabProntuario), 5000);
    await tab.click();
  }

  async startAtendimento() {
    await this.clickDetails();
    const atender = await this.driver.wait(until.elementLocated(this.atenderBtn), 10000);
    await atender.click();
    const confirm = await this.driver.wait(until.elementLocated(this.confirmAtenderBtn), 5000);
    await confirm.click();
  }

  async getErrors() {
    await this.driver.wait(until.elementLocated(this.fieldError), 5000);
    return await this.driver.findElements(this.fieldError);
  }
}