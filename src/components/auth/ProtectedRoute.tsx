import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { Role } from '../../types'

interface Props {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect each role to the appropriate base area
    if (user.role === 'TUTOR') {
      return <Navigate to="/portal" replace />
    }

    if (user.role === 'OWNER') {
      return <Navigate to="/dashboard" replace />
    }

    return <Navigate to="/home" replace />
  }

  return <Outlet />
}
