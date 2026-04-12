import { useNavigate } from 'react-router-dom'
import type { TaskRead } from '../../types'
import Badge from '../common/Badge'
import { formatDate } from '../../utils/formatters'

const CATEGORY_DOT: Record<string, string> = {
  study:    'var(--cat-study-border)',
  work:     'var(--cat-work-border)',
  leisure:  'var(--cat-leisure-border)',
  personal: 'var(--cat-personal-border)',
}

const STATUS_DOT: Record<string, string> = {
  todo:        '#94a3b8',
  in_progress: '#3b82f6',
  done:        '#10b981',
}

interface Props {
  tasks: TaskRead[]
}

export default function RecentTasks({ tasks }: Props) {
  const navigate = useNavigate()
  const recent = tasks.slice(0, 5)

  if (recent.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-8)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)',
        background: 'var(--surface)',
        border: '1px dashed var(--surface-border)',
        borderRadius: 'var(--radius-md)',
      }}>
        No tasks yet.{' '}
        <span
          style={{ color: '#546B41', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/tasks')}
        >
          Add your first task →
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {recent.map((task, i) => (
        <div
          key={task.id}
          className="recent-task-row"
          style={{ animationDelay: `${i * 60}ms` }}
          onClick={() => navigate('/tasks')}
        >
          {/* Category dot */}
          <div style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: CATEGORY_DOT[task.category] ?? '#94a3b8',
            flexShrink: 0,
          }} />

          {/* Title */}
          <span style={{
            flex: 1,
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {task.title}
          </span>

          {/* Status dot */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
          }}>
            <div style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: STATUS_DOT[task.status] ?? '#94a3b8',
            }} />
            {task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexShrink: 0 }}>
            <Badge type="category" value={task.category} />
            {task.deadline && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {formatDate(task.deadline)}
              </span>
            )}
          </div>
        </div>
      ))}

      <div
        style={{
          fontSize: 'var(--text-sm)',
          color: '#546B41',
          cursor: 'pointer',
          padding: 'var(--space-2) 0',
          textAlign: 'right',
          fontWeight: 500,
          transition: 'opacity var(--transition-fast)',
        }}
        onClick={() => navigate('/tasks')}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        View all tasks →
      </div>
    </div>
  )
}
