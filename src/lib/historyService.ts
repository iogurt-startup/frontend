import { api } from './api'
import { clinicalService } from './clinicalService'
import type {
  ClinicHistoryListItem,
  ClinicalHistoryItem,
  Patient,
} from '../types'

interface PatientsResponse {
  patients: Patient[]
  total: number
}

const PATIENTS_PER_PAGE = 100

function getRecordDate(record: ClinicalHistoryItem) {
  return record.appointment?.dateTime ?? record.updatedAt ?? record.createdAt
}

function sortByDateDesc(a: ClinicHistoryListItem, b: ClinicHistoryListItem) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

export const historyService = {
  async getAllPatients(): Promise<Patient[]> {
    let page = 1
    let total = 0
    const patients: Patient[] = []

    do {
      const response = await api.get<PatientsResponse>('/patients', {
        params: {
          page,
          perPage: PATIENTS_PER_PAGE,
        },
      })

      const batch = response.data.patients ?? []
      total = response.data.total ?? batch.length
      patients.push(...batch)
      page += 1
    } while (patients.length < total)

    return patients
  },

  async getClinicHistory(): Promise<ClinicHistoryListItem[]> {
    const patients = await this.getAllPatients()

    const historyByPatient = await Promise.all(
      patients.map(async (patient) => {
        const items = await clinicalService.getPatientHistory(patient.id)

        return items.map((record) => ({
          id: record.id,
          patientId: patient.id,
          patientName: patient.name,
          tutorName: patient.tutor?.fullName ?? '—',
          date: getRecordDate(record),
          species: patient.species,
          vetName: record.vet?.name ?? 'Não informado',
          record,
          patient,
        }))
      }),
    )

    return historyByPatient
      .flat()
      .filter((item) => item.record.finalized)
      .sort(sortByDateDesc)
  },

  async getHistoryRecordDetail(patientId: string, recordId: string): Promise<{
    patient: Patient
    record: ClinicalHistoryItem
  }> {
    const [patient, history] = await Promise.all([
      clinicalService.getPatient(patientId),
      clinicalService.getPatientHistory(patientId),
    ])

    const record = history.find((item) => item.id === recordId)

    if (!record) {
      throw new Error('Prontuário não encontrado para este paciente.')
    }

    return { patient, record }
  },
}
