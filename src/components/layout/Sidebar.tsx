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

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Even if API call fails, clear local state
    } finally {
      logout()
      navigate('/login')
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">iougurt</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
            end={item.to === '/'}
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              initials
            )}
          </div>
          <span className="sidebar-username">{user?.name}</span>
        </div>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut />
          Sair
        </button>
      </div>
    </aside>
  )
}
