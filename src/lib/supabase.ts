import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { isDevMode } from './devMode'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasCredentials && !isDevMode) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials.',
  )
}

// TEMPORARY: in dev mode without credentials, AuthContext and cutService branch
// around every real call, so this client is never actually invoked. See devMode.ts.
export const supabase = hasCredentials
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient<Database>)
