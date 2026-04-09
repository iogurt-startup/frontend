import type { ClinicalRecord, UpdateClinicalRecordRequest } from '../types'

const ROUTINE_GUIDANCE_META_PREFIX = '__IOUGURT_META__:'

export interface CareFormValues {
  clinicalNotes: string
  breathingNotes: string
  observations: string
  examRequests: string
  diagnosis: string
  prescriptions: string
  additionalObservations: string
}

export function parseRoutineGuidance(value?: string | null) {
  if (!value) {
    return {
      observations: '',
      additionalObservations: '',
    }
  }

  if (value.startsWith(ROUTINE_GUIDANCE_META_PREFIX)) {
    try {
      const parsed = JSON.parse(value.slice(ROUTINE_GUIDANCE_META_PREFIX.length)) as {
        observations?: string
        additionalObservations?: string
      }

      return {
        observations: parsed.observations ?? '',
        additionalObservations: parsed.additionalObservations ?? '',
      }
    } catch {
      return {
        observations: '',
        additionalObservations: value,
      }
    }
  }

  return {
    observations: '',
    additionalObservations: value,
  }
}

export function serializeRoutineGuidance(values: {
  observations: string
  additionalObservations: string
}) {
  const payload = {
    observations: values.observations.trim(),
    additionalObservations: values.additionalObservations.trim(),
  }

  return `${ROUTINE_GUIDANCE_META_PREFIX}${JSON.stringify(payload)}`
}

export function getCareFormValues(record: ClinicalRecord): CareFormValues {
  const routineGuidance = parseRoutineGuidance(record.routineGuidance)

  return {
    clinicalNotes: record.clinicalNotes ?? '',
    breathingNotes: record.breathingNotes ?? '',
    observations: routineGuidance.observations,
    examRequests: record.pendingDiagnosis ?? '',
    diagnosis: record.diagnosis ?? '',
    prescriptions: record.prescriptions ?? '',
    additionalObservations: routineGuidance.additionalObservations,
  }
}

export function getClinicalRecordPayload(values: CareFormValues): UpdateClinicalRecordRequest {
  return {
    clinicalNotes: values.clinicalNotes.trim(),
    breathingNotes: values.breathingNotes.trim(),
    pendingDiagnosis: values.examRequests.trim(),
    diagnosis: values.diagnosis.trim(),
    prescriptions: values.prescriptions.trim(),
    routineGuidance: serializeRoutineGuidance({
      observations: values.observations,
      additionalObservations: values.additionalObservations,
    }),
  }
}
