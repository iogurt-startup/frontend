import { api } from './api'
import type {
  ClinicalHistoryItem,
  ClinicalRecord,
  Patient,
  UpdateClinicalRecordRequest,
  Vaccination,
} from '../types'

export const clinicalService = {
  async startClinicalRecord(appointmentId: string): Promise<ClinicalRecord> {
    const response = await api.post<ClinicalRecord>('/clinical-records', { appointmentId })
    return response.data
  },

  async updateClinicalRecord(
    recordId: string,
    data: UpdateClinicalRecordRequest,
  ): Promise<ClinicalRecord> {
    const response = await api.put<ClinicalRecord>(`/clinical-records/${recordId}`, data)
    return response.data
  },

  async finalizeClinicalRecord(recordId: string): Promise<ClinicalRecord> {
    const response = await api.patch<ClinicalRecord>(`/clinical-records/${recordId}/finalize`)
    return response.data
  },

  async getPatient(patientId: string): Promise<Patient> {
    const response = await api.get<{ patient: Patient } | Patient>(`/patients/${patientId}`)
    return 'patient' in response.data ? response.data.patient : response.data
  },

  async getPatientHistory(patientId: string): Promise<ClinicalHistoryItem[]> {
    const response = await api.get<{ items: ClinicalHistoryItem[] }>(
      `/clinical-records/patient/${patientId}`,
    )
    return response.data.items ?? []
  },

  async getPatientVaccinations(patientId: string): Promise<Vaccination[]> {
    const response = await api.get<{ items: Vaccination[] }>(`/vaccinations/patient/${patientId}`)
    return response.data.items ?? []
  },

  async getPrescriptionPdf(recordId: string): Promise<Blob> {
    const response = await api.get(`/clinical-records/${recordId}/prescription`, {
      responseType: 'blob',
    })
    return response.data
  },
}
