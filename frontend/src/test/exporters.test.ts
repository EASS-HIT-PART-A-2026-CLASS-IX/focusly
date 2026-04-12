import { describe, it, expect } from 'vitest'
import { buildCSV } from '../utils/exporters'
import type { TaskRead } from '../types'

const mockTask = (overrides: Partial<TaskRead> = {}): TaskRead => ({
  id: 1,
  title: 'Study algorithms',
  description: null,
  category: 'study',
  priority: 'high',
  status: 'todo',
  estimated_minutes: 90,
  deadline: '2026-05-01',
  energy_required: 'high',
  created_at: '2026-04-12T10:00:00',
  updated_at: '2026-04-12T10:00:00',
  ...overrides,
})

describe('buildCSV', () => {
  it('starts with a header row', () => {
    const csv = buildCSV([mockTask()])
    expect(csv.startsWith('ID,Title')).toBe(true)
  })

  it('produces one data row per task', () => {
    const csv = buildCSV([mockTask({ id: 1 }), mockTask({ id: 2, title: 'Read book' })])
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('returns only a header row for an empty list', () => {
    const csv = buildCSV([])
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(1)
  })

  it('escapes values that contain commas', () => {
    const csv = buildCSV([mockTask({ title: 'Study, review, repeat' })])
    expect(csv).toContain('"Study, review, repeat"')
  })

  it('escapes values that contain double quotes', () => {
    const csv = buildCSV([mockTask({ title: 'Read "Clean Code"' })])
    expect(csv).toContain('"Read ""Clean Code"""')
  })

  it('uses empty string for null optional fields', () => {
    const csv = buildCSV([mockTask({ description: null, deadline: null, estimated_minutes: null })])
    const dataRow = csv.split('\n')[1]
    // description (col 3) and estimated_minutes (col 7) and deadline (col 8) are empty
    expect(dataRow).toContain(',,')
  })

  it('includes the task title in the data row', () => {
    const csv = buildCSV([mockTask({ title: 'Finish OS homework' })])
    expect(csv).toContain('Finish OS homework')
  })
})
