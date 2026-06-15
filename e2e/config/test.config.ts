import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  BASE_URL: process.env.BASE_URL,
  API_URL: process.env.API_URL,
  HEADLESS: process.env.HEADLESS !== 'false',
  TIMEOUT: 60000,
  LONG_TIMEOUT: 90000,
  SLOW_MO: Number(process.env.SLOW_MO) || 0,
};

export function uniqueEmail(prefix: string): string {
  return `e2e.${prefix}.${Date.now()}.${Math.floor(Math.random() * 9999)}@test.com`;
}

export function uniqueName(prefix: string): string {
  return `E2E ${prefix} ${Date.now()}`;
}

export const TEST_PASSWORD = 'Test@123456';
