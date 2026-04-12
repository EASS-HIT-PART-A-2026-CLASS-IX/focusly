import { http } from './client'
import type { TaskCreate, TaskFilters, TaskRead, TaskUpdate } from '../types'

export const tasksApi = {
  list: (filters: TaskFilters = {}): Promise<TaskRead[]> => {
    const params = new URLSearchParams()
    if (filters.status)   params.set('status',   filters.status)
    if (filters.category) params.set('category', filters.category)
    if (filters.priority) params.set('priority', filters.priority)
    const qs = params.toString()
    return http.get<TaskRead[]>(`/tasks${qs ? '?' + qs : ''}`)
  },

  get:    (id: number)                   => http.get<TaskRead>(`/tasks/${id}`),
  create: (data: TaskCreate)             => http.post<TaskRead>('/tasks', data),
  update: (id: number, data: TaskUpdate) => http.put<TaskRead>(`/tasks/${id}`, data),
  delete: (id: number)                   => http.delete(`/tasks/${id}`),
}
