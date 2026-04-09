import { useState, useEffect, useSyncExternalStore } from 'react'
import { ScheduleModal } from '../../components/scheduling/ScheduleModal'
import { useAgendaStore } from '../../stores/useAgendaStore'
import type { Appointment } from '../../types'
import '../../styles/agenda.css'

const START_HOUR = 7
const END_HOUR = 18
const ROW_DESKTOP = 140
const ROW_MOBILE = 80

const mq = window.matchMedia('(max-width: 768px)')
function subscribeMQ(cb: () => void) {
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
function useIsMobile() {
  return useSyncExternalStore(subscribeMQ, () => mq.matches)
}

const HOURS_GRID = Array.from(
  { length: (END_HOUR - START_HOUR) * 2 },
  (_, i) => {
    const h = START_HOUR + Math.floor(i / 2)
    const m = i % 2 === 0 ? '00' : '30'
    return `${String(h).padStart(2, '0')}:${m}`
  },
)

const CATEGORY_COLORS: Record<string, string> = {
  VACCINATION: 'blue',
  OBSERVATION: 'yellow',
  EXAM: 'pink',
  SURGICAL: 'purple',
}

const CATEGORY_LABELS: Record<string, string> = {
  VACCINATION: 'Vacinação',
  OBSERVATION: 'Consulta',
  EXAM: 'Exame',
  SURGICAL: 'Cirurgia',
}

function getGridIndex(dateTime: string): number {
  const d = new Date(dateTime)
  return (d.getHours() - START_HOUR) * 2 + (d.getMinutes() >= 30 ? 1 : 0)
}

function formatTime(dateTime: string): string {
  const d = new Date(dateTime)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

function shiftDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + days)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function MobileCardList({ appointments }: { appointments: Appointment[] }) {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="agenda-mobile-empty">
        Nenhum agendamento para este dia.
      </div>
    )
  }

  return (
    <div className="agenda-mobile-list">
      {sorted.map((appt) => {
        const color = CATEGORY_COLORS[appt.category] ?? 'blue'
        return (
          <div key={appt.id} className={`agenda-mobile-card card-${color}`}>
            <div className="agenda-mobile-card-time">
              {formatTime(appt.dateTime)}
            </div>
            <div className="agenda-mobile-card-body">
              <span className="agenda-mobile-card-pet">
                {appt.patient?.name ?? 'Paciente'}
              </span>
              <span className="agenda-mobile-card-info">
                {CATEGORY_LABELS[appt.category] ?? appt.category}
                {appt.vet?.name ? ` · ${appt.vet.name}` : ''}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const isMobile = useIsMobile()
  const rowH = isMobile ? ROW_MOBILE : ROW_DESKTOP

  const { selectedDate, appointments, isLoading, setDate, fetchAppointments } =
    useAgendaStore()

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleSuccess = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  return (
    <div className="agenda-container">
      <div className="agenda-header">
        <h1>Agendamentos</h1>

        <div className="agenda-controls">
          <div className="agenda-date-picker">
            <span
              className="agenda-date-arrow"
              onClick={() => setDate(shiftDate(selectedDate, -1))}
            >
              &lt;
            </span>
            <span>{formatDateBR(selectedDate)}</span>
            <span
              className="agenda-date-arrow"
              onClick={() => setDate(shiftDate(selectedDate, 1))}
            >
              &gt;
            </span>
          </div>

          <button
            className="btn-agendar-header"
            onClick={() => setIsModalOpen(true)}
          >
            + Agendar
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
          Carregando…
        </div>
      )}

      {isMobile ? (
        <MobileCardList appointments={appointments} />
      ) : (
        <div className="agenda-schedule-container">
          {HOURS_GRID.map((hour) => (
            <div
              key={hour}
              className="agenda-grid-row"
              style={{ height: `${rowH}px` }}
            >
              <span className="agenda-time">{hour}</span>
              <div className="agenda-line"></div>
            </div>
          ))}

          <div className="agenda-events">
            {appointments.map((appt) => {
              const startIdx = getGridIndex(appt.dateTime)
              if (startIdx < 0 || startIdx >= HOURS_GRID.length) return null
              const color = CATEGORY_COLORS[appt.category] ?? 'blue'

              return (
                <div
                  key={appt.id}
                  className={`agenda-card card-${color}`}
                  style={{
                    top: `${startIdx * rowH + 4}px`,
                    height: `${rowH - 8}px`,
                  }}
                >
                  <div className="agenda-card-header">
                    {appt.patient?.photoUrl ? (
                      <img
                        src={appt.patient.photoUrl}
                        alt={appt.patient?.name}
                        className="pet-avatar"
                      />
                    ) : (
                      <div className="pet-avatar pet-avatar-placeholder">
                        {appt.patient?.name?.charAt(0) ?? '?'}
                      </div>
                    )}
                    <span className="pet-name">
                      {appt.patient?.name ?? 'Paciente'}
                    </span>
                  </div>

                  <div className="agenda-card-details">
                    <div className="detail-line">
                      <span className="detail-label">Atendimento:</span>
                      <span className="detail-value">
                        {CATEGORY_LABELS[appt.category] ?? appt.category}
                      </span>
                    </div>
                    <div className="detail-line">
                      <span className="detail-label">Veterinário:</span>
                      <span className="detail-value">
                        {appt.vet?.name ?? '—'}
                      </span>
                    </div>
                    <div className="detail-line">
                      <span className="detail-label">Espécie:</span>
                      <span className="detail-value">
                        {appt.patient?.species ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showToast && (
        <div className="custom-toast-success">
          <div className="toast-content-wrapper">
            <div className="toast-icon-circle">
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5L5 9L13 1"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span>Agendamento realizado com sucesso</span>
          </div>
          <button
            className="toast-close-btn"
            onClick={() => setShowToast(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
