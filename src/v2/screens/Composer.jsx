import React, { useEffect, useRef, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { composeLetter, rewritePassage, retuneLetter, nudgeLetter, evaluateLetter, recipientLabel, liveRisk, liveEff, lvl, bucket, badgeColors, stanceLabel } from '../../lib/advisor'
import Onboarding from '../components/Onboarding'

const ONBOARD_KEY = 'bw_onboarded'

const QUICK_CHIPS = [
  { mode: 'soften', label: 'Soften' },
  { mode: 'firmer', label: 'Firmer' },
  { mode: 'shorten', label: 'Shorten' },
  { mode: 'detail', label: 'Add detail' },
]

// Whole-draft "Nudge it" presets. `mode` drives the deterministic fallback
// when AI is unavailable; `instruction` is what the model applies.
const NUDGES = [
  { label: 'Warmer', mode: 'soften', instruction: 'Make the whole message warmer and more gentle — less demanding — without changing the facts or the ask.' },
  { label: 'Firmer', mode: 'firmer', instruction: 'Make the whole message more direct and firm, with a clear ask, without becoming hostile.' },
  { label: 'Shorter', mode: 'shorten', instruction: 'Make the whole message noticeably shorter and more concise, keeping the key point and the ask.' },
  { label: 'Add a deadline', mode: null, instruction: 'Weave in a specific, reasonable deadline for the response or action — use a [bracketed placeholder] like [date] if none is given — keeping the tone the same.' },
]

// Tone segmented (Soft · Moderate · Strong) maps to the numeric tone the
// advisor works in, so retune / liveRisk / liveEff keep functioning.
const TONE_SEGMENTS = ['Soft', 'Moderate', 'Strong']
const TONE_NUM = { Soft: 15, Moderate: 50, Strong: 85 }
const toneSegOf = (tone) => (bucket(tone) === 'soft' ? 'Soft' : bucket(tone) === 'strong' ? 'Strong' : 'Moderate')

const BADGE_BASE = {
  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em',
  textTransform: 'uppercase', padding: '5px 11px', borderRadius: 'var(--radius-pill)',
}
const SECTION_LABEL = {
  fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-2xs)',
  letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
}

function StanceBadge({ st }) {
  const bc = badgeColors(st.level)
  return <span style={{ ...BADGE_BASE, background: bc.bg, color: bc.fg }}>{stanceLabel(st.level)}</span>
}

