import { useState } from 'react'
import { tasksApi } from '../api/tasksApi'
import type { TaskCreate, TaskFilters, TaskRead, TaskUpdate } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<TaskRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchTasks(filters?: TaskFilters) {
    setLoading(true)
    setError(null)
    try {
      const data = await tasksApi.list(filters)
      setTasks(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function addTask(data: TaskCreate): Promise<TaskRead> {
    const created = await tasksApi.create(data)
    setTasks(prev => [created, ...prev])
    return created
  }

  async function editTask(id: number, data: TaskUpdate): Promise<TaskRead> {
    const updated = await tasksApi.update(id, data)
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
    return updated
  }

  async function removeTask(id: number): Promise<void> {
    await tasksApi.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, loading, error, fetchTasks, addTask, editTask, removeTask }
}
