import React, { useEffect, useMemo, useRef, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import {
  composeLetter,
  rewritePassage,
  retuneLetter,
  insertPassage,
  evaluateLetter,
  suggestInsertions,
  draftAddition,
  recipientLabel,
  liveRisk,
  liveEff,
  bucket,
  verbLabel,
  stanceLabel,
} from '../../lib/advisor'
import Onboarding from '../components/Onboarding'
import './Composer.css'

// Versioned: bump when the tour content changes so everyone sees it once more.
const ONBOARD_KEY = 'bw_onboarded_composer3'
const GLYPHS = '/ds-v2/assets/glyphs'

const QUICK_CHIPS = [
  { mode: 'soften', label: 'Soften' },
  { mode: 'firmer', label: 'Firmer' },
  { mode: 'shorten', label: 'Shorter' },
  { mode: 'detail', label: 'Add Detail' },
]

// Stance badge colors + the Evaluation card's pros/cons. AI strategies may
// ship their own `pros`/`cons`; these are the per-stance fallbacks.
const LEVEL_BADGE = {
  soft: { bg: 'var(--mint-200)', fg: 'var(--mint-600)' },
  balanced: { bg: 'var(--peri-200)', fg: 'var(--blue-700)' },
  strong: { bg: 'var(--peach-200)', fg: 'var(--peach-600)' },
}
const LEVEL_EVAL = {
  soft: {
    pros: ['Warm and easy to receive', 'Protects the relationship'],
    cons: ['Easier to stall or ignore'],
  },
  balanced: {
    pros: ['Clear and firm without hostility', 'Sets a concrete expectation'],
    cons: ['Slightly more formal in tone'],
  },
  strong: {
    pros: ['Hard to ignore — signals resolve', 'Creates a clear record'],
    cons: ['Can read as adversarial', 'May put them on the defensive'],
  },
}

const TONE_WORD = { soft: 'Soft', bal: 'Moderate', strong: 'Strong' }

// Inserted images travel through the letter state as marker paragraphs so
// applyEdits/composeLetter (which only know strings) keep working.
const isImagePara = (t) => typeof t === 'string' && t.startsWith('[image:') && t.endsWith(']')
// an optional `|w=NN` suffix on the marker carries the display width (% of
// the letter column) so resizes survive undo/redo and draft snapshots
const imageSrc = (t) => t.slice(7, -1).split('|w=')[0]
const imageWidth = (t) => {
  const m = t.match(/\|w=(\d+)\]$/)
  return m ? Number(m[1]) : 78
}
const imageMarker = (src, w) => `[image:${src}|w=${w}]`

// Character offsets of the sentence boundaries in a paragraph (after each
// terminal-punctuation + space run, plus the paragraph end).
function sentenceBoundaries(text) {
  const pts = []
  const re = /[.!?…]["'”’)\]]*\s+/g
  let m
  while ((m = re.exec(text))) pts.push(m.index + m[0].length)
  pts.push(text.length)
  return pts
}

// Text offset under the pointer inside a paragraph's single text node.
function caretOffsetIn(pEl, x, y) {
  let node = null
  let off = 0
  if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y)
    if (!r) return null
    node = r.startContainer
    off = r.startOffset
  } else if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y)
    if (!p) return null
    node = p.offsetNode
    off = p.offset
  } else {
    return null
  }
  if (!pEl.contains(node) || node.nodeType !== Node.TEXT_NODE) return null
  return off
}

const RotateCcwIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
)
const RotateCwIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)
const CopyIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2.5" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const CheckIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
// minus/x drawn to the DS line-icon spec (1.7 stroke, round caps) — the
// Daybreak set has no minus or x glyph to pair with its "plus"
const MinusIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
  </svg>
)
const XIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

// .t-label per the Type spec (12px · 600 · 0.12em · uppercase) — the one
// micro-caps style used across the screen.
const T_LABEL = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  fontSize: 'var(--text-2xs)',
  letterSpacing: 'var(--tracking-wider)',
  textTransform: 'uppercase',
}

