import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import DS2 from '../ds2'
import { accountsConfigured, getSupabase } from './supabase'
import { StoreContext } from '../store'

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

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const onSuccessRef = useRef(null)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Dev deep-link (matches the store's `?screen=` pattern): `&signin=1`
  // opens the sheet on load for design review.
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('signin')) setSheetOpen(true)
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
            if (cb) cb()
          }}
        />
      )}
    </AuthContext.Provider>
  )
}

// ---------- the sign-in sheet -------------------------------------

function SignInSheet({ onClose, onSignedIn }) {
  const { Button, Sparkle } = DS2
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
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
    const { error: err } = await getSupabase().auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })
    setBusy(false)
    if (err) return setError(err.message)
    onSignedIn()
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !busy) (step === 'email' ? sendCode : verify)()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      onKeyDown={onKey}
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
        aria-label="Sign in to BetterWords"
        style={{
          width: 400, maxWidth: '100%', background: 'var(--surface-card)',
          border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)', padding: '30px 30px 26px',
          animation: 'adv-up .35s var(--ease-out)', position: 'relative',
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, border: 0, background: 'transparent',
            color: 'var(--text-faint)', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 6,
          }}
        >
          ✕
        </button>

        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
          {step === 'email' ? 'Keep your words' : 'Check your email'}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 27, lineHeight: 1.1, color: 'var(--text-strong)', margin: '0 0 10px' }}>
          {step === 'email' ? <>Sign in to save <Sparkle size={15} style={{ color: 'var(--spark)' }} /></> : 'Enter your code'}
        </h2>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--text-muted)', margin: '0 0 20px' }}>
          {step === 'email'
            ? 'Your drafts and sent messages stay private to you, and follow-ups keep their context. No password — we’ll email you a code.'
            : `We sent a 6-digit code to ${email.trim()}. It’s good for one hour.`}
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
        ) : (
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
        )}

        {error && (
          <div role="alert" style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--danger, #b3423f)', marginTop: 10 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="spark" size="lg" disabled={busy} onClick={step === 'email' ? sendCode : verify} style={{ width: '100%' }}>
            {busy ? 'One moment…' : step === 'email' ? 'Email me a code' : 'Sign in'}
          </Button>
          {step === 'code' && (
            <button
              onClick={() => { setStep('email'); setCode(''); setError(null) }}
              style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 13.5, cursor: 'pointer', padding: 4 }}
            >
              Different email, or send a new code
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

  // Signed out — the wireframe's "Login · Sign up free" pair. Both open the
  // same email-code sheet; the copy just meets the visitor where they are.
  if (!signedIn) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 26 }}>
        <a className="lp-link" onClick={() => openSignIn()} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
          Login
        </a>
        <Button variant="spark" size="sm" onClick={() => openSignIn()} style={{ fontSize: 14.5, fontWeight: 600 }}>
          Sign up free
        </Button>
      </span>
    )
  }

  const emailAddr = user?.email || ''
  const local = emailAddr.split('@')[0] || '?'
  const name = local.charAt(0).toUpperCase() + local.slice(1)
  const initial = (local[0] || '?').toUpperCase()
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

  // Colors (incl. the hover highlight) live in v35.css (.bw-acct-item) so the
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
        {avatar(36, 16)}
      </button>
      {menuOpen && (
        <div
          style={{
            position: 'absolute', top: 46, right: 0, width: 264, zIndex: 60,
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
          {store && (
            <button
              className="bw-acct-item"
              onClick={() => { setMenuOpen(false); store.dispatch({ type: 'OPEN_CONVERSATIONS' }) }}
            >
              {glyph('/ds-v35/assets/glyphs/conversations.svg')}
              My conversations
            </button>
          )}
          {/* Account & profile page isn't built yet — the item is here (per
              the wireframe) but marked; the other menu items (Settings,
              Upgrade plan, Help & feedback) stay hidden until they exist. */}
          <div className="bw-acct-item bw-acct-item--soon">
            {glyph('/ds-v35/assets/glyphs/account.svg')}
            <span style={{ flex: 1 }}>Account &amp; profile</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)', border: '1px solid var(--border-hair)', borderRadius: 999, padding: '2px 7px' }}>Soon</span>
          </div>
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
