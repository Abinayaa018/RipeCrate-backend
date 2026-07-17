import { Navigate, Route, Routes } from 'react-router-dom'
import { auth } from './services/api'
import DashboardPage from './pages/DashboardPage'
import PredictionPage from './pages/PredictionPage'
import InventoryPage from './pages/InventoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import WarehousesPage from './pages/WarehousesPage'
import AlertsPage from './pages/AlertsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import CommandPalette from './components/CommandPalette'
import CommandCenterPage from './pages/CommandCenterPage'
import Chatbot from './components/Chatbot'

function AppShell() {
  // Frontend gate (best-effort): we still allow /auth route separately.
  // If token is stale, pages may fail; the Auth page can re-auth.
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text">

      <div className="cold-grid" />
      <div className="route-lines" />
      <div className="noise" />
      <div className="relative z-10 flex h-screen flex-col">
        <Topbar />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1720px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/command-center" element={<CommandCenterPage />} />
                <Route path="/prediction" element={<PredictionPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/warehouses" element={<WarehousesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      <CommandPalette />
      <Chatbot />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  )
}

export default App
