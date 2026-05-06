import { api } from './api'
import type {
  TutorAlert,
  TutorDashboard,
  TutorPortalPatientHistory,
} from '../types'

export const portalService = {
  async getDashboard(): Promise<TutorDashboard> {
    const response = await api.get<TutorDashboard>('/portal/dashboard')
    return response.data
  },

  async getAlerts(): Promise<TutorAlert[]> {
    const response = await api.get<{ alerts: TutorAlert[] }>('/portal/alerts')
    return response.data.alerts ?? []
  },

  async getPatientHistory(patientId: string): Promise<TutorPortalPatientHistory> {
    const response = await api.get<TutorPortalPatientHistory>(`/portal/patients/${patientId}/history`)
    return response.data
  },
}