export default function Composer() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Badge, Sparkle, Button, Icon } = DS2

  const letterRef = useRef(null)
  const bodyRef = useRef(null)
  const sigRef = useRef(null)
  const popupRef = useRef(null)
  const addWrapRef = useRef(null)
  const toolsRef = useRef(null)
  const tuneRef = useRef(null)
  const evalRef = useRef(null)
  const topActionsRef = useRef(null)
  const fileRef = useRef(null)
  const pendingGapRef = useRef(null)
  // set when a mousedown inside the letter body dismisses an open popup, so
  // the click that follows doesn't immediately open a new one
  const suppressOpenRef = useRef(false)
  const flashTimer = useRef(null)
  const savedTimer = useRef(null)
  const copiedTimer = useRef(null)
  const tweenRef = useRef(null)
  const rafRef = useRef(null)
  const histRef = useRef({ undo: [], redo: [] })
  const dragSnapRef = useRef(null)

  const [tool, setTool] = useState('edit') // 'edit' | 'insert' | 'image'
  const [popup, setPopup] = useState(null) // {kind:'rewrite'|'insert', ...}
  const [popupNote, setPopupNote] = useState('')
  const [hoverPt, setHoverPt] = useState(null) // sentence caret in insert mode
  const [addOpen, setAddOpen] = useState(false)
  const [addSugs, setAddSugs] = useState(null) // null = loading fresh suggestions
  const [addNote, setAddNote] = useState('')
  const [addBusy, setAddBusy] = useState(false)
  const addPanelRef = useRef(null)
  const [flashText, setFlashText] = useState(null)
  const [busy, setBusy] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tour, setTour] = useState(false)
  const [, setHistTick] = useState(0)

  const strat = selected
  const aiMode = Boolean(strat?.paragraphs?.length)
  const paras = composeLetter(strat, state)
  const flashIdx = flashText ? paras.findIndex((p) => p.includes(flashText)) : -1

  // Meters and pros/cons prefer the model's fresh read of the CURRENT letter
  // (store.eval*), falling back to slider heuristics / per-stance copy.
  const lr = state.evalRisk ?? liveRisk(strat, state.tone, state.verbosity)
  const le = state.evalImpact ?? liveEff(strat, state.tone, state.verbosity)
  const toneWord = TONE_WORD[bucket(state.tone)]
  const levelEval = LEVEL_EVAL[strat.level] || LEVEL_EVAL.balanced
  const pros = state.evalPros?.length ? state.evalPros : strat.pros?.length ? strat.pros : levelEval.pros
  const cons = state.evalCons?.length ? state.evalCons : strat.cons?.length ? strat.cons : levelEval.cons
  const badge = LEVEL_BADGE[strat.level] || LEVEL_BADGE.balanced

  // Displayed-paragraph index → the base-paragraph index inserts anchor to
  // (mirrors applyEdits: base paras first, then that para's inserts in order).
  const displayMap = useMemo(() => {
    const baseLen = paras.length - state.inserts.length
    const map = []
    for (let i = 0; i < baseLen; i++) {
      map.push(i)
      state.inserts.filter((ins) => ins.after === i).forEach(() => map.push(i))
    }
    state.inserts.filter((ins) => ins.after >= baseLen).forEach(() => map.push(baseLen - 1))
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paras.length, state.inserts])
  const anchorForGap = (d) => displayMap[Math.min(Math.max(d, 0), displayMap.length - 1)] ?? 0

  // ---------- first-run tour ----------
  useEffect(() => {
    // Auto-start the tour the very first time the composer opens.
    // `?tour=0` opts out (design review / automated screenshots).
    if (new URLSearchParams(window.location.search).get('tour') === '0') return
    let seen = false
    try {
      seen = localStorage.getItem(ONBOARD_KEY) === '1'
    } catch {
      /* private mode */
    }
    if (!seen) setTour(true)
  }, [])

  // The header help button (V2App) bumps tourAsk to replay the tour.
  useEffect(() => {
    if (state.tourAsk) setTour(true)
  }, [state.tourAsk])

  const endTour = () => {
    try {
      localStorage.setItem(ONBOARD_KEY, '1')
    } catch {
      /* private mode */
    }
    setTour(false)
  }
  const tourSteps = [
    { getEl: () => letterRef.current, title: 'Work right on the letter', body: 'With the edit tool, select any passage and tell BetterWords how to reword it. With the insert tool, click between sentences or paragraphs to add something new.' },
    { getEl: () => toolsRef.current, title: 'Your editing toolbar', body: 'Switch between the edit, insert, and image tools. Undo, copy the letter, and “Add Something Else” — suggestions written for this draft — live here too.' },
    { getEl: () => tuneRef.current, title: 'Tune the whole draft', body: 'Drag Tone and Length to reshape the entire message at once — undo and redo are right here too.' },
    { getEl: () => evalRef.current, title: 'Read the room before you send', body: 'Pros, cons, risk, and the likely reaction — updated as you edit, so you can decide whether it’s ready or needs another pass.' },
    { getEl: () => topActionsRef.current, title: 'Save it, then send it', body: 'Keep this version with “Save as New Draft”, and when it feels right, “Review & Send”. You can replay this tour anytime with the smiley button in the header.' },
  ]

  // ---------- popup dismissal + cleanup ----------
  useEffect(() => {
    if (!popup && !addOpen) return
    const onDocDown = (e) => {
      if (popupRef.current?.contains(e.target)) return
      if (addWrapRef.current?.contains(e.target)) return
      if (addPanelRef.current?.contains(e.target)) return
      // undo/redo act on the letter, not the panel — don't dismiss it
      if (e.target.closest?.('[data-keep-add]')) return
      // clicking away resets the popup and its insert marker together; if the
      // click lands back in the letter body, swallow the follow-up click so
      // it only dismisses instead of opening a new popup
      if (popup && bodyRef.current?.contains(e.target)) suppressOpenRef.current = true
      setPopup(null)
      setPopupNote('')
      setHoverPt(null)
      setAddOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [popup, addOpen])

  // keep the selected passage painted while the rewrite popup is open —
  // focusing the popup's input drops the native ::selection highlight, so the
  // captured range is mirrored through the CSS Custom Highlight API
  useEffect(() => {
    if (popup?.kind !== 'rewrite' || !popup.range) return
    if (typeof Highlight === 'undefined' || !CSS.highlights) return
    CSS.highlights.set('bw-rewrite', new Highlight(popup.range))
    return () => CSS.highlights.delete('bw-rewrite')
  }, [popup])

  useEffect(
    () => () => {
      cancelAnimationFrame(tweenRef.current)
      cancelAnimationFrame(rafRef.current)
      clearTimeout(flashTimer.current)
      clearTimeout(savedTimer.current)
      clearTimeout(copiedTimer.current)
    },
    [],
  )

  const flash = (text) => {
    setFlashText(text)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashText(null), 1200)
  }

  // ---------- undo / redo ----------
  // Snapshots also carry the "Add Something Else" suggestion list, so undoing
  // a pick puts the consumed option card back under the panel (and redo
  // consumes it again). `sugs: null` (panel never loaded) is left untouched.
  const snapshot = () => ({
    letterParas: state.letterParas,
    replacements: state.replacements,
    inserts: state.inserts,
    tone: state.tone,
    verbosity: state.verbosity,
    sugs: addSugs,
  })
  const pushHistory = (snap = snapshot()) => {
    histRef.current.undo.push(snap)
    histRef.current.redo = []
    setHistTick((t) => t + 1)
  }
  const canUndo = histRef.current.undo.length > 0
  const canRedo = histRef.current.redo.length > 0
  const restoreEntry = (entry) => {
    const { sugs, ...letter } = entry
    dispatch({ type: 'RESTORE_EDIT', ...letter })
    if (sugs != null) setAddSugs(sugs)
  }
  const doUndo = () => {
    const h = histRef.current
    if (!h.undo.length || busy || state.letterLoading) return
    h.redo.push(snapshot())
    restoreEntry(h.undo.pop())
    setHistTick((t) => t + 1)
  }
  const doRedo = () => {
    const h = histRef.current
    if (!h.redo.length || busy || state.letterLoading) return
    h.undo.push(snapshot())
    restoreEntry(h.redo.pop())
    setHistTick((t) => t + 1)
  }

  // ---------- slider tweens + model re-read ----------
  const animateSliders = (toneTarget, verbTarget) => {
    cancelAnimationFrame(tweenRef.current)
    if (toneTarget == null && verbTarget == null) return
    const fromTone = state.tone
    const fromVerb = state.verbosity
    const start = performance.now()
    const DUR = 480
    const step = (now) => {
      const t = Math.min(1, (now - start) / DUR)
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      if (toneTarget != null) dispatch({ type: 'SET_TONE', value: Math.round(fromTone + (toneTarget - fromTone) * e) })
      if (verbTarget != null) dispatch({ type: 'SET_VERB', value: Math.round(fromVerb + (verbTarget - fromVerb) * e) })
      if (t < 1) tweenRef.current = requestAnimationFrame(step)
    }
    tweenRef.current = requestAnimationFrame(step)
  }

  // Always evaluate the current wording — evaluateLetter falls back to the
  // strategy's static copy when AI is unavailable, so mock mode still works.
  const evaluate = (nextParas, { moveSliders = false } = {}) => {
    setEvaluating(true)
    evaluateLetter({ scenarioId: state.scenarioId, strategy: strat, paras: nextParas.filter((p) => !isImagePara(p)) })
      .then((res) => {
        dispatch({
          type: 'SET_EVAL',
          why: res.why,
          reaction: res.reaction,
          pros: res.pros,
          cons: res.cons,
          risk: res.risk,
          impact: res.impact,
        })
        if (moveSliders) animateSliders(res.tone, res.verbosity)
      })
      .finally(() => setEvaluating(false))
  }

  useEffect(() => {
    evaluate(paras)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedIdx])

  // ---------- EDIT tool: select → rewrite popup ----------
  const clampX = (x) => {
    const w = letterRef.current?.getBoundingClientRect().width || 600
    return Math.max(178, Math.min(w - 178, x))
  }

  const onLetterUp = () => {
    if (tool !== 'edit') return
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
    if (!bodyRef.current?.contains(range.commonAncestorContainer)) return
    if (sigRef.current?.contains(range.commonAncestorContainer)) return
    const r = range.getBoundingClientRect()
    const c = cont.getBoundingClientRect()
    // native ::selection paints full line boxes (line-height tall, gaps
    // filled) while ::highlight paints only the font box — so the green
    // ground is drawn by us: capture the selection's per-line rects and
    // expand each to the full line pitch, exactly matching the native paint.
    // The ::highlight mirror then only turns the text white (no background).
    const bodyEl = bodyRef.current
    const bodyRect = bodyEl.getBoundingClientRect()
    const pEl = range.startContainer.parentElement?.closest('p') || bodyEl.querySelector('p')
    const pitch = parseFloat(pEl ? getComputedStyle(pEl).lineHeight : '') || 28
    const rects = [...range.getClientRects()]
      .filter((cr) => cr.width > 1 && cr.height > 1 && cr.height < pitch * 1.6)
      .map((cr) => ({
        left: cr.left - bodyRect.left + bodyEl.scrollLeft,
        top: cr.top + cr.height / 2 - pitch / 2 - bodyRect.top + bodyEl.scrollTop,
        width: cr.width,
        height: pitch,
      }))
    setPopup({ kind: 'rewrite', x: clampX(r.left - c.left + r.width / 2), y: r.bottom - c.top + 12, text, range: range.cloneRange(), rects })
    setPopupNote('')
    setAddOpen(false)
    // hand the paint over to our overlay + the ::highlight text color right
    // away — the native selection stops painting entirely once the popup's
    // input takes focus, so it can't be the popup-time paint source
    sel.removeAllRanges()
  }
  // the drag can end outside the letter (or the viewport), where the body's
  // own mouseup never fires — finish the select→popup flow on document
  // mouseup instead; onLetterUp validates the range lives in the letter body
  const letterUpRef = useRef()
  letterUpRef.current = onLetterUp
  useEffect(() => {
    if (tool !== 'edit') return
    const onUp = () => letterUpRef.current?.()
    document.addEventListener('mouseup', onUp)
    return () => document.removeEventListener('mouseup', onUp)
  }, [tool])

  const runRewrite = async ({ mode, instruction }) => {
    if (!popup || busy) return
    setBusy(true)
    const snap = snapshot()
    try {
      const rep = await rewritePassage({ text: popup.text, mode, instruction, context: paras.join('\n\n') })
      const replacement = { find: popup.text, replace: rep }
      pushHistory(snap)
      dispatch({ type: 'ADD_REPLACEMENT', replacement })
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

  // ---------- INSERT tool: sentence caret + gap lines ----------
  const onBodyMove = (e) => {
    if (tool !== 'insert' || busy || popup) return
    const { clientX, clientY } = e
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const pEl = document.elementFromPoint(clientX, clientY)?.closest?.('p[data-idx]')
      const cont = letterRef.current
      if (!pEl || !cont || !bodyRef.current?.contains(pEl)) {
        setHoverPt(null)
        return
      }
      const off = caretOffsetIn(pEl, clientX, clientY)
      if (off == null) {
        setHoverPt(null)
        return
      }
      const text = pEl.textContent
      let best = null
      for (const b of sentenceBoundaries(text)) {
        if (best == null || Math.abs(b - off) < Math.abs(best - off)) best = b
      }
      if (best == null) {
        setHoverPt(null)
        return
      }
      const tn = pEl.firstChild
      const range = document.createRange()
      range.setStart(tn, Math.min(best, tn.length))
      range.collapse(true)
      const rect = range.getBoundingClientRect()
      if (!rect || (rect.left === 0 && rect.top === 0)) {
        setHoverPt(null)
        return
      }
      const c = cont.getBoundingClientRect()
      setHoverPt({
        paraIdx: +pEl.dataset.idx,
        offset: best,
        x: rect.left - c.left - 3,
        y: rect.top - c.top + 2,
        h: (rect.height || 26) - 4,
      })
    })
  }

  const onBodyClick = () => {
    if (suppressOpenRef.current) {
      suppressOpenRef.current = false
      return
    }
    if (tool !== 'insert' || !hoverPt || busy) return
    setPopup({
      kind: 'insert',
      mode: 'sentence',
      paraIdx: hoverPt.paraIdx,
      offset: hoverPt.offset,
      x: clampX(hoverPt.x),
      y: hoverPt.y + hoverPt.h + 14,
      // freeze the caret here so it stays put while the popup is open
      caret: { x: hoverPt.x, y: hoverPt.y, h: hoverPt.h },
    })
    setPopupNote('')
    setAddOpen(false)
  }

  const onGapClick = (gapIdx, e) => {
    if (suppressOpenRef.current) {
      suppressOpenRef.current = false
      return
    }
    if (busy) return
    e.stopPropagation()
    if (tool === 'image') {
      pendingGapRef.current = gapIdx
      fileRef.current?.click()
      return
    }
    const c = letterRef.current.getBoundingClientRect()
    const g = e.currentTarget.getBoundingClientRect()
    setPopup({
      kind: 'insert',
      mode: 'gap',
      gapIdx,
      x: clampX(g.left - c.left + g.width / 2),
      y: g.bottom - c.top + 8,
    })
    setPopupNote('')
    setAddOpen(false)
  }

  const applyInsert = async () => {
    const note = popupNote.trim()
    if (!note || !popup || busy) return
    setBusy(true)
    const snap = snapshot()
    const context = paras.filter((p) => !isImagePara(p)).join('\n\n')
    try {
      if (popup.mode === 'sentence') {
        const para = paras[popup.paraIdx]
        const before = para.slice(0, popup.offset).trimEnd()
        const after = para.slice(popup.offset).trimStart()
        const passage = await insertPassage({ scenarioId: state.scenarioId, before, after, context, instruction: note })
        if (passage) {
          const replacement = { find: para, replace: [before, passage, after].filter(Boolean).join(' ') }
          pushHistory(snap)
          dispatch({ type: 'ADD_REPLACEMENT', replacement })
          flash(passage)
          evaluate(composeLetter(strat, { ...state, replacements: [...state.replacements, replacement] }), { moveSliders: true })
        }
      } else {
        const passage = await insertPassage({ scenarioId: state.scenarioId, context, instruction: note })
        if (passage) {
          const insert = { after: anchorForGap(popup.gapIdx), text: passage }
          pushHistory(snap)
          dispatch({ type: 'ADD_INSERT', insert })
          flash(passage)
          evaluate(composeLetter(strat, { ...state, inserts: [...state.inserts, insert] }), { moveSliders: true })
        }
      }
    } finally {
      setBusy(false)
      setPopup(null)
      setPopupNote('')
    }
  }

  // ---------- IMAGE tool ----------
  const onFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    const gapIdx = pendingGapRef.current ?? paras.length - 1
    pendingGapRef.current = null
    const reader = new FileReader()
    reader.onload = () => {
      pushHistory()
      dispatch({ type: 'ADD_INSERT', insert: { after: anchorForGap(gapIdx), text: `[image:${reader.result}]` } })
    }
    reader.readAsDataURL(f)
  }

  // hover controls on an inserted image — the marker text doubles as the
  // identity key into state.inserts (images only ever live there)
  const findImageInsert = (marker) => state.inserts.findIndex((ins) => ins.text === marker)
  const resizeImage = (marker, delta) => {
    const i = findImageInsert(marker)
    if (i === -1) return
    const next = Math.min(100, Math.max(30, imageWidth(marker) + delta))
    if (next === imageWidth(marker)) return
    pushHistory()
    dispatch({
      type: 'SET_INSERTS',
      inserts: state.inserts.map((ins, j) => (j === i ? { ...ins, text: imageMarker(imageSrc(marker), next) } : ins)),
    })
  }
  const removeImage = (marker) => {
    const i = findImageInsert(marker)
    if (i === -1) return
    pushHistory()
    dispatch({ type: 'SET_INSERTS', inserts: state.inserts.filter((_, j) => j !== i) })
  }

  // ---------- Add something else (draft-anchored suggestions) ----------
  // Opening the panel asks the model for three insertions anchored to the
  // CURRENT letter (suggestInsertions falls back to the strategy's
  // generation-time list without AI); a shimmer shows while it thinks.
  const toggleAdd = () => {
    const opening = !addOpen
    setAddOpen(opening)
    setPopup(null)
    if (!opening) return
    setAddNote('')
    setAddSugs(null)
    suggestInsertions({ scenarioId: state.scenarioId, strategy: strat, paras: paras.filter((p) => !isImagePara(p)) })
      .then((sugs) => setAddSugs(sugs))
      .catch(() => setAddSugs(strat.add || []))
  }

  const pickAdd = (sug) => {
    // `after` indexes the displayed letter — anchor it to a base paragraph.
    const insert = { after: anchorForGap(sug.after), text: sug.text }
    pushHistory()
    dispatch({ type: 'ADD_INSERT', insert })
    // the used card leaves; the other suggestions and the custom field stay
    // (the button toggles the whole panel away). Later anchors shift past
    // the paragraph that was just added so they keep their intended spot.
    setAddSugs((cur) =>
      cur ? cur.filter((s) => s !== sug).map((s) => (s.after > sug.after ? { ...s, after: s.after + 1 } : s)) : cur
    )
    flash(sug.text)
    evaluate(composeLetter(strat, { ...state, inserts: [...state.inserts, insert] }), { moveSliders: true })
  }

  // Custom addition: the writer describes the content/perspective to add; the
  // model writes it in the draft's voice and picks the recommended spot.
  const addCustom = async () => {
    const note = addNote.trim()
    if (!note || addBusy) return
    setAddBusy(true)
    try {
      const sug = await draftAddition({
        scenarioId: state.scenarioId,
        paras: paras.filter((p) => !isImagePara(p)),
        instruction: note,
      })
      if (!sug) return
      pickAdd(sug)
      setAddNote('')
    } finally {
      setAddBusy(false)
    }
  }

  // ---------- full-text tuning ----------
  const retune = async (nextTone, nextVerb) => {
    if (!aiMode) return
    dispatch({ type: 'SET_LETTER_LOADING', value: true })
    const base = state.letterParas || strat.paragraphs
    const next = await retuneLetter({ scenarioId: state.scenarioId, strategy: strat, paras: base, tone: nextTone, verbosity: nextVerb })
    dispatch({ type: 'SET_LETTER', paras: next })
    evaluate(composeLetter(strat, { ...state, letterParas: next }), { moveSliders: false })
  }
  const startDrag = () => {
    if (!dragSnapRef.current) dragSnapRef.current = snapshot()
  }
  const commitTune = () => {
    const snap = dragSnapRef.current
    dragSnapRef.current = null
    if (snap && (snap.tone !== state.tone || snap.verbosity !== state.verbosity)) pushHistory(snap)
    retune(state.tone, state.verbosity)
  }

  // ---------- top actions ----------
  const letterText = () =>
    paras.filter((p) => !isImagePara(p)).join('\n\n') + '\n\nBest,\n[Your name]'
  const copyLetter = () => {
    navigator.clipboard?.writeText(letterText())
    setCopied(true)
    clearTimeout(copiedTimer.current)
    copiedTimer.current = setTimeout(() => setCopied(false), 1400)
  }
  const saveDraft = () => {
    setSaved(true)
    clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaved(false), 1800)
  }

  const busyLabel = busy
    ? popup?.kind === 'insert'
      ? 'Writing…'
      : 'Revising…'
    : state.letterLoading
      ? 'Retuning…'
      : 'Re-reading…'

  return (
    // The daybreak + sparkle ground (.bw-cmp-bg) is painted by the app
    // wrapper in V2App so it runs the full viewport height.
    <main>
      <div
        className="bw-composer bw-sec-pad"
        style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 96px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}
      >
        {/* top action row */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <button className="bw-cmp-back" onClick={() => dispatch({ type: 'GOTO', screen: 'drafts' })}>← All Options</button>
          <div ref={topActionsRef} className="bw-cmp-top-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button variant="outline" iconLeft={<Icon name="star" size={16} />} onClick={saveDraft}>
              {saved ? 'Saved ✓' : 'Save as New Draft'}
            </Button>
            <button className="bw-cmp-send" onClick={() => dispatch({ type: 'GOTO', screen: 'send' })}>
              Review &amp; Send
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>

        {/* ---- draft panel ---- */}
        <section className="bw-cmp-panel" style={{ padding: '24px 16px 16px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-muted)', margin: '0 4px 12px' }}>
            Draft · Edited just now
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px 12px', flexWrap: 'wrap', margin: '0 4px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: 0 }}>
              Option {String(state.selectedIdx + 1).padStart(2, '0')}: {strat.name}
            </h1>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--text-3xs)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: badge.bg, color: badge.fg }}>
              {stanceLabel(strat.level)}
            </span>
            {strat.recommended && <span className="bw-rectag">✦ Recommended</span>}
          </div>

          {/* letter sheet */}
          <div ref={letterRef} className="bw-cmp-letter">
            <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: '8px 16px', alignItems: 'baseline', borderBottom: '1px solid var(--border-soft)', paddingBottom: 16, marginBottom: 24, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
              <span style={{ ...T_LABEL, color: 'var(--text-faint)' }}>To</span>
              <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{recipientLabel(scenario)}</span>
              <span style={{ ...T_LABEL, color: 'var(--text-faint)' }}>Re</span>
              <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{strat.subject}</span>
            </div>

            <div
              ref={bodyRef}
              className={`bw-cmp-body bw-cmp-body--${tool}`}
              style={{ opacity: state.letterLoading ? 0.5 : 1, userSelect: tool === 'edit' ? 'text' : 'none' }}
              onMouseMove={tool === 'insert' ? onBodyMove : undefined}
              onMouseLeave={() => setHoverPt(null)}
              onClick={tool === 'insert' ? onBodyClick : undefined}
              onScroll={() => {
                setHoverPt(null)
                setPopup(null)
              }}
            >
              {/* the rewrite selection's green ground — full-line-pitch rects
                  matching the native ::selection paint, behind the text
                  (z -1 inside the body's own stacking context) */}
              {popup?.kind === 'rewrite' &&
                popup.rects?.map((hr, i) => (
                  <span
                    key={`hl${i}`}
                    aria-hidden
                    style={{ position: 'absolute', left: hr.left, top: hr.top, width: hr.width, height: hr.height, background: '#10b981', zIndex: -1, pointerEvents: 'none' }}
                  />
                ))}
              {paras.map((text, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div
                      className={`bw-cmp-gap${popup?.kind === 'insert' && popup.mode === 'gap' && popup.gapIdx === i - 1 ? ' is-active' : ''}`}
                      onClick={tool !== 'edit' ? (e) => onGapClick(i - 1, e) : undefined}
                    >
                      <span className="bw-cmp-gapline" />
                      {tool === 'image' && (
                        <span className="bw-cmp-gapchip"><img src={`${GLYPHS}/insert-image-btn.svg`} alt="" /></span>
                      )}
                    </div>
                  )}
                  {isImagePara(text) ? (
                    <span className="bw-cmp-imgwrap" style={{ maxWidth: `${imageWidth(text)}%` }}>
                      <img className="bw-cmp-img" src={imageSrc(text)} alt="Inserted attachment" />
                      <span className="bw-cmp-imgtools" data-keep-add="">
                        <button
                          title="Smaller"
                          aria-label="Make image smaller"
                          disabled={imageWidth(text) <= 30}
                          onClick={(e) => { e.stopPropagation(); resizeImage(text, -15) }}
                        >
                          <MinusIcon />
                        </button>
                        <button
                          title="Larger"
                          aria-label="Make image larger"
                          disabled={imageWidth(text) >= 100}
                          onClick={(e) => { e.stopPropagation(); resizeImage(text, 15) }}
                        >
                          <Icon name="plus" size={15} />
                        </button>
                        <button
                          className="is-remove"
                          title="Remove image"
                          aria-label="Remove image"
                          onClick={(e) => { e.stopPropagation(); removeImage(text) }}
                        >
                          <XIcon />
                        </button>
                      </span>
                    </span>
                  ) : (
                    <p data-idx={i} style={{ background: i === flashIdx ? 'rgba(238,134,84,0.22)' : 'transparent', padding: i === flashIdx ? '2px 4px' : 0 }}>
                      {text}
                    </p>
                  )}
                </React.Fragment>
              ))}
              <div
                className={`bw-cmp-gap bw-cmp-gap--tail${popup?.kind === 'insert' && popup.mode === 'gap' && popup.gapIdx === paras.length - 1 ? ' is-active' : ''}`}
                onClick={tool !== 'edit' ? (e) => onGapClick(paras.length - 1, e) : undefined}
              >
                <span className="bw-cmp-gapline" />
                {tool === 'image' && (
                  <span className="bw-cmp-gapchip"><img src={`${GLYPHS}/insert-image-btn.svg`} alt="" /></span>
                )}
              </div>
              <div ref={sigRef} className="bw-cmp-sig">
                Best,
                <br />
                [Your name]
              </div>
            </div>

            {/* sentence-boundary caret (insert mode) — tracks the hover, then
                stays frozen in place while its popup is open */}
            {tool === 'insert' && hoverPt && !popup && (
              <div className="bw-cmp-caret" style={{ left: hoverPt.x, top: hoverPt.y, height: hoverPt.h }} />
            )}
            {popup?.kind === 'insert' && popup.caret && (
              <div className="bw-cmp-caret" style={{ left: popup.caret.x, top: popup.caret.y, height: popup.caret.h }} />
            )}

            {/* busy pill */}
            {(state.letterLoading || busy || evaluating) && (
              <div style={{ position: 'absolute', top: 12, right: 14, zIndex: 45, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 'var(--radius-pill)', background: 'var(--ink-800)', color: 'var(--paper-0)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '0.04em' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--peri-300)', animation: 'adv-spin 1s linear infinite' }} />
                {busyLabel}
              </div>
            )}

            {/* rewrite / insert popup */}
            {popup && (
              <div ref={popupRef} className="bw-cmp-pop" style={{ left: popup.x, top: popup.y, opacity: busy ? 0.75 : 1 }}>
                {popup.kind === 'rewrite' ? (
                  <>
                    <div className="bw-cmp-pop-quote">
                      “{popup.text.length > 76 ? popup.text.slice(0, 73) + '…' : popup.text}”
                    </div>
                    <div className="bw-cmp-pop-chips">
                      {QUICK_CHIPS.map((c) => (
                        <button key={c.mode} className="bw-cmp-chip" disabled={busy} onClick={() => applyQuick(c.mode)}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <div className="bw-cmp-pop-row">
                      <input
                        className="bw-cmp-pop-input"
                        value={popupNote}
                        onChange={(e) => setPopupNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyNote()}
                        placeholder="Describe a change…"
                        disabled={busy}
                      />
                      <button className="bw-cmp-pop-txtbtn" disabled={busy} onClick={applyNote}>
                        {busy ? '…' : 'Rewrite'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bw-cmp-pop-kicker">
                      {popup.mode === 'gap' ? 'New paragraph' : 'Insert between sentences'}
                    </div>
                    <div className="bw-cmp-pop-row">
                      <input
                        className="bw-cmp-pop-input"
                        autoFocus
                        value={popupNote}
                        onChange={(e) => setPopupNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyInsert()}
                        placeholder="What should it say?"
                        disabled={busy}
                      />
                      <button className="bw-cmp-pop-btn bw-cmp-pop-btn--blue" disabled={busy} onClick={applyInsert}>
                        {busy ? '…' : 'Write it'}
                      </button>
                    </div>
                    <div className="bw-cmp-pop-hint">Betterwords drafts it in your voice, right here.</div>
                  </>
                )}
              </div>
            )}

            {/* toolbar */}
            <div ref={toolsRef} className="bw-cmp-tools">
              <button
                className={`bw-cmp-tool bw-cmp-tool--edit${tool === 'edit' ? ' is-active' : ''}`}
                title="Edit text — select a passage to revise it"
                aria-label="Edit text tool"
                data-keep-add=""
                onClick={() => { setTool('edit'); setPopup(null); setHoverPt(null) }}
              >
                <img src={`${GLYPHS}/edit-text-btn.svg`} alt="" />
              </button>
              <button
                className={`bw-cmp-tool bw-cmp-tool--insert${tool === 'insert' ? ' is-active' : ''}`}
                title="Insert text — click between sentences or paragraphs"
                aria-label="Insert text tool"
                data-keep-add=""
                onClick={() => { setTool('insert'); setPopup(null) }}
              >
                <img src={`${GLYPHS}/insert-text-btn.svg`} alt="" />
              </button>
              <button
                className={`bw-cmp-tool bw-cmp-tool--image${tool === 'image' ? ' is-active' : ''}`}
                title="Insert image — click a gap to attach one"
                aria-label="Insert image tool"
                data-keep-add=""
                onClick={() => { setTool('image'); setPopup(null); setHoverPt(null) }}
              >
                <img src={`${GLYPHS}/insert-image-btn.svg`} alt="" />
              </button>

              <div style={{ flex: 1 }} />

              <button className="bw-cmp-mini" title="Undo" aria-label="Undo" data-keep-add="" disabled={!canUndo || busy || state.letterLoading} onClick={doUndo}>
                <RotateCcwIcon />
              </button>
              <button className="bw-cmp-mini" title="Copy the letter" aria-label="Copy the letter" onClick={copyLetter}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <span ref={addWrapRef} style={{ display: 'inline-flex', marginLeft: 4 }}>
                <button className="bw-cmp-addbtn" onClick={toggleAdd}>
                  <img src="/ds-v2/assets/glyphs/logo-star.svg" alt="" width={12} height={12} style={{ display: 'block' }} />
                  Add Something Else
                </button>
              </span>
            </div>

            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
          </div>

          {/* add-something-else — suggestions + a custom ask, below the letter
              card but inside the frosted draft panel */}
          {addOpen && (
            <div ref={addPanelRef} className="bw-cmp-addpanel">
              <div style={{ ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--text-muted)', marginBottom: 10 }}>
                Suggested for this draft
              </div>
              {addSugs == null
                ? [0, 1, 2].map((i) => (
                    <div key={i} className="bw-cmp-addsug" style={{ cursor: 'default' }}>
                      <div className="bw-shimmerbar" style={{ width: 120, height: 10, marginBottom: 8 }} />
                      <div className="bw-shimmerbar" style={{ width: '92%', height: 12 }} />
                    </div>
                  ))
                : addSugs.map((sug, i) => (
                    <button key={i} className="bw-cmp-addsug" disabled={addBusy} onClick={() => pickAdd(sug)}>
                      <div style={{ ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--accent)', marginBottom: 4 }}>{sug.label}</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)' }}>“{sug.text}”</div>
                    </button>
                  ))}
              <div style={{ ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--text-muted)', margin: '14px 0 8px' }}>
                Or describe your own
              </div>
              <div className="bw-cmp-pop-row">
                <input
                  className="bw-cmp-pop-input"
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                  placeholder="A detail, a perspective, a reassurance to add…"
                  disabled={addBusy}
                />
                <button className="bw-cmp-pop-txtbtn" disabled={addBusy || !addNote.trim()} onClick={addCustom}>
                  {addBusy ? 'Writing…' : 'Write & Add'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ---- right rail ---- */}
        <aside className="bw-composer-rail" style={{ position: 'sticky', top: 92, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="bw-cmp-panel" ref={tuneRef} data-keep-add="">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '0 4px 16px' }}>
              <h2 className="bw-cmp-panel-h2">Full-Text Tuning</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="bw-cmp-round" title="Undo" aria-label="Undo" data-keep-add="" disabled={!canUndo || busy || state.letterLoading} onClick={doUndo}>
                  <RotateCcwIcon size={15} />
                </button>
                <button className="bw-cmp-round" title="Redo" aria-label="Redo" data-keep-add="" disabled={!canRedo || busy || state.letterLoading} onClick={doRedo}>
                  <RotateCwIcon size={15} />
                </button>
              </div>
            </div>

            <div className="bw-cmp-inner">
              <TuneSlider
                label="Tone"
                word={toneWord}
                value={state.tone}
                startLabel="Soft"
                endLabel="Strong"
                onStart={startDrag}
                onChange={(v) => dispatch({ type: 'SET_TONE', value: v })}
                onCommit={commitTune}
              />
              <div style={{ height: 16 }} />
              <TuneSlider
                label="Length"
                word={verbLabel(state.verbosity)}
                value={state.verbosity}
                startLabel="Succinct"
                endLabel="Detailed"
                onStart={startDrag}
                onChange={(v) => dispatch({ type: 'SET_VERB', value: v })}
                onCommit={commitTune}
              />
            </div>
          </div>

          <div className="bw-cmp-panel" ref={evalRef} style={{ paddingTop: 24 }}>
            <h2 className="bw-cmp-panel-h2" style={{ margin: '0 4px 16px' }}>Evaluation</h2>

            <div className="bw-cmp-inner">
              <div className="bw-cmp-eval-label" style={{ color: 'var(--mint-600)' }}>Pros</div>
              <ul className="bw-cmp-eval-list" style={{ marginBottom: 14 }}>
                {pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              <div className="bw-cmp-eval-label" style={{ color: 'var(--honey-600)' }}>Cons</div>
              <ul className="bw-cmp-eval-list">
                {cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>

            <div className="bw-cmp-inner">
              <Meter label="Risk" value={lr} fill="var(--spark)" />
              <div style={{ height: 16 }} />
              <Meter label="Impact" value={le} fill="var(--accent)" />
            </div>

            <div className="bw-cmp-inner">
              <div className="bw-cmp-eval-label" style={{ color: 'var(--accent)' }}>Likely reaction</div>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)', margin: 0 }}>
                {state.evalReaction ?? strat.reaction}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {tour && <Onboarding steps={tourSteps} onDone={endTour} />}
    </main>
  )
}

function TuneSlider({ label, word, value, startLabel, endLabel, onStart, onChange, onCommit }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...T_LABEL, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--text-strong)' }}>{word}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        className="bw-cmp-range"
        style={{ background: `linear-gradient(90deg, var(--accent) 0% ${pct}%, var(--bg-sunken) ${pct}% 100%)` }}
        value={value}
        onMouseDown={onStart}
        onTouchStart={onStart}
        onKeyDown={onStart}
        onChange={(e) => onChange(+e.target.value)}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        onKeyUp={onCommit}
        aria-label={label}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  )
}

function Meter({ label, value, fill }) {
  return (
    <div>
      <div style={{ ...T_LABEL, color: 'var(--text-muted)', marginBottom: 7 }}>{label}</div>
      <div style={{ height: 8, background: 'var(--bg-sunken)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: fill, borderRadius: 'var(--radius-pill)', transition: 'width var(--dur-slow) var(--ease-out)' }} />
      </div>
    </div>
  )
}
