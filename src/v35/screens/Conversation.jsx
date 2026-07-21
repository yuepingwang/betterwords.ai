import React, { useEffect, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { fetchThread, recordReply } from '../lib/db'
import { getDemoThread, DEMO_THREADS } from '../lib/demo'
import { timeAgo, daysSince } from '../lib/advisor'

// ------------------------------------------------------------------
// Conversation — one thread's timeline, and the branch that drives the
// whole v3.5 flow: what you can do next depends on whether they've
// replied since your last message. Wireframes: "Open an existing
// conversation — …has gotten a response / …no reply yet".
// ------------------------------------------------------------------

const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })

export default function Conversation() {
  const { state, dispatch } = useStore()
  const auth = useAuth()
  const { Button, Icon } = DS2

  const [thread, setThread] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setError(null)
    const id = state.activeThreadId
    if (!auth.signedIn) {
      // Demo mode — fall back to the replied sample so deep links always land.
      setThread(getDemoThread(id) || DEMO_THREADS[0])
      return
    }
    setThread(null)
    fetchThread(id)
      .then((t) => alive && setThread(t))
      .catch((err) => alive && setError(err?.message || String(err)))
    return () => {
      alive = false
    }
  }, [state.activeThreadId, state.convoRefresh, auth.signedIn])

  if (error) {
    return (
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '60px 32px', textAlign: 'center', flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--text-muted)' }}>Couldn’t open this conversation — {error}</p>
        <Button variant="ghost" size="md" onClick={() => dispatch({ type: 'OPEN_CONVERSATIONS' })}>← All conversations</Button>
      </main>
    )
  }
  if (!thread) {
    return <main style={{ flex: 1, minHeight: '60vh' }} />
  }

  const msgs = (thread.messages || []).filter((m) => m.kind !== 'draft_version')
  const drafts = (thread.messages || []).filter((m) => m.kind === 'draft_version')
  const lastReply = [...msgs].reverse().find((m) => m.kind === 'reply')
  const lastEvent = msgs[msgs.length - 1]
  const answers = thread.context?.answers || {}
  const sinceDays = lastEvent ? daysSince(lastEvent.created_at) : 0

  const startFlow = (mode, replyText) =>
    dispatch({ type: 'START_REPLY_FLOW', mode, replyText, thread })

  // Resume a drafts-only thread in the composer, carrying the thread context.
  const continueDrafting = () => {
    const last = drafts[drafts.length - 1]
    dispatch({ type: 'START_REPLY_FLOW', mode: 'draft', thread })
    dispatch({
      type: 'OPEN_COMPOSER',
      idx: last?.context?.strategyIdx ?? 1,
      toneDefault: last?.context?.tone ?? 50,
      paras: last ? last.body.split(/\n\n+/) : null,
    })
  }

  return (
    <main style={{ maxWidth: 880, width: '100%', margin: '0 auto', padding: '48px 32px 90px', boxSizing: 'border-box', flex: 1 }}>
      {/* back link */}
      <a
        onClick={() => dispatch({ type: 'OPEN_CONVERSATIONS' })}
        style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', display: 'inline-block', marginBottom: 20 }}
      >
        ← All conversations
      </a>

      {/* header */}
      <header style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>
          To: <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>{thread.recipient || 'Someone'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 36, lineHeight: 1.1, color: 'var(--text-strong)', margin: 0 }}>
            Re: {thread.subject || 'Untitled'}
          </h1>
          {thread.hasSent && (
            <Button
              variant="primary"
              size="md"
              iconRight={<Icon name="plus" size={14} />}
              onClick={() => startFlow('followup')}
            >
              New message
            </Button>
          )}
        </div>
        {lastEvent && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 10 }}>
            Last correspondence: {timeAgo(lastEvent.created_at)}
          </div>
        )}
        {/* context chips — the thread remembers why you're writing */}
        {Object.keys(answers).length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {[
              ['Goal', answers.goal || answers.hope],
              ['Concern', answers.fear],
              ['So far', answers.rel],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <span key={k} style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 999, padding: '6px 12px', color: 'var(--text-body)' }}>
                  <b style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 10.5, color: 'var(--accent)', marginRight: 6 }}>{k}</b>
                  {v}
                </span>
              ))}
          </div>
        )}
      </header>

      <div style={{ borderBottom: '1px solid var(--border-hair)', margin: '20px 0 26px' }} />

      {/* timeline */}
      <div style={{ position: 'relative', paddingLeft: 22 }}>
        {/* the dotted spine */}
        <span aria-hidden style={{ position: 'absolute', left: 3, top: 8, bottom: 8, borderLeft: '2px dotted color-mix(in srgb, var(--accent) 35%, transparent)' }} />

        {msgs.length === 0 && (
          <TimelineNote label="Not sent yet">
            This message is still taking shape — {drafts.length} draft version{drafts.length === 1 ? '' : 's'} so far.
          </TimelineNote>
        )}

        {msgs.map((m) => (
          <TimelineEntry key={m.id} msg={m} thread={thread} draftsCount={m.kind !== 'reply' ? drafts.length : 0} />
        ))}

        {/* today marker + the branch */}
        <div style={{ position: 'relative', marginTop: 26 }}>
          <TimelineDot />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, marginBottom: 14 }}>
            <b style={{ color: 'var(--text-strong)' }}>Today</b>{' '}
            <span style={{ color: 'var(--text-muted)' }}>
              {!thread.hasSent
                ? 'Ready when you are.'
                : thread.awaiting
                  ? `It’s been ${sinceDays} day${sinceDays === 1 ? '' : 's'} since you messaged ${shortName(thread.recipient)}.`
                  : `It’s been ${sinceDays} day${sinceDays === 1 ? '' : 's'} since their reply.`}
            </span>
          </div>

          {!thread.hasSent ? (
            <NextCard tint="peri">
              <div style={{ flex: 1, minWidth: 220 }}>
                <NextTitle>Still in drafts</NextTitle>
                <NextBody>Pick up where you left off — your context and drafts are saved here.</NextBody>
              </div>
              <Button variant="primary" size="md" onClick={continueDrafting}>Continue drafting</Button>
            </NextCard>
          ) : thread.awaiting ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <PasteReplyCard
                onSubmit={(text) => {
                  // Keep the timeline truthful before drafting: the pasted
                  // reply becomes part of the thread (best-effort when
                  // signed in), then the respond flow takes over.
                  if (auth.signedIn) {
                    recordReply({ threadId: thread.id, body: text }).catch((err) => console.warn('[record reply]', err?.message || err))
                  }
                  startFlow('respond', text)
                }}
              />
              <NextCard tint="warm">
                <div style={{ flex: 1, minWidth: 200 }}>
                  <NextTitle>Are you still waiting?</NextTitle>
                  <NextBody>Let Betterwords help you determine how to follow up.</NextBody>
                </div>
                <Button variant="spark" size="md" onClick={() => startFlow('followup')}>Help me draft the follow-up ✦</Button>
              </NextCard>
            </div>
          ) : (
            <NextCard tint="warm">
              <div style={{ flex: 1, minWidth: 240 }}>
                <NextTitle>They replied — want a hand?</NextTitle>
                <NextBody>Let Betterwords read {shortName(thread.recipient)}’s message with you and shape the response.</NextBody>
              </div>
              <Button variant="spark" size="lg" onClick={() => startFlow('respond', lastReply?.body || '')}>
                Help me draft a response ✦
              </Button>
            </NextCard>
          )}
        </div>
      </div>
    </main>
  )
}

