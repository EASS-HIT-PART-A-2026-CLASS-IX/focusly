import type { TaskFilters } from '../../types'

interface Props {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
}

const STATUSES  = [{ v: 'todo', l: 'To Do' }, { v: 'in_progress', l: 'In Progress' }, { v: 'done', l: 'Done' }]
const CATS      = [{ v: 'study', l: 'Study' }, { v: 'work', l: 'Work' }, { v: 'leisure', l: 'Leisure' }, { v: 'personal', l: 'Personal' }]
const PRIORITIES= [{ v: 'high', l: 'High' }, { v: 'medium', l: 'Medium' }, { v: 'low', l: 'Low' }]

const CATEGORY_DOT: Record<string, string> = {
  study: '#3b82f6', work: '#22c55e', leisure: '#f59e0b', personal: '#a855f7',
}
const PRIORITY_DOT: Record<string, string> = {
  high: '#ef4444', medium: '#f59e0b', low: '#10b981',
}

function Pill({
  label, active, dot, onClick,
}: { label: string; active: boolean; dot?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px',
        borderRadius: 'var(--radius-pill)',
        border: active ? `1.5px solid #546B41` : '1.5px solid #e4ddd0',
        background: active ? '#eef3e8' : '#ffffff',
        color: active ? '#546B41' : 'var(--text-secondary)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? dot : 'var(--text-disabled)', flexShrink: 0 }} />
      )}
      {label}
    </button>
  )
}

export default function FilterBar({ filters, onChange }: Props) {
  const hasFilters = filters.status || filters.category || filters.priority

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Row 1: Status */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 56 }}>Status</span>
        {STATUSES.map(s => (
          <Pill
            key={s.v}
            label={s.l}
            active={filters.status === s.v}
            onClick={() => onChange({ ...filters, status: filters.status === s.v ? undefined : s.v as TaskFilters['status'] })}
          />
        ))}
      </div>

      {/* Row 2: Category */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 56 }}>Category</span>
        {CATS.map(c => (
          <Pill
            key={c.v}
            label={c.l}
            dot={CATEGORY_DOT[c.v]}
            active={filters.category === c.v}
            onClick={() => onChange({ ...filters, category: filters.category === c.v ? undefined : c.v as TaskFilters['category'] })}
          />
        ))}
      </div>

      {/* Row 3: Priority */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 56 }}>Priority</span>
        {PRIORITIES.map(p => (
          <Pill
            key={p.v}
            label={p.l}
            dot={PRIORITY_DOT[p.v]}
            active={filters.priority === p.v}
            onClick={() => onChange({ ...filters, priority: filters.priority === p.v ? undefined : p.v as TaskFilters['priority'] })}
          />
        ))}
        {hasFilters && (
          <button
            onClick={() => onChange({})}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid #fca5a5',
              background: '#fee2e2',
              color: '#b91c1c',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'var(--space-2)',
              transition: 'all var(--transition-fast)',
            }}
          >
            × Clear
          </button>
        )}
      </div>
    </div>
  )
}
