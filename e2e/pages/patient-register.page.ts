import { By } from 'selenium-webdriver';
import { BasePage } from './base.page';
import { waitForVisible } from '../helpers/wait.helper';

export interface PatientFormData {
  name: string;
  birthDate?: string;
  species: string;
  breed: string;
  weight?: string;
  sex: string;
  microchip?: string;
  microchipNumber?: string;
}

export interface TutorFormData {
  name: string;
  cpf: string;
  phone?: string;
  email?: string;
}

export class PatientRegisterPage extends BasePage {
  private petName = By.id('pet-name');
  private birthDate = By.id('birth-date');
  private species = By.id('species');
  private breed = By.id('breed');
  private weight = By.id('weight');
  private microchipNumber = By.id('microchip-number');
  private tutorModeNew = By.css('input[name="tutor-mode"][value="new"]');
  private tutorName = By.id('tutor-name');
  private tutorCpf = By.id('tutor-cpf');
  private tutorPhone = By.id('tutor-phone');
  private tutorEmail = By.id('tutor-email');
  private submitBtn = By.id('finalize-registration-btn');
  private backBtn = By.css('.register-back-btn');
  private toast = By.css('.register-toast');
  private fieldErrors = By.css('.field-error');

  async open(): Promise<void> {
    await this.navigate('/pacientes/cadastrar');
  }

  async fillPatientData(data: PatientFormData): Promise<void> {
    await this.clearAndType(this.petName, data.name);

    if (data.birthDate) {
      await this.clearAndType(this.birthDate, data.birthDate);
    }

    await this.selectOption(this.species, data.species);
    await this.clearAndType(this.breed, data.breed);

    if (data.weight) {
      await this.clearAndType(this.weight, data.weight);
    }

    const sexRadio = By.css(`input[name="sex"][value="${data.sex}"]`);
    await this.click(sexRadio);

    if (data.microchip) {
      const microchipRadio = By.css(
        `input[name="microchip"][value="${data.microchip}"]`
      );
      await this.click(microchipRadio);
      if (data.microchip === 'Sim' && data.microchipNumber) {
        await this.clearAndType(this.microchipNumber, data.microchipNumber);
      }
    } else {
      const noMicrochip = By.css('input[name="microchip"][value="Não"]');
      await this.click(noMicrochip);
    }
  }

  async selectTutorModeNew(): Promise<void> {
    await this.click(this.tutorModeNew);
  }

  async fillTutorData(data: TutorFormData): Promise<void> {
    await this.clearAndType(this.tutorName, data.name);
    await this.clearAndType(this.tutorCpf, data.cpf);

    if (data.phone) {
      await this.clearAndType(this.tutorPhone, data.phone);
    }

    if (data.email) {
      await this.clearAndType(this.tutorEmail, data.email);
    }
  }

  async submit(): Promise<void> {
    const el = await waitForVisible(this.driver, this.submitBtn);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', el);
    await el.click();
  }

  async clickBack(): Promise<void> {
    await this.click(this.backBtn);
  }

  async getToastText(): Promise<string> {
    return this.getText(this.toast);
  }

  async isToastVisible(): Promise<boolean> {
    return this.isDisplayed(this.toast);
  }

  async getFieldErrors(): Promise<string[]> {
    const errors = await this.findElements(this.fieldErrors);
    return Promise.all(errors.map((e) => e.getText()));
  }

  async hasFieldErrors(): Promise<boolean> {
    const errors = await this.findElements(this.fieldErrors);
    return errors.length > 0;
  }

  async hasUnsavedChangesProtection(): Promise<boolean> {
    const result = await this.executeScript(
      'return typeof window.onbeforeunload === "function" || window.__hasBeforeUnload === true;'
    );
    return !!result;
  }
}
