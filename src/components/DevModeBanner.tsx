import { isDevMode } from '../lib/devMode'

// TEMPORARY: remove alongside devMode.ts once Supabase is wired up for real.
export function DevModeBanner() {
  if (!isDevMode) return null

  return (
    <div className="bg-amber-400 px-3 py-1 text-center text-xs font-medium text-amber-950">
      DEV MODE — fake data, no Supabase connected
    </div>
  )
}
