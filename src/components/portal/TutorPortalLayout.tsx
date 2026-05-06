import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Clock3, Home, LogOut, Menu, X } from 'lucide-react'
import { authService } from '../../lib/authService'
import { useAuthStore } from '../../stores/authStore'
import '../../styles/portal.css'

const navItems = [
  { to: '/portal', label: 'Home', icon: Home, end: true },
  { to: '/portal/historico', label: 'Historico', icon: Clock3, end: false },
]

export function TutorPortalLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // no-op: local logout still clears session safely
    } finally {
      logout()
      navigate('/portal/login')
    }
  }

  return (
    <div className="tutor-portal-layout">
      <button
        type="button"
        className="tutor-mobile-toggle"
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setMobileOpen((current) => !current)}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <button
        type="button"
        className={`tutor-sidebar-backdrop${mobileOpen ? ' visible' : ''}`}
        aria-label="Fechar menu lateral"
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`tutor-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="tutor-sidebar-logo">iougurt</div>

        <nav className="tutor-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `tutor-sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="tutor-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Sair
        </button>
      </aside>

      <main className="tutor-portal-main">
        <Outlet />
      </main>
    </div>
  )
}
