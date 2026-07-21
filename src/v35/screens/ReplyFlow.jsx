import React, { useEffect, useMemo, useRef, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { interpretReply, draftNextMessage, followupMoves, daysSince } from '../lib/advisor'
import { DEMO_THREADS } from '../lib/demo'

// ------------------------------------------------------------------
// ReplyFlow — "reading the reply, then finding the next move."
//   respond:  interpret their reply (step 1) → choose a move (step 2)
//             → Betterwords pre-drafts the response → composer
//   followup: no reply to read, so straight to choosing the follow-up
//             move → pre-draft → composer
// Wireframe: How_to_reply.pdf (DR-1 … DR-4).
// ------------------------------------------------------------------

export default function ReplyFlow() {
  const { state, dispatch } = useStore()
  const { Button } = DS2

  // Deep-link/demo resilience: land here without a flow → use the sample.
  // `?screen=replyflow[&mode=followup][&step=moves]` for design review.
  const params = new URLSearchParams(window.location.search)
  const flow = state.replyFlow || {
    mode: params.get('mode') === 'followup' ? 'followup' : 'respond',
    replyText: DEMO_THREADS[0].messages.find((m) => m.kind === 'reply')?.body,
    thread: params.get('mode') === 'followup' ? DEMO_THREADS[1] : DEMO_THREADS[0],
  }
  const { mode, replyText, thread } = flow

  // Coming back from the composer resumes where the flow left off (the
  // store's replyFlow carries step + the cached interpretation).
  const [step, setStep] = useState(
    flow.step || (mode === 'respond' && params.get('step') !== 'moves' ? 'interpret' : 'moves')
  )
  const [reading, setReading] = useState(flow.reading || null) // interpretation result
  const [drafting, setDrafting] = useState(false)
  const [error, setError] = useState(null)
  const ran = useRef(false)

  const msgs = thread?.messages || []
  const lastSent = [...msgs].reverse().find((m) => m.kind === 'sent' || m.kind === 'followup')
  const waitedDays = lastSent ? daysSince(lastSent.created_at) : 3

  // Read the reply once on entry (respond mode) — skipped when a cached
  // interpretation came back with us from the composer.
  useEffect(() => {
    if (mode !== 'respond' || ran.current || reading) return
    ran.current = true
    interpretReply({
      scenarioId: thread?.scenarioId,
      thread,
      lastSentBody: lastSent?.body,
      replyText,
      answers: thread?.context?.answers,
    })
      .then((r) => {
        setReading(r)
        dispatch({ type: 'PATCH_REPLY_FLOW', patch: { reading: r } })
      })
      .catch((err) => setError(err?.message || String(err)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const moves = useMemo(
    () => (mode === 'respond' ? reading?.moves || [] : followupMoves(waitedDays)),
    [mode, reading, waitedDays]
  )

  const draftMove = async (move) => {
    setDrafting(true)
    setError(null)
    // The composer's back link returns here — make sure it reopens on the
    // moves step, not a fresh interpretation.
    dispatch({ type: 'PATCH_REPLY_FLOW', patch: { step: 'moves' } })
    try {
      const result = await draftNextMessage({
        scenarioId: thread?.scenarioId,
        thread,
        lastSentBody: lastSent?.body,
        replyText,
        move,
        mode,
        answers: thread?.context?.answers,
      })
      // Hand the composer everything it needs to treat this like an
      // AI-generated strategy: the pristine draft (so retune & co. use the
      // real model paths), the move's name, and the model's own "why".
      dispatch({
        type: 'PATCH_REPLY_FLOW',
        patch: { draftParas: result.paragraphs, moveTitle: move.title, draftWhy: result.why || null },
      })
      dispatch({
        type: 'OPEN_COMPOSER',
        idx: state.selectedIdx ?? 1,
        toneDefault: move.mode === 'firm' ? 72 : move.mode === 'wait' ? 28 : 46,
        paras: result.paragraphs,
      })
    } catch (err) {
      setError(err?.message || String(err))
      setDrafting(false)
    }
  }

  const stepLabel =
    mode === 'followup'
      ? 'Choose a follow-up'
      : step === 'interpret'
        ? 'Step 1 of 2 · Interpret'
        : 'Step 2 of 2 · Choose a move'

  return (
    <main style={{ maxWidth: 880, width: '100%', margin: '0 auto', padding: '44px 32px 90px', boxSizing: 'border-box', flex: 1 }}>
      {/* top rail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 34 }}>
        <a
          onClick={() =>
            step === 'moves' && mode === 'respond'
              ? setStep('interpret')
              : dispatch(thread?.id ? { type: 'OPEN_CONVERSATION', threadId: thread.id } : { type: 'OPEN_CONVERSATIONS' })
          }
          style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}
        >
          ‹ {step === 'moves' && mode === 'respond' ? 'Interpretation' : 'Conversation'}
        </a>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>{stepLabel}</span>
      </div>

      {drafting ? (
        <Centered>
          <Shimmer />
          <h1 style={h1Style}>Drafting your {mode === 'followup' ? 'follow-up' : 'response'}…</h1>
          <p style={leadStyle}>Shaping it around the move you chose. You’ll be able to tune every word.</p>
        </Centered>
      ) : mode === 'respond' && step === 'interpret' ? (
        !reading && !error ? (
          <Centered>
            <Shimmer />
            <h1 style={h1Style}>Reading what they said…</h1>
            <p style={leadStyle}>Looking at the tone, what they committed to, and whether your ask actually got answered.</p>
          </Centered>
        ) : error ? (
          <Centered>
            <p style={leadStyle}>Couldn’t read the reply — {error}</p>
          </Centered>
        ) : (
          <Interpretation reading={reading} thread={thread} onNext={() => setStep('moves')} />
        )
      ) : (
        <MovesStep mode={mode} moves={moves} reading={reading} waitedDays={waitedDays} error={error} onDraft={draftMove} />
      )}
    </main>
  )
}

// ---- step 1 · "Here's what we're hearing" -------------------------

function Interpretation({ reading, thread, onNext }) {
  const { Button } = DS2
  const from = (thread?.recipient || 'their').split(/[—·]/)[0].trim().toLowerCase()
  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <img src="/ds-v35/assets/characters/chameleon.svg" alt="" style={{ width: 64, flexShrink: 0 }} />
        <div>
          <h1 style={{ ...h1Style, margin: 0 }}>Here’s what we’re hearing</h1>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>
            From {from}’s reply
          </div>
        </div>
      </header>

      <section style={cardStyle}>
        {/* classification chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <Chip bg="var(--peri-100, #EBE9FA)" fg="var(--ink-700)">💬 {reading.kind}</Chip>
          {reading.flag && <Chip bg="#FBEED9" fg="#8A5A18">⏳ {reading.flag}</Chip>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '22px 34px' }}>
          {/* their tone */}
          <div>
            <Kicker>Their tone</Kicker>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--text-strong)', margin: '6px 0 10px' }}>
              {reading.tone?.label}
            </div>
            <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'linear-gradient(90deg, #E2A79A, #EFD9A7, #9BD4B4)' }}>
              <span style={{ position: 'absolute', top: -3, left: `calc(${Math.max(4, Math.min(96, reading.tone?.warmth ?? 50))}% - 7px)`, width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '3px solid var(--ink-800)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--text-faint)', marginTop: 6 }}>
              <span>Hostile</span>
              <span>Warm</span>
            </div>
          </div>
          {/* did it meet the need */}
          <div>
            <Kicker>Did it meet your need?</Kicker>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 8px' }}>
              <span aria-hidden style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: reading.met?.score === 'yes' ? '#5FBF87' : reading.met?.score === 'no' ? '#DE8272' : '#E9B44C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                {reading.met?.score === 'yes' ? '✓' : reading.met?.score === 'no' ? '✕' : '–'}
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--text-strong)' }}>{reading.met?.label}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>{reading.met?.note}</p>
          </div>
        </div>
      </section>

      {/* what this likely means */}
      <section style={{ ...cardStyle, marginTop: 18 }}>
        <Kicker>What this likely means</Kicker>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {(reading.means || []).map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span aria-hidden style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', background: m.mark === 'good' ? '#5FBF87' : m.mark === 'watch' ? '#E9B44C' : 'var(--accent)' }}>
                {m.mark === 'good' ? '✓' : m.mark === 'watch' ? '!' : '→'}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, lineHeight: 1.55, color: 'var(--text-body)' }}>{m.text}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 26 }}>
        <Button variant="primary" size="lg" onClick={onNext}>See next steps →</Button>
      </div>
    </>
  )
}

