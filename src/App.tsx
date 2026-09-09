import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BottomNav } from './components/BottomNav'
import { SignIn } from './pages/SignIn'
import { StartCut } from './pages/StartCut'
import { Home } from './pages/Home'
import { Calendar } from './pages/Calendar'
import { Stats } from './pages/Stats'
import { Settings } from './pages/Settings'

function AppLayout() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/start-cut" element={<StartCut />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
