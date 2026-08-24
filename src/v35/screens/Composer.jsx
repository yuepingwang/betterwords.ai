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
  rephrase,
} from '../lib/advisor'
import Onboarding from '../components/Onboarding'
import { RecapRail } from '../components/ClarifyRecap'
import { ContextPanel } from '../components/ContextPanel'
import { useAuth, AccountControl } from '../lib/auth'
import { saveDraftVersion } from '../lib/db'
import './Composer.css'

// The composer's own sunset (Figma "main body" 449:2180): translucent paper
// over the base, cresting honey → pink → periwinkle → teal at the fold. The
// stops are this screen's palette, not Daybreak tokens; the night footer's
// lip picks up the same teal so the sweep continues.
export const COMPOSER_SUNSET_LIP = '#5FD0C0'
export const COMPOSER_GROUND =
  'linear-gradient(180deg, rgba(251, 247, 239, 0.75) 85%, #EBD46A 90%, #EC7FB0 94%, #6E88E4 98%, #5FD0C0 100%), linear-gradient(90deg, var(--paper-1) 0%, var(--paper-1) 100%)'

// Versioned: bump when the tour content changes so everyone sees it once more.
const ONBOARD_KEY = 'bw_onboarded_composer5'
const GLYPHS = '/ds-v35/assets/glyphs'

const QUICK_CHIPS = [
  { mode: 'soften', label: 'Soften' },
  { mode: 'firmer', label: 'Firmer' },
  { mode: 'shorten', label: 'Shorter' },
  { mode: 'detail', label: 'Add Detail' },
]

