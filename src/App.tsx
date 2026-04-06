import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Auth pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'

// Layout
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Pages
import { HomePage } from './pages/home/HomePage'
import { PatientsListPage } from './pages/patients/PatientsListPage'
import { PatientRegisterPage } from './pages/patients/PatientRegisterPage'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'TUTOR' ? '/portal' : '/'} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        {/* Protected: OWNER + VET */}
        <Route element={<ProtectedRoute allowedRoles={['OWNER', 'VET']} />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="pacientes" element={<PatientsListPage />} />
            <Route path="pacientes/cadastrar" element={<PatientRegisterPage />} />
            <Route path="agenda" element={<div><div className="page-header"><h1>Agenda</h1></div><p style={{ color: 'var(--color-text-secondary)' }}>Em desenvolvimento...</p></div>} />
            <Route path="historico" element={<div><div className="page-header"><h1>Histórico</h1></div><p style={{ color: 'var(--color-text-secondary)' }}>Em desenvolvimento...</p></div>} />
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
