import { useNavigate } from 'react-router-dom'
import type { TaskRead } from '../../types'
import Badge from '../common/Badge'
import { formatDate } from '../../utils/formatters'

interface Props {
  tasks: TaskRead[]
}

export default function RecentTasks({ tasks }: Props) {
  const navigate = useNavigate()
  const recent = tasks.slice(0, 5)

  if (recent.length === 0) {
    return (
      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', padding: 'var(--space-4) 0' }}>
        No tasks yet. <span style={{ color: 'var(--brand-500)', cursor: 'pointer' }} onClick={() => navigate('/tasks')}>Add your first task →</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {recent.map(task => (
        <div
          key={task.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          onClick={() => navigate('/tasks')}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-100)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
        >
          <span
            style={{
              flex: 1,
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.title}
          </span>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexShrink: 0 }}>
            <Badge type="category" value={task.category} />
            <Badge type="status" value={task.status} />
            {task.deadline && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {formatDate(task.deadline)}
              </span>
            )}
          </div>
        </div>
      ))}

      <div
        style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-500)', cursor: 'pointer', padding: 'var(--space-2) 0', textAlign: 'right' }}
        onClick={() => navigate('/tasks')}
      >
        View all tasks →
      </div>
    </div>
  )
}
