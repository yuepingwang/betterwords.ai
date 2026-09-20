import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import DS2 from '../ds2'
import { accountsConfigured, getSupabase } from './supabase'
import { StoreContext } from '../store'
import { displayName, getPrefs, setPrefs, usePrefs } from './prefs'

// ------------------------------------------------------------------
// auth.jsx — v3 account state + the email-code sign-in sheet.
//
// Sign-in is passwordless email OTP (enter address → numeric code from
// the email), the lowest-friction flow on mobile — no password to
// invent, no app-switching magic-link dance. `openSignIn(onSuccess)`
// lets any screen gate an action on being signed in (e.g. Composer's
// "Save as New Draft"): the sheet opens, and onSuccess runs after the
// code checks out.
//
// When Supabase isn't configured (see supabase.js) the provider still
// mounts but reports { configured: false } — the header control and
// sheet render nothing, and v3 looks exactly like it did before
// accounts existed.
// ------------------------------------------------------------------

const AuthContext = createContext(null)

// The account is the source of truth for the display name: whenever a
// session surfaces a saved name (sign-in, reload, USER_UPDATED), mirror
// it into prefs — that's what displayName() and every screen read.
function adoptAccountName(u) {
  const n = (u?.user_metadata?.display_name || '').trim()
  if (n && n !== getPrefs().name) setPrefs({ name: n })
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const onSuccessRef = useRef(null)
  // Present whenever the provider mounts inside the app's StoreProvider
  // (everywhere in v3.5) — drives the post-sign-in landing on Home.
  const store = useContext(StoreContext)

  useEffect(() => {
    // A `?mockuser` review session owns the auth state — don't let the real
    // Supabase session (usually null) overwrite it.
    try {
      if (new URLSearchParams(window.location.search).get('mockuser')) return
    } catch {}
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      adoptAccountName(u)
      // A returning signed-in visitor lands on the Home dashboard, not the
      // marketing landing — unless a `?screen=` deep link took over.
      try {
        if (u && !new URLSearchParams(window.location.search).get('screen')) store?.dispatch({ type: 'OPEN_HOME' })
      } catch {}
    })
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      adoptAccountName(session?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Dev deep-links (match the store's `?screen=` pattern): `&signin=1`
  // opens the sheet on load; `&mockuser=1` (or `&mockuser=a@b.c`) fakes a
  // signed-in session so the app chrome/home can be design-reviewed
  // without an account. Both are review-only affordances.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      if (p.get('signin')) setSheetOpen(true)
      const mock = p.get('mockuser')
      if (mock) {
        setUser({ email: mock.includes('@') ? mock : 'yueping.design@gmail.com' })
        if (!p.get('screen')) store?.dispatch({ type: 'OPEN_HOME' })
      }
    } catch {}
  }, [])

  const value = useMemo(
    () => ({
      configured: accountsConfigured,
      user,
      signedIn: Boolean(user),
      openSignIn: (onSuccess) => {
        if (!accountsConfigured) return
        onSuccessRef.current = onSuccess || null
        setSheetOpen(true)
      },
      signOut: () => getSupabase()?.auth.signOut(),
    }),
    [user],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      {sheetOpen && (
        <SignInSheet
          onClose={() => setSheetOpen(false)}
          onSignedIn={() => {
            setSheetOpen(false)
            const cb = onSuccessRef.current
            onSuccessRef.current = null
            // A gated action (e.g. the composer's save) resumes where it was;
            // a plain header sign-in lands on the signed-in Home dashboard.
            if (cb) cb()
            else store?.dispatch({ type: 'OPEN_HOME' })
          }}
        />
      )}
    </AuthContext.Provider>
  )
}

// ---------- the sign-in sheet -------------------------------------

