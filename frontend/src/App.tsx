import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { TaskCountProvider } from './context/TaskCountContext'
import PageShell from './components/layout/PageShell'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import PreferencesPage from './pages/PreferencesPage'

export default function App() {
  return (
    <ToastProvider>
      <TaskCountProvider>
        <PageShell>
          <Routes>
            <Route path="/"            element={<DashboardPage />} />
            <Route path="/tasks"       element={<TasksPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Routes>
        </PageShell>
      </TaskCountProvider>
    </ToastProvider>
  )
}
