import { useEffect, useState } from 'react'

// ------------------------------------------------------------------
// prefs.js — user preferences for the Account & Settings pages.
// Stored client-side (localStorage): there's no profile table in the
// Supabase schema yet, and this keeps the pages fully working for the
// signed-out demo too. `usePrefs` re-renders every consumer when any
// page patches a value, so the Home dashboard mirrors edits live.
// ------------------------------------------------------------------

const KEY = 'bw35-prefs'
const EVT = 'bw35-prefs-changed'

export const TONE_OPTIONS = ['Gentle', 'Moderate', 'Direct']
export const LENGTH_OPTIONS = ['Concise', 'Balanced', 'Detailed']
export const VOICE_OPTIONS = ['Concise', 'Analytical', 'Warm', 'Optimistic', 'Playful', 'Sincere', 'Thoughtful']

export const DEFAULT_PREFS = {
  name: '', // display name — falls back to the email's first word
  email: '', // shown from auth when empty
  language: 'English',
  tone: 'Moderate',
  length: 'Detailed',
  signoff: '', // falls back to the display name
  voices: ['Concise', 'Analytical', 'Warm', 'Optimistic'],
  customVoices: [], // user-defined characteristics (always selectable chips)
  voiceNote: 'Warm but direct. I’d rather be clear than soften something into confusion.',
}

export function getPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function setPrefs(patch) {
  const next = { ...getPrefs(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: next }))
  return next
}

export function usePrefs() {
  const [prefs, setState] = useState(getPrefs)
  useEffect(() => {
    const onChange = (e) => setState(e.detail || getPrefs())
    window.addEventListener(EVT, onChange)
    return () => window.removeEventListener(EVT, onChange)
  }, [])
  return [prefs, (patch) => setState(setPrefs(patch))]
}

// "yueping.design@…" → "Yueping" — first word of the address's local part.
export function nameFromEmail(email) {
  const first = (email || '').split('@')[0].split(/[._+-]/)[0]
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : ''
}

// The display name every screen should use: explicit pref, else email.
export function displayName(prefs, authEmail) {
  return prefs.name.trim() || nameFromEmail(prefs.email || authEmail) || 'Yueping'
}
