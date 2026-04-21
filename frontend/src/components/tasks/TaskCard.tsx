import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TaskRead, Status } from '../../types'
import ConfirmDialog from '../common/ConfirmDialog'
import { formatMinutes, formatDate } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const CATEGORY_ACCENT: Record<string, string> = {
  study:    '#546B41',
  work:     '#99AD7A',
  leisure:  '#b5a080',
  personal: '#7a8c6a',
}

const CATEGORY_DOT: Record<string, string> = {
  study:    '#4a7fc1',
  work:     '#4a8c5c',
  leisure:  '#d4943a',
  personal: '#9b59b6',
}

const CATEGORY_LABEL: Record<string, string> = {
  study: 'Study', work: 'Work', leisure: 'Leisure', personal: 'Personal',
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  high:   { color: '#7a3b2e', bg: '#f5e8e4', dot: '#e05252', label: 'High' },
  medium: { color: '#8a6a2a', bg: '#f5edda', dot: '#d4943a', label: 'Medium' },
  low:    { color: '#3d5130', bg: '#eef3e8', dot: '#4a8c5c', label: 'Low' },
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  todo:        { color: '#5a6050', bg: '#f0ede6', dot: '#a0a890',  label: 'To Do' },
  in_progress: { color: '#3d5130', bg: '#e4eedd', dot: '#99AD7A',  label: 'In Progress' },
  done:        { color: '#2e4a24', bg: '#d8e8d0', dot: '#546B41',  label: 'Done' },
}

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

interface Props {
  task: TaskRead
  onEdit: (task: TaskRead) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: Status) => void
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { token } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleDeleteClick = () => {
    if (!token) {
      addToast('Sign in to delete tasks', 'error')
      navigate('/login')
      return
    }
    setConfirmOpen(true)
  }

  const accent   = CATEGORY_ACCENT[task.category]  ?? '#5b6af0'
  const priority = PRIORITY_CONFIG[task.priority]  ?? PRIORITY_CONFIG.medium
  const status   = STATUS_CONFIG[task.status]      ?? STATUS_CONFIG.todo

  return (
    <>
      <div
        className="task-card"
        style={{ borderLeft: `4px solid ${accent}` }}
      >
        {/* ── Top row: title + priority badge ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            flex: 1,
            minWidth: 0,
          }}>
            {task.title}
          </h3>
          <span style={{
            flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            background: priority.bg,
            color: priority.color,
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: priority.dot, display: 'inline-block', flexShrink: 0 }} />
            {priority.label}
          </span>
        </div>

        {/* ── Description — always rendered, min-height keeps structure consistent ── */}
        <div style={{ minHeight: 36, marginBottom: 'var(--space-3)' }}>
          {task.description ? (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {task.description}
            </p>
          ) : null}
        </div>

        {/* ── Status + category chips ── */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            background: status.bg,
            color: status.color,
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot, display: 'inline-block', flexShrink: 0 }} />
            {status.label}
          </span>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            color: accent,
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: CATEGORY_DOT[task.category] ?? accent, display: 'inline-block', flexShrink: 0 }} />
            {CATEGORY_LABEL[task.category]}
          </span>
        </div>

        {/* ── Meta row ── */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-4)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--surface-border)',
        }}>
          {task.estimated_minutes && (
            <span className="meta-chip">⏱ {formatMinutes(task.estimated_minutes)}</span>
          )}
          {task.deadline && (
            <span className="meta-chip">📅 {formatDate(task.deadline)}</span>
          )}
          <span className="meta-chip">⚡ {task.energy_required}</span>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          {task.status !== 'done' && (
            <button className="icon-btn icon-btn--success" onClick={() => onStatusChange(task.id, 'done')}>
              <CheckIcon /> Done
            </button>
          )}
          <button className="icon-btn" onClick={() => onEdit(task)}>
            <EditIcon /> Edit
          </button>
          <button className="icon-btn icon-btn--danger" onClick={handleDeleteClick}>
            <TrashIcon />
          </button>
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
