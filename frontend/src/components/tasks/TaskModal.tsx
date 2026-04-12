import type { TaskCreate, TaskRead } from '../../types'
import TaskForm from './TaskForm'

interface Props {
  task?: TaskRead
  open: boolean
  onClose: () => void
  onSave: (data: TaskCreate) => Promise<void>
}

export default function TaskModal({ task, open, onClose, onSave }: Props) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 'var(--space-4)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          box_shadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflow: 'auto',
          padding: 'var(--space-6)',
        }}
      >
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>
          {task ? 'Edit Task' : 'New Task'}
        </h2>
        <TaskForm
          initial={task}
          onSubmit={onSave}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
