import { useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { usePreferences } from '../hooks/usePreferences'
import { useTaskCount } from '../context/TaskCountContext'
import StatCard from '../components/dashboard/StatCard'
import RecentTasks from '../components/dashboard/RecentTasks'
import TaskCalendar from '../components/dashboard/TaskCalendar'
import LoadingSpinner from '../components/common/LoadingSpinner'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function HeroBanner({ name, done, total }: { name: string; done: number; total: number }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0
  const r      = 30
  const circ   = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const subtitle =
    total === 0        ? 'No tasks yet — start adding some!'
    : pct === 100      ? 'All tasks complete! Great work 🎉'
    : `${total - done} task${total - done !== 1 ? 's' : ''} left to complete`

  return (
    <div className="hero-banner">
      <div className="hero-deco-1" />
      <div className="hero-deco-2" />

      <div>
        <p className="hero-date">{today}</p>
        <h1 className="hero-title">{getGreeting()}, {name || 'there'} 👋</h1>
        <p className="hero-subtitle">{subtitle}</p>
      </div>

      {total > 0 && (
        <div className="hero-progress">
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r={r}
              fill="none" stroke="#fff" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
            <text x="40" y="45" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">
              {pct}%
            </text>
          </svg>
          <div>
            <div style={{ color: '#fff', fontSize: 'var(--text-xl)', fontWeight: 700, lineHeight: 1.1 }}>
              {done}
              <span style={{ opacity: 0.6, fontSize: 'var(--text-sm)', fontWeight: 400 }}>/{total}</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-xs)', marginTop: 4 }}>
              Completed
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { tasks, loading, fetchTasks } = useTasks()
  const { prefs, fetchPrefs } = usePreferences()
  const { setCount } = useTaskCount()

  useEffect(() => {
    fetchTasks()
    fetchPrefs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCount(tasks.length)
  }, [tasks.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const total          = tasks.length
  const inProgress     = tasks.filter(t => t.status === 'in_progress').length
  const done           = tasks.filter(t => t.status === 'done').length
  const totalMinutes   = tasks
    .filter(t => t.status !== 'done' && t.estimated_minutes)
    .reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0)
  const estimatedHours = (totalMinutes / 60).toFixed(1)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {/* Hero — full width */}
      <HeroBanner
        name={prefs?.display_name ?? ''}
        done={done}
        total={total}
      />

      {/* 2-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}>
        {/* Left column */}
        <div>
          {/* Stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}>
            <div className="stagger-1">
              <StatCard label="Total Tasks"     value={total}          icon="📋" accent="#546B41" />
            </div>
            <div className="stagger-2">
              <StatCard label="In Progress"     value={inProgress}     icon="⚡" accent="#99AD7A" />
            </div>
            <div className="stagger-3">
              <StatCard label="Completed"       value={done}           icon="✅" accent="#3d5130" />
            </div>
            <div className="stagger-4">
              <StatCard label="Hours Remaining" value={estimatedHours} icon="⏱" accent="#DCCCAC" />
            </div>
          </div>

          {/* Recent tasks */}
          <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>Recent Tasks</p>
          <RecentTasks tasks={tasks} />
        </div>

        {/* Right column — calendar */}
        <div className="stagger-2">
          <TaskCalendar tasks={tasks} />
        </div>
      </div>
    </div>
  )
}
