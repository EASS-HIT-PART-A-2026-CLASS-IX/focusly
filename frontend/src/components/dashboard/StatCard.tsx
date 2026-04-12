interface Props {
  label: string
  value: number | string
  icon: string
  gradient: string
}

export default function StatCard({ label, value, icon, gradient }: Props) {
  return (
    <div className="stat-card" style={{ background: gradient }}>
      <div className="stat-deco-1" />
      <div className="stat-deco-2" />

      <div style={{
        width: 44, height: 44,
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        position: 'relative',
      }}>
        {icon}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'rgba(255,255,255,0.75)',
          marginTop: 4,
          fontWeight: 500,
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}
