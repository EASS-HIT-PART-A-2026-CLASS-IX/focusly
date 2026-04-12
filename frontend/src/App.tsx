import { Routes, Route } from 'react-router-dom'
import PageShell from './components/layout/PageShell'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import PreferencesPage from './pages/PreferencesPage'

export default function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/"            element={<DashboardPage />} />
        <Route path="/tasks"       element={<TasksPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
      </Routes>
    </PageShell>
  )
}
