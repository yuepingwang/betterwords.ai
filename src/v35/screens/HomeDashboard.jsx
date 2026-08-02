import React, { useEffect, useMemo, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { fetchThread, listThreads } from '../lib/db'
import { DEMO_THREADS } from '../lib/demo'
import HomeHero, { HOME_GROUND } from '../components/HomeHero'
import { displayName, usePrefs } from '../lib/prefs'

// ------------------------------------------------------------------
// HomeDashboard — the signed-in home page (Figma 489:3991): an 800px
// column on the daybreak-edge ground. Hero welcome card over the
// cloud illustration, then a 2×2 grid: activity stats · what to do
// next (carousel over the live threads) · account & plan · writing
// style defaults. Signed out it runs on the demo threads so the page
// stays browsable for design review (?screen=dashboard).
// ------------------------------------------------------------------

// Same status read as the Conversations list (minus its localStorage
// archive flags — archived threads still count as handled here).
const statusOf = (t) => (!t.hasSent ? 'draft' : t.awaiting ? 'awaiting' : 'replied')

const DAY_MS = 24 * 60 * 60 * 1000
const daysSince = (iso) => Math.max(1, Math.floor((Date.now() - new Date(iso)) / DAY_MS))

// "Your landlord" → "To your landlord" (the next-card meta line).
const toLabel = (r) => (r ? `To ${/^your\s/i.test(r) ? r[0].toLowerCase() + r.slice(1) : r}` : 'To someone')

// Card shell — Figma: white, 16 radius, 20 pad, soft ink shadow.
function DashCard({ children, style }) {
  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 10px rgba(28, 23, 70, 0.06)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </section>
  )
}

// The hairline pill button in every card header (Figma "span" 489:4083):
// border-soft ring, 12px semibold ink.
function Pill({ children, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={onClick ? 'bw-dash-pill' : undefined}
      style={{
        border: '1px solid var(--border-soft)',
        borderRadius: 999,
        padding: '10px 16px',
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 12,
        lineHeight: 1.2,
        color: 'var(--ink-700)',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </button>
  )
}

// Small-caps section label (Figma: 12px semibold ink-400).
const kickerStyle = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, letterSpacing: '0.01em', color: 'var(--ink-400)' }

const cardTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: 'var(--display-soft)',
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: '0.01em',
  color: 'var(--ink-600)',
  margin: 0,
}

// Per-status dress for the "what to do next" suggestion card.
const NEXT_TONES = {
  awaiting: {
    badge: (t) => `WAITING ${daysSince(t.lastActivityAt)} DAY${daysSince(t.lastActivityAt) === 1 ? '' : 'S'}`,
    badgeBg: 'var(--honey-300)',
    badgeInk: 'var(--honey-600)',
    meta: () => 'no reply yet',
    cta: 'Nudge them ✦',
    art: '/ds-v35/assets/characters/convo-waiting-snail.svg',
    mode: 'followup',
  },
  replied: {
    badge: () => 'THEY REPLIED',
    badgeBg: 'var(--mint-200)',
    badgeInk: 'var(--mint-600)',
    meta: (t) => `replied ${daysSince(t.lastActivityAt)}d ago`,
    cta: 'Help me respond ✦',
    art: '/ds-v35/assets/characters/ctx-sent.svg',
    mode: 'respond',
  },
  draft: {
    badge: () => 'DRAFT IN PROGRESS',
    badgeBg: 'var(--peri-200)',
    badgeInk: 'var(--blue-600)',
    meta: () => 'not sent yet',
    cta: 'Keep drafting ✦',
    art: '/ds-v35/assets/characters/ctx-waiting.svg',
    mode: 'open',
  },
}

