import { useEffect, useState } from 'react'
import { fetchSuggestions, type Suggestion } from '../../api/suggestionsApi'

function formatMinutes(min: number | null): string {
  if (!min) return ''
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function SkeletonItem() {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--surface-border)' }}>
      <div style={{ height: 14, width: '60%', background: '#e8e2d8', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 11, width: '85%', background: '#e8e2d8', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
}

export default function FocusCard() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(false)

  useEffect(() => {
    fetchSuggestions()
      .then(res => setSuggestions(res.suggestions))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginTop: 'var(--space-4)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid var(--surface-border)',
        background: 'linear-gradient(135deg, #546B41 0%, #3d5130 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>
            Today's Focus
          </span>
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, marginLeft: 24 }}>
          Powered by Gemma AI
        </p>
      </div>

      {/* Body */}
      {loading ? (
        <>
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </>
      ) : error ? (
        <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
          Suggestions unavailable — check your API key
        </div>
      ) : suggestions.length === 0 ? (
        <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
          No pending tasks — you're all caught up!
        </div>
      ) : (
        suggestions.map((s, i) => (
          <div
            key={s.task_id}
            style={{
              padding: '14px 16px',
              borderBottom: i < suggestions.length - 1 ? '1px solid var(--surface-border)' : 'none',
              background: i === 0 ? '#faf9f5' : 'transparent',
            }}
          >
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{s.emoji}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {s.title}
                </span>
              </div>
              {s.estimated_minutes && (
                <span style={{
                  flexShrink: 0,
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#546B41',
                  background: '#eef3e8',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-pill)',
                  whiteSpace: 'nowrap',
                }}>
                  ⏱ {formatMinutes(s.estimated_minutes)}
                </span>
              )}
            </div>
            {/* Reason */}
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, paddingLeft: 23 }}>
              {s.reason}
            </p>
          </div>
        ))
      )}
    </div>
  )
}
