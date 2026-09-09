import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
    )
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />
  }

  return <Outlet />
}
