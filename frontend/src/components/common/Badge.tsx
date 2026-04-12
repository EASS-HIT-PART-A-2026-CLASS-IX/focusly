import type { Category, Priority, Status } from '../../types'

type BadgeType = 'category' | 'priority' | 'status'
type BadgeValue = Category | Priority | Status

const COLOR_MAP: Record<BadgeType, Record<string, { bg: string; color: string }>> = {
  category: {
    study:    { bg: 'var(--cat-study-bg)',    color: 'var(--cat-study-text)' },
    work:     { bg: 'var(--cat-work-bg)',     color: 'var(--cat-work-text)' },
    leisure:  { bg: 'var(--cat-leisure-bg)',  color: 'var(--cat-leisure-text)' },
    personal: { bg: 'var(--cat-personal-bg)', color: 'var(--cat-personal-text)' },
  },
  priority: {
    high:   { bg: 'var(--pri-high-bg)',   color: 'var(--pri-high-text)' },
    medium: { bg: 'var(--pri-medium-bg)', color: 'var(--pri-medium-text)' },
    low:    { bg: 'var(--pri-low-bg)',    color: 'var(--pri-low-text)' },
  },
  status: {
    todo:        { bg: 'var(--sta-todo-bg)',        color: 'var(--sta-todo-text)' },
    in_progress: { bg: 'var(--sta-in_progress-bg)', color: 'var(--sta-in_progress-text)' },
    done:        { bg: 'var(--sta-done-bg)',         color: 'var(--sta-done-text)' },
  },
}

const LABEL_MAP: Record<string, string> = {
  in_progress: 'In Progress',
  todo: 'To Do',
  done: 'Done',
  study: 'Study',
  work: 'Work',
  leisure: 'Leisure',
  personal: 'Personal',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

interface Props {
  type: BadgeType
  value: BadgeValue
}

export default function Badge({ type, value }: Props) {
  const colors = COLOR_MAP[type][value] ?? { bg: '#f1f5f9', color: '#475569' }

  return (
    <span
      style={{
        background: colors.bg,
        color: colors.color,
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {LABEL_MAP[value] ?? value}
    </span>
  )
}
