import { NavLink } from 'react-router-dom'
import { useTaskCount } from '../../context/TaskCountContext'

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
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

export default function Sidebar() {
  const { count } = useTaskCount()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">F</div>
        <span className="sidebar-logo-text">Focusly</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end>
          <DashboardIcon />
          Dashboard
        </NavLink>
        <NavLink to="/tasks">
          <TasksIcon />
          Tasks
          {count > 0 && (
            <span className="sidebar-badge">{count}</span>
          )}
        </NavLink>
        <NavLink to="/preferences">
          <PreferencesIcon />
          Preferences
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Smart Daily Planner · v0.2
      </div>
    </aside>
  )
}
