import { useEffect, useMemo, useState } from 'react'
import {
  Heart,
  CalendarClock,
  CheckCircle2,
  Bell,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../lib/errorMessage'
import { portalService } from '../../lib/portalService'
import { parseRoutineGuidance } from '../../lib/clinicalRecordContent'

import type {
  TutorAlert,
  TutorDashboard,
  TutorPortalPatientHistory,
  Vaccination,
} from '../../types'
import '../../styles/iougurt-care.css'

/* ── Helpers ────────────────────────────────────── */

function formatDate(value?: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('pt-BR')
}

function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  if (Number.isNaN(target.getTime())) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function vaccineUrgency(vaccine: Vaccination): 'overdue' | 'pending' | 'upcoming' {
  if (vaccine.status === 'OVERDUE') return 'overdue'
  const days = daysUntil(vaccine.nextDoseAt)
  if (days !== null && days < 0) return 'overdue'
  if (days !== null && days <= 14) return 'pending'
  return 'upcoming'
}

interface Recommendation {
  text: string
  vetName: string
  date: string
}

function extractRecommendations(
  history: TutorPortalPatientHistory | null,
  alerts: TutorAlert[],
  petName: string,
): Recommendation[] {
  const results: Recommendation[] = []

  if (history) {
    for (const record of history.clinicalRecords) {
      if (!record.finalized) continue
      const guidance = parseRoutineGuidance(record.routineGuidance)
      const text = guidance.additionalObservations?.trim() || guidance.observations?.trim()
      if (text) {
        results.push({
          text,
          vetName: record.vet?.name ?? 'Veterinário',
          date: formatDate(record.createdAt),
        })
      }
    }
  }

  const vetAlerts = alerts.filter(
    (a) => a.type === 'vet_recommendation' && a.patientName === petName,
  )

  for (const alert of vetAlerts) {
    if (!results.some((r) => r.text === alert.message)) {
      results.push({
        text: alert.message,
        vetName: 'Veterinário',
        date: alert.date ? formatDate(alert.date) : '—',
      })
    }
  }

  return results
}

/* ── Types ──────────────────────────────────────── */

type CareItemType = 'vaccine' | 'appointment' | 'recommendation'

interface CareItem {
  id: string
  type: CareItemType
  title: string
  subtitle: string
  description: string
  dateStr: string
  dateObj: Date
  urgencyStatus: 'ok' | 'warning' | 'danger' | 'info'
  tagLabel?: string
  icon: React.ReactNode
}

/* ── Component ──────────────────────────────────── */

export function IougurtCarePage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState<TutorDashboard | null>(null)
  const [alerts, setAlerts] = useState<TutorAlert[]>([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [selectedHistory, setSelectedHistory] = useState<TutorPortalPatientHistory | null>(null)
  const [activeTab, setActiveTab] = useState<'todos' | 'vacinas' | 'consultas' | 'recomendacoes'>('todos')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [dashRes, alertsRes] = await Promise.all([
          portalService.getDashboard(),
          portalService.getAlerts(),
        ])
        if (cancelled) return
        setDashboard(dashRes)
        setAlerts(alertsRes)
        if (dashRes.pets.length > 0) {
          setSelectedPetId(dashRes.pets[0].id)
        }
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, 'Não foi possível carregar os dados.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedPetId) return
    let cancelled = false
    async function loadPet() {
      try {
        const res = await portalService.getPatientHistory(selectedPetId)
        if (!cancelled) setSelectedHistory(res)
      } catch {
        if (!cancelled) setSelectedHistory(null)
      }
    }
    void loadPet()
    return () => { cancelled = true }
  }, [selectedPetId])

  const selectedPetName = useMemo(() => {
    if (!dashboard) return ''
    return dashboard.pets.find((p) => p.id === selectedPetId)?.name || ''
  }, [dashboard, selectedPetId])

  const petIndex = useMemo(() => {
    if (!dashboard) return -1
    return dashboard.pets.findIndex(p => p.id === selectedPetId)
  }, [dashboard, selectedPetId])

  const handlePrevPet = () => {
    if (!dashboard || petIndex <= 0) return
    setSelectedPetId(dashboard.pets[petIndex - 1].id)
  }

  const handleNextPet = () => {
    if (!dashboard || petIndex >= dashboard.pets.length - 1) return
    setSelectedPetId(dashboard.pets[petIndex + 1].id)
  }

  // Unified items
  const allItems = useMemo(() => {
    const items: CareItem[] = []
    if (!dashboard) return items

    // 1. Vaccines
    const petVaccines = dashboard.upcomingVaccinations.filter(v => v.patientId === selectedPetId)
    const historyVaccines = selectedHistory?.vaccinations ?? []
    const allVaccineIds = new Set(petVaccines.map((v) => v.id))
    for (const hv of historyVaccines) {
      if (!allVaccineIds.has(hv.id)) petVaccines.push(hv)
    }

    petVaccines.forEach(v => {
      const urgency = vaccineUrgency(v)
      let status: 'ok' | 'warning' | 'danger' = 'ok'
      let tagLabel = 'Em dia'
      if (urgency === 'overdue') { status = 'danger'; tagLabel = 'Atrasada' }
      if (urgency === 'pending') { status = 'warning'; tagLabel = 'Próxima' }

      items.push({
        id: `vac-${v.id}`,
        type: 'vaccine',
        title: v.vaccineName,
        subtitle: 'VACINA',
        description: v.nextDoseAt ? `Vencimento em ${formatDate(v.nextDoseAt)}.` : `Aplicada em ${formatDate(v.appliedAt)}`,
        dateStr: formatDate(v.nextDoseAt || v.appliedAt),
        dateObj: new Date(v.nextDoseAt || v.appliedAt || 0),
        urgencyStatus: status,
        tagLabel: tagLabel,
        icon: <CalendarClock size={20} />
      })
    })

    // 2. Appointments
    const now = Date.now()
    const upcomingApps = dashboard.recentAppointments
      .filter((a) => a.patientId === selectedPetId && new Date(a.dateTime).getTime() >= now)

    upcomingApps.forEach(a => {
      let title = 'Consulta'
      if (a.category === 'VACCINATION') title = 'Vacinação'
      if (a.category === 'EXAM') title = 'Exame'
      if (a.category === 'SURGICAL') title = 'Cirurgia'

      const days = daysUntil(a.dateTime)
      const tagLabel = days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `Em ${days} dias`
      const timeStr = new Date(a.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      items.push({
        id: `app-${a.id}`,
        type: 'appointment',
        title,
        subtitle: 'CONSULTA',
        description: `Agendada para ${formatDate(a.dateTime)} às ${timeStr}${a.vet?.name ? ` com Dr(a). ${a.vet.name}` : ''}.`,
        dateStr: formatDate(a.dateTime),
        dateObj: new Date(a.dateTime),
        urgencyStatus: 'warning',
        tagLabel,
        icon: <CalendarClock size={20} />
      })
    })

    // 3. Recommendations
    const recs = extractRecommendations(selectedHistory, alerts, selectedPetName)
    recs.forEach((r, idx) => {
      items.push({
        id: `rec-${idx}`,
        type: 'recommendation',
        title: 'Recomendação Veterinária',
        subtitle: 'RECOMENDAÇÃO',
        description: r.text,
        dateStr: r.date,
        dateObj: new Date(r.date || 0),
        urgencyStatus: 'info',
        icon: <Heart size={20} />
      })
    })

    return items.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
  }, [dashboard, selectedHistory, selectedPetId, alerts, selectedPetName])

  const filteredItems = useMemo(() => {
    if (activeTab === 'todos') return allItems
    if (activeTab === 'vacinas') return allItems.filter(i => i.type === 'vaccine')
    if (activeTab === 'consultas') return allItems.filter(i => i.type === 'appointment')
    if (activeTab === 'recomendacoes') return allItems.filter(i => i.type === 'recommendation')
    return allItems
  }, [allItems, activeTab])

  const counts = {
    todos: allItems.length,
    vacinas: allItems.filter(i => i.type === 'vaccine').length,
    consultas: allItems.filter(i => i.type === 'appointment').length,
    recomendacoes: allItems.filter(i => i.type === 'recommendation').length,
  }

  const attentionCount = allItems.filter(i => i.urgencyStatus === 'warning' || i.urgencyStatus === 'danger').length
  const okCount = allItems.filter(i => i.urgencyStatus === 'ok' || i.urgencyStatus === 'info').length

  if (loading) {
    return <div className="care-page"><div className="care-loading-spinner" /></div>
  }

  if (error || !dashboard) {
    return <div className="care-page care-error">{error || 'Erro ao carregar.'}</div>
  }

  return (
    <div className="care-page">
      {/* Top Header */}
      <div className="care-top-bar">
        <button className="care-btn-back" onClick={() => navigate('/portal')}>
          <ArrowLeft size={16} /> Voltar
        </button>
        {dashboard.pets.length > 0 && (
          <div className="care-pet-pill">
            <button onClick={handlePrevPet} disabled={petIndex <= 0}>
              <ChevronLeft size={14} />
            </button>
            <span className="pet-name">🐾 {selectedPetName} {petIndex + 1}/{dashboard.pets.length}</span>
            <button onClick={handleNextPet} disabled={petIndex >= dashboard.pets.length - 1}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Title Area */}
      <div className="care-title-area">
        <h1>
          <div className="care-title-icon-box">
            <Heart size={20} fill="currentColor" />
          </div>
          iougurt Care
        </h1>
        <p>Acompanhe alertas, vacinas e recomendações do seu pet</p>
      </div>

      {/* Summary Cards */}
      <div className="care-summary-row">
        <div className="care-summary-pill total">
          <Bell size={16} /> {counts.todos} TOTAL
        </div>
        <div className="care-summary-pill attention">
          <Clock3 size={16} /> {attentionCount} ATENÇÃO
        </div>
        <div className="care-summary-pill ok">
          <CheckCircle2 size={16} /> {okCount} EM DIA
        </div>
      </div>

      {/* Tabs */}
      <div className="care-tabs">
        <button 
          className={`care-tab ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          Todos <span className="tab-count">{counts.todos}</span>
        </button>
        <button 
          className={`care-tab ${activeTab === 'vacinas' ? 'active' : ''}`}
          onClick={() => setActiveTab('vacinas')}
        >
          💉 Vacinas <span className="tab-count">{counts.vacinas}</span>
        </button>
        <button 
          className={`care-tab ${activeTab === 'consultas' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultas')}
        >
          📅 Consultas <span className="tab-count">{counts.consultas}</span>
        </button>
        <button 
          className={`care-tab ${activeTab === 'recomendacoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('recomendacoes')}
        >
          ♡ Recomendações <span className="tab-count">{counts.recomendacoes}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="care-grid">
        {filteredItems.map(item => (
          <div key={item.id} className={`care-card status-${item.urgencyStatus} type-${item.type}`}>
            <div className="care-card-header">
              <div className="care-card-header-left">
                <div className="care-card-icon">
                  {item.icon}
                </div>
                <div className="care-card-titles">
                  <h3>{item.title}</h3>
                  <span>{item.subtitle}</span>
                </div>
              </div>
              {item.tagLabel && (
                <div className="care-card-tag">
                  {item.tagLabel === 'Hoje' && <Clock3 size={12} />}
                  {item.tagLabel}
                </div>
              )}
            </div>
            
            <div className="care-card-body">
              <p>{item.description}</p>
            </div>
            
            <div className="care-card-footer">
              <ClipboardList size={14} /> {item.dateStr}
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="care-grid-empty">
            Nenhum item encontrado nesta categoria.
          </div>
        )}
      </div>
    </div>
  )
}
