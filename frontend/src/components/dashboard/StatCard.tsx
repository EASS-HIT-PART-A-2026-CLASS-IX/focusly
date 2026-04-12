interface Props {
  label: string
  value: number | string
  accent: string
  icon: 'tasks' | 'progress' | 'completed' | 'hours'
}

const ICONS = {
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  ),
  progress: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  ),
  completed: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  hours: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  ),
}

export default function StatCard({ label, value, accent, icon }: Props) {
  return (
    <div
      className="stat-card-v2"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      {/* Icon + label row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#7a8570',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {label}
        </span>
        <div style={{
          width: 34, height: 34,
          borderRadius: 8,
          background: `${accent}18`,
          color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {ICONS[icon]}
        </div>
      </div>

      {/* Value */}
      <div style={{
        fontSize: 36,
        fontWeight: 800,
        color: '#2c3320',
        lineHeight: 1,
        letterSpacing: '-1px',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>

      {/* Bottom rule in accent color */}
      <div style={{
        marginTop: 'var(--space-4)',
        height: 2,
        borderRadius: 2,
        background: `${accent}22`,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: '60%',
          background: accent,
          borderRadius: 2,
          opacity: 0.5,
        }} />
      </div>
    </div>
  )
}
