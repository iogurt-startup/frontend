import { api } from './api'
import type { CreateTutorAccountResponse, Tutor } from '../types'

export const TutorsService = {
  async list(page = 1, search?: string): Promise<{ tutors: Tutor[]; total: number }> {
    const response = await api.get<{ tutors: Tutor[]; total: number }>('/tutors', {
      params: { page, perPage: 100, search },
    })
    return response.data
  },

  async getById(id: string): Promise<Tutor> {
    const response = await api.get<{ tutor: Tutor }>(`/tutors/${id}`)
    return response.data.tutor
  },

  async createAccount(tutorId: string, email: string): Promise<CreateTutorAccountResponse> {
    const response = await api.post<CreateTutorAccountResponse>(`/tutors/${tutorId}/account`, {
      email,
    })
    return response.data
  },
}
