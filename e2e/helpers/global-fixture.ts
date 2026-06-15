import {
  registerOwner,
  registerVet,
  createTutor,
  createPatient,
  createTutorAccount,
  createAppointment,
  createTestContext,
  TestUser,
  TestTutor,
  TestPatient,
  TestAppointment,
  TestContext,
} from './api.helper';
import { uniqueEmail } from '../config/test.config';

export interface SharedData {
  ctx: TestContext;
  owner: TestUser;
  vet: TestUser;
  tutor: TestTutor;
  patientDog: TestPatient;
  patientCat: TestPatient;
  tutorCredentials: { userId: string; email: string; temporaryPassword: string };
  appointment: TestAppointment;
  dynamicTutorCredentials?: { email: string; temporaryPassword: string; petName: string; tutorName: string };
}

let sharedData: SharedData | null = null;
let setupDone = false;

export function getSharedData(): SharedData {
  if (!sharedData) {
    throw new Error('Fixture global não inicializado. Verifique se o root hook está configurado.');
  }
  return sharedData;
}

export async function setupGlobalFixture(): Promise<void> {
  if (setupDone) return;

  const ctx = createTestContext();

  const owner = await registerOwner(ctx, 'global');

  const vet = await registerVet(ctx, owner, 'global.vet');

  const tutor = await createTutor(ctx, owner, 'global');

  const patientDog = await createPatient(ctx, owner, tutor.id, 'global.dog', 'Cachorro');
  const patientCat = await createPatient(ctx, owner, tutor.id, 'global.cat', 'Gato');

  const tutorCredentials = await createTutorAccount(
    ctx,
    owner,
    tutor.id,
    uniqueEmail('global.tutor.account')
  );

  const appointment = await createAppointment(
    ctx,
    owner,
    patientDog.id,
    new Date().toISOString()
  );

  sharedData = {
    ctx,
    owner,
    vet,
    tutor,
    patientDog,
    patientCat,
    tutorCredentials,
    appointment,
  };

  setupDone = true;
}

import { WebDriver } from 'selenium-webdriver';
import { createDriver } from './driver.factory';

let globalDriver: WebDriver | null = null;

export async function getGlobalDriver(): Promise<WebDriver> {
  if (!globalDriver) {
    globalDriver = await createDriver();
  }
  return globalDriver;
}

export async function quitGlobalDriver(): Promise<void> {
  if (globalDriver) {
    try {
      await globalDriver.quit();
    } catch { /* ignore */ }
    globalDriver = null;
  }
}

export const mochaHooks = {
  async beforeAll() {
    await setupGlobalFixture();
  },
  async afterAll() {
    await quitGlobalDriver();
  },
};
