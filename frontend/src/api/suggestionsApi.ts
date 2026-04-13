import { http } from './client'

export interface Suggestion {
  task_id: number
  title: string
  emoji: string
  reason: string
  estimated_minutes: number | null
}

export interface SuggestionsResponse {
  suggestions: Suggestion[]
}

export const fetchSuggestions = () =>
  http.get<SuggestionsResponse>('/suggestions')
