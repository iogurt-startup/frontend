import { NavLink, useNavigate } from 'react-router-dom'
import { Home, PawPrint, Calendar, Clock, LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../lib/authService'
import '../../styles/layout.css'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/pacientes', label: 'Pacientes', icon: PawPrint },
  { to: '/agenda', label: 'Agenda', icon: Calendar },
  { to: '/historico', label: 'Histórico', icon: Clock },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Even if API call fails, clear local state
    } finally {
      logout()
      onClose?.()
      navigate('/login')
    }
  }

  const displayName = user?.name || 'Rafael Rocha'
  const displayAvatar =
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop'

  const initials = displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop${mobileOpen ? ' visible' : ''}`}
        aria-label="Fechar menu lateral"
        onClick={onClose}
      />

      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">iougurt</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              end={item.to === '/'}
              onClick={onClose}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {displayAvatar ? <img src={displayAvatar} alt={displayName} /> : initials}
            </div>
            <span className="sidebar-username">{displayName}</span>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
