import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Non-null when the app is misconfigured. This is a value rather than a
 *  module-scope `throw` on purpose: an unconditional throw here is statically
 *  reachable, so a production build with the vars unset proves every importer
 *  unreachable and tree-shakes the entire app into an empty page. The build now
 *  fails loudly instead (see vite.config.ts), and screens render this message
 *  rather than a blank body. */
export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials.'
    : null

// Placeholders keep client construction side-effect free when misconfigured;
// nothing reaches the network because App renders the config screen first.
export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost',
  supabaseAnonKey || 'missing-anon-key',
)
