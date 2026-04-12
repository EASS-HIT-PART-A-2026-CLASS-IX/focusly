import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TaskRead } from '../../types'

const CATEGORY_COLOR: Record<string, string> = {
  study:    '#3b82f6',
  work:     '#22c55e',
  leisure:  '#f59e0b',
  personal: '#a855f7',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

interface Props {
  tasks: TaskRead[]
}

export default function TaskCalendar({ tasks }: Props) {
  const navigate = useNavigate()
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Map "YYYY-MM-DD" → tasks with deadline on that day
  const tasksByDate: Record<string, TaskRead[]> = {}
  for (const t of tasks) {
    if (!t.deadline) continue
    // normalize to local YYYY-MM-DD
    const key = t.deadline.slice(0, 10)
    const d   = new Date(key + 'T00:00:00')
    if (d.getFullYear() === year && d.getMonth() === month) {
      tasksByDate[key] = tasksByDate[key] ? [...tasksByDate[key], t] : [t]
    }
  }

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1))
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Build cell grid: leading blanks + day numbers
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {MONTHS[month]}
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{year}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={prevMonth}
            style={{
              width: 30, height: 30,
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-raised)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: 14,
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#eef3e8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#faf7f2')}
          >‹</button>
          <button
            onClick={nextMonth}
            style={{
              width: 30, height: 30,
              border: '1px solid #e4ddd0',
              borderRadius: 'var(--radius-sm)',
              background: '#faf7f2',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: 14,
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#eef3e8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#faf7f2')}
          >›</button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 'var(--space-2)' }}>
        {DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-disabled)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '4px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />

          const key       = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayTasks  = tasksByDate[key] ?? []
          const isToday   = key === todayKey
          const hasTasks  = dayTasks.length > 0

          return (
            <div
              key={key}
              onClick={() => hasTasks && navigate('/tasks')}
              title={hasTasks ? dayTasks.map(t => t.title).join(', ') : undefined}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 4px',
                textAlign: 'center',
                cursor: hasTasks ? 'pointer' : 'default',
                background: isToday ? '#546B41' : hasTasks ? '#eef3e8' : 'transparent',
                transition: 'background var(--transition-fast)',
                minHeight: 42,
              }}
              onMouseEnter={e => {
                if (!isToday) e.currentTarget.style.background = hasTasks ? '#eef3e8' : '#faf7f2'
              }}
              onMouseLeave={e => {
                if (!isToday) e.currentTarget.style.background = hasTasks ? '#eef3e8' : 'transparent'
              }}
            >
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: isToday ? 700 : 500,
                color: isToday ? '#fff' : 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {day}
              </span>

              {/* Task dots */}
              {dayTasks.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  marginTop: 4,
                  flexWrap: 'wrap',
                }}>
                  {dayTasks.slice(0, 3).map((t, idx) => (
                    <div key={idx} style={{
                      width: 5, height: 5,
                      borderRadius: '50%',
                      background: isToday ? 'rgba(255,255,255,0.85)' : (CATEGORY_COLOR[t.category] ?? '#94a3b8'),
                      flexShrink: 0,
                    }} />
                  ))}
                  {dayTasks.length > 3 && (
                    <span style={{ fontSize: 8, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 'var(--space-4)',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--surface-border)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}>
        {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{cat}</span>
          </div>
        ))}
      </div>

      {/* Upcoming deadlines */}
      {Object.keys(tasksByDate).length > 0 && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>Deadlines this month</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {Object.entries(tasksByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(0, 4)
              .map(([date, dateTasks]) => (
                <div key={date} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{
                    minWidth: 32,
                    textAlign: 'center',
                    background: '#546B41',
                    color: '#fff',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}>
                    {new Date(date + 'T00:00:00').getDate()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {dateTasks.slice(0, 2).map(t => (
                      <div key={t.id} style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: CATEGORY_COLOR[t.category] ?? '#94a3b8',
                          marginRight: 5,
                          verticalAlign: 'middle',
                        }} />
                        {t.title}
                      </div>
                    ))}
                    {dateTasks.length > 2 && (
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                        +{dateTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
