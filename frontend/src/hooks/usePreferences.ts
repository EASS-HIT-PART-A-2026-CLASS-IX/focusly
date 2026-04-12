import { useState } from 'react'
import { preferencesApi } from '../api/preferencesApi'
import type { PreferencesCreate, PreferencesRead, PreferencesUpdate } from '../types'

export function usePreferences() {
  const [prefs, setPrefs] = useState<PreferencesRead | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchPrefs() {
    setLoading(true)
    setError(null)
    try {
      const list = await preferencesApi.list()
      setPrefs(list[0] ?? null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Create if no record exists, update if it does
  async function savePrefs(data: PreferencesCreate | PreferencesUpdate): Promise<void> {
    if (prefs) {
      const updated = await preferencesApi.update(prefs.id, data as PreferencesUpdate)
      setPrefs(updated)
    } else {
      const created = await preferencesApi.create(data as PreferencesCreate)
      setPrefs(created)
    }
  }

  return { prefs, loading, error, fetchPrefs, savePrefs }
}
