import { api } from './api'
import type { ExamFile } from '../types'

export const examService = {
  async listPatientExams(patientId: string): Promise<ExamFile[]> {
    const response = await api.get<{ items?: ExamFile[]; exams?: ExamFile[] }>(`/exams/patient/${patientId}`)
    // Backward/forward compatibility while backend contract stabilizes.
    return response.data.items || response.data.exams || []
  },

  async uploadExamFile(patientId: string, file: File, clinicalRecordId?: string): Promise<ExamFile> {
    const formData = new FormData()
    formData.append('patientId', patientId)
    formData.append('file', file)
    
    if (clinicalRecordId) {
      formData.append('clinicalRecordId', clinicalRecordId)
    }

    const response = await api.post<ExamFile>('/exams/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }
}
