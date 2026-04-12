import type { TaskFilters } from '../../types'
import Button from '../common/Button'

interface Props {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
}

export default function FilterBar({ filters, onChange }: Props) {
  const hasFilters = filters.status || filters.category || filters.priority

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      <select
        className="form-select"
        style={{ width: 'auto' }}
        value={filters.status ?? ''}
        onChange={e => onChange({ ...filters, status: e.target.value as TaskFilters['status'] || undefined })}
      >
        <option value="">All Statuses</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        className="form-select"
        style={{ width: 'auto' }}
        value={filters.category ?? ''}
        onChange={e => onChange({ ...filters, category: e.target.value as TaskFilters['category'] || undefined })}
      >
        <option value="">All Categories</option>
        <option value="study">Study</option>
        <option value="work">Work</option>
        <option value="leisure">Leisure</option>
        <option value="personal">Personal</option>
      </select>

      <select
        className="form-select"
        style={{ width: 'auto' }}
        value={filters.priority ?? ''}
        onChange={e => onChange({ ...filters, priority: e.target.value as TaskFilters['priority'] || undefined })}
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