// "Your landlord — Mr. Aubert" → "your landlord" for mid-sentence use.
function shortName(recipient) {
  const r = (recipient || 'them').split(/[—·]/)[0].trim()
  return r.charAt(0).toLowerCase() + r.slice(1)
}

function TimelineDot() {
  return (
    <span aria-hidden style={{ position: 'absolute', left: -26, top: 3, width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent)' }} />
  )
}

function TimelineNote({ label, children }) {
  return (
    <div style={{ position: 'relative', marginBottom: 26 }}>
      <TimelineDot />
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, marginBottom: 8 }}>
        <b style={{ color: 'var(--text-strong)' }}>{label}</b>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-muted)' }}>{children}</div>
    </div>
  )
}

const KIND_META = {
  sent: { who: 'You', status: 'Marked as sent' },
  followup: { who: 'You', status: 'Follow-up · sent' },
  reply: { who: null, status: null },
}

function TimelineEntry({ msg, thread, draftsCount }) {
  const [open, setOpen] = useState(false)
  const meta = KIND_META[msg.kind] || KIND_META.sent
  const isYou = msg.kind !== 'reply'
  const who = isYou ? 'You' : (thread.recipient || 'Them').split(/[—·]/)[0].trim()
  // Avatar initial — for "Your landlord" use L, not Y (which is You's).
  const initial = (isYou ? 'Y' : who.replace(/^your\s+/i, '').charAt(0)).toUpperCase()
  const paras = (msg.body || '').split(/\n\n+/)
  const preview = !open && paras.length > 1

  return (
    <div style={{ position: 'relative', marginBottom: 26 }}>
      <TimelineDot />
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, marginBottom: 10 }}>
        <b style={{ color: 'var(--text-strong)' }}>{dateLabel(msg.created_at)}</b>
      </div>
      <article style={{ background: isYou ? 'var(--surface-card)' : 'color-mix(in srgb, var(--peach-100, #FBEDE3) 60%, var(--surface-card))', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(28,23,70,0.05))', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border-hair)' }}>
          <span aria-hidden style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink-800)', background: isYou ? 'var(--peri-200, #DCD9F6)' : 'var(--peach-200, #F6D9C4)' }}>
            {initial}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 15.5, color: 'var(--text-strong)' }}>{who}</div>
            {isYou && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)' }}>To: {(thread.recipient || '').split(/[—·]/)[0].trim()}</div>}
          </div>
          {meta.status && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: 'var(--peri-100, #EBE9FA)', color: 'var(--ink-700)', whiteSpace: 'nowrap' }}>
              {meta.status}
            </span>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--accent)', background: 'transparent', border: '1px solid var(--border-hair)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {open ? 'Collapse' : 'View message'}
          </button>
        </div>
        <div style={{ padding: '16px 20px 18px' }}>
          {(open ? paras : paras.slice(0, 1)).map((p, i) => (
            <p key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-body)', margin: i === 0 ? 0 : '12px 0 0', ...(preview && i === 0 ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}) }}>
              {p}
            </p>
          ))}
          {preview && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-faint)', marginTop: 8 }}>…</div>
          )}
          {isYou && draftsCount > 0 && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-faint)', marginTop: 12 }}>
              {draftsCount} earlier draft version{draftsCount === 1 ? '' : 's'} kept
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