export default function Composer() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Button, Slider, Card, Segmented, Badge, IconButton, Divider, Icon, Sparkle, Tag } = DS2 // full Daybreak component bundle
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
  const [nudging, setNudging] = useState(null) // label of the nudge being applied
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
    { getEl: () => tuneRef.current, title: 'Set the overall voice', body: 'Pick a Tone and drag the Length slider to reshape the entire draft at once — softer or stronger, shorter or more detailed.' },
    { getEl: () => letterRef.current, title: 'Revise any line', body: 'Select a word, sentence, or passage in the letter. A popup appears where you can tell BetterWords exactly how to reword that section.' },
    { getEl: () => addRef.current, title: 'Add your own section', body: 'Click “＋ Add a passage” to insert a new custom section anywhere in the draft.' },
    { getEl: () => evalRef.current, title: 'Read the room before you send', body: 'Risk and Impact show the vibe of your message and the likely reaction — so you can decide whether it’s ready to send or needs another pass.' },
  ]

  const strat = selected
  const aiMode = Boolean(strat?.paragraphs?.length)
  const paras = composeLetter(strat, state)
  const wordCount = paras.join(' ').trim().split(/\s+/).filter(Boolean).length
  const flashIdx = flashText ? paras.findIndex((p) => p.includes(flashText)) : -1

  const lr = liveRisk(strat, state.tone, state.verbosity)
  const le = liveEff(strat, state.tone, state.verbosity)
  const toneSeg = toneSegOf(state.tone)
  const verbWord = state.verbosity >= 50 ? 'Detailed' : 'Succinct'

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

  // Glide the tone/length values from where they are to the model's new read
  // instead of snapping (the Length thumb slides; the Tone segment settles).
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

  useEffect(() => () => cancelAnimationFrame(tweenRef.current), [])

  // Re-read the CURRENT letter with the model → refresh "Why this works" /
  // "Likely reaction", and (after an inline edit) let tone/length follow the text.
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

  // Tone/Length commit → in AI mode, ask the model to rewrite at the new
  // tone/length. In mock mode the change is already reflected synchronously.
  const retune = async (nextTone, nextVerb) => {
    if (!aiMode) return
    dispatch({ type: 'SET_LETTER_LOADING', value: true })
    const base = state.letterParas || strat.paragraphs
    const next = await retuneLetter({ scenarioId: state.scenarioId, strategy: strat, paras: base, tone: nextTone, verbosity: nextVerb })
    dispatch({ type: 'SET_LETTER', paras: next })
    evaluate(composeLetter(strat, { ...state, letterParas: next }), { moveSliders: false })
  }

  const onToneSeg = (seg) => {
    const num = TONE_NUM[seg]
    dispatch({ type: 'SET_TONE', value: num })
    retune(num, state.verbosity)
  }
  const onLenChange = (e) => dispatch({ type: 'SET_VERB', value: +e.target.value })
  const onLenCommit = (e) => retune(state.tone, +e.target.value)

  // Whole-draft nudge → rewrite the working copy, then re-read it so the
  // why/reaction and the Tone/Length controls follow where the text now sits.
  const nudge = async (n) => {
    if (busy || state.letterLoading || nudging) return
    setNudging(n.label)
    dispatch({ type: 'SET_LETTER_LOADING', value: true })
    try {
      const base =
        state.letterParas && state.letterParas.length
          ? state.letterParas
          : strat.paragraphs && strat.paragraphs.length
            ? strat.paragraphs
            : composeLetter(strat, state)
      const next = await nudgeLetter({ scenarioId: state.scenarioId, strategy: strat, paras: base, instruction: n.instruction, mode: n.mode })
      dispatch({ type: 'SET_LETTER', paras: next })
      evaluate(composeLetter(strat, { ...state, letterParas: next }), { moveSliders: true })
    } finally {
      setNudging(null)
    }
  }

  return (
    <main className="bw-composer bw-sec-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36, alignItems: 'start' }}>
      {/* letter */}
      <section>
        <div style={{ marginBottom: 12 }}>
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'GOTO', screen: 'drafts' })}>← All options</Button>
        </div>

        {/* strategy title + tags (left) · tips button (right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 24, lineHeight: 1.05, color: 'var(--text-strong)', margin: 0 }}>{strat.name}</h1>
            <StanceBadge st={strat} />
            {strat.recommended && (
              <Badge tone="gradient" size="sm"><Sparkle size={9} style={{ color: '#fff' }} />Recommended</Badge>
            )}
          </div>
          <IconButton variant="soft" label="Show editor tips" onClick={() => setTour(true)}>?</IconButton>
        </div>

        {/* draft sheet — token-styled div (needs a ref for selection geometry, so
            not the <Card> component; matches the Card--draft look) */}
        <div ref={letterRef} onMouseUp={onLetterUp} className="bw-letter" style={{ position: 'relative', background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: '44px 48px 36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: '8px 14px', alignItems: 'baseline', borderBottom: '1px solid var(--border-hair)', paddingBottom: 18, marginBottom: 26, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</span>
            <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{recipientLabel(scenario)}</span>
            <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Re</span>
            <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{strat.subject}</span>
          </div>

          <div style={{ userSelect: 'text', cursor: 'text', opacity: state.letterLoading ? 0.5 : 1, transition: 'opacity .25s var(--ease-out)' }}>
            {paras.map((text, i) => (
              <p key={i} style={{ margin: '0 0 18px', fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.72, color: 'var(--text-body)', background: i === flashIdx ? 'rgba(238,134,84,0.22)' : 'transparent', borderRadius: 'var(--radius-xs)', transition: 'background .8s var(--ease-out)', padding: i === flashIdx ? '2px 4px' : 0 }}>
                {text}
              </p>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '20px 0 0' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-faint)', margin: 0, fontStyle: 'italic' }}>
              Select any line to revise it · or add a passage below.
            </p>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{wordCount} words</span>
          </div>

          {(state.letterLoading || busy || evaluating) && (
            <div style={{ position: 'absolute', top: 14, right: 16, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 'var(--radius-pill)', background: 'var(--ink-800)', color: 'var(--paper-0)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '0.04em' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--peri-300)', animation: 'adv-spin 1s linear infinite' }} />
              {busy ? 'Revising…' : nudging ? 'Nudging…' : state.letterLoading ? 'Retuning…' : 'Re-reading…'}
            </div>
          )}

          {popup && (
            <div ref={popupRef} style={{ position: 'absolute', left: popup.x, top: popup.y, transform: 'translateX(-50%)', zIndex: 40, width: 300 }}>
              <div style={{ background: 'var(--ink-800)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 14, color: 'var(--paper-0)', opacity: busy ? 0.7 : 1 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.4, color: 'var(--peri-200)', marginBottom: 10 }}>
                  “{popup.text.length > 70 ? popup.text.slice(0, 67) + '…' : popup.text}”
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {QUICK_CHIPS.map((c) => (
                    <button
                      key={c.mode}
                      onClick={() => applyQuick(c.mode)}
                      disabled={busy}
                      style={{ border: '1px solid var(--border-night)', background: 'rgba(255,255,255,0.06)', color: 'var(--paper-0)', borderRadius: 'var(--radius-pill)', padding: '6px 12px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, cursor: busy ? 'default' : 'pointer' }}
                      onMouseOver={(e) => { if (busy) return; e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
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
                    style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-night)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--paper-0)', outline: 'none' }}
                  />
                  <button onClick={applyNote} disabled={busy} style={{ border: 'none', background: 'var(--spark)', color: 'var(--paper-0)', borderRadius: 'var(--radius-sm)', padding: '8px 13px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, cursor: busy ? 'default' : 'pointer' }}>
                    {busy ? '…' : 'Rewrite'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add+ */}
        <div style={{ marginTop: 16 }}>
          <span ref={addRef} style={{ display: 'inline-block' }}>
            <Button variant="outline" size="sm" iconLeft={<Icon name="plus" size={15} />} onClick={() => { setAddOpen(!addOpen); setPopup(null) }}>
              Add a passage
            </Button>
          </span>
          {addOpen && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, animation: 'adv-up .3s var(--ease-out)' }}>
              <div style={{ ...SECTION_LABEL, fontSize: 'var(--text-3xs)', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                Where would you like to add something?
              </div>
              {(strat.add || []).map((sug, i) => (
                <button key={i} onClick={() => pickAdd(sug)} className="bw-add-sug" style={{ textAlign: 'left', background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-md)', padding: '14px 16px', cursor: 'pointer', transition: 'border-color .2s var(--ease-out), box-shadow .2s var(--ease-out)' }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5 }}>{sug.label}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.45, color: 'var(--text-body)' }}>“{sug.text}”</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* right rail */}
      <aside className="bw-composer-rail" style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* tune */}
        <Card padded style={{ padding: 22 }}>
          <div ref={tuneRef}>
            <div style={{ ...SECTION_LABEL, color: 'var(--text-strong)', marginBottom: 18 }}>Tune the message</div>
            <div style={{ ...SECTION_LABEL, color: 'var(--text-muted)', marginBottom: 10 }}>Tone</div>
            <Segmented block options={TONE_SEGMENTS} value={toneSeg} onChange={onToneSeg} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '22px 0 12px' }}>
              <span style={{ ...SECTION_LABEL, color: 'var(--text-muted)' }}>Length</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--accent)' }}>{verbWord}</span>
            </div>
            <Slider value={state.verbosity} onChange={onLenChange} onMouseUp={onLenCommit} onTouchEnd={onLenCommit} onKeyUp={onLenCommit} labelStart="Succinct" labelEnd="Detailed" />
            <div style={{ ...SECTION_LABEL, color: 'var(--text-muted)', margin: '22px 0 10px' }}>Nudge it</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {NUDGES.map((n) => (
                <Tag key={n.label} selected={nudging === n.label} onClick={() => nudge(n)}>{n.label}</Tag>
              ))}
            </div>
          </div>
        </Card>

        {/* why + meters */}
        <Card padded style={{ padding: 22 }}>
          <div ref={evalRef}>
            <div style={{ ...SECTION_LABEL, color: 'var(--text-strong)', marginBottom: 12 }}>Why this works</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.5, color: 'var(--text-body)', margin: '0 0 14px' }}>{state.evalWhy ?? strat.why}</p>
            <div style={{ ...SECTION_LABEL, fontSize: 'var(--text-3xs)', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 4 }}>Likely reaction</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.45, color: 'var(--text-muted)', margin: '0 0 18px' }}>{state.evalReaction ?? strat.reaction}</p>
            <div style={{ margin: '0 0 16px' }}><Divider /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <LiveBar label="Risk" word={lvl(lr)} value={lr} fill="var(--danger)" labelColor="var(--danger)" />
              <LiveBar label="Impact" word={lvl(le)} value={le} fill="var(--accent)" labelColor="var(--accent)" />
            </div>
          </div>
        </Card>

        {/* notes */}
        {state.comments.length > 0 && (
          <Card padded style={{ padding: 22 }}>
            <div style={{ ...SECTION_LABEL, color: 'var(--text-strong)', marginBottom: 14 }}>Your edits</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {state.comments.map((cm, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--peri-400)', paddingLeft: 12 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 3 }}>“{cm.snippet}”</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-body)' }}>{cm.note}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button variant="spark" size="lg" block iconRight={<Icon name="send" size={16} />} onClick={() => dispatch({ type: 'GOTO', screen: 'send' })}>
          Continue to send
        </Button>
      </aside>

      {tour && <Onboarding steps={tourSteps} onDone={endTour} />}
    </main>
  )
}

function LiveBar({ label, word, value, fill, labelColor }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: labelColor }}>{word}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-sunken)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: fill, borderRadius: 'var(--radius-pill)', transition: 'width .35s var(--ease-out)' }} />
      </div>
    </div>
  )
}