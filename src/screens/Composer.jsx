import React, { useEffect, useRef, useState } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import { composeLetter, rewritePassage, retuneLetter, evaluateLetter, recipientLabel, liveRisk, liveEff, lvl, bucket, badgeColors, stanceLabel } from '../lib/advisor'
import Onboarding from '../components/Onboarding'

const ONBOARD_KEY = 'bw_onboarded'

const QUICK_CHIPS = [
  { mode: 'soften', label: 'Soften' },
  { mode: 'firmer', label: 'Firmer' },
  { mode: 'shorten', label: 'Shorten' },
  { mode: 'detail', label: 'Add detail' },
]

// Tag styling shared with the Drafts screen ("A few ways to say it").
const BADGE_BASE = {
  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em',
  textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999,
}
const REC_BADGE = {
  display: 'inline-flex', alignItems: 'center', gap: 5, ...BADGE_BASE,
  background: '#F3E6C2', color: 'var(--honey-600)',
}

function StanceBadge({ st }) {
  const bc = badgeColors(st.level)
  return <span style={{ ...BADGE_BASE, background: bc.bg, color: bc.fg }}>{stanceLabel(st.level)}</span>
}

export default function Composer() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Button } = DS
  const letterRef = useRef(null)
  const tuneRef = useRef(null)
  const addRef = useRef(null)
  const evalRef = useRef(null)
  const popupRef = useRef(null)
  const flashTimer = useRef(null)

  const [popup, setPopup] = useState(null) // { x, y, text }
  const [popupNote, setPopupNote] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [flashText, setFlashText] = useState(null)
  const [busy, setBusy] = useState(false) // an inline rewrite is in flight
  const [evaluating, setEvaluating] = useState(false) // model is re-reading the draft
  const [tour, setTour] = useState(false)
  const tweenRef = useRef(null)

  // First-time users get a one-off walkthrough of the editor's four features.
  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem(ONBOARD_KEY) === '1' } catch { /* private mode */ }
    if (!seen) setTour(true)
  }, [])

  // Dismiss the reword popup when clicking anywhere outside it.
  useEffect(() => {
    if (!popup) return
    const onDocDown = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopup(null)
        setPopupNote('')
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [popup])

  const endTour = () => {
    try { localStorage.setItem(ONBOARD_KEY, '1') } catch { /* private mode */ }
    setTour(false)
  }

  const tourSteps = [
    { getEl: () => tuneRef.current, title: 'Set the overall voice', body: 'Drag the Tone and Length sliders to reshape the entire draft at once — softer or stronger, shorter or more detailed.' },
    { getEl: () => letterRef.current, title: 'Revise any line', body: 'Select a word, sentence, or passage in the letter. A popup appears where you can tell BetterWords exactly how to reword that section.' },
    { getEl: () => addRef.current, title: 'Add your own section', body: 'Click “＋ Add a passage” to insert a new custom section anywhere in the draft.' },
    { getEl: () => evalRef.current, title: 'Read the room before you send', body: 'Risk and Impact show the vibe of your message and the likely reaction — so you can decide whether it’s ready to send or needs another pass.' },
  ]

  const strat = selected
  // When the strategy carries AI paragraphs, tone/length are retuned by the
  // model; otherwise composeLetter derives them from the mock's tone variants.
  const aiMode = Boolean(strat?.paragraphs?.length)
  const paras = composeLetter(strat, state)
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

  // Glide the Tone/Length sliders from where they are to the model's new read,
  // instead of snapping. Each frame dispatches the interpolated value, so the
  // controlled range thumb slides. A null target leaves that slider alone.
  const animateSliders = (toneTarget, verbTarget) => {
    cancelAnimationFrame(tweenRef.current)
    if (toneTarget == null && verbTarget == null) return
    const fromTone = state.tone
    const fromVerb = state.verbosity
    const start = performance.now()
    const DUR = 480
    const step = (now) => {
      const t = Math.min(1, (now - start) / DUR)
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // easeInOutQuad
      if (toneTarget != null) dispatch({ type: 'SET_TONE', value: Math.round(fromTone + (toneTarget - fromTone) * e) })
      if (verbTarget != null) dispatch({ type: 'SET_VERB', value: Math.round(fromVerb + (verbTarget - fromVerb) * e) })
      if (t < 1) tweenRef.current = requestAnimationFrame(step)
    }
    tweenRef.current = requestAnimationFrame(step)
  }

  // Stop any in-flight slider tween if the component unmounts.
  useEffect(() => () => cancelAnimationFrame(tweenRef.current), [])

  // Re-read the CURRENT letter with the model → refresh "Why this works" /
  // "Likely reaction" from the real wording, and (after an inline edit) let the
  // Tone/Length sliders follow where the text now sits. Mock strategies have no
  // model working copy, so this is a no-op for them.
  const evaluate = (nextParas, { moveSliders = false } = {}) => {
    if (!aiMode) return
    setEvaluating(true)
    evaluateLetter({ scenarioId: state.scenarioId, strategy: strat, paras: nextParas })
      .then((res) => {
        dispatch({ type: 'SET_EVAL', why: res.why, reaction: res.reaction })
        if (moveSliders) animateSliders(res.tone, res.verbosity)
      })
      .finally(() => setEvaluating(false))
  }

  // On opening a strategy, ground the why/reaction copy in the actual draft.
  useEffect(() => {
    evaluate(paras)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedIdx])

  // One inline-rewrite path for both the quick chips and the free-text note.
  const runRewrite = async ({ mode, instruction }) => {
    if (!popup || busy) return
    setBusy(true)
    try {
      const rep = await rewritePassage({ text: popup.text, mode, instruction, context: paras.join('\n\n') })
      const replacement = { find: popup.text, replace: rep }
      dispatch({ type: 'ADD_REPLACEMENT', replacement })
      if (instruction) {
        const snippet = popup.text.length > 60 ? popup.text.slice(0, 57) + '…' : popup.text
        dispatch({ type: 'ADD_COMMENT', comment: { snippet, note: instruction } })
      }
      flash(rep)
      // Re-evaluate against the edited letter; an edit may shift tone/length.
      evaluate(composeLetter(strat, { ...state, replacements: [...state.replacements, replacement] }), { moveSliders: true })
    } finally {
      setBusy(false)
      setPopup(null)
      setPopupNote('')
      window.getSelection()?.removeAllRanges()
    }
  }

  const applyQuick = (mode) => runRewrite({ mode })
  const applyNote = () => {
    const note = popupNote.trim()
    if (note) runRewrite({ instruction: note })
  }

  const pickAdd = (sug) => {
    const insert = { after: sug.after, text: sug.text }
    dispatch({ type: 'ADD_INSERT', insert })
    setAddOpen(false)
    flash(sug.text)
    evaluate(composeLetter(strat, { ...state, inserts: [...state.inserts, insert] }), { moveSliders: true })
  }

  // Slider commit → in AI mode, ask the model to rewrite the letter at the new
  // tone/length. In mock mode the change is already reflected synchronously.
  const retune = async (nextTone, nextVerb) => {
    if (!aiMode) return
    dispatch({ type: 'SET_LETTER_LOADING', value: true })
    const base = state.letterParas || strat.paragraphs
    const next = await retuneLetter({ scenarioId: state.scenarioId, strategy: strat, paras: base, tone: nextTone, verbosity: nextVerb })
    dispatch({ type: 'SET_LETTER', paras: next })
    // The letter changed, so refresh why/reaction — but the sliders already
    // reflect the user's chosen tone/length, so don't move them.
    evaluate(composeLetter(strat, { ...state, letterParas: next }), { moveSliders: false })
  }

  return (
    <main className="bw-composer bw-sec-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36, alignItems: 'start' }}>
      {/* letter */}
      <section>
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => dispatch({ type: 'GOTO', screen: 'drafts' })} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '6px 4px' }}>
            ← All options
          </button>
        </div>

        {/* strategy title + tags (left) · tips button (right), matching the Drafts screen */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 23, lineHeight: 1.05, color: 'var(--ink-800)', margin: 0 }}>{strat.name}</h1>
            <StanceBadge st={strat} />
            {strat.recommended && <span style={REC_BADGE}>✦ Recommended</span>}
          </div>
          <button
            onClick={() => setTour(true)}
            title="Show editor tips"
            aria-label="Show editor tips"
            style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-hair)', background: 'var(--cream-0)', color: 'var(--royal-600)', boxShadow: 'var(--shadow-sm)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}
          >
            ?
          </button>
        </div>

        <div ref={letterRef} onMouseUp={onLetterUp} className="bw-letter" style={{ position: 'relative', background: 'var(--surface-letter)', border: '1px solid rgba(11,22,38,0.07)', borderRadius: 8, boxShadow: 'var(--shadow-letter)', padding: '44px 48px 36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: '8px 14px', alignItems: 'baseline', borderBottom: '1px solid var(--border-hair)', paddingBottom: 18, marginBottom: 26, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</span>
            <span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{recipientLabel(scenario)}</span>
            <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Re</span>
            <span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{strat.subject}</span>
          </div>

          <div style={{ userSelect: 'text', cursor: 'text', opacity: state.letterLoading ? 0.5 : 1, transition: 'opacity .25s var(--ease-quiet)' }}>
            {paras.map((text, i) => (
              <p key={i} style={{ margin: '0 0 18px', fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.72, color: 'var(--ink-700)', background: i === flashIdx ? 'rgba(224,174,69,0.28)' : 'transparent', borderRadius: 3, transition: 'background .8s var(--ease-quiet)', padding: i === flashIdx ? '2px 4px' : 0 }}>
                {text}
              </p>
            ))}
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-faint)', margin: '20px 0 0', fontStyle: 'italic' }}>
            Select any line to revise it · or add a passage below.
          </p>

          {(state.letterLoading || busy || evaluating) && (
            <div style={{ position: 'absolute', top: 14, right: 16, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, background: 'var(--ink-800)', color: 'var(--cream-0)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '0.04em' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--peri-300)', animation: 'adv-spin 1s linear infinite' }} />
              {busy ? 'Revising…' : state.letterLoading ? 'Retuning…' : 'Re-reading…'}
            </div>
          )}

          {popup && (
            <div ref={popupRef} style={{ position: 'absolute', left: popup.x, top: popup.y, transform: 'translateX(-50%)', zIndex: 40, width: 300 }}>
              <div style={{ background: 'var(--ink-800)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 14, color: 'var(--cream-0)', opacity: busy ? 0.7 : 1 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.4, color: 'var(--peri-200)', marginBottom: 10 }}>
                  “{popup.text.length > 70 ? popup.text.slice(0, 67) + '…' : popup.text}”
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {QUICK_CHIPS.map((c) => (
                    <button
                      key={c.mode}
                      onClick={() => applyQuick(c.mode)}
                      disabled={busy}
                      style={{ border: '1px solid var(--border-night)', background: 'rgba(255,255,255,0.06)', color: 'var(--cream-0)', borderRadius: 999, padding: '6px 12px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, cursor: busy ? 'default' : 'pointer' }}
                      onMouseOver={(e) => { if (busy) return; e.currentTarget.style.background = 'var(--royal-600)'; e.currentTarget.style.borderColor = 'var(--royal-600)' }}
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
                    disabled={busy}
                    style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-night)', borderRadius: 7, padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--cream-0)', outline: 'none' }}
                  />
                  <button onClick={applyNote} disabled={busy} style={{ border: 'none', background: 'var(--peri-300)', color: 'var(--ink-800)', borderRadius: 7, padding: '8px 13px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, cursor: busy ? 'default' : 'pointer' }}>
                    {busy ? '…' : 'Rewrite'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add+ */}
        <div style={{ marginTop: 16 }}>
          <button
            ref={addRef}
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
              {(strat.add || []).map((sug, i) => (
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
      <aside className="bw-composer-rail" style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* tune */}
        <div ref={tuneRef} style={{ background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-800)', marginBottom: 20 }}>Tune the message</div>
          <SliderRow label="Tone" valueLabel={toneLbl} ends={['Soft', 'Strong']} value={state.tone} onChange={(v) => dispatch({ type: 'SET_TONE', value: v })} onCommit={(v) => retune(v, state.verbosity)} marginBottom={22} />
          <SliderRow label="Length" valueLabel={verbLbl} ends={['Succinct', 'Detailed']} value={state.verbosity} onChange={(v) => dispatch({ type: 'SET_VERB', value: v })} onCommit={(v) => retune(state.tone, v)} />
        </div>

        {/* why + meters */}
        <div ref={evalRef} style={{ background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-800)', marginBottom: 12 }}>Why this works</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.5, color: 'var(--text-body)', margin: '0 0 14px' }}>{state.evalWhy ?? strat.why}</p>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.45, color: 'var(--ink-700)', margin: '0 0 20px' }}>{state.evalReaction ?? strat.reaction}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <LiveBar label="Risk" word={lvl(lr)} value={lr} fill="var(--coral-500)" labelColor="var(--coral-600)" />
            <LiveBar label="Impact" word={lvl(le)} value={le} fill="var(--royal-600)" labelColor="var(--royal-700)" />
          </div>
        </div>

        {/* notes */}
        {state.comments.length > 0 && (
          <div style={{ background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-800)', marginBottom: 14 }}>Your edits</div>
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

      {tour && <Onboarding steps={tourSteps} onDone={endTour} />}
    </main>
  )
}

function SliderRow({ label, valueLabel, ends, value, onChange, onCommit, marginBottom = 0 }) {
  const commit = (e) => onCommit && onCommit(+e.target.value)
  return (
    <div style={{ marginBottom }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--royal-700)' }}>{valueLabel}</span>
      </div>
      <input
        type="range"
        className="adv-range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
      />
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
