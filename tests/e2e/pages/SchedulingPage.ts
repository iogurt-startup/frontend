import { By, WebDriver, until } from 'selenium-webdriver';

export class SchedulingPage {
  private driver: WebDriver;
  private openModalBtn = By.className('btn-agendar-header');
  private dateInput = By.css('input[type="date"]');
  private customSelects = By.className('custom-select-button');
  private submitBtn = By.className('btn-submit');
  private successToast = By.className('custom-toast-success');

  constructor(driver: WebDriver) { 
    this.driver = driver; 
  }

  async navigate() {
    await this.driver.get('http://localhost:5173/agenda');
    await this.driver.wait(until.elementLocated(By.tagName('h1')), 10000);
  }

  async openModal() {
    await this.driver.wait(until.elementLocated(this.openModalBtn), 5000);
    await this.driver.findElement(this.openModalBtn).click();
  }

  async selectOption(selectIndex: number, optionText: string) {
    const selects = await this.driver.wait(until.elementsLocated(this.customSelects), 10000);
    await selects[selectIndex].click();
    
    const optionLocator = By.xpath(`//div[contains(@class, 'dropdown-item') and contains(text(), '${optionText}')]`);
    const option = await this.driver.wait(until.elementLocated(optionLocator), 10000);
    await option.click();
    await this.driver.sleep(500); 
  }

  async fillDate(date: string) {
    const input = await this.driver.wait(until.elementLocated(this.dateInput), 5000);
    
    await this.driver.executeScript(`
      let input = arguments[0];
      let value = arguments[1];
      let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    `, input, date);
    
    await this.driver.sleep(500);
  }

  async submit() {
    const btn = await this.driver.wait(until.elementLocated(this.submitBtn), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
    await this.driver.sleep(500); 
    await btn.click();
  }

  async getSubmitError() {
    const errorElements = await this.driver.findElements(
      By.xpath("//span[contains(text(), 'Preencha') or contains(text(), 'Erro')]")
    );
    if (errorElements.length > 0) {
      return await errorElements[0].getText();
    }
    return null;
  }

  async isSuccessToastVisible() {
    try {
        const toast = await this.driver.wait(until.elementLocated(this.successToast), 5000);
        return await toast.isDisplayed();
    } catch {
        return false;
    }
  }
}