import { useState } from 'react'
import type { TaskRead, Status } from '../../types'
import Badge from '../common/Badge'
import Button from '../common/Button'
import ConfirmDialog from '../common/ConfirmDialog'

const CATEGORY_BORDER: Record<string, string> = {
  study:    'var(--cat-study-border)',
  work:     'var(--cat-work-border)',
  leisure:  'var(--cat-leisure-border)',
  personal: 'var(--cat-personal-border)',
}

interface Props {
  task: TaskRead
  onEdit: (task: TaskRead) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: Status) => void
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div
        className="card"
        style={{
          borderLeft: `4px solid ${CATEGORY_BORDER[task.category] ?? 'var(--surface-border)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {/* Title + priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.4 }}>
            {task.title}
          </h3>
          <Badge type="priority" value={task.priority} />
        </div>

        {/* Description */}
        {task.description && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {task.description}
          </p>
        )}

        {/* Badges row */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Badge type="category" value={task.category} />
          <Badge type="status" value={task.status} />
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {task.estimated_minutes && (
            <span>⏱ {task.estimated_minutes} min</span>
          )}
          {task.deadline && (
            <span>📅 {task.deadline}</span>
          )}
          <span>⚡ {task.energy_required}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
          {task.status !== 'done' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(task.id, 'done')}
            >
              ✓ Mark done
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task"
        message={`"${task.title}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => { setConfirmOpen(false); onDelete(task.id) }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
