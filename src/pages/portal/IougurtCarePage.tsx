import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bell,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Heart,
  PawPrint,
  ShieldCheck,
  Syringe,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { portalService } from '../../lib/portalService'
import { useAuthStore } from '../../stores/authStore'
import type {
  TutorAlert,
  TutorDashboard,
  TutorPortalPatientHistory,
  Vaccination,
  Appointment,
} from '../../types'
import '../../styles/iougurt-care.css'

/* ── Helpers ──────────────────────────────────── */

function formatDate(value?: string | null) {
  if (!value) return 'Não informado'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Não informado'
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

function getUrgencyLevel(days: number | null): 'critical' | 'warning' | 'info' | 'ok' {
  if (days === null) return 'info'
  if (days < 0) return 'critical'
  if (days <= 7) return 'warning'
  if (days <= 30) return 'info'
  return 'ok'
}

function getUrgencyLabel(days: number | null): string {
  if (days === null) return ''
  if (days < 0) return `Atrasado ${Math.abs(days)} dia(s)`
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Amanhã'
  return `Em ${days} dias`
}

function parseMetaMessage(message: string): string {
  if (!message) return ''
  if (message.startsWith('__IOUGURT_META__:')) {
    try {
      const jsonStr = message.replace('__IOUGURT_META__:', '').trim()
      const data = JSON.parse(jsonStr)
      const parts = []
      if (data.observations && data.observations.trim()) parts.push(data.observations.trim())
      if (data.additionalObservations && data.additionalObservations.trim()) parts.push(data.additionalObservations.trim())
      if (parts.length > 0) return parts.join(' - ')
      return ''
    } catch {
      return ''
    }
  }
  return message
}

const CATEGORY_LABELS: Record<string, string> = {
  VACCINATION: 'Vacinação',
  OBSERVATION: 'Consulta',
  EXAM: 'Exame',
  SURGICAL: 'Cirurgia',
}

/* ── Care Card Types ──────────────────────────── */

interface CareCard {
  id: string
  type: 'vaccine' | 'appointment' | 'recommendation'
  title: string
  description: string
  urgency: 'critical' | 'warning' | 'info' | 'ok'
  urgencyLabel: string
  date?: string
  icon: typeof Syringe
}

function buildCareCards(
  petId: string,
  petName: string,
  dashboard: TutorDashboard,
  alerts: TutorAlert[],
  history: TutorPortalPatientHistory | null,
): CareCard[] {
  const cards: CareCard[] = []
  const now = Date.now()

  // ── Upcoming Appointments ──
  const petAppointments = dashboard.recentAppointments
    .filter((a: Appointment) => a.patientId === petId)
    .filter((a: Appointment) => new Date(a.dateTime).getTime() >= now)
    .sort((a: Appointment, b: Appointment) =>
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )

  petAppointments.forEach((appt: Appointment, idx: number) => {
    const days = daysUntil(appt.dateTime)
    cards.push({
      id: `appt-${appt.id}`,
      type: 'appointment',
      title: CATEGORY_LABELS[appt.category] || 'Consulta',
      description: `Agendada para ${formatDate(appt.dateTime)}${appt.vet?.name ? ` com Dr(a). ${appt.vet.name}` : ''}.`,
      urgency: getUrgencyLevel(days),
      urgencyLabel: getUrgencyLabel(days),
      date: appt.dateTime,
      icon: appt.category === 'SURGICAL' ? Stethoscope : CalendarClock,
    })
  })

  // ── Vaccinations ──
  const petVaccines = dashboard.upcomingVaccinations
    .filter((v: Vaccination) => v.patientId === petId)
    .sort((a: Vaccination, b: Vaccination) =>
      new Date(a.nextDoseAt ?? '').getTime() - new Date(b.nextDoseAt ?? '').getTime()
    )

  petVaccines.forEach((vacc: Vaccination) => {
    const days = daysUntil(vacc.nextDoseAt)
    cards.push({
      id: `vacc-${vacc.id}`,
      type: 'vaccine',
      title: vacc.vaccineName,
      description: vacc.nextDoseAt
        ? `Próxima dose: ${formatDate(vacc.nextDoseAt)}`
        : 'Data da próxima dose não informada.',
      urgency: getUrgencyLevel(days),
      urgencyLabel: getUrgencyLabel(days),
      date: vacc.nextDoseAt ?? undefined,
      icon: Syringe,
    })
  })

  // Also add vaccinations from patient history
  if (history) {
    history.vaccinations
      .filter((v) => v.status === 'PENDING' || v.status === 'OVERDUE')
      .filter((v) => !petVaccines.find((pv) => pv.id === v.id))
      .forEach((vacc) => {
        const days = daysUntil(vacc.nextDoseAt)
        cards.push({
          id: `vacc-hist-${vacc.id}`,
          type: 'vaccine',
          title: vacc.vaccineName,
          description: vacc.status === 'OVERDUE'
            ? `Vacina atrasada! Última dose prevista: ${formatDate(vacc.nextDoseAt)}`
            : `Próxima dose: ${formatDate(vacc.nextDoseAt)}`,
          urgency: vacc.status === 'OVERDUE' ? 'critical' : getUrgencyLevel(days),
          urgencyLabel: vacc.status === 'OVERDUE' ? 'Atrasada' : getUrgencyLabel(days),
          date: vacc.nextDoseAt ?? undefined,
          icon: Syringe,
        })
      })
  }

  // ── Vet Recommendations (from alerts) ──
  const recommendations = alerts.filter(
    (a) => a.patientName === petName
  )

  recommendations.forEach((rec, idx) => {
    let urgency: CareCard['urgency'] = 'info'
    if (rec.type === 'overdue_vaccine') urgency = 'critical'
    else if (rec.type === 'upcoming_vaccine') urgency = 'warning'

    cards.push({
      id: `rec-${idx}-${rec.patientName}`,
      type: 'recommendation',
      title: rec.type === 'vet_recommendation'
        ? 'Recomendação Veterinária'
        : rec.type === 'overdue_vaccine'
          ? 'Vacina Atrasada'
          : 'Vacina Próxima',
      description: parseMetaMessage(rec.message) || 'Acompanhar rotina de cuidados conforme orientação veterinária.',
      urgency,
      urgencyLabel: rec.date ? getUrgencyLabel(daysUntil(rec.date)) : '',
      date: rec.date,
      icon: rec.type === 'vet_recommendation' ? Heart : Syringe,
    })
  })

  // Sort: critical first, then warning, info, ok
  const urgencyOrder = { critical: 0, warning: 1, info: 2, ok: 3 }
  cards.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

  return cards
}

/* ── Component ────────────────────────────────── */

export function IougurtCarePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState<TutorDashboard | null>(null)
  const [alerts, setAlerts] = useState<TutorAlert[]>([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [selectedHistory, setSelectedHistory] = useState<TutorPortalPatientHistory | null>(null)
  const [loadingPet, setLoadingPet] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'vaccine' | 'appointment' | 'recommendation'>('all')

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
          setSelectedPetId((c) => c || dashRes.pets[0].id)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              'Não foi possível carregar os dados. Tente novamente.',
          )
        }
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
      setLoadingPet(true)
      try {
        const res = await portalService.getPatientHistory(selectedPetId)
        if (!cancelled) setSelectedHistory(res)
      } catch {
        if (!cancelled) setSelectedHistory(null)
      } finally {
        if (!cancelled) setLoadingPet(false)
      }
    }

    void loadPet()
    return () => { cancelled = true }
  }, [selectedPetId])

  const selectedPet = useMemo(() => {
    if (!dashboard) return null
    return dashboard.pets.find((p) => p.id === selectedPetId) ?? null
  }, [dashboard, selectedPetId])

  const selectedPetIndex = useMemo(() => {
    if (!dashboard) return -1
    return dashboard.pets.findIndex((p) => p.id === selectedPetId)
  }, [dashboard, selectedPetId])

  const careCards = useMemo(() => {
    if (!dashboard || !selectedPet) return []
    return buildCareCards(
      selectedPetId,
      selectedPet.name,
      dashboard,
      alerts,
      selectedHistory,
    )
  }, [dashboard, alerts, selectedPetId, selectedPet, selectedHistory])

  const filteredCards = useMemo(() => {
    if (activeFilter === 'all') return careCards
    return careCards.filter((c) => c.type === activeFilter)
  }, [careCards, activeFilter])

  const counts = useMemo(() => ({
    all: careCards.length,
    vaccine: careCards.filter((c) => c.type === 'vaccine').length,
    appointment: careCards.filter((c) => c.type === 'appointment').length,
    recommendation: careCards.filter((c) => c.type === 'recommendation').length,
  }), [careCards])

  const criticalCount = useMemo(
    () => careCards.filter((c) => c.urgency === 'critical').length,
    [careCards],
  )

  const warningCount = useMemo(
    () => careCards.filter((c) => c.urgency === 'warning').length,
    [careCards],
  )

  function handleSwitchPet(direction: 'next' | 'prev') {
    if (!dashboard || dashboard.pets.length <= 1 || selectedPetIndex < 0) return
    const delta = direction === 'next' ? 1 : -1
    const nextIdx = (selectedPetIndex + delta + dashboard.pets.length) % dashboard.pets.length
    setSelectedPetId(dashboard.pets[nextIdx].id)
  }

  if (loading) {
    return (
      <div className="care-page">
        <div className="care-loading">
          <div className="care-loading-spinner" />
          <p>Carregando iougurt Care...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="care-page">
        <div className="care-error">
          <AlertTriangle size={32} />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!dashboard || dashboard.pets.length === 0) {
    return (
      <div className="care-page">
        <div className="care-empty-state">
          <PawPrint size={48} />
          <p>Nenhum pet vinculado à sua conta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="care-page">
      {/* Header */}
      <header className="care-header">
        <div className="care-header-left">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate('/portal')}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <div className="care-title-group">
            <div className="care-title-row">
              <div className="care-logo-badge">
                <Heart size={18} />
              </div>
              <h1>iougurt Care</h1>
            </div>
            <p className="care-subtitle">
              Acompanhe alertas, vacinas e recomendações do seu pet
            </p>
          </div>
        </div>

        {/* Pet Switcher */}
        <div className="care-pet-switcher">
          <button
            type="button"
            className="care-pet-nav"
            onClick={() => handleSwitchPet('prev')}
            disabled={dashboard.pets.length <= 1}
            aria-label="Pet anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="care-pet-pill">
            <PawPrint size={14} />
            <span>{selectedPet?.name || 'Meu pet'}</span>
            <small>{Math.max(selectedPetIndex + 1, 1)}/{dashboard.pets.length}</small>
          </div>
          <button
            type="button"
            className="care-pet-nav"
            onClick={() => handleSwitchPet('next')}
            disabled={dashboard.pets.length <= 1}
            aria-label="Próximo pet"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      {/* Summary Badges */}
      <div className="care-summary-row">
        <div className="care-summary-badge total">
          <Bell size={16} />
          <span>{careCards.length}</span>
          <small>Total</small>
        </div>
        {criticalCount > 0 && (
          <div className="care-summary-badge critical">
            <AlertTriangle size={16} />
            <span>{criticalCount}</span>
            <small>Urgente{criticalCount > 1 ? 's' : ''}</small>
          </div>
        )}
        {warningCount > 0 && (
          <div className="care-summary-badge warning">
            <Clock size={16} />
            <span>{warningCount}</span>
            <small>Atenção</small>
          </div>
        )}
        <div className="care-summary-badge ok">
          <CheckCircle2 size={16} />
          <span>{careCards.filter((c) => c.urgency === 'ok' || c.urgency === 'info').length}</span>
          <small>Em dia</small>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="care-filter-tabs">
        <button
          type="button"
          className={`care-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Todos
          <span className="care-tab-count">{counts.all}</span>
        </button>
        <button
          type="button"
          className={`care-filter-tab ${activeFilter === 'vaccine' ? 'active' : ''}`}
          onClick={() => setActiveFilter('vaccine')}
        >
          <Syringe size={14} />
          Vacinas
          <span className="care-tab-count">{counts.vaccine}</span>
        </button>
        <button
          type="button"
          className={`care-filter-tab ${activeFilter === 'appointment' ? 'active' : ''}`}
          onClick={() => setActiveFilter('appointment')}
        >
          <CalendarClock size={14} />
          Consultas
          <span className="care-tab-count">{counts.appointment}</span>
        </button>
        <button
          type="button"
          className={`care-filter-tab ${activeFilter === 'recommendation' ? 'active' : ''}`}
          onClick={() => setActiveFilter('recommendation')}
        >
          <Heart size={14} />
          Recomendações
          <span className="care-tab-count">{counts.recommendation}</span>
        </button>
      </div>

      {/* Cards Grid */}
      {loadingPet ? (
        <div className="care-loading">
          <div className="care-loading-spinner" />
          <p>Carregando alertas do pet...</p>
        </div>
      ) : filteredCards.length > 0 ? (
        <div className="care-cards-grid">
          {filteredCards.map((card, idx) => (
            <article
              key={card.id}
              className={`care-card care-card--${card.urgency} care-card--${card.type}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="care-card-header">
                <div className={`care-card-icon care-card-icon--${card.type}`}>
                  <card.icon size={18} />
                </div>
                <div className="care-card-meta">
                  <h3>{card.title}</h3>
                  <span className="care-card-type-label">
                    {card.type === 'vaccine' ? 'Vacina' :
                     card.type === 'appointment' ? 'Consulta' : 'Recomendação'}
                  </span>
                </div>
                {card.urgencyLabel && (
                  <div className={`care-card-urgency care-card-urgency--${card.urgency}`}>
                    {card.urgency === 'critical' && <AlertTriangle size={12} />}
                    {card.urgency === 'warning' && <Clock size={12} />}
                    {card.urgency === 'info' && <Info size={12} />}
                    {card.urgency === 'ok' && <CheckCircle2 size={12} />}
                    <span>{card.urgencyLabel}</span>
                  </div>
                )}
              </div>
              <p className="care-card-description">{card.description}</p>
              {card.date && (
                <div className="care-card-date">
                  <CalendarClock size={13} />
                  <span>{formatDate(card.date)}</span>
                </div>
              )}
              <div className={`care-card-accent care-card-accent--${card.urgency}`} />
            </article>
          ))}
        </div>
      ) : (
        <div className="care-empty-cards">
          <ShieldCheck size={48} />
          <h3>Tudo em dia!</h3>
          <p>
            {activeFilter === 'all'
              ? `Nenhum alerta ou recomendação pendente para ${selectedPet?.name || 'seu pet'}.`
              : `Nenhum alerta do tipo selecionado para ${selectedPet?.name || 'seu pet'}.`}
          </p>
        </div>
      )}
    </div>
  )
}