// The Evaluation card's pros/cons. AI strategies may ship their own
// `pros`/`cons`; these are the per-stance fallbacks. (The stance badge
// colors moved into DS2.DraftPanel.)
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
  const { Badge, Sparkle, Button, Icon, DraftPanel, Logo, Tooltip } = DS2

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

  // The letter card (sheet + tools bar) is capped so its bottom keeps the
  // same 40px window reserve as the clarify-recap summary card (see
  // ClarifyRecap.jsx's maxHeight); the sheet sizes to the message inside
  // that cap and scrolls only when it hits it.
  const cardRef = useRef(null)
  const [railCap, setRailCap] = useState(null)
  useEffect(() => {
    const measure = () => {
      const el = cardRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      setRailCap(Math.max(360, window.innerHeight - top - 40))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Header frost — clear until the page scrolls and the letter card slides
  // under it (mirrors SiteHeader's frost-on-scroll).
  const [hdrFrosted, setHdrFrosted] = useState(false)
  useEffect(() => {
    const onScroll = () => setHdrFrosted(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bottom-bar tune trays (Figma 449:2915 / 449:3569): "Adjust your tone" /
  // "Adjust the length" expand under the pill bar. Adjustments save
  // themselves — leaving a selection instance (selecting other text, another
  // tool, the other tray, Done) commits its settled version as ONE undo
  // entry, so slider back-and-forth never litters the history. Cancel still
  // reverts just the instance in hand.
  // Dev deep-link (matches `?tour=0`): `&tray=tone|length` opens a tray on
  // load for design review/screenshots.
  const [tray, setTray] = useState(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('tray')
      return t === 'tone' || t === 'length' ? t : null
    } catch {
      return null
    }
  })
  const trayBaseRef = useRef(null)
  // While a tray is open the whole letter is "selected" by default (peri
  // highlight, magic cursor); dragging with the magic cursor narrows the
  // adjustment to that passage instead. null → the full text.
  const [tuneSel, setTuneSel] = useState(null)
  // Live preview while dragging: every slider settle re-derives the letter
  // FROM THE TRAY'S BASE SNAPSHOT (so previews never compound), debounced so
  // the model isn't called at drag rate. `previewSeq` drops stale responses.
  const liveRef = useRef({})
  const previewTimer = useRef(null)
  const previewSeq = useRef(0)
  const evalSeqRef = useRef(0)
  const lastPreviewRef = useRef(null)

  // `selOverride`/`baseOverride` let a commit run one final settle pass for a
  // selection instance the writer just left (so "Done"/re-scope beating the
  // 350ms debounce never drops the last drag) — with an override the preview
  // doesn't touch tuneSel, and the caller gets back the applied letter fields
  // to re-baseline from.
  const runTunePreview = async (selOverride, baseOverride) => {
    const base = baseOverride ?? trayBaseRef.current
    if (!base) return null
    const hasSelOverride = selOverride !== undefined
    const sel = hasSelOverride ? selOverride : liveRef.current.tuneSel
    const { tone, verbosity } = liveRef.current
    const seq = ++previewSeq.current
    // Back at the baseline → put the base text back verbatim.
    if (tone === base.tone && verbosity === base.verbosity) {
      const { sugs, ...letter } = base.snap
      dispatch({ type: 'RESTORE_EDIT', ...letter })
      lastPreviewRef.current = { tone, verbosity, sel: sel?.find ?? sel?.text ?? null }
      return letter
    }
    const baseParas = base.snap.letterParas || strat.paragraphs || []
    dispatch({ type: 'SET_LETTER_LOADING', value: true })
    try {
      if (sel?.text) {
        // Passage-only adjustment → rewritePassage (OpenAI; heuristic
        // fallback without a key), applied over the base replacements.
        const asks = []
        if (tone !== base.tone) asks.push(`shift its tone to ${TONE_WORD[bucket(tone)].toLowerCase()} — about ${tone} on a 0–100 soft-to-strong scale`)
        if (verbosity !== base.verbosity) asks.push(`make it ${verbLabel(verbosity).toLowerCase()} — about ${verbosity} on a 0–100 succinct-to-detailed scale`)
        const rep = await rewritePassage({
          text: sel.find ?? sel.text,
          instruction: `Rewrite only this passage to ${asks.join(', and ')}. Keep its meaning, facts, and the writer's voice; return only the rewritten passage.`,
          context: (convo ? `${convo}\n\n` : '') + paras.join('\n\n'),
        })
        if (seq !== previewSeq.current) return null
        const replacements = [...base.snap.replacements, { find: sel.find ?? sel.text, replace: rep }]
        dispatch({ type: 'RESTORE_EDIT', letterParas: base.snap.letterParas, replacements, inserts: base.snap.inserts, tone, verbosity })
        // the freshly generated text is now "the selection" (still anchored
        // to its original base passage, so repeated drags never compound) —
        // unless this is a settle pass for an instance already left behind
        if (!hasSelOverride) setTuneSel({ text: rep, find: sel.find ?? sel.text })
        evaluate(composeLetter(strat, { ...state, letterParas: base.snap.letterParas, replacements, inserts: base.snap.inserts }), { moveSliders: false })
        lastPreviewRef.current = { tone, verbosity, sel: sel.find ?? sel.text }
        return { letterParas: base.snap.letterParas, replacements, inserts: base.snap.inserts, tone, verbosity }
      } else if (aiMode) {
        // Full-text adjustment → retuneLetter regenerates the draft (OpenAI).
        // (Static scenarios re-derive from tone variants in composeLetter,
        // so their text already tracks the sliders live.)
        const rfFallback = isReplyDraft
          ? baseParas.map((p) => rephrase(p, bucket(tone) === 'soft' ? 'soften' : bucket(tone) === 'strong' ? 'firmer' : verbosity < 50 ? 'shorten' : 'detail'))
          : null
        const next = await retuneLetter({ scenarioId: state.scenarioId, strategy: strat, paras: baseParas, tone, verbosity, convo, fallbackParas: rfFallback })
        if (seq !== previewSeq.current) return null
        dispatch({ type: 'SET_LETTER', paras: next })
        evaluate(composeLetter(strat, { ...state, letterParas: next, replacements: base.snap.replacements, inserts: base.snap.inserts }), { moveSliders: false })
        lastPreviewRef.current = { tone, verbosity, sel: null }
        return { letterParas: next, replacements: base.snap.replacements, inserts: base.snap.inserts, tone, verbosity }
      }
      lastPreviewRef.current = { tone, verbosity, sel: sel?.find ?? sel?.text ?? null }
      return null
    } finally {
      if (seq === previewSeq.current) dispatch({ type: 'SET_LETTER_LOADING', value: false })
    }
  }
  // A `?tray=` deep link skips openTray — seed the same state on mount:
  // base snapshot for previews/Cancel, first paragraph pre-selected.
  useEffect(() => {
    if (!tray || trayBaseRef.current) return
    trayBaseRef.current = {
      tone: state.tone,
      verbosity: state.verbosity,
      snap: snapshot(),
      eval: { why: state.evalWhy, reaction: state.evalReaction, pros: state.evalPros, cons: state.evalCons, risk: state.evalRisk, impact: state.evalImpact },
    }
    const firstPara = paras.find((p) => !isImagePara(p))
    if (firstPara) setTuneSel({ text: firstPara, find: firstPara })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scheduleTunePreview = () => {
    clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(runTunePreview, 350)
  }

  const closeTray = (commit, { settle = true } = {}) => {
    const base = trayBaseRef.current
    trayBaseRef.current = null
    clearTimeout(previewTimer.current)
    setTray(null)
    setTuneSel(null)
    if (!base) return
    if (commit) {
      const changed = base.tone !== state.tone || base.verbosity !== state.verbosity
      if (changed) {
        // Keep what the live preview produced; undo returns to the pre-tray
        // letter in one step. If the last drag hasn't previewed yet (the
        // close beat the debounce), run that final pass now — except where
        // the caller is about to restore other state itself (settle: false),
        // where a late-landing preview would clobber it.
        pushHistory(base.snap)
        const lp = lastPreviewRef.current
        const cur = liveRef.current.tuneSel
        const sel = cur ? cur.find ?? cur.text : null
        if (settle && (!lp || lp.tone !== state.tone || lp.verbosity !== state.verbosity || lp.sel !== sel)) {
          runTunePreview(cur ?? null, base)
        }
      }
    } else {
      // Cancel — put back everything the previews touched: text, edits, both
      // sliders, AND the evaluation (risk / impact / likely reaction), exactly
      // as the tray found them; in-flight previews and reads are dropped.
      previewSeq.current += 1
      evalSeqRef.current += 1
      setEvaluating(false)
      restoreEntry(base.snap)
      if (base.eval) dispatch({ type: 'SET_EVAL', ...base.eval })
    }
    lastPreviewRef.current = null
  }
  // Leaving the current selection instance for a NEW scope (dragging a new
  // selection, or clicking back to full text) while the sliders have moved:
  // commit that instance to the edit history and re-baseline the open tray
  // on the committed letter, so the next instance's drags stack on top of it
  // instead of lifting it off. Called through a ref so the mouseup listener
  // (bound once per tray) always sees fresh state.
  const rescopeTune = async (prevSel) => {
    const base = trayBaseRef.current
    if (!base) return
    const { tone, verbosity } = liveRef.current
    if (tone === base.tone && verbosity === base.verbosity) return // untouched sliders → nothing to save
    clearTimeout(previewTimer.current)
    pushHistory(base.snap)
    // If the last drag hasn't previewed yet, settle it against the instance
    // that's being left before the new one takes over.
    const lp = lastPreviewRef.current
    const prevKey = prevSel ? prevSel.find ?? prevSel.text : null
    let applied = null
    if (!lp || lp.tone !== tone || lp.verbosity !== verbosity || lp.sel !== prevKey) {
      applied = await runTunePreview(prevSel ?? null, base)
    }
    if (!applied) applied = { letterParas: state.letterParas, replacements: state.replacements, inserts: state.inserts, tone, verbosity }
    trayBaseRef.current = {
      tone,
      verbosity,
      snap: { ...applied, sugs: addSugs },
      eval: { why: state.evalWhy, reaction: state.evalReaction, pros: state.evalPros, cons: state.evalCons, risk: state.evalRisk, impact: state.evalImpact },
    }
    lastPreviewRef.current = null
  }
  const rescopeTuneRef = useRef()
  rescopeTuneRef.current = rescopeTune

  const openTray = (which) => {
    setAddOpen(false)
    setPopup(null)
    if (tray === which) return closeTray(true)
    // switching trays commits the open tray's pending adjustment first (no
    // settle pass — its late dispatch would fight the fresh base snapshot)
    if (tray) closeTray(true, { settle: false })
    trayBaseRef.current = {
      tone: state.tone,
      verbosity: state.verbosity,
      snap: snapshot(),
      // the last saved evaluation — Cancel puts these back
      eval: { why: state.evalWhy, reaction: state.evalReaction, pros: state.evalPros, cons: state.evalCons, risk: state.evalRisk, impact: state.evalImpact },
    }
    lastPreviewRef.current = null
    // behave as if the writer just selected the first paragraph — slider
    // drags rewrite it; they can re-select to change the scope
    const firstPara = paras.find((p) => !isImagePara(p))
    setTuneSel(firstPara ? { text: firstPara, find: firstPara } : null)
    setTray(which)
  }

  // Magic-cursor selection while a tray is open: drag in the letter to limit
  // the adjustment to a passage; a plain click in the letter goes back to
  // the full-text default. Interacting with the tray keeps the selection.
  useEffect(() => {
    if (!tray) return
    const onUp = (e) => {
      if (!bodyRef.current?.contains(e.target)) return
      const sel = window.getSelection()
      let next = null
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0)
        if (!bodyRef.current.contains(range.commonAncestorContainer)) return
        const text = sel.toString().trim()
        if (text.length >= 3) next = { text, find: text }
      }
      // Re-scoping — narrowing to a passage OR clicking back to the full-text
      // default — auto-saves the instance being left: its settled adjustment
      // becomes one undo entry and the tray re-baselines on it, so the new
      // scope's drags stack on top. Untouched sliders → nothing to save.
      const prev = liveRef.current.tuneSel || null
      if ((prev?.text || null) !== (next?.text || null)) rescopeTuneRef.current?.(prev)
      setTuneSel(next)
    }
    document.addEventListener('mouseup', onUp)
    return () => document.removeEventListener('mouseup', onUp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tray])

  // Reply/follow-up drafts (from the reply flow) become a first-class AI
  // strategy: the generated draft is its `paragraphs`, so every composer
  // tool (retune, rewrite, insert, evaluate, suggest) takes the real model
  // path instead of the static scenario scaffolding.
  const rf = state.replyFlow
  const isReplyDraft = Boolean(rf && (rf.mode === 'respond' || rf.mode === 'followup') && rf.draftParas?.length)
  const strat = isReplyDraft
    ? {
        ...selected,
        paragraphs: rf.draftParas,
        name: rf.moveTitle || (rf.mode === 'followup' ? 'The Follow-up' : 'The Response'),
        recommended: false,
      }
    : selected
  // The ongoing-correspondence context, threaded into every AI tool prompt
  // so edits stay anchored to what was actually said.
  const rfMsgs = rf?.thread?.messages || []
  const rfLastSent = [...rfMsgs].reverse().find((m) => m.kind === 'sent' || m.kind === 'followup')
  const convo = isReplyDraft
    ? [
        `This message is the writer's ${rf.mode === 'followup' ? 'FOLLOW-UP after receiving no reply' : 'RESPONSE to a reply'} in an ongoing correspondence.`,
        rfLastSent?.body && `The writer's previous message:\n"""${rfLastSent.body}"""`,
        rf.mode === 'respond' && rf.replyText && `The reply being responded to:\n"""${rf.replyText}"""`,
      ]
        .filter(Boolean)
        .join('\n\n')
    : ''
  const aiMode = Boolean(strat?.paragraphs?.length)
  const paras = composeLetter(strat, state)
  const flashIdx = flashText ? paras.findIndex((p) => p.includes(flashText)) : -1

  // Fresh values for the debounced tune previews (closures in setTimeout
  // would otherwise read a stale render).
  liveRef.current = { tone: state.tone, verbosity: state.verbosity, tuneSel }

  // Meters and pros/cons prefer the model's fresh read of the CURRENT letter
  // (store.eval*), falling back to slider heuristics / per-stance copy.
  const lr = state.evalRisk ?? liveRisk(strat, state.tone, state.verbosity)
  const le = state.evalImpact ?? liveEff(strat, state.tone, state.verbosity)
  const toneWord = TONE_WORD[bucket(state.tone)]
  const levelEval = LEVEL_EVAL[strat.level] || LEVEL_EVAL.balanced
  const pros = state.evalPros?.length ? state.evalPros : strat.pros?.length ? strat.pros : levelEval.pros
  const cons = state.evalCons?.length ? state.evalCons : strat.cons?.length ? strat.cons : levelEval.cons

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

  // The header help button (V35App) bumps tourAsk to replay the tour.
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
    { getEl: () => letterRef.current, title: 'Work right on the letter', body: 'With the edit tool, select any passage and tell BetterWords how to reword it. With the insert tool, click between sentences or paragraphs to add something new; the image tool attaches pictures.' },
    { getEl: () => toolsRef.current, title: 'Your editing tools', body: 'Edit, insert, and image tools on the left — the active one lights up. Undo, redo, and copy-the-letter sit on the right.' },
    { getEl: () => tuneRef.current, title: 'Tune it with the critters', body: '“Adjust Your Tone” and “Adjust the Length” rewrite the selected passage live as you drag — the first paragraph starts selected, or select your own. “Add Something Else” suggests passages written for this draft.' },
    { getEl: () => evalRef.current, title: 'Read the room before you send', body: 'Pros, cons, risk, impact, and the likely reaction — re-read as you edit and tune, so you can decide whether it’s ready or needs another pass.' },
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
  // An open tray whose sliders have moved holds a not-yet-committed edit —
  // undo treats it like any other change (commit, then step back over it).
  const trayPending = Boolean(trayBaseRef.current && (trayBaseRef.current.tone !== state.tone || trayBaseRef.current.verbosity !== state.verbosity))
  const canUndo = histRef.current.undo.length > 0 || trayPending
  const canRedo = histRef.current.redo.length > 0 && !trayPending
  const restoreEntry = (entry) => {
    const { sugs, ...letter } = entry
    dispatch({ type: 'RESTORE_EDIT', ...letter })
    if (sugs != null) setAddSugs(sugs)
  }
  const doUndo = () => {
    if (busy || state.letterLoading) return
    // commit the pending tray adjustment first (no settle pass — the restore
    // below must win), so undo reverts it and redo can bring it back
    if (trayBaseRef.current) closeTray(true, { settle: false })
    const h = histRef.current
    if (!h.undo.length) return
    h.redo.push(snapshot())
    restoreEntry(h.undo.pop())
    setHistTick((t) => t + 1)
  }
  const doRedo = () => {
    if (busy || state.letterLoading) return
    if (trayBaseRef.current) closeTray(true, { settle: false })
    const h = histRef.current
    if (!h.redo.length) return
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
    const seq = ++evalSeqRef.current
    setEvaluating(true)
    evaluateLetter({ scenarioId: state.scenarioId, strategy: strat, paras: nextParas.filter((p) => !isImagePara(p)), convo })
      .then((res) => {
        if (seq !== evalSeqRef.current) return
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
      .finally(() => {
        if (seq === evalSeqRef.current) setEvaluating(false)
      })
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
    if (tray || addOpen) return // tune selections belong to the tray, not the rewrite popup
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
      const rep = await rewritePassage({ text: popup.text, mode, instruction, context: (convo ? `${convo}\n\n` : '') + paras.join('\n\n') })
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
    if (tray || addOpen || tool !== 'insert' || busy || popup) return
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
    if (tray || addOpen || tool !== 'insert' || !hoverPt || busy) return
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
    if (tray || addOpen || busy) return
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
        const passage = await insertPassage({ scenarioId: state.scenarioId, before, after, context, instruction: note, convo })
        if (passage) {
          const replacement = { find: para, replace: [before, passage, after].filter(Boolean).join(' ') }
          pushHistory(snap)
          dispatch({ type: 'ADD_REPLACEMENT', replacement })
          flash(passage)
          evaluate(composeLetter(strat, { ...state, replacements: [...state.replacements, replacement] }), { moveSliders: true })
        }
      } else {
        const passage = await insertPassage({ scenarioId: state.scenarioId, context, instruction: note, convo })
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
    suggestInsertions({ scenarioId: state.scenarioId, strategy: strat, paras: paras.filter((p) => !isImagePara(p)), convo })
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
        convo,
      })
      if (!sug) return
      pickAdd(sug)
      setAddNote('')
    } finally {
      setAddBusy(false)
    }
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
  const auth = useAuth()
  const saveDraft = () => {
    const flash = (v) => {
      setSaved(v)
      clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSaved(false), 1800)
    }
    // No accounts backend configured → the button stays cosmetic, as before.
    if (!auth.configured) return flash('ok')
    const doSave = () =>
      saveDraftVersion({
        threadId: state.threadId,
        scenario,
        state,
        subject: selected?.subject,
        body: letterText(),
      })
        .then((tid) => {
          if (tid !== state.threadId) dispatch({ type: 'SET_THREAD', threadId: tid })
          flash('ok')
        })
        .catch((err) => {
          console.warn('[save draft]', err?.message || err)
          flash('err')
        })
    // The sign-in gate lives here (see ACCOUNTS-PLAN.md): compose freely
    // anonymously; the first save is the moment that needs an account.
    if (auth.signedIn) doSave()
    else auth.openSignIn(doSave)
  }

  const busyLabel = busy
    ? popup?.kind === 'insert'
      ? 'Writing…'
      : 'Revising…'
    : state.letterLoading
      ? 'Retuning…'
      : 'Re-reading…'

  // "Add Something Else" — suggestions + a custom ask; sits below the letter
  // sheet but inside the frosted draft panel, via DraftPanel's footer slot.
  const addPanel = !addOpen ? null : (
    <div>
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
  )

  return (
    // The daybreak + sparkle ground (.bw-cmp-bg) is painted by the app
    // wrapper in V35App so it runs the full viewport height.
    <main>
      {/* ---- the composer's own header — the draft actions live IN the
          sticky bar (per the new_header_for_composer wireframe): gradient
          wordmark left; help · Save as New Draft · Review & Send · account
          right. V35App skips SiteHeader on this screen. */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          // clear over the sunset until scrolling brings the letter card
          // under it — then the frost + hairline fade in (same contract as
          // SiteHeader; the hairline is a shadow so the height never shifts)
          background: hdrFrosted ? 'color-mix(in srgb, var(--bg-elevated) 55%, transparent)' : 'transparent',
          backdropFilter: hdrFrosted ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: hdrFrosted ? 'blur(10px)' : 'none',
          boxShadow: hdrFrosted ? '0 1px 0 var(--border-hair)' : 'none',
          transition: 'background 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out)',
        }}
      >
        <div style={{ width: '100%', boxSizing: 'border-box', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <span style={{ cursor: 'pointer', display: 'inline-flex' }} onClick={() => dispatch({ type: 'GO_LANDING' })}>
            <Logo variant="gradient" size={24} />
          </span>
          <div ref={topActionsRef} className="bw-cmp-top-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Tooltip content="Show me around the composer" side="bottom">
              <button className="bw-cmp-help" aria-label="Replay the composer tour" onClick={() => dispatch({ type: 'ASK_TOUR' })}>
                <img src={`${GLYPHS}/question.svg`} alt="" />
              </button>
            </Tooltip>
            <Button variant="outline" iconLeft={<Icon name="star" size={15} />} onClick={saveDraft} style={{ height: 40, padding: '0 var(--space-5)', fontSize: 'var(--text-xs)' }}>
              {saved === 'err' ? 'Couldn’t save' : saved ? 'Saved ✓' : 'Save as New Draft'}
            </Button>
            <button className="bw-cmp-send" onClick={() => dispatch({ type: 'GOTO', screen: 'send' })}>
              Review &amp; Send
              <Icon name="send" size={16} />
            </button>
            <AccountControl compact />
          </div>
        </div>
      </header>
      {/* The composer's "main body" (Figma 449:2180) fills the viewport below
          the 68px header — its sunset crests at the fold, and the teal-lipped
          night footer continues it under the fold. */}
      <div
        className="bw-cmp2-ground"
        style={{
          width: '100%',
          minHeight: 'calc(100vh - 68px)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          backgroundImage: COMPOSER_GROUND,
        }}
      >
      <div
        className="bw-composer"
        style={{ width: '100%', maxWidth: 1236, margin: '0 auto', padding: '20px 28px 64px', boxSizing: 'border-box', flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'center' }}
      >
        {/* ---- left column: back link + the writing context ------------
            New conversation → the frosted Clarify recap (Figma Sidebar,
            449:2788). Reply / follow-up → the thread's Context panel
            (449:3223), same card as the conversation page. */}
        {/* reply mode's ContextPanel is 240 wide (vs the 256 recap) — size the
            column to match so the gap to the letter card stays exactly 16px,
            the same as the gap to the evaluation cards on the right */}
        <div style={{ width: isReplyDraft && rf?.thread ? 240 : 256, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 24, display: 'flex', alignItems: 'center' }}>
            {state.replyFlow?.mode === 'respond' || state.replyFlow?.mode === 'followup' ? (
              <button className="bw-cmp-back" onClick={() => dispatch({ type: 'GOTO', screen: 'replyflow' })}>← All Options</button>
            ) : state.replyFlow?.mode === 'draft' && state.threadId ? (
              <button className="bw-cmp-back" onClick={() => dispatch({ type: 'OPEN_CONVERSATION', threadId: state.threadId })}>← Conversation</button>
            ) : (
              <button className="bw-cmp-back" onClick={() => dispatch({ type: 'GOTO', screen: 'drafts' })}>← All Drafts</button>
            )}
          </div>
          {isReplyDraft && rf?.thread ? (
            <ContextPanel
              frost
              thread={rf.thread}
              msgs={rfMsgs.filter((m) => m.kind !== 'draft_version')}
              drafts={rfMsgs.filter((m) => m.kind === 'draft_version')}
            />
          ) : (
            <RecapRail />
          )}
        </div>

        {/* ---- center column: option header + the letter card ---------- */}
        <div style={{ flex: '1 1 644px', maxWidth: 644, minWidth: 460, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* option header row (Figma 449:3201) */}
          <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16, color: 'var(--ink-700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isReplyDraft ? strat.name : `Option ${String(state.selectedIdx + 1).padStart(2, '0')}: ${strat.name}`}
              </span>
              <span style={{ flexShrink: 0, background: 'rgba(169, 201, 244, 0.5)', borderRadius: 'var(--radius-pill)', padding: '5px 10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)' }}>
                {stanceLabel(strat.level)}
              </span>
              {!!strat.recommended && (
                <span style={{ flexShrink: 0, backgroundImage: 'var(--grad-aurora)', borderRadius: 'var(--radius-pill)', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--paper-0)', boxShadow: 'var(--shadow-xs)' }}>
                  <Sparkle size={9} style={{ color: 'var(--paper-0)' }} /> Recommended
                </span>
              )}
            </div>
            <span style={{ flexShrink: 0, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, letterSpacing: '1px', color: 'var(--ink-400)', whiteSpace: 'nowrap' }}>
              {state.replyFlow ? (state.replyFlow.mode === 'followup' ? 'Follow-up · Edited just now' : 'Response · Edited just now') : 'Draft · Edited just now'}
            </span>
          </div>

          {/* letter card (Figma 449:5131): white sheet on top, glass action
              bar below carrying the tool row + pill tabs + trays */}
          <div ref={cardRef} style={{ display: 'flex', flexDirection: 'column', maxHeight: railCap ?? undefined }}>
            {/* letter sheet (449:5132) */}
            <div ref={letterRef} className="bw-cmp2-sheet">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '21px 20px 14px' }}>
                {[
                  ['TO', (state.replyFlow?.thread?.recipient || recipientLabel(scenario) || '').split(/[—·]/)[0].trim()],
                  ['RE', state.subjectOverride || strat.subject],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(115, 115, 115, 0.8)', width: 20, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-900)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ margin: '0 20px', borderBottom: '1.5px solid rgba(21, 18, 62, 0.1)' }} />

            <div
              ref={bodyRef}
              className={`bw-cmp-body bw-cmp2-body${tray || addOpen ? '' : ` bw-cmp-body--${tool}`}${tray ? ' bw-cmp2-body--tune' : ''}${addOpen ? ' bw-cmp2-body--quiet' : ''}`}
              style={{ flex: 1, minHeight: 0, maxHeight: 'none', opacity: state.letterLoading ? 0.5 : 1, userSelect: tray ? 'text' : addOpen ? 'none' : tool === 'edit' ? 'text' : 'none' }}
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
                      {tray && tuneSel?.text === text ? <span className="bw-cmp2-hl">{text}</span> : text}
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
            {tool === 'insert' && hoverPt && !popup && !tray && !addOpen && (
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

            </div>{/* /sheet */}

            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />

            {/* glass action bar (449:5161): tool row + pill tabs + trays */}
            <div ref={tuneRef} className="bw-cmp2-bar bw-recap-frost" data-keep-add="">
              {/* tool row — the active tool goes quiet while a tray or the
                  add panel has the stage (449:4774) */}
              <div ref={toolsRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className={`bw-cmp2-tool bw-cmp2-tool--edit${tool === 'edit' && !tray && !addOpen ? ' is-active' : ''}`}
                    title="Edit text — select a passage to revise it"
                    aria-label="Edit text tool"
                    data-keep-add=""
                    onClick={() => { setTool('edit'); setPopup(null); setHoverPt(null); closeTray(true); setAddOpen(false) }}
                  >
                    <span className="bw-cmp2-glyph" style={{ WebkitMaskImage: `url(${GLYPHS}/cmp-tool-edit.svg)`, maskImage: `url(${GLYPHS}/cmp-tool-edit.svg)` }} />
                  </button>
                  <button
                    className={`bw-cmp2-tool bw-cmp2-tool--insert${tool === 'insert' && !tray && !addOpen ? ' is-active' : ''}`}
                    title="Insert text — click between sentences or paragraphs"
                    aria-label="Insert text tool"
                    data-keep-add=""
                    onClick={() => { setTool('insert'); setPopup(null); closeTray(true); setAddOpen(false) }}
                  >
                    <span className="bw-cmp2-glyph" style={{ WebkitMaskImage: `url(${GLYPHS}/cmp-tool-insert.svg)`, maskImage: `url(${GLYPHS}/cmp-tool-insert.svg)` }} />
                  </button>
                  <button
                    className={`bw-cmp2-tool bw-cmp2-tool--image${tool === 'image' && !tray && !addOpen ? ' is-active' : ''}`}
                    title="Insert image — click a gap to attach one"
                    aria-label="Insert image tool"
                    data-keep-add=""
                    onClick={() => { setTool('image'); setPopup(null); setHoverPt(null); closeTray(true); setAddOpen(false) }}
                  >
                    <span className="bw-cmp2-glyph" style={{ WebkitMaskImage: `url(${GLYPHS}/cmp-tool-image.svg)`, maskImage: `url(${GLYPHS}/cmp-tool-image.svg)` }} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="bw-cmp2-mini" title="Undo" aria-label="Undo" data-keep-add="" disabled={!canUndo || busy || state.letterLoading} onClick={doUndo}>
                    <RotateCcwIcon size={18} />
                  </button>
                  <button className="bw-cmp2-mini" title="Redo" aria-label="Redo" data-keep-add="" disabled={!canRedo || busy || state.letterLoading} onClick={doRedo}>
                    <RotateCwIcon size={18} />
                  </button>
                  <button className="bw-cmp2-mini" title="Copy the letter" aria-label="Copy the letter" onClick={copyLetter}>
                    {copied ? <CheckIcon size={19} /> : <CopyIcon size={19} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span ref={addWrapRef} style={{ display: 'flex', flex: 1, minWidth: 0 }}>
                  <PillTab
                    art="/ds-v35/assets/characters/cmp-add-octo.png"
                    label="Add Something Else"
                    active={addOpen}
                    onClick={() => { closeTray(true); toggleAdd() }}
                  />
                </span>
                <PillTab
                  art="/ds-v35/assets/characters/cmp-pill-tone.png"
                  label="Adjust Your Tone"
                  active={tray === 'tone'}
                  onClick={() => openTray('tone')}
                />
                <PillTab
                  art="/ds-v35/assets/characters/cmp-pill-length.png"
                  label="Adjust the Length"
                  active={tray === 'length'}
                  onClick={() => openTray('length')}
                />
              </div>

              {addOpen && (
                <div ref={addPanelRef} className="bw-cmp2-tray" style={{ display: 'block' }}>
                  {addPanel}
                </div>
              )}

              {tray === 'tone' && (
                <TuneTray
                  noSel={!tuneSel}
                  kind="tone"
                  value={state.tone}
                  word={toneWord}
                  startLabel="Soft"
                  endLabel="Strong"
                  fill="linear-gradient(90deg, var(--blue-700) 0%, var(--mint-600) 47%, #FFAA22 92%, #FF6224 130%)"
                  thumbColor="#3D52D6"
                  busy={state.letterLoading}
                  onChange={(v) => { dispatch({ type: 'SET_TONE', value: v }); scheduleTunePreview() }}
                  onCancel={() => closeTray(false)}
                  onDone={() => closeTray(true)}
                />
              )}
              {tray === 'length' && (
                <TuneTray
                  noSel={!tuneSel}
                  kind="length"
                  value={state.verbosity}
                  word={verbLabel(state.verbosity)}
                  startLabel="Succinct"
                  endLabel="Detailed"
                  fill="linear-gradient(90deg, var(--peach-300), var(--peach-500))"
                  thumbColor="var(--peach-500)"
                  busy={state.letterLoading}
                  onChange={(v) => { dispatch({ type: 'SET_VERB', value: v }); scheduleTunePreview() }}
                  onCancel={() => closeTray(false)}
                  onDone={() => closeTray(true)}
                />
              )}
            </div>
          </div>{/* /letter card */}
        </div>{/* /center column */}

        {/* ---- right column: evaluation cards (449:2995 / 3100 / 3141) --- */}
        <aside ref={evalRef} className="bw-composer-rail" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 40 }}>
          <div className="bw-cmp2-card">
            <h2 className="bw-cmp2-card-h2">Pros &amp; Cons</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                <span className="bw-cmp2-eval-kicker">Pros</span>
                <img src={`${GLYPHS}/cmp-thumbs-up.svg`} alt="" width={12} height={12} />
              </div>
              {pros.map((p, i) => (
                <div key={i} className="bw-cmp2-evalchip" style={{ background: 'var(--mint-200)', color: 'var(--mint-600)' }}>{p}</div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                <span className="bw-cmp2-eval-kicker">Cons</span>
                <img src={`${GLYPHS}/cmp-thumbs-down.svg`} alt="" width={12} height={12} />
              </div>
              {cons.map((c, i) => (
                <div key={i} className="bw-cmp2-evalchip" style={{ background: 'var(--peach-100)', color: 'var(--spark)' }}>{c}</div>
              ))}
            </div>
          </div>

          <div className="bw-cmp2-card">
            <h2 className="bw-cmp2-card-h2">Risk &amp; Impact</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="bw-cmp2-eval-kicker">Risk</span>
              <MeterBar value={lr} fill="linear-gradient(90deg, var(--honey-500), var(--coral-400))" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="bw-cmp2-eval-kicker">Impact</span>
              <MeterBar value={le} fill="linear-gradient(90deg, var(--blue-700), var(--blue-500))" />
            </div>
          </div>

          <div className="bw-cmp2-card">
            <h2 className="bw-cmp2-card-h2">Likely Reaction</h2>
            <p style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontStyle: 'italic', fontSize: 13, lineHeight: '20px', color: 'var(--accent)', margin: 0 }}>
              {state.evalReaction ?? strat.reaction}
            </p>
          </div>
        </aside>
      </div>
      </div>{/* /ground */}

      {tour && <Onboarding steps={tourSteps} onDone={endTour} />}
    </main>
  )
}

// ---- bottom-bar pill tab (Figma 449:2905) --------------------------

function PillTab({ art, label, active, onClick }) {
  return (
    <button type="button" className={`bw-cmp2-pill${active ? ' is-active' : ''}`} data-keep-add="" onClick={onClick} aria-pressed={active}>
      <span className="bw-cmp2-pill-art"><img src={art} alt="" /></span>
      <span className="bw-cmp2-pill-label">{label}</span>
    </button>
  )
}

// ---- expanded tune tray (Figma 449:2915 / 3569) --------------------

function TuneTray({ kind, value, word, startLabel, endLabel, fill, thumbColor, busy, noSel = false, onChange, onCancel, onDone }) {
  const pct = Math.max(0, Math.min(100, value))
  const railRef = useRef(null)

  // Length tray (Figma 449:6234 short / 449:6492 long): the dog IS the
  // slider — grab its head and drag; the rear stays pinned at "succinct"
  // while the body stretches to wherever the head goes.
  const dragTo = (clientX) => {
    const r = railRef.current?.getBoundingClientRect()
    if (!r || !r.width) return
    onChange(Math.round(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))))
  }
  const startHeadDrag = (e) => {
    if (noSel) return
    e.preventDefault()
    dragTo(e.clientX)
    const move = (ev) => dragTo(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const DOGS = '/ds-v35/assets/characters'
  return (
    <div className="bw-cmp2-tray" data-keep-add="">
      <div title={noSel ? 'Select some text in the letter to adjust it' : undefined} style={{ flex: '0 0 260px', position: 'relative', paddingTop: kind === 'length' ? 48 : 34, opacity: noSel ? 0.45 : 1, transition: 'opacity 0.15s var(--ease-out)' }}>
        {kind === 'tone' ? (
          // the chameleon perches on the tone thumb — no transition, so it
          // tracks the slider 1:1, and it's a drag handle itself
          <img
            src="/ds-v35/assets/characters/chameleon.svg"
            alt="Drag the chameleon to adjust the tone"
            title="Drag me — softer or stronger"
            onPointerDown={startHeadDrag}
            onDragStart={(e) => e.preventDefault()}
            style={{ position: 'absolute', bottom: 26, left: `calc(${pct}% - 22px)`, width: 44, cursor: noSel ? 'default' : 'ew-resize', touchAction: 'none', userSelect: 'none', filter: 'drop-shadow(0 3px 5px rgba(28,23,70,0.18))' }}
          />
        ) : (
          // stretchy dog rig — z-order: rear (1) under the body band (2)
          // under the draggable head (3)
          <>
            <img
              src={`${DOGS}/dog_end.svg`}
              alt=""
              aria-hidden
              style={{ position: 'absolute', left: -6, bottom: 22, height: 54, zIndex: 1, pointerEvents: 'none' }}
            />
            <div
              aria-hidden
              style={{ position: 'absolute', left: 16, width: `max(0px, calc(${pct}% - 16px))`, bottom: 32, height: 36, boxSizing: 'border-box', background: '#F9BF9E', borderTop: '4px solid #1C1746', borderBottom: '4px solid #1C1746', zIndex: 2, pointerEvents: 'none' }}
            />
            <img
              src={`${DOGS}/dog_head.svg`}
              alt="Drag the dog's head to adjust the length"
              title="Drag me — longer or shorter"
              onPointerDown={startHeadDrag}
              onDragStart={(e) => e.preventDefault()}
              style={{ position: 'absolute', left: `calc(${pct}% - 20px)`, bottom: 22, height: 50, zIndex: 3, cursor: noSel ? 'default' : 'ew-resize', touchAction: 'none', userSelect: 'none' }}
            />
          </>
        )}
        <input
          ref={railRef}
          type="range"
          min="0"
          max="100"
          className="bw-cmp2-range"
          style={{ '--fill': fill, '--pct': `${pct}%`, '--thumb': thumbColor }}
          value={value}
          disabled={noSel}
          onChange={(e) => onChange(+e.target.value)}
          aria-label={kind === 'tone' ? 'Tone' : 'Length'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, letterSpacing: '0.1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>
      <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontStyle: 'italic', fontSize: 20, letterSpacing: '0.2px', color: '#16246E' }}>
        {word}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" className="bw-cmp2-traybtn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className="bw-cmp2-traybtn is-done" onClick={onDone} disabled={busy}>{busy ? '…' : 'Done'}</button>
      </div>
    </div>
  )
}

function MeterBar({ value, fill }) {
  return (
    <div style={{ position: 'relative', height: 8, background: 'var(--paper-2)', borderRadius: 12, boxShadow: '0 1px 4px rgba(21,18,62,0.05), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
      <div style={{ width: `${value}%`, height: '100%', backgroundImage: fill, borderRadius: 12, boxShadow: '0 1px 4px rgba(21,18,62,0.05)', transition: 'width var(--dur-slow) var(--ease-out)' }} />
    </div>
  )
}

