/** Supabase rejects with a PostgrestError — a plain object, not an Error — so
 *  an `instanceof Error` check throws away the only useful text (RLS denials,
 *  constraint violations). Read the message off whatever we were handed. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message

  if (typeof error === 'object' && error !== null) {
    const { message, details } = error as { message?: unknown; details?: unknown }
    if (typeof message === 'string' && message) return message
    if (typeof details === 'string' && details) return details
  }

  if (typeof error === 'string' && error) return error

  return fallback
}
