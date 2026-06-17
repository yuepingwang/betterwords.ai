import React, { useRef, useState } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import { buildParas, rephrase, liveRisk, liveEff, lvl, bucket } from '../lib/advisor'

const QUICK_CHIPS = [
  { mode: 'soften', label: 'Soften' },
  { mode: 'firmer', label: 'Firmer' },
  { mode: 'shorten', label: 'Shorten' },
  { mode: 'detail', label: 'Add detail' },
]

export default function Composer() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Button } = DS
  const letterRef = useRef(null)
  const flashTimer = useRef(null)

  const [popup, setPopup] = useState(null) // { x, y, text }
  const [popupNote, setPopupNote] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [flashText, setFlashText] = useState(null)

  const strat = selected
  const paras = buildParas(state.scenarioId, state.selectedIdx, state.tone, state.verbosity, state.replacements, state.inserts)
  const flashIdx = flashText ? paras.findIndex((p) => p.includes(flashText)) : -1

  const lr = liveRisk(strat, state.tone, state.verbosity)
  const le = liveEff(strat, state.tone, state.verbosity)
  const toneLbl = bucket(state.tone) === 'soft' ? 'Soft' : bucket(state.tone) === 'bal' ? 'Balanced' : 'Strong'
  const verbLbl = state.verbosity >= 50 ? 'Detailed' : 'Succinct'

  const flash = (text) => {
    setFlashText(text)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashText(null), 1200)
  }

  const onLetterUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const text = sel.toString().trim()
    if (text.length < 3) {
      if (popup) setPopup(null)
      return
    }
    const cont = letterRef.current
    if (!cont) return
    const range = sel.getRangeAt(0)
    if (!cont.contains(range.commonAncestorContainer)) return
    const r = range.getBoundingClientRect()
    const c = cont.getBoundingClientRect()
    let x = r.left - c.left + r.width / 2
    x = Math.max(150, Math.min(c.width - 150, x))
    setPopup({ x, y: r.bottom - c.top + 12, text })
    setPopupNote('')
    setAddOpen(false)
  }

  const applyQuick = (mode) => {
    if (!popup) return
    const rep = rephrase(popup.text, mode)
    dispatch({ type: 'ADD_REPLACEMENT', replacement: { find: popup.text, replace: rep } })
    setPopup(null)
    setPopupNote('')
    flash(rep)
    window.getSelection()?.removeAllRanges()
  }

  const applyNote = () => {
    const note = popupNote.trim()
    if (!popup || !note) return
    const snippet = popup.text.length > 60 ? popup.text.slice(0, 57) + '…' : popup.text
    dispatch({ type: 'ADD_COMMENT', comment: { snippet, note } })
    setPopup(null)
    setPopupNote('')
    window.getSelection()?.removeAllRanges()
  }

  const pickAdd = (sug) => {
    dispatch({ type: 'ADD_INSERT', insert: { after: sug.after, text: sug.text } })
    setAddOpen(false)
    flash(sug.text)
  }

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36, alignItems: 'start' }}>
      {/* letter */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => dispatch({ type: 'GOTO', screen: 'drafts' })} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '6px 4px' }}>
            ← All options
          </button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            ✦ {strat.name}
          </span>
        </div>

        <div ref={letterRef} onMouseUp={onLetterUp} style={{ position: 'relative', background: 'var(--surface-letter)', border: '1px solid rgba(11,22,38,0.07)', borderRadius: 8, boxShadow: 'var(--shadow-letter)', padding: '44px 48px 36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: '8px 14px', alignItems: 'baseline', borderBottom: '1px solid var(--border-hair)', paddingBottom: 18, marginBottom: 26, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</span>
            <span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{scenario.recipient}</span>
            <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Re</span>
            <span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{strat.subject}</span>
          </div>

          <div style={{ userSelect: 'text', cursor: 'text' }}>
            {paras.map((text, i) => (
              <p key={i} style={{ margin: '0 0 18px', fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.72, color: 'var(--ink-700)', background: i === flashIdx ? 'rgba(224,174,69,0.28)' : 'transparent', borderRadius: 3, transition: 'background .8s var(--ease-quiet)', padding: i === flashIdx ? '2px 4px' : 0 }}>
                {text}
              </p>
            ))}
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-faint)', margin: '20px 0 0', fontStyle: 'italic' }}>
            Select any line to revise it · or add a passage below.
          </p>

          {popup && (
            <div style={{ position: 'absolute', left: popup.x, top: popup.y, transform: 'translateX(-50%)', zIndex: 40, width: 300 }}>
              <div style={{ background: 'var(--ink-800)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 14, color: 'var(--cream-0)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.4, color: 'var(--peri-200)', marginBottom: 10 }}>
                  “{popup.text.length > 70 ? popup.text.slice(0, 67) + '…' : popup.text}”
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {QUICK_CHIPS.map((c) => (
                    <button
                      key={c.mode}
                      onClick={() => applyQuick(c.mode)}
                      style={{ border: '1px solid var(--border-night)', background: 'rgba(255,255,255,0.06)', color: 'var(--cream-0)', borderRadius: 999, padding: '6px 12px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--royal-600)'; e.currentTarget.style.borderColor = 'var(--royal-600)' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'var(--border-night)' }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <input
                    value={popupNote}
                    onChange={(e) => setPopupNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyNote()}
                    placeholder="Describe a change…"
                    style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-night)', borderRadius: 7, padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--cream-0)', outline: 'none' }}
                  />
                  <button onClick={applyNote} style={{ border: 'none', background: 'var(--peri-300)', color: 'var(--ink-800)', borderRadius: 7, padding: '8px 13px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add+ */}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => { setAddOpen(!addOpen); setPopup(null) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', border: '1.5px dashed var(--border-strong)', background: 'transparent', borderRadius: 999, color: 'var(--ink-700)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--royal-600)'; e.currentTarget.style.color = 'var(--royal-600)' }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--ink-700)' }}
          >
            ＋ Add a passage
          </button>
          {addOpen && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, animation: 'adv-up .3s var(--ease-quiet)' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Where would you like to add something?
              </div>
              {strat.add.map((sug, i) => (
                <button key={i} onClick={() => pickAdd(sug)} className="bw-add-sug" style={{ textAlign: 'left', background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'border-color .2s var(--ease-quiet), box-shadow .2s var(--ease-quiet)' }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 5 }}>{sug.label}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.45, color: 'var(--ink-700)' }}>“{sug.text}”</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* right rail */}
      <aside style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* tune */}
        <div style={{ background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-800)', marginBottom: 20 }}>Tune the message</div>
          <SliderRow label="Tone" valueLabel={toneLbl} ends={['Soft', 'Strong']} value={state.tone} onChange={(v) => dispatch({ type: 'SET_TONE', value: v })} marginBottom={22} />
          <SliderRow label="Length" valueLabel={verbLbl} ends={['Succinct', 'Detailed']} value={state.verbosity} onChange={(v) => dispatch({ type: 'SET_VERB', value: v })} />
        </div>

        {/* why + meters */}
        <div style={{ background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-800)', marginBottom: 12 }}>Why this works</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.5, color: 'var(--text-body)', margin: '0 0 14px' }}>{strat.why}</p>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.45, color: 'var(--ink-700)', margin: '0 0 20px' }}>{strat.reaction}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <LiveBar label="Risk" word={lvl(lr)} value={lr} fill="var(--coral-500)" labelColor="var(--coral-600)" />
            <LiveBar label="Impact" word={lvl(le)} value={le} fill="var(--royal-600)" labelColor="var(--royal-700)" />
          </div>
        </div>

        {/* notes */}
        {state.comments.length > 0 && (
          <div style={{ background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-800)', marginBottom: 14 }}>Your notes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {state.comments.map((cm, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--peri-400)', paddingLeft: 12 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 3 }}>“{cm.snippet}”</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink-700)' }}>{cm.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" size="lg" block onClick={() => dispatch({ type: 'GOTO', screen: 'send' })}>
          Continue to send →
        </Button>
      </aside>
    </main>
  )
}

function SliderRow({ label, valueLabel, ends, value, onChange, marginBottom = 0 }) {
  return (
    <div style={{ marginBottom }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--royal-700)' }}>{valueLabel}</span>
      </div>
      <input type="range" className="adv-range" min="0" max="100" value={value} onChange={(e) => onChange(+e.target.value)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  )
}

function LiveBar({ label, word, value, fill, labelColor }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: labelColor }}>{word}</span>
      </div>
      <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: fill, borderRadius: 999, transition: 'width .35s var(--ease-quiet)' }} />
      </div>
    </div>
  )
}
