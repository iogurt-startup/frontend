import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LoaderCircle, Printer, Share2 } from 'lucide-react'
import { parseRoutineGuidance } from '../../lib/clinicalRecordContent'
import { historyService } from '../../lib/historyService'
import type { ClinicalHistoryItem, Patient } from '../../types'
import '../../styles/history.css'

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function buildExportContent(patient: Patient, record: ClinicalHistoryItem) {
  const routineGuidance = parseRoutineGuidance(record.routineGuidance)

  return [
    `Atendimento - ${formatDateTime(record.appointment?.dateTime ?? record.createdAt)}`,
    '',
    `Paciente: ${patient.name}`,
    `Tutor: ${patient.tutor?.fullName ?? '—'}`,
    `Queixa principal: ${record.clinicalNotes ?? '—'}`,
    '',
    'Exame físico:',
    record.breathingNotes ?? '—',
    '',
    'Observações:',
    routineGuidance.observations || '—',
    '',
    'Pedidos de exame:',
    record.pendingDiagnosis ?? '—',
    '',
    'Diagnóstico provisório / definitivo:',
    record.diagnosis ?? '—',
    '',
    'Medicação / Prescrição:',
    record.prescriptions ?? '—',
    '',
    'Observações adicionais:',
    routineGuidance.additionalObservations || '—',
  ].join('\n')
}

function InfoBlock({ title, content }: { title: string; content?: string | null }) {
  return (
    <section className="history-detail-block">
      <h3>{title}</h3>
      <p>{content?.trim() ? content : '—'}</p>
    </section>
  )
}

export function HistoryDetailsPage() {
  const navigate = useNavigate()
  const { recordId, patientId } = useParams<{ recordId: string; patientId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [patient, setPatient] = useState<Patient | null>(null)
  const [record, setRecord] = useState<ClinicalHistoryItem | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDetails() {
      if (!recordId || !patientId) {
        setError('Parâmetros inválidos para abrir este atendimento.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const data = await historyService.getHistoryRecordDetail(patientId, recordId)

        if (!cancelled) {
          setPatient(data.patient)
          setRecord(data.record)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              err.message ||
              'Não foi possível carregar os detalhes da consulta.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDetails()

    return () => {
      cancelled = true
    }
  }, [patientId, recordId])

  const exportContent = useMemo(() => {
    if (!patient || !record) return ''
    return buildExportContent(patient, record)
  }, [patient, record])

  const routineGuidance = useMemo(
    () => (record ? parseRoutineGuidance(record.routineGuidance) : { observations: '', additionalObservations: '' }),
    [record],
  )

  if (loading) {
    return (
      <div className="history-detail-state">
        <LoaderCircle className="care-spin" />
      </div>
    )
  }

  if (error || !patient || !record) {
    return <div className="history-detail-state">{error || 'Atendimento não encontrado.'}</div>
  }

  return (
    <div className="history-detail-page">
      <div className="history-detail-topbar">
        <button className="care-back-button" type="button" onClick={() => navigate('/historico')}>
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div className="history-detail-actions">
          <button type="button" onClick={() => window.print()}>
            <Printer size={16} />
            Imprimir
          </button>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                `atendimento-${patient.name.toLowerCase().replace(/\s+/g, '-')}.txt`,
                exportContent,
              )
            }
          >
            <Share2 size={16} />
            Exportar
          </button>
        </div>
      </div>

      <div className="history-detail-content">
        <p className="history-detail-kicker">
          Atendimento - {formatDateTime(record.appointment?.dateTime ?? record.createdAt)}
        </p>

        <InfoBlock title="Queixa principal:" content={record.clinicalNotes} />
        <InfoBlock title="Exame físico:" content={record.breathingNotes} />
        <InfoBlock title="Observações:" content={routineGuidance.observations} />
        <InfoBlock title="Pedidos de exame:" content={record.pendingDiagnosis} />
        <InfoBlock title="Diagnóstico provisório / definitivo:" content={record.diagnosis} />
        <InfoBlock title="Medicação / Prescrição:" content={record.prescriptions} />
        <InfoBlock title="Observações adicionais:" content={routineGuidance.additionalObservations} />
      </div>
    </div>
  )
}
