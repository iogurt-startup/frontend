import axios, { AxiosInstance } from 'axios';
import { ENV, uniqueEmail, uniqueName, TEST_PASSWORD } from '../config/test.config';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface TestTutor {
  id: string;
  fullName: string;
  cpf: string;
  userId?: string;
  email?: string;
  password?: string;
}

export interface TestPatient {
  id: string;
  name: string;
  tutorId: string;
  species: string;
}

export interface TestAppointment {
  id: string;
}

export interface TestContext {
  users: TestUser[];
  tutors: TestTutor[];
  patients: TestPatient[];
  appointments: TestAppointment[];
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: ENV.API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: ENV.TIMEOUT,
  });
}

export function createTestContext(): TestContext {
  return {
    users: [],
    tutors: [],
    patients: [],
    appointments: [],
  };
}

export async function registerOwner(
  ctx: TestContext,
  suffix: string
): Promise<TestUser> {
  const client = createApiClient();
  const email = uniqueEmail(`owner.${suffix}`);
  const name = uniqueName(`owner.${suffix}`);
  const clinicName = `Centro Veterinário Iougurt ${suffix} ${Date.now()}`;

  await client.post('/auth/register', {
    name,
    email,
    password: TEST_PASSWORD,
    clinicName,
  });

  const loginRes = await client.post('/auth/login', {
    email,
    password: TEST_PASSWORD,
  });

  const user: TestUser = {
    id: loginRes.data.user.id,
    email,
    password: TEST_PASSWORD,
    name,
    role: loginRes.data.user.role,
    accessToken: loginRes.data.accessToken,
    refreshToken: loginRes.data.refreshToken,
  };

  ctx.users.push(user);
  return user;
}

export async function registerVet(
  ctx: TestContext,
  ownerUser: TestUser,
  suffix: string
): Promise<TestUser> {
  const client = createApiClient();
  const email = uniqueEmail(`vet.${suffix}`);
  const name = uniqueName(`Vet ${suffix}`);
  const password = TEST_PASSWORD;

  await client.post(
    '/auth/register/vet',
    { name, email, password },
    { headers: authHeaders(ownerUser.accessToken) }
  );

  const loginRes = await client.post('/auth/login', {
    email,
    password,
  });

  const user: TestUser = {
    id: loginRes.data.user.id,
    email,
    password,
    name,
    role: loginRes.data.user.role,
    accessToken: loginRes.data.accessToken,
    refreshToken: loginRes.data.refreshToken,
  };

  ctx.users.push(user);
  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> {
  const client = createApiClient();
  const res = await client.post('/auth/login', { email, password });
  return res.data;
}

export async function refreshUserToken(user: TestUser): Promise<void> {
  const client = createApiClient();
  try {
    const res = await client.post('/auth/login', {
      email: user.email,
      password: user.password,
    });
    user.accessToken = res.data.accessToken;
    user.refreshToken = res.data.refreshToken;
  } catch {
  }
}

export async function changeUserRole(
  user: TestUser,
  role: string
): Promise<void> {
  user.role = role;
}

export async function createTutor(
  ctx: TestContext,
  user: TestUser,
  suffix: string
): Promise<TestTutor> {
  const client = createApiClient();
  const cpf = generateRandomCpf();
  const fullName = uniqueName(`Tutor ${suffix}`);
  const email = uniqueEmail(`tutor.${suffix}`);

  const res = await client.post(
    '/tutors',
    { fullName, cpf, phone: '11999990000', email },
    { headers: authHeaders(user.accessToken) }
  );

  const data = res.data.tutor || res.data;

  const tutor: TestTutor = {
    id: data.id,
    fullName,
    cpf,
    email,
  };

  ctx.tutors.push(tutor);
  return tutor;
}

export async function createTutorAccount(
  ctx: TestContext,
  user: TestUser,
  tutorId: string,
  email: string
): Promise<{ userId: string; email: string; temporaryPassword: string }> {
  const client = createApiClient();
  const res = await client.post(
    `/tutors/${tutorId}/account`,
    { email },
    { headers: authHeaders(user.accessToken) }
  );

  if (res.data.userId) {
    const tutorUser: TestUser = {
      id: res.data.userId,
      email: res.data.email,
      password: res.data.temporaryPassword,
      name: 'Tutor',
      role: 'TUTOR',
      accessToken: '',
      refreshToken: '',
    };
    ctx.users.push(tutorUser);

    const tutor = ctx.tutors.find((t) => t.id === tutorId);
    if (tutor) {
      tutor.userId = res.data.userId;
      tutor.email = res.data.email;
      tutor.password = res.data.temporaryPassword;
    }
  }

  return res.data;
}

export async function createPatient(
  ctx: TestContext,
  user: TestUser,
  tutorId: string,
  suffix: string,
  species: string = 'Cachorro'
): Promise<TestPatient> {
  const client = createApiClient();
  const name = uniqueName(`pet.${suffix}`);

  const res = await client.post(
    '/patients',
    {
      name,
      tutorId,
      species,
      breed: 'Vira-lata',
      sex: 'Masculino',
      birthDate: '2023-01-15',
      weightKg: 12.5,
    },
    { headers: authHeaders(user.accessToken) }
  );

  const data = res.data.patient || res.data;

  const patient: TestPatient = {
    id: data.id,
    name,
    tutorId,
    species,
  };

  ctx.patients.push(patient);
  return patient;
}

export async function createAppointment(
  ctx: TestContext,
  user: TestUser,
  patientId: string,
  dateTime: string,
  category: string = 'OBSERVATION'
): Promise<TestAppointment> {
  const client = createApiClient();
  const end = new Date(new Date(dateTime).getTime() + 30 * 60000).toISOString();

  const res = await client.post(
    '/appointments',
    {
      patientId,
      vetId: user.id,
      dateTime,
      endDateTime: end,
      category,
    },
    { headers: authHeaders(user.accessToken) }
  );

  const data = res.data.appointment || res.data;
  const appt: TestAppointment = { id: data.id };
  ctx.appointments.push(appt);
  return appt;
}



export function generateRandomCpf(): string {
  const rand = (max: number) => Math.floor(Math.random() * max);
  const n = Array.from({ length: 9 }, () => rand(9));

  let d1 = 0;
  for (let i = 0; i < 9; i++) d1 += n[i] * (10 - i);
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;
  n.push(d1);

  let d2 = 0;
  for (let i = 0; i < 10; i++) d2 += n[i] * (11 - i);
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;
  n.push(d2);

  return n.join('');
}
