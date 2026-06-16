import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class PatientsListPage extends BasePage {
  private searchInput = By.id('patient-search');
  private filterBtn = By.id('patient-filter-btn');
  private addBtn = By.id('patient-add-btn');
  private table = By.css('.patients-table');
  private tableRows = By.css('.patients-table tbody tr');
  private paginationBtns = By.css('.pagination-btn');
  private filterSpecies = By.id('patients-filter-species');
  private emptyState = By.css('.patients-empty');
  private loading = By.css('.patients-loading');
  private pageInfo = By.css('.page-footer-info');
  private filterPopover = By.css('.patients-filter-popover');
  private applyFilterBtn = By.css('.patients-filter-actions button.primary');
  private clearFilterBtn = By.css('.patients-filter-actions button.ghost');
  private actionBtns = By.css('.table-action-btn');

  async open(): Promise<void> {
    await this.navigate('/pacientes');
  }

  async searchPatient(text: string): Promise<void> {
    await this.clearAndType(this.searchInput, text);
  }

  async openFilters(): Promise<void> {
    await this.click(this.filterBtn);
  }

  async selectSpeciesFilter(species: string): Promise<void> {
    await this.selectOption(this.filterSpecies, species);
  }

  async applyFilters(): Promise<void> {
    await this.click(this.applyFilterBtn);
  }

  async clearFilters(): Promise<void> {
    await this.click(this.clearFilterBtn);
  }

  async clickNewPatient(): Promise<void> {
    await this.click(this.addBtn);
  }

  async getPatientRows(): Promise<WebElement[]> {
    return this.findElements(this.tableRows);
  }

  async clickPatientAction(index: number): Promise<void> {
    const buttons = await this.findElements(this.actionBtns);
    if (buttons[index]) {
      await buttons[index].click();
    }
  }

  async isTableVisible(): Promise<boolean> {
    return this.isDisplayed(this.table);
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.isDisplayed(this.emptyState);
  }

  async isLoadingVisible(): Promise<boolean> {
    return this.isDisplayed(this.loading, 3000);
  }

  async getPageInfo(): Promise<string> {
    return this.getText(this.pageInfo);
  }

  async goToNextPage(): Promise<void> {
    const buttons = await this.findElements(this.paginationBtns);
    if (buttons.length >= 2) {
      await buttons[buttons.length - 1].click();
    }
  }

  async goToPreviousPage(): Promise<void> {
    const buttons = await this.findElements(this.paginationBtns);
    if (buttons.length >= 2) {
      await buttons[0].click();
    }
  }

  async isFilterPopoverVisible(): Promise<boolean> {
    return this.isDisplayed(this.filterPopover);
  }

  async waitForTableOrEmpty(): Promise<void> {
    await this.driver.wait(async () => {
      const tableVisible = await this.isDisplayed(this.table, 1000);
      const emptyVisible = await this.isDisplayed(this.emptyState, 1000);
      return tableVisible || emptyVisible;
    }, 15000);
  }
}
