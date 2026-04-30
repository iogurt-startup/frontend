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
  },

  resolveExamFileUrl(fileUrl: string): string {
    if (!fileUrl) return ''
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl

    const baseUrl = api.defaults.baseURL || ''
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const normalizedPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
    return `${normalizedBase}${normalizedPath}`
  },

  async downloadExamFile(fileUrl: string, fileName: string): Promise<void> {
    const url = this.resolveExamFileUrl(fileUrl)
    const response = await api.get(url, { responseType: 'blob' })
    const blobUrl = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  },
}
