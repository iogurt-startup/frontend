import { WebDriver } from 'selenium-webdriver';
import { ENV } from '../config/test.config';
import { LoginPage } from '../pages/login.page';

export async function ensureLoggedIn(
  driver: WebDriver,
  email: string,
  password: string,
  targetPath: string
): Promise<void> {

  await driver.get(`${ENV.BASE_URL}${targetPath}`);
  
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const currentUrl = await driver.getCurrentUrl();
  
  if (currentUrl.includes(targetPath)) {
    return;
  }
  
  await driver.executeScript('window.localStorage.clear();');
  const loginPage = new LoginPage(driver);
  await loginPage.open();
  await loginPage.login(email, password);
  await loginPage.waitForUrlContains(targetPath);
}