// The action cards under "Today".
function NextCard({ tint, children }) {
  return (
    <div
      style={{
        background: tint === 'warm' ? 'color-mix(in srgb, var(--peach-100, #FBEDE3) 45%, var(--surface-card))' : 'var(--surface-card)',
        border: '1px solid var(--border-hair)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
  )
}
const NextTitle = ({ children }) => (
  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 17.5, color: 'var(--text-strong)', marginBottom: 4 }}>{children}</div>
)
const NextBody = ({ children }) => (
  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)' }}>{children}</div>
)

function PasteReplyCard({ onSubmit }) {
  const { Button } = DS2
  const [text, setText] = useState('')
  return (
    <NextCard tint="peri">
      <div style={{ flex: 1, minWidth: 240 }}>
        <NextTitle>Have they replied?</NextTitle>
        <NextBody>Paste their message here so Betterwords can help you respond.</NextBody>
        <textarea
          className="bw-field"
          rows={3}
          placeholder="Paste their message here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', marginTop: 12, resize: 'vertical', fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.5 }}
        />
        <div style={{ marginTop: 12 }}>
          <Button variant="primary" size="md" disabled={!text.trim()} onClick={() => text.trim() && onSubmit(text.trim())}>
            Draft response
          </Button>
        </div>
      </div>
    </NextCard>
  )
}
