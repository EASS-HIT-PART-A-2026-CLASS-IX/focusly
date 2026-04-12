import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  children: ReactNode
}

const STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--brand-500)',
    color: '#fff',
    border: '1px solid transparent',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--surface-border)',
  },
  danger: {
    background: 'var(--pri-high-bg)',
    color: 'var(--pri-high-text)',
    border: '1px solid #fca5a5',
  },
}

const SIZE: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 'var(--text-sm)' },
  md: { padding: '9px 18px', fontSize: 'var(--text-base)' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}: Props) {
  return (
    <button
      style={{
        ...STYLES[variant],
        ...SIZE[size],
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.6 : 1,
        transition: 'background var(--transition-fast), opacity var(--transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
