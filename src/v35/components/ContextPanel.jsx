import React, { useMemo, useState } from 'react'
import DS2 from '../ds2'
import { timeAgo, daysSince } from '../lib/advisor'

// ------------------------------------------------------------------
// ContextPanel — the 240px thread-context card from the Figma
// "My Messages" frame (445:1214): overview, meta rows, goal/concern/
// tone chips, and the "+ New Context" note-adder. Shared by the
// Conversation page and the Composer's reply/follow-up mode (449:3223).
// ------------------------------------------------------------------

// The cool slate well behind the overview/chat surfaces; the warm Daybreak
// papers have no similarly-cool neutral, so it stays literal.
export const SLATE_WELL = '#F8FAFC'

// "Your landlord — Mr. Aubert" → "your landlord" for mid-sentence use.
export const shortName = (recipient) => {
  const r = (recipient || 'them').split(/[—·]/)[0].trim()
  return r.charAt(0).toLowerCase() + r.slice(1)
}
export const initialOf = (r) => (r || '?').replace(/^your\s+/i, '').charAt(0).toUpperCase()

export const Kicker = ({ size = 10, children }) => (
  <div style={{ fontFamily: 'var(--font-sans)', fontSize: size, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{children}</div>
)

const CtxChip = ({ children }) => (
  <span style={{ background: 'rgba(21, 18, 62, 0.05)', borderRadius: 4, padding: '4px 10px', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>
    {children}
  </span>
)

function CtxSection({ title, values }) {
  if (!values.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Kicker>{title}</Kicker>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {values.map((v) => (
          <CtxChip key={v}>{v}</CtxChip>
        ))}
      </div>
    </div>
  )
}

// Tone slider value → the label the panel shows.
const toneLabel = (t) => (t == null ? null : t < 34 ? 'Gentle' : t < 67 ? 'Moderate' : 'Assertive')

// `frost` — the composer's reply/follow-up flow (Figma 449:6492) renders
// this card in the clarify-recap's glass instead of solid paper, matching
// the sidebar treatment on that screen. The conversation page keeps paper.
export function ContextPanel({ thread, msgs, drafts, frost = false }) {
  const { Badge } = DS2
  const answers = thread.context?.answers || {}
  const status = !thread.hasSent ? { tone: 'accent', tag: 'Draft' } : thread.awaiting ? { tone: 'warning', tag: 'Awaiting reply' } : { tone: 'success', tag: 'Replied' }

  // "+ New Context" — extra notes the writer wants the next draft to carry.
  // View state for now (not persisted); they render as chips like the rest.
  const [notes, setNotes] = useState([])
  const [adding, setAdding] = useState(false)
  const [noteText, setNoteText] = useState('')

  // Mean days between each outbound message and the reply that followed it;
  // while waiting, the current open wait counts too.
  const avgWait = useMemo(() => {
    const waits = []
    let openSince = null
    msgs.forEach((m) => {
      if (m.kind === 'sent' || m.kind === 'followup') openSince = m.created_at
      else if (m.kind === 'reply' && openSince) {
        waits.push(daysSince(openSince) - daysSince(m.created_at))
        openSince = null
      }
    })
    if (openSince) waits.push(daysSince(openSince))
    if (!waits.length) return null
    const mean = Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
    return `${mean} day${mean === 1 ? '' : 's'}`
  }, [msgs])

  // One-glance read of where the thread stands, in the panel's italic voice.
  const overview = useMemo(() => {
    const name = shortName(thread.recipient)
    const sent = thread.counts?.sent ?? 0
    if (!thread.hasSent) return `Still in drafts — ${drafts.length} version${drafts.length === 1 ? '' : 's'} shaped, nothing sent to ${name} yet.`
    const base = `${sent} message${sent === 1 ? '' : 's'} sent to ${name}.`
    if (thread.awaiting) {
      const d = daysSince([...msgs].reverse().find((m) => m.kind !== 'reply')?.created_at)
      return `${base} No reply yet — it’s been ${d} day${d === 1 ? '' : 's'} since your last message.`
    }
    return `${base} They replied — the next move is yours.`
  }, [thread, msgs, drafts])

  const lastTone = [...(thread.messages || [])].reverse().find((m) => m.context?.tone != null)?.context?.tone
  const tones = [toneLabel(lastTone)].filter(Boolean)

  const addNote = () => {
    const t = noteText.trim()
    if (t) setNotes((n) => [...n, t])
    setNoteText('')
    setAdding(false)
  }

  return (
    <aside
      className={frost ? 'bw-recap-frost' : undefined}
      style={{
        width: 240,
        flexShrink: 0,
        boxSizing: 'border-box',
        borderRadius: frost ? 'var(--radius-lg)' : 'var(--radius-md)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        ...(frost
          ? {}
          : { background: 'var(--surface-card)', filter: 'drop-shadow(0 4px 5px rgba(28, 23, 70, 0.06))' }),
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            aria-hidden
            style={{ width: 20, height: 20, backgroundColor: 'var(--ink-700)', WebkitMaskImage: 'url(/ds-v35/assets/glyphs/convo-caret.svg)', maskImage: 'url(/ds-v35/assets/glyphs/convo-caret.svg)', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}
          />
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: 'var(--ink-900)' }}>Context</span>
        </div>
        <Badge tone={status.tone} size="sm">{status.tag}</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Kicker size={11}>Overview</Kicker>
          <div style={{ background: SLATE_WELL, borderRadius: 10, padding: '10px 12px', boxShadow: 'var(--shadow-xs)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontStyle: 'italic', fontWeight: 300, fontSize: 11, lineHeight: 1.5, color: 'var(--blue-700)', margin: 0 }}>
              {overview}
            </p>
          </div>
        </div>

        {/* meta rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Kicker>Last update:</Kicker>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, color: 'var(--blue-700)' }}>{timeAgo(thread.lastActivityAt)}</span>
          </div>
          {avgWait && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Kicker>Average wait time:</Kicker>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, color: 'var(--blue-700)' }}>{avgWait}</span>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(21, 18, 62, 0.06)' }} />

        <CtxSection title="Conversation Goal" values={[answers.goal || answers.hope].filter(Boolean)} />
        <CtxSection title="Concerns" values={[answers.fear, answers.pattern, answers.issue].filter(Boolean)} />
        <CtxSection title="Chosen Tone Voice" values={tones} />
        <CtxSection title="Notes" values={notes} />
      </div>

      {/* + New Context */}
      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            className="bw-field"
            autoFocus
            placeholder="e.g. they’re away until Friday"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => (e.key === 'Enter' ? addNote() : e.key === 'Escape' ? setAdding(false) : null)}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, height: 36, padding: '0 12px' }}
          />
          <button
            onClick={addNote}
            style={{ border: 0, background: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: 'var(--radius-pill)', height: 32, fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ width: '100%', height: 38, border: '1.5px solid transparent', borderRadius: 'var(--radius-pill)', background: 'var(--paper-0)', boxShadow: 'var(--shadow-sm)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', color: 'var(--accent)', cursor: 'pointer' }}
        >
          + New Context
        </button>
      )}
    </aside>
  )
}
