import { Routes, Route } from 'react-router-dom'
import PageShell from './components/layout/PageShell'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>Coming soon...</p>
    </div>
  )
}

export default function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/"            element={<DashboardPage />} />
        <Route path="/tasks"       element={<TasksPage />} />
        <Route path="/preferences" element={<Placeholder title="Preferences" />} />
      </Routes>
    </PageShell>
  )
}
