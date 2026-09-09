import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom'
import { supabaseConfigError } from './lib/supabase'
import { AuthProvider } from './contexts/AuthContext'
import { PreferencesProvider } from './contexts/PreferencesContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BottomNav } from './components/BottomNav'
import { SignIn } from './pages/SignIn'
import { StartCut } from './pages/StartCut'
import { Home } from './pages/Home'
import { Calendar } from './pages/Calendar'
import { Settings } from './pages/Settings'
import { ScreenSkeleton } from './components/Skeleton'

// Recharts is most of the bundle and only these two screens need it, so both
// are lazy — leaving either one eager pulls the chart back into the main chunk.
const Stats = lazy(() => import('./pages/Stats').then((m) => ({ default: m.Stats })))
const CutDetail = lazy(() => import('./pages/CutDetail').then((m) => ({ default: m.CutDetail })))

function AppLayout() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <div className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <Suspense fallback={<ScreenSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
      <BottomNav />
    </div>
  )
}

function ConfigError({ message }: { message: string }) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold text-gray-900">Cut Tracker isn't configured</h1>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

function App() {
  if (supabaseConfigError) {
    return <ConfigError message={supabaseConfigError} />
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <PreferencesProvider>
          <ToastProvider>
            <Routes>
              <Route path="/sign-in" element={<SignIn />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/start-cut" element={<StartCut />} />

                <Route element={<AppLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/cuts/:cutId" element={<CutDetail />} />
                </Route>
              </Route>
            </Routes>
          </ToastProvider>
        </PreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
