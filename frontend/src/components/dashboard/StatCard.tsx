interface Props {
  label: string
  value: number | string
  icon: string
  accent: string
}

export default function StatCard({ label, value, icon, accent }: Props) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e4ddd0',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 1px 4px rgba(60,70,40,0.07)',
      transition: 'box-shadow 200ms ease, transform 200ms ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'
      ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
      ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
    }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '12px 12px 0 0' }} />

      {/* Icon */}
      <div style={{
        width: 36, height: 36,
        borderRadius: 8,
        background: `${accent}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17,
      }}>
        {icon}
      </div>

      {/* Value */}
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#2c3320', lineHeight: 1, letterSpacing: '-0.5px' }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: '#7a8070', marginTop: 5, fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  )
}
