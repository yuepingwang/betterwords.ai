import React, { useEffect, useMemo, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { listThreads } from '../lib/db'
import { DEMO_THREADS } from '../lib/demo'
import { timeAgo } from '../lib/advisor'

// ------------------------------------------------------------------
// Conversations — every thread the user has, newest activity first.
// Signed out (or accounts unconfigured) it shows the demo threads, so
// the whole v3.5 flow stays browsable. Wireframe: "View All My
// Conversations".
// ------------------------------------------------------------------

export default function Conversations() {
  const { state, dispatch } = useStore()
  const auth = useAuth()
  const { Button, Icon } = DS2

  const [threads, setThreads] = useState(null) // null → loading
  const [query, setQuery] = useState('')
  const demo = !auth.signedIn

  useEffect(() => {
    let alive = true
    if (demo) {
      setThreads(DEMO_THREADS)
      return
    }
    setThreads(null)
    listThreads()
      .then((t) => alive && setThreads(t))
      .catch((err) => {
        console.warn('[conversations]', err?.message || err)
        if (alive) setThreads([])
      })
    return () => {
      alive = false
    }
  }, [demo, state.convoRefresh])

  const shown = useMemo(() => {
    if (!threads) return null
    const q = query.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) =>
      [t.subject, t.recipient, JSON.stringify(t.context?.answers || {})].join(' ').toLowerCase().includes(q)
    )
  }, [threads, query])

  return (
    <main style={{ maxWidth: 1060, width: '100%', margin: '0 auto', padding: '48px 32px 90px', boxSizing: 'border-box', flex: 1 }}>
      {/* title row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 40, lineHeight: 1.05, color: 'var(--text-strong)', margin: 0 }}>
            Conversations
          </h1>
          {demo && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-muted)', margin: '10px 0 0' }}>
              Sample conversations — {auth.configured ? 'sign in to see your own.' : 'connect an account to keep your own.'}
            </p>
          )}
        </div>
        <Button variant="spark" size="md" iconRight={<Icon name="plus" size={15} />} onClick={() => dispatch({ type: 'RESTART' })}>
          New conversation
        </Button>
      </div>

      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <input
          className="bw-field"
          placeholder="Search conversations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {/* loading */}
      {shown === null && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 180, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-hair)', background: 'var(--surface-card)', opacity: 0.55, animation: 'adv-pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}

      {/* empty */}
      {shown && shown.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)' }}>
          <img src="/ds-v35/assets/characters/ctx-waiting.svg" alt="" style={{ width: 96, marginBottom: 18 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 24, color: 'var(--text-strong)', margin: '0 0 8px' }}>
            {query ? 'Nothing matches that search' : 'No conversations yet'}
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-muted)', margin: '0 0 22px' }}>
            {query ? 'Try a different name or subject.' : 'Say the first hard thing — we’ll keep the thread from there.'}
          </p>
          {!query && (
            <Button variant="primary" size="md" onClick={() => dispatch({ type: 'RESTART' })}>Start your first message</Button>
          )}
        </div>
      )}

      {/* cards */}
      {shown && shown.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {shown.map((t) => (
            <ThreadCard key={t.id} thread={t} onOpen={() => dispatch({ type: 'OPEN_CONVERSATION', threadId: t.id })} />
          ))}
        </div>
      )}
    </main>
  )
}

// Status the card leads with — the "what happens next" read of the thread.
function statusChip(t) {
  if (!t.hasSent) return { label: 'Still in drafts', bg: 'var(--peri-100)', fg: 'var(--ink-700)' }
  if (t.awaiting) return { label: 'Waiting on them', bg: '#FBEED9', fg: '#8A5A18' }
  return { label: 'They replied', bg: '#DDF2E4', fg: '#1F6A43' }
}

function ThreadCard({ thread: t, onOpen }) {
  const chip = statusChip(t)
  // A one-line handle on what the thread is about: the writer's stated goal
  // if the clarify answers captured one, else the latest message snippet.
  const answers = t.context?.answers || {}
  const summary = answers.goal || answers.hope || Object.values(answers)[0] || ''
  return (
    <article
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      role="button"
      tabIndex={0}
      className="bw-convo-card"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-hair)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(28,23,70,0.05))',
        padding: '22px 24px 0',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow .2s var(--ease-out), transform .2s var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            To: <span style={{ color: 'var(--text-body)', fontWeight: 500 }}>{t.recipient || 'Someone'}</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 19, lineHeight: 1.25, color: 'var(--text-strong)', margin: 0 }}>
            Re: {t.subject || 'Untitled'}
          </h3>
        </div>
        <span style={{ flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', padding: '5px 10px', borderRadius: 999, background: chip.bg, color: chip.fg, whiteSpace: 'nowrap' }}>
          {chip.label}
        </span>
      </div>

      {summary && (
        <div style={{ marginTop: 14, background: 'color-mix(in srgb, var(--cream-1) 70%, transparent)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-md, 10px)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>Goal</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.45, color: 'var(--text-body)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {summary}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <div style={{ borderTop: '1px solid var(--border-hair)', margin: '0 -24px', padding: '12px 24px', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span><b style={{ color: 'var(--text-body)' }}>{t.counts.sent}</b> sent</span>
          <span>·</span>
          <span><b style={{ color: 'var(--text-body)' }}>{t.counts.drafts}</b> draft{t.counts.drafts === 1 ? '' : 's'}</span>
          <span>·</span>
          <span><b style={{ color: 'var(--text-body)' }}>{t.counts.replies}</b> repl{t.counts.replies === 1 ? 'y' : 'ies'}</span>
          <span style={{ marginLeft: 'auto' }}>{timeAgo(t.lastActivityAt)}</span>
        </div>
      </div>
    </article>
  )
}
