import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/sermons', label: 'Sermons' },
  { to: '/events', label: 'Events' },
  { to: '/articles', label: 'Articles' },
  { to: '/programs', label: 'Programs' },
  { to: '/leadership', label: 'Leadership' },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop${open ? ' is-open' : ''}`}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside className={`sidebar${open ? ' is-open' : ''}`}>
        <div className="sidebar-brand">
          <img
            src="/tph-symbol-white.png"
            alt=""
            className="sidebar-symbol"
            width={48}
            height={48}
          />
          <div>
            <p className="sidebar-name">The Publishers House</p>
            <p className="sidebar-eyebrow">CMS</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' is-active' : ''}`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-user" title={user?.email ?? undefined}>
            {user?.email}
          </p>
          <button type="button" className="sidebar-logout" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
