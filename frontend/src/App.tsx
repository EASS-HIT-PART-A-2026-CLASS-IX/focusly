import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { TaskCountProvider } from './context/TaskCountContext'
import { AuthProvider } from './context/AuthContext'
import PageShell from './components/layout/PageShell'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import PreferencesPage from './pages/PreferencesPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TaskCountProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={
              <PageShell>
                <Routes>
                  <Route path="/"            element={<DashboardPage />} />
                  <Route path="/tasks"       element={<TasksPage />} />
                  <Route path="/preferences" element={<PreferencesPage />} />
                </Routes>
              </PageShell>
            } />
          </Routes>
        </TaskCountProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
