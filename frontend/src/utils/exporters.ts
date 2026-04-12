import type { TaskRead } from '../types'

export function exportTasksToCSV(tasks: TaskRead[]): void {
  const headers = [
    'ID', 'Title', 'Description', 'Category', 'Priority', 'Status',
    'Estimated Minutes', 'Deadline', 'Energy Required', 'Created At',
  ]

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

  const escape = (val: string | number) => {
    const str = String(val)
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `focusly-tasks-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
