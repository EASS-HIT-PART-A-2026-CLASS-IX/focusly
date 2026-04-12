import { useState } from 'react'
import type { TaskCreate, TaskRead } from '../../types'
import Button from '../common/Button'

interface Props {
  initial?: TaskRead
  onSubmit: (data: TaskCreate) => Promise<void>
  onCancel: () => void
}

export default function TaskForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle]                     = useState(initial?.title ?? '')
  const [description, setDescription]         = useState(initial?.description ?? '')
  const [category, setCategory]               = useState(initial?.category ?? 'study')
  const [priority, setPriority]               = useState(initial?.priority ?? 'medium')
  const [status, setStatus]                   = useState(initial?.status ?? 'todo')
  const [energyRequired, setEnergyRequired]   = useState(initial?.energy_required ?? 'medium')
  const [estimatedMinutes, setEstimatedMinutes] = useState(initial?.estimated_minutes?.toString() ?? '')
  const [deadline, setDeadline]               = useState(initial?.deadline ?? '')
  const [error, setError]                     = useState('')
  const [saving, setSaving]                   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setError('')
    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status,
        energy_required: energyRequired,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        deadline: deadline || undefined,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optional details..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value as typeof category)}>
            <option value="study">Study</option>
            <option value="work">Work</option>
            <option value="leisure">Leisure</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as typeof priority)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value as typeof status)}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Energy Required</label>
          <select className="form-select" value={energyRequired} onChange={e => setEnergyRequired(e.target.value as typeof energyRequired)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Estimated Minutes</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={estimatedMinutes}
            onChange={e => setEstimatedMinutes(e.target.value)}
            placeholder="e.g. 60"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deadline</label>
          <input
            className="form-input"
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Save changes' : 'Add task'}
        </Button>
      </div>
    </form>
  )
}
