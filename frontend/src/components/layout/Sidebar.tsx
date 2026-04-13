import { NavLink } from 'react-router-dom'
import { useTaskCount } from '../../context/TaskCountContext'

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
)

const TasksIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <polyline points="3 6 4 7 6 5" /><polyline points="3 12 4 13 6 11" /><polyline points="3 18 4 19 6 17" />
  </svg>
)

const PreferencesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
  </svg>
)

const NAV_ITEMS = [
  { to: '/',            end: true,  Icon: DashboardIcon,  label: 'Dashboard' },
  { to: '/tasks',       end: false, Icon: TasksIcon,      label: 'Tasks' },
  { to: '/preferences', end: false, Icon: PreferencesIcon,label: 'Preferences' },
]

export default function Sidebar() {
  const { count } = useTaskCount()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="sidebar-logo-text">Focusly</span>
      </div>

      {/* Nav label */}
      <div style={{ padding: '0 var(--space-4) var(--space-2)', marginTop: 'var(--space-2)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(168,173,196,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Menu
        </span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, end, Icon, label }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <>
                <div className={isActive ? 'sidebar-icon-wrap sidebar-icon-wrap--active' : 'sidebar-icon-wrap'}>
                  <Icon />
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Tasks' && count > 0 && (
                  <span className="sidebar-badge">{count}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: '#99AD7A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sidebar-text-hover)' }}>Focusly</div>
            <div style={{ fontSize: 10, color: 'rgba(168,173,196,0.5)' }}>v0.2</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
