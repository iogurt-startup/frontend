import { api } from './api'
import type { Patient } from '../types'

export const PatientsService = {
  async list(
    page = 1,
    search?: string,
    tutorId?: string,
  ): Promise<{ patients: Patient[]; total: number }> {
    const response = await api.get<{ patients: Patient[]; total: number }>('/patients', {
      params: { page, perPage: 100, search, tutorId },
    })
    return response.data
  },

  async getById(id: string): Promise<Patient> {
    const response = await api.get<{ patient: Patient }>(`/patients/${id}`)
    return response.data.patient
  },
}
