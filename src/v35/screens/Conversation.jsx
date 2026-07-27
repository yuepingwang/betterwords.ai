import React, { useEffect, useMemo, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { fetchThread, recordReply } from '../lib/db'
import { getDemoThread, DEMO_THREADS } from '../lib/demo'
import { ContextPanel, SLATE_WELL, shortName, initialOf } from '../components/ContextPanel'

// ------------------------------------------------------------------
// Conversation — one thread's timeline (Figma "My Messages", 445:1209):
// a 240px Context panel beside a chat-style timeline card. The card's
// footer bar is the branch that drives the whole v3.5 flow — what you
// can do next depends on whether they've replied since your last
// message:
//   drafts only → continue drafting
//   awaiting    → "Still waiting?" (follow-up) · "They replied?"
//                 (inline paste → respond flow)
//   replied     → "Help me respond ✦"
// Shares the My Conversations ground: main body fills the viewport,
// daybreak rainbow at the fold, night footer below.
// ------------------------------------------------------------------

// "Jan 15, 2:14 PM"
const stampLabel = (iso) => {
  const d = new Date(iso)
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
}

export default function Conversation() {
  const { state, dispatch } = useStore()
  const auth = useAuth()
  const { Button } = DS2

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
        <Button variant="ghost" size="md" onClick={() => dispatch({ type: 'OPEN_CONVERSATIONS' })}>← My Conversations</Button>
      </main>
    )
  }
  if (!thread) {
    return <main style={{ flex: 1, minHeight: '60vh' }} />
  }

  const msgs = (thread.messages || []).filter((m) => m.kind !== 'draft_version')
  const drafts = (thread.messages || []).filter((m) => m.kind === 'draft_version')
  const lastReply = [...msgs].reverse().find((m) => m.kind === 'reply')

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

  // Pasted reply → keep the timeline truthful (best-effort when signed in),
  // then the respond flow takes over.
  const submitPastedReply = (text) => {
    if (auth.signedIn) {
      recordReply({ threadId: thread.id, body: text }).catch((err) => console.warn('[record reply]', err?.message || err))
    }
    startFlow('respond', text)
  }

  return (
    // Same ground contract as My Conversations: the main body (Figma
    // 445:1210) fills the viewport below the 68px header, rainbow at the
    // fold, night footer under it.
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundImage:
          'linear-gradient(180deg, var(--paper-1) 90%, var(--honey-400) 93%, var(--coral-400) 96%, var(--lilac-500) 98%, var(--blue-500) 100%)',
      }}
    >
      <main style={{ maxWidth: 1152, width: '100%', margin: '0 auto', padding: '14px 24px 44px', boxSizing: 'border-box', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <a
          onClick={() => dispatch({ type: 'OPEN_CONVERSATIONS' })}
          style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', display: 'inline-block', margin: '0 0 20px', alignSelf: 'flex-start' }}
        >
          ← My Conversations
        </a>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', flex: 1 }}>
          <ContextPanel thread={thread} msgs={msgs} drafts={drafts} />
          <TimelineCard
            thread={thread}
            msgs={msgs}
            drafts={drafts}
            lastReply={lastReply}
            onFollowup={() => startFlow('followup')}
            onRespond={() => startFlow('respond', lastReply?.body || '')}
            onPasteReply={submitPastedReply}
            onContinueDrafting={continueDrafting}
          />
        </div>
      </main>
    </div>
  )
}

// ---- Timeline card (Figma 445:1260) --------------------------------

function TimelineCard({ thread, msgs, drafts, lastReply, onFollowup, onRespond, onPasteReply, onContinueDrafting }) {
  const name = shortName(thread.recipient)
  const properName = name.charAt(0).toUpperCase() + name.slice(1)
  const [pasting, setPasting] = useState(false)

  return (
    <section style={{ flex: 1, minWidth: 380, display: 'flex', flexDirection: 'column', minHeight: 620, filter: 'drop-shadow(0 4px 5px rgba(28, 23, 70, 0.06))' }}>
      {/* header */}
      <div style={{ background: 'var(--surface-card)', borderBottom: '1px solid rgba(28, 23, 70, 0.06)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--ink-600)', marginBottom: 2 }}>
          To: {(thread.recipient || 'Someone').split(/[—·]/)[0].trim()}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 17, lineHeight: 1.15, color: 'var(--ink-900)' }}>
          Re: {thread.subject || 'Untitled'}
        </div>
      </div>

      {/* chat canvas */}
      <div style={{ background: SLATE_WELL, flex: 1, overflowY: 'auto', padding: '12px 48px 12px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {msgs.length === 0 && (
            <CenterNote
              art="/ds-v35/assets/characters/ctx-waiting.svg"
              title="Nothing sent yet"
              caption={`${drafts.length} draft version${drafts.length === 1 ? '' : 's'} shaped so far — pick it up below when you’re ready.`}
            />
          )}

          {msgs.map((m) => (
            <TimelineSegment key={m.id} msg={m} thread={thread} />
          ))}

          {thread.hasSent && thread.awaiting && (
            <CenterNote
              art="/ds-v35/assets/characters/convo-waiting-snail.svg"
              title={`Have you heard back from ${name}?`}
              caption="Draft a polite nudge or paste their response when they reply below."
            />
          )}
          {thread.hasSent && !thread.awaiting && (
            <CenterNote
              title="What would you like to say back?"
              caption="Betterwords can read their reply with you and shape the response below."
            />
          )}
        </div>
      </div>

      {/* action bar — the branch */}
      <div style={{ background: 'var(--surface-card)', borderTop: '1px solid rgba(28, 23, 70, 0.06)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: 16 }}>
        {!thread.hasSent ? (
          <PromptCard tint="peri" title="Still in drafts" caption="Pick up where you left off — your context and drafts are saved here.">
            <PillButton kind="accent" onClick={onContinueDrafting}>Continue drafting</PillButton>
          </PromptCard>
        ) : pasting ? (
          <PastePanel
            name={name}
            onCancel={() => setPasting(false)}
            onSubmit={(text) => {
              setPasting(false)
              onPasteReply(text)
            }}
          />
        ) : thread.awaiting ? (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <PromptCard tint="warm" title="Still waiting?" caption="Get help writing a gentle reminder follow-up.">
              <PillButton kind="spark" onClick={onFollowup}>Polish nudge ✦</PillButton>
            </PromptCard>
            <PromptCard tint="peri" title="They replied?" caption="Paste their answer to craft your reply draft.">
              <PillButton kind="accent" onClick={() => setPasting(true)}>Draft response</PillButton>
            </PromptCard>
          </div>
        ) : (
          <PromptCard tint="peri" title={`${properName} replied — want a hand?`} caption="Betterwords reads their message with you and shapes the response.">
            <PillButton kind="ghost" onClick={onFollowup}>Follow up instead</PillButton>
            <PillButton kind="accent" onClick={onRespond}>Help me respond ✦</PillButton>
          </PromptCard>
        )}
      </div>
    </section>
  )
}

