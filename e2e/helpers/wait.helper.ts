import { WebDriver, WebElement, By, until, Condition } from 'selenium-webdriver';
import { ENV } from '../config/test.config';

export async function waitForVisible(
  driver: WebDriver,
  locator: By,
  timeout: number = ENV.TIMEOUT
): Promise<WebElement> {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

export async function waitForClickable(
  driver: WebDriver,
  locator: By,
  timeout: number = ENV.TIMEOUT
): Promise<WebElement> {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await driver.wait(until.elementIsEnabled(el), timeout);
  return el;
}

export async function waitForUrl(
  driver: WebDriver,
  urlPart: string,
  timeout: number = ENV.TIMEOUT
): Promise<boolean> {
  return driver.wait(until.urlContains(urlPart), timeout).then(() => true);
}

export async function waitForUrlToBe(
  driver: WebDriver,
  url: string,
  timeout: number = ENV.TIMEOUT
): Promise<boolean> {
  return driver.wait(until.urlIs(url), timeout).then(() => true);
}

export async function waitForElementGone(
  driver: WebDriver,
  locator: By,
  timeout: number = ENV.TIMEOUT
): Promise<void> {
  await driver.wait(async () => {
    const elements = await driver.findElements(locator);
    return elements.length === 0;
  }, timeout);
}

export async function waitForTextPresent(
  driver: WebDriver,
  locator: By,
  text: string,
  timeout: number = ENV.TIMEOUT
): Promise<boolean> {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  return driver.wait(
    new Condition(`text "${text}" to be present`, async () => {
      const actual = await el.getText();
      return actual.includes(text);
    }),
    timeout
  ).then(() => true);
}

export async function waitForAnyElement(
  driver: WebDriver,
  locators: By[],
  timeout: number = ENV.TIMEOUT
): Promise<WebElement> {
  return driver.wait(async () => {
    for (const locator of locators) {
      const elements = await driver.findElements(locator);
      if (elements.length > 0) {
        const visible = await elements[0].isDisplayed().catch(() => false);
        if (visible) return elements[0];
      }
    }
    return false as unknown as WebElement;
  }, timeout) as Promise<WebElement>;
}
