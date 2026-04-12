import { useEffect, useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import { useToast } from '../context/ToastContext'
import { formatHour } from '../utils/formatters'
import type { PeakFocusTime } from '../types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Button from '../components/common/Button'

const FOCUS_OPTIONS: { value: PeakFocusTime; label: string; icon: string; desc: string }[] = [
  { value: 'morning',   label: 'Morning',   icon: '🌅', desc: '6 AM – 12 PM' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️', desc: '12 PM – 6 PM' },
  { value: 'evening',   label: 'Evening',   icon: '🌙', desc: '6 PM – midnight' },
]

// ── input helpers ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--surface-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 6,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const { prefs, loading, error, fetchPrefs, savePrefs } = usePreferences()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // form fields
  const [displayName, setDisplayName]           = useState('')
  const [age, setAge]                           = useState('')
  const [workStart, setWorkStart]               = useState('9')
  const [workEnd, setWorkEnd]                   = useState('17')
  const [studyHours, setStudyHours]             = useState('4')
  const [breakMinutes, setBreakMinutes]         = useState('15')
  const [peakFocus, setPeakFocus]               = useState<PeakFocusTime>('morning')

  useEffect(() => {
    fetchPrefs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill form when preferences load
  useEffect(() => {
    if (prefs) {
      setDisplayName(prefs.display_name)
      setAge(String(prefs.age))
      setWorkStart(String(prefs.work_start_hour))
      setWorkEnd(String(prefs.work_end_hour))
      setStudyHours(String(prefs.preferred_study_hours_per_day))
      setBreakMinutes(String(prefs.preferred_break_minutes))
      setPeakFocus(prefs.peak_focus_time)
    }
  }, [prefs])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const ageNum   = parseInt(age)
    const startNum = parseInt(workStart)
    const endNum   = parseInt(workEnd)
    const studyNum = parseInt(studyHours)
    const breakNum = parseInt(breakMinutes)

    if (!displayName.trim())           return setFormError('Display name is required.')
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120)
                                       return setFormError('Age must be between 1 and 120.')
    if (endNum <= startNum)            return setFormError('Work end hour must be after work start hour.')
    if (studyNum < 1 || studyNum > 12) return setFormError('Study hours must be between 1 and 12.')
    if (breakNum < 5 || breakNum > 60) return setFormError('Break minutes must be between 5 and 60.')

    setSaving(true)
    try {
      await savePrefs({
        display_name: displayName.trim(),
        age: ageNum,
        work_start_hour: startNum,
        work_end_hour: endNum,
        preferred_study_hours_per_day: studyNum,
        preferred_break_minutes: breakNum,
        peak_focus_time: peakFocus,
      })
      addToast('Preferences saved', 'success')
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Preferences</h1>
        <p className="page-subtitle">
          {prefs ? 'Update your profile and study settings.' : 'Set up your profile to personalise Focusly.'}
        </p>
      </div>

      {error && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── Profile ── */}
        <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-5)' }}>
          <p className="section-label" style={{ marginBottom: 'var(--space-4)' }}>Profile</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Field label="Display Name">
              <input
                style={inputStyle}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Shir"
                maxLength={80}
              />
            </Field>
            <Field label="Age">
              <input
                style={inputStyle}
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 22"
                min={1}
                max={120}
              />
            </Field>
          </div>
        </div>

        {/* ── Work Schedule ── */}
        <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-5)' }}>
          <p className="section-label" style={{ marginBottom: 'var(--space-4)' }}>Work Schedule</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-4)' }}>
            <Field label="Work Start">
              <select
                style={inputStyle}
                value={workStart}
                onChange={e => setWorkStart(e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i)}</option>
                ))}
              </select>
            </Field>
            <Field label="Work End">
              <select
                style={inputStyle}
                value={workEnd}
                onChange={e => setWorkEnd(e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i)}</option>
                ))}
              </select>
            </Field>
            <Field label="Study hrs / day">
              <input
                style={inputStyle}
                type="number"
                value={studyHours}
                onChange={e => setStudyHours(e.target.value)}
                min={1}
                max={12}
              />
            </Field>
            <Field label="Break (min)">
              <input
                style={inputStyle}
                type="number"
                value={breakMinutes}
                onChange={e => setBreakMinutes(e.target.value)}
                min={5}
                max={60}
              />
            </Field>
          </div>
        </div>

        {/* ── Peak Focus ── */}
        <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-5)' }}>
          <p className="section-label" style={{ marginBottom: 'var(--space-4)' }}>Peak Focus Time</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            {FOCUS_OPTIONS.map(opt => {
              const active = peakFocus === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPeakFocus(opt.value)}
                  style={{
                    padding: 'var(--space-4)',
                    border: `2px solid ${active ? 'var(--brand-500)' : 'var(--surface-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--brand-100)' : 'var(--surface-raised)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{opt.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: active ? 'var(--brand-500)' : 'var(--text-primary)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {opt.desc}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        {formError && (
          <div style={{ padding: 'var(--space-3) var(--space-4)', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            {formError}
          </div>
        )}

        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : prefs ? 'Save Changes' : 'Create Profile'}
        </Button>
      </form>
    </div>
  )
}
