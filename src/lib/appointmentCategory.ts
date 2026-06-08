import type { AppointmentCategory } from '../types'

export const APPOINTMENT_CATEGORY_LABELS: Record<AppointmentCategory, string> = {
  VACCINATION: 'Vacinação',
  OBSERVATION: 'Consulta',
  EXAM: 'Exame',
  SURGICAL: 'Cirurgia',
}

export const HOME_AGENDA_CATEGORY_COLOR_CLASS: Record<AppointmentCategory, string> = {
  VACCINATION: 'category-cyan',
  OBSERVATION: 'category-yellow',
  EXAM: 'category-pink',
  SURGICAL: 'category-cyan',
}