function SignInSheet({ onClose, onSignedIn }) {
  const { Button, Sparkle } = DS2
  const [step, setStep] = useState('email') // 'email' | 'code' | 'name'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  // Prefilled from any name set while browsing signed-out, so the name
  // step is a one-tap confirm rather than a blank field.
  const [name, setName] = useState(() => getPrefs().name)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const sendCode = async () => {
    const addr = email.trim()
    if (!/.+@.+\..+/.test(addr)) return setError('That doesn’t look like an email address.')
    setBusy(true)
    setError(null)
    const { error: err } = await getSupabase().auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true },
    })
    setBusy(false)
    if (err) return setError(err.message)
    setStep('code')
  }

  const verify = async () => {
    if (code.trim().length < 6) return setError('Enter the code from the email.')
    setBusy(true)
    setError(null)
    const { data, error: err } = await getSupabase().auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })
    setBusy(false)
    if (err) return setError(err.message)
    // Returning accounts already carry a name — adopt it and finish. A
    // fresh account gets one more step: what they go by when they send.
    const accountName = (data?.user?.user_metadata?.display_name || '').trim()
    if (accountName) {
      setPrefs({ name: accountName })
      return onSignedIn()
    }
    setError(null)
    setStep('name')
  }

  const saveName = async () => {
    const n = name.trim()
    if (!n) return setError('Tell us what you go by — or skip for now.')
    setBusy(true)
    setError(null)
    // Saved on the account (user metadata) so it follows them across
    // devices; mirrored into prefs so Home greets them right away.
    const { error: err } = await getSupabase().auth.updateUser({ data: { display_name: n } })
    setBusy(false)
    if (err) return setError(err.message)
    setPrefs({ name: n })
    onSignedIn()
  }

  const submit = step === 'email' ? sendCode : step === 'code' ? verify : saveName

  // By the name step the code has already checked out — they're signed
  // in. Dismissing the sheet there (✕, backdrop, Escape) is a skip, so
  // it still completes the sign-in flow instead of stranding it.
  const dismiss = step === 'name' ? onSignedIn : onClose

  const onKey = (e) => {
    if (e.key === 'Enter' && !busy) submit()
    if (e.key === 'Escape') dismiss()
  }

  return (
    <div
      onKeyDown={onKey}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'color-mix(in srgb, var(--ink-800) 34%, transparent)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign up or log in to BetterWords"
        style={{
          width: 400, maxWidth: '100%', background: 'var(--surface-card)',
          border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)', padding: '30px 30px 26px',
          animation: 'adv-up .35s var(--ease-out)', position: 'relative',
        }}
      >
        <button
          aria-label="Close"
          onClick={dismiss}
          style={{
            position: 'absolute', top: 14, right: 14, border: 0, background: 'transparent',
            color: 'var(--text-faint)', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 6,
          }}
        >
          ✕
        </button>

        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
          {step === 'email' ? 'Keep your words' : step === 'code' ? 'Check your email' : 'One last thing'}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 27, lineHeight: 1.1, color: 'var(--text-strong)', margin: '0 0 10px' }}>
          {step === 'email' ? (
            <>Sign up or log in <Sparkle size={15} style={{ color: 'var(--spark)' }} /></>
          ) : step === 'code' ? (
            'Enter your code'
          ) : (
            <>What do you go by? <Sparkle size={15} style={{ color: 'var(--spark)' }} /></>
          )}
        </h2>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--text-muted)', margin: '0 0 20px' }}>
          {step === 'email'
            ? 'Your drafts and sent messages stay private to you, and follow-ups keep their context. No password — we’ll email you a code.'
            : step === 'code'
              ? `We sent a 6-digit code to ${email.trim()}. It’s good for one hour.`
              : 'The name you send messages under. It greets you at home and signs your drafts — you can change it anytime in Account.'}
        </p>

        {step === 'email' ? (
          <input
            className="bw-field"
            type="email"
            autoFocus
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : step === 'code' ? (
          <input
            className="bw-field"
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            style={{ letterSpacing: '0.35em', fontVariantNumeric: 'tabular-nums' }}
          />
        ) : (
          <input
            className="bw-field"
            type="text"
            autoFocus
            autoComplete="given-name"
            placeholder="Your first name, a nickname…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {error && (
          <div role="alert" style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--danger, #b3423f)', marginTop: 10 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="spark" size="lg" disabled={busy} onClick={submit} style={{ width: '100%' }}>
            {busy ? 'One moment…' : step === 'email' ? 'Email me a code' : 'Continue'}
          </Button>
          {step === 'code' && (
            <button
              onClick={() => { setStep('email'); setCode(''); setError(null) }}
              style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 13.5, cursor: 'pointer', padding: 4 }}
            >
              Different email, or send a new code
            </button>
          )}
          {step === 'name' && (
            <button
              onClick={onSignedIn}
              style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 13.5, cursor: 'pointer', padding: 4 }}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- header account control --------------------------------

// Rendered by SiteChrome on every screen. Unconfigured → nothing (v3
// looks account-free). Signed out → quiet "Sign in". Signed in → an
// initial chip that opens a tiny menu with the email + sign out.
// `compact` (the composer header): just the avatar — signed out it renders
// nothing, since the Save-draft gate already opens the sign-in sheet.
export function AccountControl({ compact = false }) {
  const { configured, signedIn, user, openSignIn, signOut } = useAuth()
  // Optional — present whenever the control renders inside the app's
  // StoreProvider, which is everywhere in v3.5. Drives "My conversations".
  const store = useContext(StoreContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapRef = useRef(null)
  // The chosen display name (name step / Account page) — same source
  // Home and Settings read, so the avatar menu matches the greeting.
  const [prefs] = usePrefs()

  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => {
      if (!wrapRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  if (!configured) return null

  const { Button } = DS2

  if (!signedIn && compact) return null

  // Signed out — the wireframe's "Login · Sign up" pair. Both open the
  // same email-code sheet; the copy just meets the visitor where they are.
  if (!signedIn) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 26 }}>
        <a className="lp-link" onClick={() => openSignIn()} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500, paddingBottom: 2 }}>
          Login
        </a>
        {/* dressed like the signed-in header's "+ New" pill (42px, 20px pads)
            on the accent color — the header nav links' font color */}
        <Button variant="primary" size="md" onClick={() => openSignIn()} style={{ height: 42, paddingLeft: 20, paddingRight: 20 }}>
          Sign up
        </Button>
      </span>
    )
  }

  const emailAddr = user?.email || ''
  const name = displayName(prefs, emailAddr)
  const initial = (name[0] || '?').toUpperCase()
  // The wireframe chip: soft peri→peach wash, serif initial, hairline ring.
  const chipBg = 'linear-gradient(135deg, var(--peri-200, #DCD9F6), var(--peach-200, #F6D9C4))'
  const avatar = (size, font) => (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: chipBg, color: 'var(--ink-800)',
        border: '2px solid color-mix(in srgb, #fff 75%, transparent)',
        boxShadow: '0 1px 6px rgba(28, 23, 70, 0.16)',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: font,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {initial}
    </span>
  )

  // Colors (incl. the hover highlight) live in v4.css (.bw-acct-item) so the
  // icon can follow the text color: the glyph is a currentColor-filled mask.
  const glyph = (src) => (
    <span
      aria-hidden
      className="bw-acct-glyph"
      style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
    />
  )

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        aria-label={`Account: ${emailAddr}`}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex' }}
      >
        {avatar(42, 18)}
      </button>
      {menuOpen && (
        <div
          style={{
            position: 'absolute', top: 50, right: 0, width: 264, zIndex: 60,
            background: 'var(--surface-card)', border: '1px solid var(--border-hair)',
            borderRadius: 'var(--radius-lg, 16px)', boxShadow: 'var(--shadow-lg, var(--shadow-md))', padding: 12,
          }}
        >
          {/* who's signed in */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 6px 14px', borderBottom: '1px solid var(--border-hair)', marginBottom: 8 }}>
            {avatar(40, 18)}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14.5, color: 'var(--text-strong)' }}>{name}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emailAddr}</div>
            </div>
          </div>
          {/* Home + My conversations live here now — the signed-in header
              carries only "+ New" and this avatar (Figma 490:4503). */}
          {store && (
            <>
              <button
                className="bw-acct-item"
                onClick={() => { setMenuOpen(false); store.dispatch({ type: 'OPEN_HOME' }) }}
              >
                {glyph('/ds-v4/assets/glyphs/home.svg')}
                Home
              </button>
              <button
                className="bw-acct-item"
                onClick={() => { setMenuOpen(false); store.dispatch({ type: 'OPEN_CONVERSATIONS' }) }}
              >
                {glyph('/ds-v4/assets/glyphs/conversations.svg')}
                My conversations
              </button>
            </>
          )}
          {store &&
            [
              ['Account', 'account', '/ds-v4/assets/glyphs/account.svg'],
              ['Settings', 'settings', '/ds-v4/assets/glyphs/settings.svg'],
            ].map(([label, screen, icon]) => (
              <button
                key={screen}
                className="bw-acct-item"
                onClick={() => { setMenuOpen(false); store.dispatch({ type: 'GOTO', screen }) }}
              >
                {glyph(icon)}
                {label}
              </button>
            ))}
          <div style={{ borderTop: '1px solid var(--border-hair)', margin: '8px 0' }} />
          <button className="bw-acct-item bw-acct-item--danger" onClick={() => { setMenuOpen(false); signOut() }}>
            <span aria-hidden style={{ width: 16, textAlign: 'center' }}>←</span>
            Log out
          </button>
        </div>
      )}
    </span>
  )
}
