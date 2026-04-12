import { http } from './client'
import type { PreferencesCreate, PreferencesRead, PreferencesUpdate } from '../types'

export const preferencesApi = {
  list:   ()                                         => http.get<PreferencesRead[]>('/preferences'),
  get:    (id: number)                               => http.get<PreferencesRead>(`/preferences/${id}`),
  create: (data: PreferencesCreate)                  => http.post<PreferencesRead>('/preferences', data),
  update: (id: number, data: PreferencesUpdate)      => http.put<PreferencesRead>(`/preferences/${id}`, data),
  delete: (id: number)                               => http.delete(`/preferences/${id}`),
}
