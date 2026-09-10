// TEMPORARY: lets the app run without a real Supabase project so the UI can be
// clicked through locally. Set VITE_DEV_MODE=false (or remove it) in .env once
// Supabase + Google OAuth are configured, then delete this file and its usages.
export const isDevMode = import.meta.env.VITE_DEV_MODE === 'true'
