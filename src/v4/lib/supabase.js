// ------------------------------------------------------------------
// supabase.js — the single seam between v3 and Supabase (accounts +
// storage), mirroring how advisor.js seams the AI: if the env keys are
// missing the app runs exactly as before — no accounts UI, nothing
// persisted, nothing broken.
//
// Config comes from VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (.env
// locally, Amplify console env vars in the deployed build). The anon
// key is safe to ship to browsers: all data access is governed by the
// row-level-security policies in supabase/migrations/.
// ------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL || ''
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Is the accounts backend configured for this build?
export const accountsConfigured = Boolean(URL && ANON_KEY)

let _client = null

// Lazy singleton — created on first use so unconfigured builds never
// touch the library at runtime.
export function getSupabase() {
  if (!accountsConfigured) return null
  if (!_client) {
    _client = createClient(URL, ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return _client
}
