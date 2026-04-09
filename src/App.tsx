import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Landing
import { LandingPage } from './pages/LandingPage'

// Auth pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'

// Dev Pages
import { TutorDevPage } from './pages/TutorDevPage'

// Layout
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Pages
import { HomePage } from './pages/home/HomePage'
import { PatientsListPage } from './pages/patients/PatientsListPage'
import { PatientRegisterPage } from './pages/patients/PatientRegisterPage'
import { PatientDetailsPage } from './pages/patients/PatientDetailsPage'
import { AgendaPage } from './pages/agenda/AgendaPage'
import { ClinicalCarePage } from './pages/clinical/ClinicalCarePage'
import { HistoryListPage } from './pages/history/HistoryListPage'
import { HistoryDetailsPage } from './pages/history/HistoryDetailsPage'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'TUTOR' ? '/portal' : '/dashboard'} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* Auth (public) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Tutor Dev Page */}
        <Route
          path="/tutor-portal"
          element={<TutorDevPage />}
        />

        {/* Protected: OWNER + VET */}
        <Route element={<ProtectedRoute allowedRoles={['OWNER', 'VET']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="pacientes" element={<PatientsListPage />} />
            <Route path="pacientes/cadastrar" element={<PatientRegisterPage />} />
            <Route path="pacientes/:id" element={<PatientDetailsPage />} />
            <Route
              path="atendimentos/:appointmentId/pacientes/:patientId"
              element={<ClinicalCarePage />}
            />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="historico" element={<HistoryListPage />} />
            <Route path="historico/:recordId/pacientes/:patientId" element={<HistoryDetailsPage />} />
          </Route>
        </Route>

        {/* Protected: TUTOR */}
        <Route element={<ProtectedRoute allowedRoles={['TUTOR']} />}>
          <Route path="portal" element={<div>Portal do Tutor (em desenvolvimento)</div>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
