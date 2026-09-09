import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function SignIn() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setError(null)
    try {
      await signInWithGoogle()
    } catch {
      setError('Sign-in is not available yet. Google OAuth has not been configured for this project.')
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Cut Tracker</h1>
      <p className="max-w-xs text-sm text-gray-500">
        Track how consistently you follow your cut, and what happens to your weight.
      </p>
      <button
        onClick={handleSignIn}
        className="min-h-11 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white"
      >
        Sign in with Google
      </button>
      {error && <p className="max-w-xs text-sm text-red-500">{error}</p>}
    </div>
  )
}