export default function HomeDashboard() {
  const { dispatch } = useStore()
  const auth = useAuth()
  const { Button } = DS2

  const [threads, setThreads] = useState(null) // null → loading
  const demo = !auth.signedIn

  useEffect(() => {
    let alive = true
    if (demo) {
      setThreads(DEMO_THREADS)
      return
    }
    listThreads()
      .then((t) => alive && setThreads(t))
      .catch((err) => {
        console.warn('[home]', err?.message || err)
        if (alive) setThreads([])
      })
    return () => {
      alive = false
    }
  }, [demo])

  // "In the past 30 days" — everything the stats card counts.
  const recent = useMemo(
    () => (threads || []).filter((t) => Date.now() - new Date(t.lastActivityAt) < 30 * DAY_MS),
    [threads],
  )
  const counts = useMemo(() => {
    const c = { replied: 0, awaiting: 0, draft: 0 }
    recent.forEach((t) => c[statusOf(t)]++)
    return c
  }, [recent])

  // Suggestion queue for the carousel — most urgent first: things awaiting a
  // nudge, then replies to answer, then drafts to finish.
  const suggestions = useMemo(() => {
    const order = { awaiting: 0, replied: 1, draft: 2 }
    return [...recent]
      .sort((a, b) => order[statusOf(a)] - order[statusOf(b)] || new Date(b.lastActivityAt) - new Date(a.lastActivityAt))
  }, [recent])
  const [nextIdx, setNextIdx] = useState(0)
  const suggestion = suggestions.length ? suggestions[((nextIdx % suggestions.length) + suggestions.length) % suggestions.length] : null

  // The CTA drops straight into the right flow for the thread's state,
  // fetching the full thread first (the reply flow needs its messages).
  // Anything that can't be resolved just opens the conversation.
  const actOn = async (t, mode) => {
    if (mode === 'open') return dispatch({ type: 'OPEN_CONVERSATION', threadId: t.id })
    try {
      const full = demo ? DEMO_THREADS.find((d) => d.id === t.id) : await fetchThread(t.id)
      const replyText = mode === 'respond' ? [...(full.messages || [])].reverse().find((m) => m.kind === 'reply')?.body || null : null
      dispatch({ type: 'START_REPLY_FLOW', mode, replyText, thread: full })
    } catch (err) {
      console.warn('[home]', err?.message || err)
      dispatch({ type: 'OPEN_CONVERSATION', threadId: t.id })
    }
  }

  // Profile + writing-style prefs (Account/Settings pages) — the card
  // chips below mirror them live.
  const [prefs] = usePrefs()
  const emailAddr = prefs.email || auth.user?.email || ''
  const name = displayName(prefs, auth.user?.email)
  const initial = (name[0] || '?').toUpperCase()
  const signoff = prefs.signoff.trim() || name

  return (
    // Figma 490:4346 — paper ground with the home rainbow cresting at the
    // bottom edge; the warm footer under the fold continues the lilac (see
    // SiteFooter warm variant). The whole page pulls up under the
    // transparent header so the hero starts 12px from the top (HOME_GROUND).
    <div style={HOME_GROUND}>
      <main style={{ maxWidth: 856, width: '100%', margin: '0 auto', padding: '12px 28px 64px', boxSizing: 'border-box', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <HomeHero active="home" />

        {/* Two independent auto-layout columns (Figma 490:4342 / 490:4343):
            left 360, right 424 of the 800 — each a vstack of
            content-hugging cards, so the columns' bottoms stay ragged. */}
        <div className="bw-dash-grid" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div className="bw-dash-col" style={{ flex: '360 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ---- past 30 days (489:4248) ---- */}
          <DashCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={kickerStyle}>PAST 30 DAYS</span>
              <Pill onClick={() => dispatch({ type: 'OPEN_CONVERSATIONS' })}>My Conversations</Pill>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 32, padding: '0 16px' }}>
                {[
                  ['replied', 'Replied', '#10B981'],
                  ['awaiting', 'Awaiting', 'var(--peach-500)'],
                  ['draft', 'Drafted', '#6E88E4'],
                ].map(([key, label, color]) => (
                  <div key={key} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '2px 0' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 32, letterSpacing: '0.01em', color }}>
                      {threads ? counts[key] : '–'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, letterSpacing: '0.01em', color: 'var(--ink-700)' }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--peri-100)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 56, lineHeight: 1, letterSpacing: '0.01em', color: '#2B45D4' }}>
                  {threads ? recent.length : '–'}
                </span>
                <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 14, letterSpacing: '0.01em', color: 'var(--ink-600)' }}>
                  Conversations have been carefully handled
                </span>
                <img src="/ds-v35/assets/characters/ctx-sent.svg" alt="" style={{ width: 64, height: 56, objectFit: 'contain', flexShrink: 0 }} />
              </div>
            </div>
          </DashCard>

          {/* ---- my account (489:4275) ---- */}
          <DashCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={cardTitleStyle}>My Account</h2>
              <Pill onClick={() => dispatch({ type: 'GOTO', screen: 'account' })}>Account Settings</Pill>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span
                aria-hidden
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--peri-200), var(--peach-200))',
                  border: '2px solid color-mix(in srgb, #fff 75%, transparent)',
                  boxShadow: '0 4px 5px rgba(28, 23, 70, 0.06), 0 2px 2px rgba(28, 23, 70, 0.06)',
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: 'var(--display-soft)',
                  fontWeight: 600,
                  fontSize: 24,
                  color: 'var(--ink-500)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {initial}
              </span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--ink-700)' }}>{name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emailAddr || 'you@example.com'}
                  </span>
                  <span style={{ background: 'var(--mint-200)', borderRadius: 999, padding: '2px 4px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, lineHeight: 1.2, color: 'var(--mint-600)', flexShrink: 0 }}>✓</span>
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--ink-400)' }}>No password — sign in with a code</span>
              </div>
            </div>
            {/* plan box (489:4291) — static demo copy until billing exists */}
            <div style={{ borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, backgroundImage: 'linear-gradient(100deg, var(--paper-1) 0%, #F1EEFB 50%, var(--peach-100) 100%)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ ...kickerStyle, letterSpacing: '0.05em' }}>My plan</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 18, color: 'var(--ink-800)' }}>Free</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-600)' }}>12 out of 20 messages used this cycle</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ background: 'var(--paper-0)', borderRadius: 12, boxShadow: '0 1px 4px rgba(21, 18, 62, 0.05)', overflow: 'hidden', width: '100%' }}>
                  <div style={{ height: 8, width: '59.5%', borderRadius: 12, boxShadow: '0 1px 4px rgba(21, 18, 62, 0.05)', backgroundImage: 'linear-gradient(90deg, var(--blue-500) 0%, var(--peri-400) 20%, var(--lilac-500) 40%, #C48CC0 60%, var(--coral-400) 75%, var(--peach-400) 100%)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)' }}>8 messages left · Resets Sep 1</span>
              </div>
              <Button variant="primary" size="md" disabled title="Coming soon" style={{ width: '100%', fontSize: 15, fontWeight: 600, letterSpacing: '0.02em' }}>
                (Coming soon) Upgrade to Unlimited
              </Button>
            </div>
          </DashCard>
          </div>

          <div className="bw-dash-col" style={{ flex: '424 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ---- what to do next (489:4217) ---- */}
          <DashCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={kickerStyle}>WHAT TO DO NEXT</span>
              {suggestions.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* the arrow art (circle + baked shadow) comes straight from the
                      frame; negative margins trim the 56px export down to the
                      36px circle so the 16px gap reads between the circles */}
                  {[
                    ['Previous suggestion', 'left', -1],
                    ['Next suggestion', 'right', +1],
                  ].map(([label, dir, step]) => (
                    <button key={dir} type="button" aria-label={label} onClick={() => setNextIdx((i) => i + step)} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex', width: 36, height: 36 }}>
                      <img src={`/ds-v35/assets/glyphs/home-arrow-${dir}.svg`} alt="" style={{ width: 56, height: 56, margin: '-6px -10px -14px -10px' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {suggestion ? (
              <NextCard suggestion={suggestion} onAct={actOn} />
            ) : (
              <div style={{ background: 'rgba(255, 253, 248, 0.9)', border: '1px solid rgba(255, 255, 255, 0.7)', borderRadius: 22, boxShadow: '0 2px 5px rgba(21, 18, 62, 0.07)', padding: '24px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                <img src="/ds-v35/assets/characters/ctx-courage.svg" alt="" style={{ width: 76 }} />
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
                  {threads ? 'All caught up — nothing waiting on you.' : 'Looking at your conversations…'}
                </p>
                {threads && (
                  <Button variant="spark" size="sm" onClick={() => dispatch({ type: 'RESTART' })}>Start something new ✦</Button>
                )}
              </div>
            )}
          </DashCard>

          {/* ---- my writing style (489:4310) ---- */}
          <DashCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={cardTitleStyle}>My Writing Style</h2>
              <Pill onClick={() => dispatch({ type: 'GOTO', screen: 'settings' })}>Edit Settings</Pill>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={kickerStyle}>DEFAULT WRITING TONES</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  ['Default tone: ', prefs.tone],
                  ['Default length: ', prefs.length],
                  ['Sign off as: ', `“${signoff}”`, true],
                ].map(([label, value, italic]) => (
                  <span key={label} style={{ background: 'color-mix(in srgb, var(--peri-200) 50%, transparent)', borderRadius: 999, padding: '8px 14px', fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.2, color: '#2B45D4', whiteSpace: 'nowrap' }}>
                    {label}
                    <span style={{ fontWeight: 600, fontStyle: italic ? 'italic' : undefined }}>{value}</span>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={kickerStyle}>DEFAULT VOICE - “WHO AM I?”</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {prefs.voices.map((v) => (
                    <span key={v} style={{ background: 'color-mix(in srgb, var(--mint-300) 50%, transparent)', borderRadius: 999, padding: '8px 14px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, lineHeight: 1.2, color: 'var(--mint-600)' }}>
                      {v}
                    </span>
                  ))}
                </div>
                <div style={{ background: 'color-mix(in srgb, var(--mint-300) 25%, transparent)', border: '1px solid var(--mint-300)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, color: 'var(--mint-600)' }}>Your Saved Voice Note:</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontStyle: 'italic', fontSize: 11, color: 'var(--ink-600)' }}>
                    “{prefs.voiceNote}”
                  </span>
                </div>
              </div>
            </div>
          </DashCard>
          </div>
        </div>
      </main>
    </div>
  )
}

// One suggestion (Figma "div" 489:4069) — frosted paper card: status badge,
// subject, meta, the thread's mascot, and the flow CTA bottom-right.
function NextCard({ suggestion: t, onAct }) {
  const { Button } = DS2
  const tone = NEXT_TONES[statusOf(t)]
  return (
    <div style={{ background: 'rgba(255, 253, 248, 0.9)', border: '1px solid rgba(255, 255, 255, 0.7)', borderRadius: 22, boxShadow: '0 2px 5px rgba(21, 18, 62, 0.07)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <span style={{ background: tone.badgeBg, borderRadius: 999, padding: '4px 10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10.5, lineHeight: 1.2, letterSpacing: '0.06em', color: tone.badgeInk, whiteSpace: 'nowrap' }}>
            {tone.badge(t)}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 20, lineHeight: '23px', color: 'var(--ink-900)' }}>
            {t.subject || 'Untitled'}
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.2, color: 'var(--ink-600)' }}>
            {toLabel(t.recipient)} · {tone.meta(t)}
          </span>
        </div>
        <img src={tone.art} alt="" style={{ width: 60, flexShrink: 0 }} />
      </div>
      <Button
        variant="spark"
        size="sm"
        onClick={() => onAct(t, tone.mode)}
        style={{ alignSelf: 'flex-end', fontSize: 12.5, fontWeight: 700, boxShadow: '0 6px 11px rgba(238, 134, 84, 0.42)' }}
      >
        {tone.cta}
      </Button>
    </div>
  )
}
