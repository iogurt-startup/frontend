import { api } from './api'
import type { Appointment, CreateAppointmentRequest } from '../types'

export const AppointmentsService = {
  async listByDay(date: string): Promise<Appointment[]> {
    const response = await api.get<{ appointments: Appointment[] }>('/appointments', {
      params: { date },
    })
    return response.data.appointments
  },

  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<{ appointment: Appointment }>('/appointments', data)
    return response.data.appointment
  },

  async cancel(id: string, reason: string): Promise<Appointment> {
    const response = await api.delete<Appointment>(`/appointments/${id}`, {
      data: { reason },
    })
    return response.data
  },

  async reschedule(id: string, dateTime: string): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/appointments/${id}/reschedule`, {
      dateTime,
    })
    return response.data
  },
}
