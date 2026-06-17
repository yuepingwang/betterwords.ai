import React, { useEffect, useMemo, useRef, useState } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import Meter from '../components/Meter'
import {
  composeDraft,
  liveMetrics,
  reviseSelection,
  suggestInsertions,
  toneLabel,
  lengthLabel,
  riskWord,
  impactWord,
} from '../lib/advisor'

const QUICK_ACTIONS = [
  { id: 'soften', label: 'Soften' },
  { id: 'firmer', label: 'Firmer' },
  { id: 'shorten', label: 'Shorten' },
  { id: 'detail', label: 'Add detail' },
]

export default function Composer() {
  const { state, dispatch, go, selected } = useStore()
  const { Button, Sparkle } = DS
  const letterRef = useRef(null)

  // Sticky per-paragraph edits keyed by paragraph id live in the store, so
  // they survive slider moves and carry through to the Send preview.
  const edits = state.edits
  const [popup, setPopup] = useState(null) // { pid, text, x, y }
  const [noteText, setNoteText] = useState('')
  const [busy, setBusy] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  const base = useMemo(
    () => (selected ? composeDraft(selected, state.tone, state.length, { inserts: state.inserts }) : null),
    [selected, state.tone, state.length, state.inserts],
  )
  const letter = useMemo(
    () =>
      base
        ? { ...base, paragraphs: base.paragraphs.map((p) => ({ ...p, text: edits[p.id] ?? p.text })) }
        : null,
    [base, edits],
  )

  if (!selected || !base || !letter) {
    return (
      <main className="bw-container" style={{ paddingBlock: 'var(--space-10)' }}>
        <p className="bw-serif" style={{ color: 'var(--text-muted)' }}>No draft selected.</p>
        <button onClick={() => go('drafts')} className="bw-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back to options</button>
      </main>
    )
  }

  const metrics = liveMetrics(selected, state.tone, state.length)

  // capture a text selection inside the letter
  const onMouseUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      setPopup(null)
      return
    }
    const text = sel.toString().trim()
    if (text.length < 2) return
    const anchorEl = sel.anchorNode?.parentElement?.closest('[data-pid]')
    if (!anchorEl || !letterRef.current) return
    const pid = anchorEl.getAttribute('data-pid')
    const range = sel.getRangeAt(0).getBoundingClientRect()
    const box = letterRef.current.getBoundingClientRect()
    setPopup({
      pid,
      text,
      x: range.left - box.left + range.width / 2,
      y: range.top - box.top,
    })
  }

  const applyQuick = async (instruction) => {
    if (!popup) return
    setBusy(true)
    const para = letter.paragraphs.find((p) => p.id === popup.pid)
    const newSub = await reviseSelection(popup.text, instruction)
    const updated = (edits[popup.pid] ?? para.text).replace(popup.text, newSub)
    dispatch({ type: 'SET_EDIT', pid: popup.pid, text: updated })
    setBusy(false)
    setPopup(null)
    window.getSelection()?.removeAllRanges()
  }

  const saveNote = () => {
    if (!popup || !noteText.trim()) return
    dispatch({ type: 'ADD_NOTE', note: { snippet: popup.text.slice(0, 60), note: noteText.trim() } })
    setNoteText('')
    setPopup(null)
    window.getSelection()?.removeAllRanges()
  }

  const openAdd = async () => {
    const nextOpen = !addOpen
    setAddOpen(nextOpen)
    if (nextOpen && suggestions.length === 0) {
      const s = await suggestInsertions(selected, base.paragraphs.length)
      setSuggestions(s)
    }
  }

  const chooseInsert = (ins) => {
    dispatch({ type: 'ADD_INSERT', insert: ins })
    setAddOpen(false)
  }

  return (
    <main
      className="bw-container"
      style={{
        paddingBlock: 'var(--space-8)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 340px',
        gap: 'var(--space-7)',
        alignItems: 'start',
      }}
    >
      {/* letter column */}
      <section>
        <button onClick={() => go('drafts')} className="bw-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'var(--text-sm)' }}>
          ← All options
        </button>
        <h1 className="bw-display" style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--space-3)' }}>
          <Sparkle size={18} /> {selected?.name}
        </h1>
        <p className="bw-serif" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
          Select any line to revise it · or add a passage below.
        </p>

        {/* the letter */}
        <div
          ref={letterRef}
          onMouseUp={onMouseUp}
          style={{
            position: 'relative',
            marginTop: 'var(--space-5)',
            background: 'var(--surface-letter)',
            border: '1px solid var(--border-hair)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-letter)',
            padding: 'var(--space-8)',
          }}
        >
          {/* address block */}
          <div className="rule-double" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 'var(--space-4)', rowGap: 'var(--space-1)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-soft)' }}>
            <span className="bw-meter-label">To</span>
            <span style={{ color: 'var(--text-body)' }}>{letter.to}</span>
            <span className="bw-meter-label">Re</span>
            <span style={{ color: 'var(--text-body)' }}>{letter.re}</span>
          </div>

          <div style={{ marginTop: 'var(--space-5)', fontFamily: 'var(--font-serif)', fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-body)', maxWidth: 'var(--measure-letter)' }}>
            <p style={{ marginTop: 0 }}>{letter.salutation}</p>
            {letter.paragraphs.map((p) => (
              <p
                key={p.id}
                data-pid={p.id}
                style={{
                  background: p.inserted ? 'rgba(169,201,244,0.16)' : 'transparent',
                  borderRadius: p.inserted ? 'var(--radius-sm)' : 0,
                  padding: p.inserted ? 'var(--space-1) var(--space-2)' : 0,
                }}
              >
                {p.text}
              </p>
            ))}
            <p style={{ marginBottom: 0 }}>{letter.closing}</p>
            <p style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>{letter.signoff}</p>
          </div>

          {/* selection popup */}
          {popup && (
            <div
              className="bw-fade-up"
              style={{
                position: 'absolute',
                left: Math.max(120, popup.x),
                top: Math.max(0, popup.y - 12),
                transform: 'translate(-50%, -100%)',
                zIndex: 5,
                width: 280,
                background: 'var(--ink-800)',
                color: 'var(--cream-0)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: 'var(--space-4)',
              }}
            >
              <p className="bw-serif" style={{ fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--peri-200)', margin: '0 0 var(--space-3)' }}>
                “{popup.text.length > 70 ? popup.text.slice(0, 70) + '…' : popup.text}”
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => applyQuick(a.id)}
                    disabled={busy}
                    style={{
                      cursor: 'pointer',
                      fontSize: 'var(--text-2xs)',
                      padding: '4px var(--space-3)',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--border-night)',
                      background: 'transparent',
                      color: 'var(--cream-0)',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--royal-600)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Or note a change…"
                  onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 'var(--text-xs)',
                    padding: '6px var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-night)',
                    background: 'var(--ink-700)',
                    color: 'var(--cream-0)',
                  }}
                />
                <button
                  onClick={saveNote}
                  style={{ cursor: 'pointer', fontSize: 'var(--text-2xs)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--peri-300)', color: 'var(--ink-800)', fontWeight: 'var(--weight-semibold)' }}
                >
                  Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* add a passage */}
        <div style={{ marginTop: 'var(--space-5)' }}>
          <button
            onClick={openAdd}
            style={{
              width: '100%',
              cursor: 'pointer',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--border-strong)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
            }}
          >
            ＋ Add a passage
          </button>
          {addOpen && (
            <div className="bw-fade-up" style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {suggestions.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 'var(--text-sm)' }}>Thinking of where this could go…</p>}
              {suggestions.map((ins, i) => (
                <button
                  key={i}
                  onClick={() => chooseInsert(ins)}
                  className="bw-lift"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: 'var(--cream-0)',
                    border: '1px solid var(--border-hair)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--royal-600)' }}>
                    {ins.label}
                  </span>
                  <span className="bw-serif" style={{ display: 'block', fontStyle: 'italic', color: 'var(--text-body)', marginTop: 4 }}>
                    {ins.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* sidebar */}
      <aside style={{ position: 'sticky', top: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <SidebarCard title="Tune the message">
          <SliderRow
            label="Tone"
            value={state.tone}
            valueLabel={toneLabel(state.tone)}
            ends={['Soft', 'Strong']}
            onChange={(v) => dispatch({ type: 'SET_TONE', value: v })}
          />
          <div style={{ height: 'var(--space-5)' }} />
          <SliderRow
            label="Length"
            value={state.length}
            valueLabel={lengthLabel(state.length)}
            ends={['Succinct', 'Detailed']}
            onChange={(v) => dispatch({ type: 'SET_LENGTH', value: v })}
          />
        </SidebarCard>

        <SidebarCard title="Why this works">
          <p className="bw-serif" style={{ color: 'var(--text-body)', fontSize: 'var(--text-sm)', margin: 0 }}>
            {selected?.description}
          </p>
          <p className="bw-serif" style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 'var(--space-3) 0 var(--space-4)' }}>
            {selected?.likelyReaction}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Meter label="Risk" value={metrics.risk} word={riskWord(metrics.risk)} tone="risk" />
            <Meter label="Impact" value={metrics.impact} word={impactWord(metrics.impact)} tone="impact" />
          </div>
        </SidebarCard>

        {state.notes.length > 0 && (
          <SidebarCard title="Your notes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {state.notes.map((n, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--peri-400)', paddingLeft: 'var(--space-3)' }}>
                  <p className="bw-serif" style={{ fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    “{n.snippet}”
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)', margin: '2px 0 0' }}>{n.note}</p>
                </div>
              ))}
            </div>
          </SidebarCard>
        )}

        <Button variant="primary" size="lg" block onClick={() => go('send')}>
          Continue to send →
        </Button>
      </aside>
    </main>
  )
}

function SidebarCard({ title, children }) {
  return (
    <div style={{ background: 'var(--surface-letter)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 'var(--space-5)' }}>
      <p className="bw-kicker" style={{ marginBottom: 'var(--space-4)' }}>{title}</p>
      {children}
    </div>
  )
}

function SliderRow({ label, value, valueLabel, ends, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
        <span className="bw-meter-label">{label}</span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--royal-700)' }}>{valueLabel}</span>
      </div>
      <input
        className="adv-range"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="adv-range-ends">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  )
}
