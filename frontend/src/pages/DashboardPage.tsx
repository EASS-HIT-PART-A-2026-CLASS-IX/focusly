import { useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { usePreferences } from '../hooks/usePreferences'
import StatCard from '../components/dashboard/StatCard'
import RecentTasks from '../components/dashboard/RecentTasks'
import LoadingSpinner from '../components/common/LoadingSpinner'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { tasks, loading, fetchTasks } = useTasks()
  const { prefs, fetchPrefs } = usePreferences()

  useEffect(() => {
    fetchTasks()
    fetchPrefs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const total       = tasks.length
  const inProgress  = tasks.filter(t => t.status === 'in_progress').length
  const done        = tasks.filter(t => t.status === 'done').length
  const totalMinutes = tasks
    .filter(t => t.status !== 'done' && t.estimated_minutes)
    .reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0)
  const estimatedHours = (totalMinutes / 60).toFixed(1)

  const greeting = prefs
    ? `${getGreeting()}, ${prefs.display_name} 👋`
    : `${getGreeting()} 👋`

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">{greeting}</h1>
        <p className="page-subtitle">Here's your productivity overview</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stat cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-8)',
            }}
          >
            <StatCard label="Total Tasks"      value={total}          icon="📋" accent="#5b6af0" />
            <StatCard label="In Progress"      value={inProgress}     icon="⚡" accent="#f59e0b" />
            <StatCard label="Completed"        value={done}           icon="✅" accent="#10b981" />
            <StatCard label="Estimated Hours"  value={estimatedHours} icon="⏱" accent="#8b5cf6" />
          </div>

          {/* Recent tasks */}
          <div>
            <p className="section-label">Recent Tasks</p>
            <RecentTasks tasks={tasks} />
          </div>
        </>
      )}
    </div>
  )
}
