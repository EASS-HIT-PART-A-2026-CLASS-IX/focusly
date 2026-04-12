import type { TaskRead } from '../types'

const CSV_HEADERS = [
  'ID', 'Title', 'Description', 'Category', 'Priority', 'Status',
  'Estimated Minutes', 'Deadline', 'Energy Required', 'Created At',
]

function escapeCSV(val: string | number): string {
  const str = String(val)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

export function buildCSV(tasks: TaskRead[]): string {
  const rows = tasks.map(t => [
    t.id,
    t.title,
    t.description ?? '',
    t.category,
    t.priority,
    t.status,
    t.estimated_minutes ?? '',
    t.deadline ?? '',
    t.energy_required,
    t.created_at.slice(0, 10),
  ])

  return [
    CSV_HEADERS.join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n')
}

export function exportTasksToCSV(tasks: TaskRead[]): void {
  const csv  = buildCSV(tasks)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `focusly-tasks-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
