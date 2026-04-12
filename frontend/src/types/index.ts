// Enums — mirror the backend models exactly
export type Category = 'study' | 'work' | 'leisure' | 'personal'
export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'in_progress' | 'done'
export type EnergyLevel = 'low' | 'medium' | 'high'
export type PeakFocusTime = 'morning' | 'afternoon' | 'evening'

// Task — mirrors TaskRead from the backend
export interface TaskRead {
  id: number
  title: string
  description: string | null
  category: Category
  priority: Priority
  status: Status
  estimated_minutes: number | null
  deadline: string | null   // "YYYY-MM-DD"
  energy_required: EnergyLevel
  created_at: string        // ISO datetime
  updated_at: string
}

// For POST /tasks
export interface TaskCreate {
  title: string
  description?: string
  category: Category
  priority: Priority
  status: Status
  estimated_minutes?: number
  deadline?: string
  energy_required: EnergyLevel
}

// For PUT /tasks/{id} — all fields optional
export interface TaskUpdate {
  title?: string
  description?: string
  category?: Category
  priority?: Priority
  status?: Status
  estimated_minutes?: number
  deadline?: string
  energy_required?: EnergyLevel
}

// Filter state for the task list
export interface TaskFilters {
  status?: Status
  category?: Category
  priority?: Priority
}

// Preferences — mirrors PreferencesRead from the backend
export interface PreferencesRead {
  id: number
  display_name: string
  age: number
  work_start_hour: number
  work_end_hour: number
  preferred_study_hours_per_day: number
  preferred_break_minutes: number
  peak_focus_time: PeakFocusTime
}

// For POST /preferences
export interface PreferencesCreate {
  display_name: string
  age: number
  work_start_hour: number
  work_end_hour: number
  preferred_study_hours_per_day: number
  preferred_break_minutes: number
  peak_focus_time: PeakFocusTime
}

// For PUT /preferences/{id} — all fields optional
export interface PreferencesUpdate {
  display_name?: string
  age?: number
  work_start_hour?: number
  work_end_hour?: number
  preferred_study_hours_per_day?: number
  preferred_break_minutes?: number
  peak_focus_time?: PeakFocusTime
}