// ---- step 2 · "What you could do next" ----------------------------

function MovesStep({ mode, moves, reading, waitedDays, error, onDraft }) {
  const { Button } = DS2
  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={h1Style}>What you could do next</h1>
        <p style={{ ...leadStyle, margin: '10px auto 0', maxWidth: 520 }}>
          {mode === 'followup'
            ? `No reply in ${waitedDays} day${waitedDays === 1 ? '' : 's'} — here’s how you could move it along.`
            : reading?.met?.note
              ? `Because ${reading.kind?.toLowerCase().includes('resist') ? 'they pushed back' : 'they’re engaging but left it open'}, here’s where we’d start.`
              : 'Here’s where we’d start.'}
        </p>
      </header>

      {error && (
        <p role="alert" style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--danger, #b3423f)', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, alignItems: 'stretch' }}>
        {moves.map((mv, i) => (
          <article
            key={i}
            style={{
              ...cardStyle,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              ...(mv.recommended
                ? { border: '1.5px solid var(--spark, #E8963E)', boxShadow: '0 6px 22px rgba(232, 150, 62, 0.16)' }
                : {}),
            }}
          >
            {mv.recommended && (
              <span style={{ position: 'absolute', top: -11, left: 18, fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', background: 'linear-gradient(90deg, var(--spark, #E8963E), #E97B4F)', borderRadius: 999, padding: '4px 10px' }}>
                ✦ Recommended
              </span>
            )}
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 19, lineHeight: 1.25, color: 'var(--text-strong)', margin: '6px 0 0' }}>{mv.title}</h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0, flex: 1 }}>{mv.body}</p>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-faint)', borderTop: '1px solid var(--border-hair)', paddingTop: 10 }}>{mv.note}</div>
            <Button variant={mv.recommended ? 'primary' : 'ghost'} size="md" onClick={() => onDraft(mv)} style={{ width: '100%' }}>
              Draft this {mv.recommended ? '→' : ''}
            </Button>
          </article>
        ))}
      </div>
    </>
  )
}

// ---- shared bits --------------------------------------------------

const h1Style = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: 'var(--display-soft)',
  fontWeight: 600,
  fontSize: 34,
  lineHeight: 1.1,
  color: 'var(--text-strong)',
  margin: 0,
}
const leadStyle = { fontFamily: 'var(--font-serif)', fontSize: 16.5, lineHeight: 1.5, color: 'var(--text-muted)' }
const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-hair)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  padding: '24px 26px',
}

const Kicker = ({ children }) => (
  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>{children}</div>
)
const Chip = ({ bg, fg, children }) => (
  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, background: bg, color: fg, borderRadius: 999, padding: '7px 14px' }}>{children}</span>
)

function Centered({ children }) {
  return <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: 480, margin: '0 auto' }}>{children}</div>
}
function Shimmer() {
  return (
    <div aria-hidden style={{ display: 'inline-flex', gap: 6, marginBottom: 22 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', opacity: 0.5, animation: 'adv-pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  )
}
