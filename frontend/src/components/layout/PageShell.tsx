import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface Props {
  children: ReactNode
}

export default function PageShell({ children }: Props) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-main">
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}