function TimelineSegment({ msg, thread }) {
  const isYou = msg.kind !== 'reply'
  const properName = (() => {
    const n = shortName(thread.recipient)
    return n.charAt(0).toUpperCase() + n.slice(1)
  })()
  const header = msg.kind === 'sent' ? 'You sent a message' : msg.kind === 'followup' ? 'You sent a follow-up' : `${properName} replied`
  const paras = (msg.body || '').split(/\n\n+/)
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', filter: 'drop-shadow(0 4px 5px rgba(28, 23, 70, 0.06))' }}>
      <span
        aria-hidden
        style={{ width: 27, height: 27, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#fff', background: isYou ? 'var(--accent)' : 'var(--peach-500)' }}
      >
        {isYou ? 'Y' : initialOf(thread.recipient)}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '5px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)' }}>{header}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{stampLabel(msg.created_at)}</span>
        </div>
        <div style={{ background: isYou ? 'var(--peri-100)' : 'var(--paper-0)', border: isYou ? 'none' : '1px solid var(--border-hair)', borderRadius: 10, padding: 16 }}>
          {paras.map((p, i) => (
            <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', color: 'var(--ink-700)', margin: i === 0 ? 0 : '10px 0 0' }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// Centered note on the chat canvas (the snail "have you heard back?" beat).
function CenterNote({ art, title, caption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0', textAlign: 'center' }}>
      {art && <img src={art} alt="" style={{ width: 116, maxHeight: 78, objectFit: 'contain' }} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 16, color: 'var(--ink-800)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)' }}>{caption}</div>
      </div>
    </div>
  )
}

// ---- action-bar prompt cards (Figma 445:1385 / 445:1391) -----------

function PromptCard({ tint, title, caption, children }) {
  // warm: the follow-up nudge; peri: the respond path. Warm's exact fills sit
  // between Daybreak tokens, so the bg stays literal with peach-100 edging.
  const skin =
    tint === 'warm'
      ? { background: '#FFF9ED', border: '1px solid var(--peach-100)' }
      : { background: 'var(--peri-100)', border: '1px solid var(--peri-200)' }
  return (
    <div style={{ ...skin, flex: 1, minWidth: 300, borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 15, color: 'var(--ink-800)' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)' }}>{caption}</span>
      </div>
      {children}
    </div>
  )
}

function PillButton({ kind, onClick, children }) {
  const skins = {
    accent: { background: 'var(--accent)', color: 'var(--text-on-accent)' },
    spark: { background: 'var(--spark)', color: 'var(--paper-0)' },
    ghost: { background: 'transparent', color: 'var(--accent)' },
  }
  return (
    <button
      onClick={onClick}
      className="bw-cvt-pill"
      style={{ ...skins[kind], border: 0, borderRadius: 'var(--radius-pill)', padding: '10px 16px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}
    >
      {children}
    </button>
  )
}

// The "They replied? Paste their answer" gap-fill: the action bar itself
// becomes the paste surface, then hands off to the respond flow.
function PastePanel({ name, onCancel, onSubmit }) {
  const [text, setText] = useState('')
  return (
    <div style={{ background: 'var(--peri-100)', border: '1px solid var(--peri-200)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 15, color: 'var(--ink-800)' }}>What did {name} say?</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)' }}>Paste their reply — Betterwords reads it with you, then shapes your response.</span>
      </div>
      <textarea
        className="bw-field"
        autoFocus
        rows={4}
        placeholder="Paste their message here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.5, background: 'var(--paper-0)' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <PillButton kind="ghost" onClick={onCancel}>Cancel</PillButton>
        <PillButton kind="accent" onClick={() => text.trim() && onSubmit(text.trim())}>Interpret &amp; draft ✦</PillButton>
      </div>
    </div>
  )
}
