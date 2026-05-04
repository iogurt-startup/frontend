import { By, WebDriver, until } from 'selenium-webdriver';

export class ClinicalPage {
  private driver: WebDriver;
  private notesArea = By.id('clinical-notes');
  private physicalExamArea = By.id('physical-exam');
  private diagnosisArea = By.id('care-diagnosis');
  private backBtn = By.className('care-back-button');
  private exitModal = By.className('care-modal');
  private finalizeBtn = By.xpath("//button[contains(., 'Finalizar atendimento')]");
  private confirmFinalizeBtn = By.xpath("//div[contains(@class, 'care-modal-actions')]//button[contains(@class, 'primary')]");
  private successToast = By.className('care-toast');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async typeNotes(text: string) {
    const area = await this.driver.wait(until.elementLocated(this.notesArea), 10000);
    await area.sendKeys(text);
  }

  async fillClinicalData(notes: string, exam: string, diagnosis: string) {
    const notesEl = await this.driver.wait(until.elementLocated(this.notesArea), 10000);
    await notesEl.sendKeys(notes);
    await this.driver.findElement(this.physicalExamArea).sendKeys(exam);
    await this.driver.findElement(this.diagnosisArea).sendKeys(diagnosis);
  }

  async clickBack() {
    await this.driver.findElement(this.backBtn).click();
  }

  async isExitModalVisible() {
    const modal = await this.driver.wait(until.elementLocated(this.exitModal), 5000);
    return await modal.isDisplayed();
  }

  async finalizeCare() {
    const btn = await this.driver.wait(until.elementLocated(this.finalizeBtn), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
    await this.driver.sleep(500);
    await btn.click();
    const confirmBtn = await this.driver.wait(until.elementLocated(this.confirmFinalizeBtn), 5000);
    await confirmBtn.click();
  }

  async isSuccessToastVisible() {
    const toast = await this.driver.wait(until.elementLocated(this.successToast), 10000);
    return await toast.isDisplayed();
  }
}