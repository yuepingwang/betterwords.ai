import React, { useEffect, useState } from 'react'
import DS2 from '../ds2'
import AppPage, { PageCard, kickerStyle } from '../components/AppPage'
import PlanBox from '../components/PlanBox'
import { useAuth } from '../lib/auth'
import { getSupabase } from '../lib/supabase'
import { displayName, usePrefs } from '../lib/prefs'

// ------------------------------------------------------------------
// Account — profile page reached from the avatar menu and the Home
// dashboard's "Account Settings" pill. Edits are held in a local
// draft; a Cancel / Save pair appears in the back-link row while
// anything is unsaved. Saving an email change goes through Supabase's
// confirm-by-email flow when a real session exists.
// ------------------------------------------------------------------

// Languages the picker offers; only English ships today.
const LANGUAGES = ['English', 'Español', 'Français', '中文', '한국어']

export default function Account() {
  const auth = useAuth()
  const [prefs, update] = usePrefs()
  const { Button } = DS2

  const authEmail = auth.user?.email || ''
  const savedEmail = prefs.email || authEmail

  // The editable draft — page fields bind here, not to the saved prefs.
  const [draft, setDraft] = useState({ name: prefs.name, language: prefs.language, email: savedEmail })
  const patch = (p) => { setDraft((d) => ({ ...d, ...p })); setStatus(null) }
  const [status, setStatus] = useState(null) // null | 'busy' | {ok|err: msg}

  // The auth session can resolve after mount — adopt its address as long
  // as the user hasn't typed anything yet.
  useEffect(() => {
    if (!draft.email && savedEmail) setDraft((d) => ({ ...d, email: savedEmail }))
  }, [savedEmail]) // eslint-disable-line react-hooks/exhaustive-deps

  const emailDirty = draft.email.trim() !== savedEmail
  const dirty = draft.name !== prefs.name || draft.language !== prefs.language || emailDirty

  const name = displayName({ ...prefs, ...draft }, authEmail)
  const initial = (name[0] || '?').toUpperCase()

  const cancel = () => {
    setDraft({ name: prefs.name, language: prefs.language, email: savedEmail })
    setStatus(null)
  }

  const save = async () => {
    update({ name: draft.name, language: draft.language })
    const sb = getSupabase()
    // The name also lives on the account (user metadata) so it follows the
    // user across devices — fire-and-forget; prefs already have it locally.
    if (auth.signedIn && sb && draft.name !== prefs.name) {
      sb.auth.updateUser({ data: { display_name: draft.name.trim() } }).catch(() => {})
    }
    if (!emailDirty) return setStatus({ ok: 'Saved.' })
    const addr = draft.email.trim()
    if (!/.+@.+\..+/.test(addr)) return setStatus({ err: 'That doesn’t look like an email address.' })
    setStatus('busy')
    if (auth.signedIn && sb) {
      // Supabase sends a confirmation link to the new address; the account
      // switches over once it's clicked.
      const { error } = await sb.auth.updateUser({ email: addr })
      if (error) return setStatus({ err: error.message })
      update({ email: addr })
      return setStatus({ ok: `Saved — confirmation sent to ${addr}; the email change applies once you confirm.` })
    }
    update({ email: addr })
    setStatus({ ok: 'Saved.' })
  }

  const fieldLabel = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--ink-600)' }

  return (
    <AppPage
      title="Account"
      sub="Who you are on BetterWords."
      actions={
        dirty && (
          <>
            {/* md dress at the header "+ New" button's 42px height */}
            <Button variant="ghost" size="md" onClick={cancel} style={{ height: 42, paddingLeft: 20, paddingRight: 20 }}>Cancel</Button>
            <Button variant="primary" size="md" disabled={status === 'busy'} onClick={save} style={{ height: 42, paddingLeft: 28, paddingRight: 28 }}>
              {status === 'busy' ? 'One moment…' : 'Save'}
            </Button>
          </>
        )
      }
    >
      {/* ---- profile ---- */}
      <PageCard>
        <span style={kickerStyle}>PROFILE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span
            aria-hidden
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              flexShrink: 0,
              background: 'linear-gradient(135deg, var(--peri-200), var(--peach-200))',
              border: '2px solid color-mix(in srgb, #fff 75%, transparent)',
              boxShadow: '0 4px 5px rgba(28, 23, 70, 0.06), 0 2px 2px rgba(28, 23, 70, 0.06)',
              fontFamily: 'var(--font-display)',
              fontVariationSettings: 'var(--display-soft)',
              fontWeight: 600,
              fontSize: 28,
              color: 'var(--ink-500)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initial}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: 'var(--ink-700)' }}>{name}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>No password — sign in with a code</span>
          </div>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={fieldLabel}>Display name</span>
          <input
            className="bw-field"
            type="text"
            placeholder={name}
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
            style={{ maxWidth: 380, fontFamily: 'var(--font-sans)', fontSize: 15 }}
          />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>Used in your welcome, your sign-offs, and this account card.</span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={fieldLabel}>Email</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="bw-field"
              type="email"
              value={draft.email}
              onChange={(e) => patch({ email: e.target.value })}
              style={{ maxWidth: 380, width: '100%', fontFamily: 'var(--font-sans)', fontSize: 15 }}
            />
            {!emailDirty && savedEmail && (
              <span style={{ background: 'var(--mint-200)', borderRadius: 999, padding: '3px 8px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, color: 'var(--mint-600)', whiteSpace: 'nowrap' }}>✓ VERIFIED</span>
            )}
          </div>
          {status?.err && <span role="alert" style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--danger)' }}>{status.err}</span>}
          {status?.ok && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--mint-600)' }}>{status.ok}</span>}
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>Sign-in codes go to this address.</span>
        </div>
      </PageCard>

      {/* ---- language ---- */}
      <PageCard>
        <span style={kickerStyle}>PREFERRED LANGUAGE</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {LANGUAGES.map((lang) => {
            const active = draft.language === lang
            const soon = lang !== 'English'
            return (
              <button
                key={lang}
                type="button"
                disabled={soon}
                title={soon ? 'Coming soon' : undefined}
                onClick={soon || active ? undefined : () => patch({ language: lang })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  borderRadius: 999,
                  padding: '9px 16px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13.5,
                  lineHeight: 1.2,
                  cursor: soon ? 'not-allowed' : active ? 'default' : 'pointer',
                  ...(active
                    ? { background: 'var(--accent-soft)', border: '1.5px solid var(--accent)', color: 'var(--accent)', fontWeight: 600 }
                    : { background: 'transparent', border: '1.5px solid var(--border-soft)', color: soon ? 'var(--ink-400)' : 'var(--ink-600)', fontWeight: 500 }),
                }}
              >
                {lang}
                {soon && (
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)', border: '1px solid var(--border-hair)', borderRadius: 999, padding: '2px 6px' }}>Soon</span>
                )}
              </button>
            )
          })}
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--ink-500)', margin: 0 }}>
          BetterWords writes in English for now — more languages are on the way.
        </p>
      </PageCard>

      {/* ---- plan ---- */}
      <PageCard>
        <PlanBox />
      </PageCard>
    </AppPage>
  )
}
