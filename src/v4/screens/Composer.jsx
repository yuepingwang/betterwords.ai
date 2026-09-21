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
import { useAuth, AccountControl } from '../lib/auth'
import { saveDraftVersion } from '../lib/db'
import './Composer.css'

// Kept for Drafts.jsx, which still paints the previous sunset ground.
export const COMPOSER_SUNSET_LIP = '#5C7BEB'
export const COMPOSER_GROUND =
  'linear-gradient(180deg, #FBF7EF 90%, #F5C659 93%, #F27A66 96%, #A688E4 98%, #5C7BEB 100%), linear-gradient(90deg, #FBF7EF 0%, #FBF7EF 100%)'

// The v4 composer (Figma section 660:2835 / 668:3326 / 636:6296 / 659:2466 /
// 636:6685): white header band, full-bleed pastel image ground, 300/700/300
// columns with 6px gaps, and a 48px round tool-button set (641:7743).
const ONBOARD_KEY = 'bw_onboarded_composer7'
const GLYPHS = '/ds-v4/assets/glyphs'
const G4 = '/ds-v4/assets/glyphs/cmp4'
// The static pastel image ground (background-image-light.png) rendered
// live: every color blob of the reference placed as a blurred ellipse
// (positions/colors sampled from the image), drifting very slowly, under
// a resolution-locked grain overlay.
const BG_BASE = '#FBEFEA'
// one entry per blob in the reference image: [left%, top%, width%, height%, color, opacity, drift variant, duration s, delay s]
const BG_BLOBS = [
  ['30%', '28%', '42%', '42%', '#F9E3E6', 0.55, 'c', 74, -20], // soft pink wash, center
  ['56%', '20%', '36%', '32%', '#F8DABC', 0.75, 'b', 66, -8],  // apricot wash, upper right
  ['1%', '4%', '25%', '27%', '#B9D3F1', 0.9, 'a', 58, 0],      // powder blue, top left
  ['-5%', '21%', '15%', '17%', '#C3D9F3', 0.8, 'b', 62, -30],  // blue, left edge
  ['7%', '33%', '23%', '21%', '#FAEFB4', 0.9, 'c', 60, -14],   // butter, upper left-mid
  ['-4%', '49%', '15%', '19%', '#F8D8B0', 0.85, 'a', 68, -40], // peach, left edge
  ['-3%', '66%', '19%', '21%', '#C9DDF4', 0.85, 'b', 56, -22], // pale blue, lower left
  ['37%', '72%', '19%', '23%', '#FAF0B6', 0.9, 'a', 64, -33],  // butter, bottom center
  ['77%', '50%', '23%', '29%', '#AFE3C4', 0.9, 'c', 70, -5],   // mint, lower right
  ['83%', '0%', '19%', '17%', '#F6D8E3', 0.7, 'b', 72, -48],   // pink tint, top right
  ['91%', '11%', '9%', '9%', '#DCD6F2', 0.7, 'a', 54, -26],    // lilac speck, top right
]
// grain tile: 128x128 texels of fractal noise; sized so each texel is
// exactly TWO device pixels (the "smallest unit" x2 at this screen's
// resolution — cf. the landing grain, which supersamples the same unit)
const GRAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='2.6' intercept='-0.8'/%3E%3CfeFuncG type='linear' slope='2.6' intercept='-0.8'/%3E%3CfeFuncB type='linear' slope='2.6' intercept='-0.8'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")"
const GRAIN_TILE_CSS = typeof window !== 'undefined' ? 256 / (window.devicePixelRatio || 1) : 128
const REDUCE_MOTION =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const QUICK_CHIPS = [
  { mode: 'soften', label: 'Soften' },
  { mode: 'firmer', label: 'Firmer' },
  { mode: 'shorten', label: 'Shorter' },
  { mode: 'detail', label: 'Add Detail' },
]

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

// Contexts panel rows: short field labels per clarify-question id, in the
// design's order; unmapped ids fall back to the question's own title.
const FIELD_LABELS = {
  harm: 'About',
  what: 'About',
  say: 'What I need to say',
  to: 'Sharing with',
  who: 'Who it’s for',
  goal: 'Desired outcome',
  seek: 'Desired outcome',
  urgency: 'Urgency',
  rel: 'Relationship dynamics',
  power: 'Relationship dynamics',
  fear: 'My biggest worries',
  understand: 'What they should understand',
  directness: 'How direct',
}
const FIELD_ORDER = ['About', 'Desired outcome', 'Urgency', 'Relationship dynamics', 'My biggest worries']

// Inserted images travel through the letter state as marker paragraphs.
const isImagePara = (t) => typeof t === 'string' && t.startsWith('[image:') && t.endsWith(']')
const imageSrc = (t) => t.slice(7, -1).split('|w=')[0]
const imageWidth = (t) => {
  const m = t.match(/\|w=(\d+)\]$/)
  return m ? Number(m[1]) : 78
}
const imageMarker = (src, w) => `[image:${src}|w=${w}]`

function sentenceBoundaries(text) {
  const pts = []
  const re = /[.!?…]["'”’)\]]*\s+/g
  let m
  while ((m = re.exec(text))) pts.push(m.index + m[0].length)
  pts.push(text.length)
  return pts
}

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

const CheckIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
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

// ---- the reusable 48px tool button (Figma component set 641:7743) ----
// Edit tools swap to a white glyph on their color when active; critter
// tools sit on the sand chip. One component, two families.
const TOOLS = {
  edit: { family: 'edit', icon: 'tool-edit', activeIcon: 'tool-edit-white', title: 'Edit text — select a passage to revise it' },
  insert: { family: 'insert', icon: 'tool-insert', activeIcon: 'tool-insert-white', title: 'Insert text — click between sentences or paragraphs' },
  image: { family: 'image', icon: 'tool-image', activeIcon: 'tool-image-white', title: 'Insert image — click a gap to attach one' },
  // The critter art ships taller than its slot — the design shows a fixed
  // crop window (36×23 / 36×18 / 36×19, dog mirrored) over each image.
  add: { family: 'critter', icon: 'octo', h: 23, title: 'Add something else — passages written for this draft' },
  tone: { family: 'critter', icon: 'chameleon-sm', h: 18, imgStyle: { width: '100.5%', height: '115%' }, title: 'Adjust the tone' },
  length: { family: 'critter', icon: 'dog-sm', h: 19, imgStyle: { width: '100%', height: '120%', transform: 'scaleX(-1)' }, title: 'Adjust the length' },
}
function ToolButton({ kind, active, onClick }) {
  const t = TOOLS[kind]
  const critter = t.family === 'critter'
  const icon = !critter && active ? t.activeIcon : t.icon
  return (
    <button
      type="button"
      className={`bw-cmp4-tool bw-cmp4-tool--${critter ? 'critter' : t.family}${active ? ' is-active' : ''}`}
      title={t.title}
      aria-label={t.title}
      aria-pressed={active}
      onClick={onClick}
    >
      {critter ? (
        <span style={{ width: 36, height: t.h, overflow: 'hidden', display: 'inline-block', position: 'relative' }}>
          <img
            src={`${G4}/${t.icon}.png`}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: 36, height: t.h, objectFit: 'cover', objectPosition: 'top', ...t.imgStyle }}
          />
        </span>
      ) : (
        <img className="bw-cmp4-tool-ic" src={`${G4}/${icon}.svg`} alt="" />
      )}
    </button>
  )
}

// ---- the reusable header pill (Back / Review & Send / Save / help) ----
// "To: Your landlord — Mr. Aubert": the role word ("landlord") and the
// name ("Mr. Aubert") are separate inline-editable segments — dotted
// underlines by default, click to edit (Enter/blur commits, Esc cancels).
// A leading "Your "/"My " on the role stays fixed; only the role word edits.
function InlineEdit({ value, ariaLabel, onCommit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)
  useEffect(() => {
    if (editing) {
      setDraft(value)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [editing]) // eslint-disable-line react-hooks/exhaustive-deps
  const commit = () => {
    setEditing(false)
    const v = draft.trim()
    if (v && v !== value) onCommit(v)
  }
  if (editing) {
    return (
      <input
        ref={inputRef}
        className="bw-cmp4-toline-input"
        value={draft}
        size={Math.max(4, draft.length + 1)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        aria-label={ariaLabel}
      />
    )
  }
  return (
    <button type="button" className="bw-cmp4-toline-name" title={`Edit the ${ariaLabel}`} onClick={() => setEditing(true)}>
      {value}
    </button>
  )
}

function RecipientLine({ role, name, onCommitRole, onCommitName }) {
  // keep a leading "Your " / "My " fixed; the editable role segment is the
  // word after it ("landlord")
  const m = /^((?:your|my)\s+)(.+)$/i.exec(role || '')
  const rolePrefix = m ? m[1] : ''
  const roleWord = m ? m[2] : role || ''
  return (
    <p className="bw-cmp4-toline">
      To: {rolePrefix}
      <InlineEdit value={roleWord} ariaLabel="recipient’s role" onCommit={(w) => onCommitRole(rolePrefix + w)} />
      {name != null && (
        <>
          {' — '}
          <InlineEdit value={name} ariaLabel="recipient’s name" onCommit={onCommitName} />
        </>
      )}
    </p>
  )
}

function PillButton({ primary, back, icon, children, ...rest }) {
  return (
    <button
      type="button"
      className={`bw-cmp4-pill${primary ? ' bw-cmp4-pill--primary' : ''}${back ? ' bw-cmp4-pill--back' : ''}${!children ? ' bw-cmp4-pill--icon' : ''}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

// ---- tray slider ------------------------------------------------------
// The v4 track (300px, #F0E9DB + gradient fill) carries the v3.5 critter
// rigs: the 44px chameleon perches ON the thumb and is itself a drag
// handle (no transition, tracks 1:1); the dog IS the length slider — rear
// pinned at "short", the bordered body band stretches, and the 50px head
// drags. The hidden range input keeps track-clicks and keyboard.
const CHARS = '/ds-v4/assets/characters'
function TraySlider({ kind, value, onChange, disabled }) {
  const pct = Math.max(0, Math.min(100, value))
  const railRef = useRef(null)
  const fill =
    kind === 'tone'
      ? 'linear-gradient(90deg, #2B45D4 0%, #2F9E6D 47.5%, #FFAA22 92%, #FF6224 130%)'
      : 'linear-gradient(90deg, #F9BF9E 0%, #F27A66 130%)'
  const labels = kind === 'tone' ? ['Soft', 'Strong'] : ['Short', 'Long']
  const dragTo = (clientX) => {
    const r = railRef.current?.getBoundingClientRect()
    if (!r || !r.width) return
    onChange(Math.round(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))))
  }
  const startHeadDrag = (e) => {
    if (disabled) return
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
  return (
    <div className="bw-cmp4-slider" style={{ paddingTop: kind === 'length' ? 40 : 34 }}>
      {/* the round thumb dot on the track — layered in FRONT of the
          critter, a 12px take on v3.5's white dot with the colored ring */}
      <span
        aria-hidden
        className="bw-cmp4-thumb-ring"
        style={{ position: 'absolute', bottom: 15.5, left: `${pct}%`, transform: 'translateX(-50%)', width: 12, height: 12, zIndex: 4, borderColor: kind === 'tone' ? '#3D52D6' : '#EE8654', pointerEvents: 'none' }}
      />
      {kind === 'tone' ? (
        <img
          src={`${CHARS}/chameleon.svg`}
          alt="Drag the chameleon to adjust the tone"
          title="Drag me — softer or stronger"
          onPointerDown={startHeadDrag}
          onDragStart={(e) => e.preventDefault()}
          style={{ position: 'absolute', bottom: 23, left: `calc(${pct}% - 26px)`, width: 52, zIndex: 3, cursor: disabled ? 'default' : 'ew-resize', touchAction: 'none', userSelect: 'none', filter: 'drop-shadow(0 3px 5px rgba(28,23,70,0.18))' }}
        />
      ) : (
        <>
          {/* v3.5 rig at ~80% scale — the tray reads lighter at this size */}
          <img
            src={`${CHARS}/dog_end.svg`}
            alt=""
            aria-hidden
            style={{ position: 'absolute', left: -5, bottom: 21, height: 43, zIndex: 1, pointerEvents: 'none' }}
          />
          <div
            aria-hidden
            style={{ position: 'absolute', left: 13, width: `max(0px, calc(${pct}% - 13px))`, bottom: 29, height: 29, boxSizing: 'border-box', background: '#F9BF9E', borderTop: '3px solid #1C1746', borderBottom: '3px solid #1C1746', zIndex: 2, pointerEvents: 'none' }}
          />
          <img
            src={`${CHARS}/dog_head.svg`}
            alt="Drag the dog's head to adjust the length"
            title="Drag me — longer or shorter"
            onPointerDown={startHeadDrag}
            onDragStart={(e) => e.preventDefault()}
            style={{ position: 'absolute', left: `calc(${pct}% - 16px)`, bottom: 21, height: 40, zIndex: 3, cursor: disabled ? 'default' : 'ew-resize', touchAction: 'none', userSelect: 'none' }}
          />
        </>
      )}
      <div ref={railRef} className="bw-cmp4-slider-track">
        <span className="bw-cmp4-slider-fill" style={{ width: `${pct}%`, backgroundImage: fill }} />
      </div>
      <div className="bw-cmp4-slider-labels">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(+e.target.value)}
        aria-label={kind === 'tone' ? 'Tone' : 'Length'}
      />
    </div>
  )
}

export default function Composer() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Icon } = DS2

  const letterRef = useRef(null) // the letter card — popup coordinates anchor here
  const bodyRef = useRef(null)
  const sigRef = useRef(null)
  const popupRef = useRef(null)
  const dockRef = useRef(null)
  const leftRef = useRef(null)
  const railRef = useRef(null)
  const actionsRef = useRef(null)
  const fileRef = useRef(null)
  const pendingGapRef = useRef(null)
  const suppressOpenRef = useRef(false)
  const flashTimer = useRef(null)
  const savedTimer = useRef(null)
  const copiedTimer = useRef(null)
  const rafRef = useRef(null)
  const histRef = useRef({ undo: [], redo: [] })
  // Tray machinery: previews re-derive from the tray's base snapshot so
  // slider drags never compound; leaving the tray auto-commits ONE undo
  // entry (the X close, tool switches, and undo itself all commit).
  const trayBaseRef = useRef(null)
  const previewTimer = useRef(null)
  const previewSeq = useRef(0)
  const evalSeqRef = useRef(0)
  const lastPreviewRef = useRef(null)
  const liveRef = useRef({})

  const [tool, setTool] = useState('edit') // 'edit' | 'insert' | 'image'
  const [tray, setTray] = useState(null) // null | 'add' | 'tone' | 'length'
  const [popup, setPopup] = useState(null)
  const [popupNote, setPopupNote] = useState('')
  const [hoverPt, setHoverPt] = useState(null)
  const [flashText, setFlashText] = useState(null)
  const [busy, setBusy] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tour, setTour] = useState(false)
  const [, setHistTick] = useState(0)
  const [ctxOpen, setCtxOpen] = useState(true)
  const [histOpen, setHistOpen] = useState(false)
  const [accPros, setAccPros] = useState(true)
  const [accFeed, setAccFeed] = useState(true)
  const [addSugs, setAddSugs] = useState(null)
  const [addNote, setAddNote] = useState('')
  const [addBusy, setAddBusy] = useState(false)

  // Cap the letter card so its bottom keeps the design's 24px reserve.
  const [cardCap, setCardCap] = useState(null)
  useEffect(() => {
    const measure = () => {
      const el = letterRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      setCardCap(Math.max(480, window.innerHeight - top - 24))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Reply/follow-up drafts become a first-class AI strategy.
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

  liveRef.current = { tone: state.tone, verbosity: state.verbosity }

  const lr = state.evalRisk ?? liveRisk(strat, state.tone, state.verbosity)
  const le = state.evalImpact ?? liveEff(strat, state.tone, state.verbosity)
  const levelEval = LEVEL_EVAL[strat.level] || LEVEL_EVAL.balanced
  // Pros/cons arrive from the model as { text, quote } — the quote is the
  // verbatim passage in the letter the point is grounded in. Static
  // fallbacks are plain strings (no quote → the row isn't clickable).
  const evRow = (p) => (typeof p === 'string' ? { text: p, quote: null } : p)
  const pros = (state.evalPros?.length ? state.evalPros : strat.pros?.length ? strat.pros : levelEval.pros).map(evRow)
  const cons = (state.evalCons?.length ? state.evalCons : strat.cons?.length ? strat.cons : levelEval.cons).map(evRow)
  const meterWord = (v) => (v < 40 ? 'Low' : v < 70 ? 'Medium' : 'High')
  const rowQuote = state.evalWhy || 'Based on this draft’s current wording'

  // Clicking a pro/con paints its quoted passage in the letter (CSS Custom
  // Highlight — mint for pros, honey for cons) and scrolls it into view;
  // the paint lifts after a few seconds. Falls back through
  // case-insensitive and smart-quote / whitespace-tolerant matching, then
  // to the paragraph flash.
  const evidenceTimer = useRef(null)
  const clearEvidence = () => {
    if (typeof Highlight === 'undefined' || !CSS.highlights) return
    CSS.highlights.delete('bw-evidence-pro')
    CSS.highlights.delete('bw-evidence-con')
  }
  const highlightEvidence = (quote, kind = 'pro') => {
    if (!quote || !bodyRef.current) return
    let target = null
    let start = -1
    let len = 0
    const paraEls = [...bodyRef.current.querySelectorAll('p[data-idx]')]
    for (const p of paraEls) {
      const tn = p.firstChild
      if (!tn || tn.nodeType !== Node.TEXT_NODE) continue
      const t = tn.textContent
      let i = t.indexOf(quote)
      if (i === -1) i = t.toLowerCase().indexOf(quote.toLowerCase())
      if (i !== -1) {
        target = p
        start = i
        len = quote.length
        break
      }
    }
    if (!target) {
      const esc = quote
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/["“”]/g, '["“”]')
        .replace(/['‘’]/g, "['‘’]")
        .replace(/\s+/g, '\\s+')
      let re
      try {
        re = new RegExp(esc, 'i')
      } catch {
        re = null
      }
      if (re) {
        for (const p of paraEls) {
          const tn = p.firstChild
          if (!tn || tn.nodeType !== Node.TEXT_NODE) continue
          const m = re.exec(tn.textContent)
          if (m) {
            target = p
            start = m.index
            len = m[0].length
            break
          }
        }
      }
    }
    if (!target) return flash(quote)
    clearTimeout(evidenceTimer.current)
    const tn = target.firstChild
    const range = document.createRange()
    range.setStart(tn, Math.min(start, tn.length))
    range.setEnd(tn, Math.min(start + len, tn.length))
    if (typeof Highlight !== 'undefined' && CSS.highlights) {
      clearEvidence()
      CSS.highlights.set(`bw-evidence-${kind}`, new Highlight(range))
      evidenceTimer.current = setTimeout(clearEvidence, 3200)
    }
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  // "Your landlord — Mr. Aubert": role and (placeholder) name are separate
  // inline-editable segments; overrides live in the store
  const rawRecipient = rf?.thread?.recipient || scenario?.recipient || recipientLabel(scenario) || ''
  const [roleBase, nameBase] = rawRecipient.split(/[—·]/).map((p) => p.trim())
  const recipientRole = state.recipientRoleOverride || roleBase || ''
  const recipientName = state.recipientOverride || nameBase || null
  const recipient = recipientName ? `${recipientRole} — ${recipientName}` : recipientRole
  const subject = state.subjectOverride || strat.subject

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
    if (new URLSearchParams(window.location.search).get('tour') === '0') return
    let seen = false
    try {
      seen = localStorage.getItem(ONBOARD_KEY) === '1'
    } catch {
      /* private mode */
    }
    if (!seen) setTour(true)
  }, [])
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
    { getEl: () => letterRef.current, title: 'Work right on the letter', body: 'With the edit tool, select any passage and tell BetterWords how to reword it. With the insert tool, click between sentences or paragraphs; the image tool attaches pictures.' },
    { getEl: () => dockRef.current, title: 'Tools and critters', body: 'Edit, insert, and image tools on the left; the octopus suggests passages, and the chameleon and dog open tone and length sliders that rewrite the letter live. Undo, redo, and copy sit on the right.' },
    { getEl: () => leftRef.current, title: 'Your context, at hand', body: 'Everything you told BetterWords stays beside the letter — tuck it away with “Hide Contexts”, or hop back with “Edit my answers”.' },
    { getEl: () => railRef.current, title: 'Read the room before you send', body: 'Pros, cons, risk, impact, and the likely reaction — re-read as you edit. Each panel folds away when you want the letter to breathe.' },
    { getEl: () => actionsRef.current, title: 'Save it, then send it', body: 'Keep this version with “Save as New Draft”, and when it feels right, “Review & Send”. Replay this tour anytime with the smiley button.' },
  ]

  // ---------- popup dismissal + cleanup ----------
  useEffect(() => {
    if (!popup) return
    const onDocDown = (e) => {
      if (popupRef.current?.contains(e.target)) return
      if (popup && bodyRef.current?.contains(e.target)) suppressOpenRef.current = true
      setPopup(null)
      setPopupNote('')
      setHoverPt(null)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [popup])

  useEffect(() => {
    if (popup?.kind !== 'rewrite' || !popup.range) return
    if (typeof Highlight === 'undefined' || !CSS.highlights) return
    CSS.highlights.set('bw-rewrite', new Highlight(popup.range))
    return () => CSS.highlights.delete('bw-rewrite')
  }, [popup])

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(flashTimer.current)
      clearTimeout(savedTimer.current)
      clearTimeout(copiedTimer.current)
      clearTimeout(previewTimer.current)
      clearTimeout(evidenceTimer.current)
      if (typeof Highlight !== 'undefined' && CSS.highlights) {
        CSS.highlights.delete('bw-evidence-pro')
        CSS.highlights.delete('bw-evidence-con')
      }
    },
    [],
  )

  const flash = (text) => {
    setFlashText(text)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashText(null), 1200)
  }

  // ---------- undo / redo ----------
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
  const restoreEntry = (entry) => {
    const { sugs, ...letter } = entry
    dispatch({ type: 'RESTORE_EDIT', ...letter })
    if (sugs != null) setAddSugs(sugs)
  }
  // An open tray whose slider has moved holds a not-yet-committed edit.
  const trayPending = Boolean(trayBaseRef.current && (trayBaseRef.current.tone !== state.tone || trayBaseRef.current.verbosity !== state.verbosity))
  const canUndo = histRef.current.undo.length > 0 || trayPending
  const canRedo = histRef.current.redo.length > 0 && !trayPending
  const doUndo = () => {
    if (busy || state.letterLoading) return
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

  // ---------- evaluation ----------
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
        if (moveSliders) {
          if (res.tone != null) dispatch({ type: 'SET_TONE', value: res.tone })
          if (res.verbosity != null) dispatch({ type: 'SET_VERB', value: res.verbosity })
        }
      })
      .finally(() => {
        if (seq === evalSeqRef.current) setEvaluating(false)
      })
  }
  useEffect(() => {
    evaluate(paras)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedIdx])

  // ---------- tone / length trays (full-letter retune) ----------
  const runTunePreview = async (baseOverride) => {
    const base = baseOverride ?? trayBaseRef.current
    if (!base) return null
    const { tone, verbosity } = liveRef.current
    const seq = ++previewSeq.current
    if (tone === base.tone && verbosity === base.verbosity) {
      const { sugs, ...letter } = base.snap
      dispatch({ type: 'RESTORE_EDIT', ...letter })
      lastPreviewRef.current = { tone, verbosity }
      return base.snap
    }
    if (!aiMode) {
      // static scenarios re-derive from tone variants inside composeLetter,
      // so the text already tracks the sliders — just re-read the letter
      evaluate(composeLetter(strat, { ...state, tone, verbosity }))
      lastPreviewRef.current = { tone, verbosity }
      return null
    }
    const baseParas = base.snap.letterParas || strat.paragraphs || []
    dispatch({ type: 'SET_LETTER_LOADING', value: true })
    try {
      const rfFallback = isReplyDraft
        ? baseParas.map((p) => rephrase(p, bucket(tone) === 'soft' ? 'soften' : bucket(tone) === 'strong' ? 'firmer' : verbosity < 50 ? 'shorten' : 'detail'))
        : null
      const next = await retuneLetter({ scenarioId: state.scenarioId, strategy: strat, paras: baseParas, tone, verbosity, convo, fallbackParas: rfFallback })
      if (seq !== previewSeq.current) return null
      dispatch({ type: 'SET_LETTER', paras: next })
      evaluate(composeLetter(strat, { ...state, letterParas: next, replacements: base.snap.replacements, inserts: base.snap.inserts }))
      lastPreviewRef.current = { tone, verbosity }
      return { ...base.snap, letterParas: next, tone, verbosity }
    } finally {
      if (seq === previewSeq.current) dispatch({ type: 'SET_LETTER_LOADING', value: false })
    }
  }
  const scheduleTunePreview = () => {
    clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(runTunePreview, 350)
  }
  // Closing a tray auto-saves: the settled adjustment becomes ONE undo
  // entry (slider back-and-forth collapses into it). `settle: false` skips
  // the final catch-up pass when the caller is about to restore state.
  const closeTray = (commit = true, { settle = true } = {}) => {
    const base = trayBaseRef.current
    trayBaseRef.current = null
    clearTimeout(previewTimer.current)
    setTray(null)
    if (!base) return
    if (commit) {
      const changed = base.tone !== state.tone || base.verbosity !== state.verbosity
      if (changed) {
        pushHistory(base.snap)
        const lp = lastPreviewRef.current
        if (settle && (!lp || lp.tone !== state.tone || lp.verbosity !== state.verbosity)) {
          runTunePreview(base)
        }
      }
    }
    lastPreviewRef.current = null
  }
  const openTray = (which) => {
    setPopup(null)
    setPopupNote('')
    setHoverPt(null)
    if (tray === which) return closeTray(true)
    if (tray === 'tone' || tray === 'length') closeTray(true, { settle: false })
    else if (tray === 'add') setTray(null)
    if (which === 'add') {
      setTray('add')
      setAddNote('')
      setAddSugs(null)
      suggestInsertions({ scenarioId: state.scenarioId, strategy: strat, paras: paras.filter((p) => !isImagePara(p)), convo })
        .then((sugs) => setAddSugs(sugs))
        .catch(() => setAddSugs(strat.add || []))
      return
    }
    trayBaseRef.current = { tone: state.tone, verbosity: state.verbosity, snap: snapshot() }
    lastPreviewRef.current = null
    setTray(which)
  }

  // ---------- EDIT tool: select → rewrite popup ----------
  const clampX = (x) => {
    const w = letterRef.current?.getBoundingClientRect().width || 700
    return Math.max(178, Math.min(w - 178, x))
  }
  const onLetterUp = () => {
    if (tray || tool !== 'edit') return
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
    const bodyEl = bodyRef.current
    const bodyRect = bodyEl.getBoundingClientRect()
    const pEl = range.startContainer.parentElement?.closest('p') || bodyEl.querySelector('p')
    const pitch = parseFloat(pEl ? getComputedStyle(pEl).lineHeight : '') || 24
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
    sel.removeAllRanges()
  }
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

  // ---------- INSERT tool ----------
  const onBodyMove = (e) => {
    if (tray || tool !== 'insert' || busy || popup) return
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
    if (tray || tool !== 'insert' || !hoverPt || busy) return
    setPopup({
      kind: 'insert',
      mode: 'sentence',
      paraIdx: hoverPt.paraIdx,
      offset: hoverPt.offset,
      x: clampX(hoverPt.x),
      y: hoverPt.y + hoverPt.h + 14,
      caret: { x: hoverPt.x, y: hoverPt.y, h: hoverPt.h },
    })
    setPopupNote('')
  }
  const onGapClick = (gapIdx, e) => {
    if (suppressOpenRef.current) {
      suppressOpenRef.current = false
      return
    }
    if (tray || busy) return
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

  // ---------- octopus tray: draft-anchored additions ----------
  const pickAdd = (sug) => {
    const insert = { after: anchorForGap(sug.after), text: sug.text }
    pushHistory()
    dispatch({ type: 'ADD_INSERT', insert })
    setAddSugs((cur) =>
      cur ? cur.filter((s) => s !== sug).map((s) => (s.after > sug.after ? { ...s, after: s.after + 1 } : s)) : cur
    )
    flash(sug.text)
    evaluate(composeLetter(strat, { ...state, inserts: [...state.inserts, insert] }), { moveSliders: true })
  }
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
    const flashSaved = (v) => {
      setSaved(v)
      clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSaved(false), 1800)
    }
    if (!auth.configured) return flashSaved('ok')
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
          flashSaved('ok')
        })
        .catch((err) => {
          console.warn('[save draft]', err?.message || err)
          flashSaved('err')
        })
    if (auth.signedIn) doSave()
    else auth.openSignIn(doSave)
  }
  const goBack =
    state.replyFlow?.mode === 'respond' || state.replyFlow?.mode === 'followup'
      ? () => dispatch({ type: 'GOTO', screen: 'replyflow' })
      : state.replyFlow?.mode === 'draft' && state.threadId
        ? () => dispatch({ type: 'OPEN_CONVERSATION', threadId: state.threadId })
        : () => dispatch({ type: 'GOTO', screen: 'drafts' })

  const busyLabel = busy
    ? popup?.kind === 'insert'
      ? 'Writing…'
      : 'Revising…'
    : state.letterLoading
      ? 'Retuning…'
      : 'Re-reading…'

  const editAnswers = () => {
    dispatch({ type: 'SET_STEP', step: 0 })
    dispatch({ type: 'GOTO', screen: 'clarify' })
  }
  const sentence = (s) => (typeof s === 'string' && s ? s[0].toUpperCase() + s.slice(1) : s)
  const contextRows = [
    { label: 'To', value: recipient || '—' },
    ...(isReplyDraft && rf?.thread ? [{ label: 'About', value: rf.thread.subject || subject }] : []),
    ...(scenario?.questions || [])
      .map((q, i) => {
        const a = state.answers[q.id]
        const value = a == null || a === '' ? null : Array.isArray(a) ? a.join(', ') : a
        const label = FIELD_LABELS[q.id] || q.title
        const rank = FIELD_ORDER.indexOf(label)
        return { label, value: sentence(value), rank: rank === -1 ? FIELD_ORDER.length + i : rank }
      })
      .sort((a, b) => a.rank - b.rank),
  ].filter((r) => r.value)

  // History panel: versions saved into the thread (reply mode carries them).
  const historyRows = rfMsgs.filter((m) => m.kind === 'draft_version')

  const trayWord = tray === 'tone' ? TONE_WORD[bucket(state.tone)] : verbLabel(state.verbosity)

  const switchTool = (k) => {
    if (tray) closeTray(true)
    setTool(k)
    setPopup(null)
    setPopupNote('')
    setHoverPt(null)
  }

  return (
    <main>
      {/* pastel mesh ground — absolutely positioned against the V4App page
          wrapper (the nearest positioned ancestor), so it runs the FULL
          page height: behind the columns AND under the transparent footer.
          z -1 inside the wrapper's isolated stacking context. */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none', backgroundColor: BG_BASE }}>
        {BG_BLOBS.map(([l, t, w, h, color, op, variant, dur, delay], i) => (
          <span
            key={i}
            className="bw-cmp4-blob"
            style={{
              left: l,
              top: t,
              width: w,
              height: h,
              background: color,
              opacity: op,
              animationName: REDUCE_MOTION ? 'none' : `bw-cmp4-blob-${variant}`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
        {/* grain: each noise texel = 2 device pixels at this resolution */}
        <span
          className="bw-cmp4-grain"
          style={{ backgroundImage: GRAIN_TILE, backgroundSize: `${GRAIN_TILE_CSS}px ${GRAIN_TILE_CSS}px` }}
        />
      </div>

      {/* ---- white header band (660:2915) ---- */}
      <header className="bw-cmp4-header">
        {/* the action pills anchor to the window's top-right, outside the
            column grid (they span wider than the rail's column) */}
        <div ref={actionsRef} className="bw-cmp4-actions">
          <PillButton primary icon={<img src={`${G4}/send.svg`} alt="" style={{ width: 24, height: 24 }} />} onClick={() => dispatch({ type: 'GOTO', screen: 'send' })}>
            Review &amp; Send
          </PillButton>
          <PillButton icon={<img src={`${G4}/star-square.svg`} alt="" style={{ width: 20, height: 20 }} />} onClick={saveDraft}>
            {saved === 'err' ? 'Couldn’t save' : saved ? 'Saved ✓' : 'Save as New Draft'}
          </PillButton>
          {/* same account control as the rest of the app's header
              (avatar + dropdown menu; Login/Sign up signed out) */}
          <AccountControl />
        </div>
        {/* same column grid as the content row below, so the badges and
            To:/RE: block sit flush with the letter card's left edge at
            every viewport width */}
        <div className="bw-cmp4-cols">
          <div style={{ paddingLeft: 9 }}>
            <PillButton
              back
              icon={
                <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* natural 13.7×12 glyph centered in the 20px slot (675:4687) */}
                  <img src={`${G4}/arrow-left.svg`} alt="" style={{ width: 14, height: 12 }} />
                </span>
              }
              onClick={goBack}
            >
              Back
            </PillButton>
          </div>
          <div className="bw-cmp4-hmid">
            <div className="bw-cmp4-badges">
              <span className="bw-cmp4-option">
                {isReplyDraft ? strat.name : `Option ${String(state.selectedIdx + 1).padStart(2, '0')}: ${strat.name}`}
              </span>
              <span className="bw-cmp4-badge">{stanceLabel(strat.level)}</span>
              {!!strat.recommended && (
                <span className="bw-cmp4-badge">
                  <img src={`${G4}/rec-sparkle.svg`} alt="" style={{ width: 10, height: 10 }} />
                  <span className="bw-cmp4-grad-text">Recommended</span>
                </span>
              )}
            </div>
            <div style={{ marginTop: 20 }}>
              <h1 className="bw-cmp4-subject">{subject}</h1>
              <RecipientLine
                role={recipientRole}
                name={recipientName}
                onCommitRole={(role) => dispatch({ type: 'SET_RECIPIENT_ROLE', role })}
                onCommitName={(name) => dispatch({ type: 'SET_RECIPIENT', recipient: name })}
              />
            </div>
          </div>
          <div />
        </div>
      </header>

      {/* ---- the three columns (the mesh ground lives above, on the
          full-page layer) ---- */}
      <div className="bw-cmp4-ground">
        <div className="bw-cmp4-row bw-cmp4-cols">
          {/* left: the Context and History chips (660:3204 / 660:3219) —
              icon-only until hovered, when they grow their label (668:3326);
              open panels keep the label out as "Hide …" */}
          <div ref={leftRef} className="bw-cmp4-left">
            <button
              className={`bw-cmp4-chip bw-cmp4-chip--morph${ctxOpen ? ' is-open' : ''}`}
              aria-expanded={ctxOpen}
              onClick={() => setCtxOpen((v) => !v)}
            >
              <span className="bw-cmp4-chip-ic">
                <img src={`${G4}/crab.png`} alt="" style={{ width: 32, height: 27, margin: '-1px 0 0 -2px' }} />
              </span>
              <span className="bw-cmp4-chip-label">{ctxOpen ? 'Hide Context' : 'Show Context'}</span>
            </button>
            {ctxOpen && (
              <div className="bw-cmp4-ctx">
                <div>
                  <div className="bw-cmp4-ctx-title">{scenario?.label}</div>
                  {contextRows.map((row, i) => (
                    <div key={i} className="bw-cmp4-field">
                      <span className="bw-cmp4-field-label">{row.label}</span>
                      <span className="bw-cmp4-field-value">{row.value}</span>
                    </div>
                  ))}
                </div>
                <button className="bw-cmp4-editans" onClick={editAnswers}>
                  ← Edit my answers
                </button>
              </div>
            )}
            <button
              className={`bw-cmp4-chip bw-cmp4-chip--morph${histOpen ? ' is-open' : ''}`}
              aria-expanded={histOpen}
              onClick={() => setHistOpen((v) => !v)}
            >
              <span className="bw-cmp4-chip-ic">
                <img src={`${G4}/chat-preview.svg`} alt="" style={{ width: 24, height: 24 }} />
              </span>
              <span className="bw-cmp4-chip-label">{histOpen ? 'Hide History' : 'Show History'}</span>
            </button>
            {histOpen && (
              <div className="bw-cmp4-ctx">
                <div>
                  <div className="bw-cmp4-ctx-title">History</div>
                  {historyRows.length ? (
                    historyRows.map((m, i) => (
                      <div key={i} className="bw-cmp4-field">
                        <span className="bw-cmp4-field-label">{m.label || `Draft version ${i + 1}`}</span>
                        <span className="bw-cmp4-field-value">
                          {(m.body || '').slice(0, 90)}
                          {(m.body || '').length > 90 ? '…' : ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: '20px', color: 'rgba(28, 23, 70, 0.5)', margin: 0, padding: '10px 8px' }}>
                      Versions you keep with “Save as New Draft” will appear here.
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* help — replays the composer tour; same hover-morph chip as
                Context/History (icon-only until hovered) */}
            <button
              className="bw-cmp4-chip bw-cmp4-chip--morph"
              aria-label="Replay the composer tour"
              onClick={() => dispatch({ type: 'ASK_TOUR' })}
            >
              <span className="bw-cmp4-chip-ic">
                <img src={`${G4}/question.svg`} alt="" style={{ width: 24, height: 24 }} />
              </span>
              <span className="bw-cmp4-chip-label">Show me around</span>
            </button>
          </div>

          {/* center: the letter card (660:2873) */}
          <div ref={letterRef} className="bw-cmp4-card" style={{ height: cardCap ?? undefined }}>
            <div
              ref={bodyRef}
              className={`bw-cmp-body bw-cmp4-body${tray ? '' : ` bw-cmp-body--${tool}`}`}
              style={{ opacity: state.letterLoading ? 0.5 : 1, userSelect: !tray && tool === 'edit' ? 'text' : 'none' }}
              onMouseMove={tool === 'insert' ? onBodyMove : undefined}
              onMouseLeave={() => setHoverPt(null)}
              onClick={tool === 'insert' ? onBodyClick : undefined}
              onScroll={() => {
                setHoverPt(null)
                setPopup(null)
              }}
            >
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
                      <span className="bw-cmp-imgtools">
                        <button title="Smaller" aria-label="Make image smaller" disabled={imageWidth(text) <= 30} onClick={(e) => { e.stopPropagation(); resizeImage(text, -15) }}>
                          <MinusIcon />
                        </button>
                        <button title="Larger" aria-label="Make image larger" disabled={imageWidth(text) >= 100} onClick={(e) => { e.stopPropagation(); resizeImage(text, 15) }}>
                          <Icon name="plus" size={15} />
                        </button>
                        <button className="is-remove" title="Remove image" aria-label="Remove image" onClick={(e) => { e.stopPropagation(); removeImage(text) }}>
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
              <div ref={sigRef} className="bw-cmp-sig bw-cmp4-sig">
                Best,
                <br />
                [Your name]
              </div>
            </div>

            {tool === 'insert' && hoverPt && !popup && !tray && (
              <div className="bw-cmp-caret" style={{ left: hoverPt.x, top: hoverPt.y, height: hoverPt.h }} />
            )}
            {popup?.kind === 'insert' && popup.caret && (
              <div className="bw-cmp-caret" style={{ left: popup.caret.x, top: popup.caret.y, height: popup.caret.h }} />
            )}

            {(state.letterLoading || busy || evaluating) && (
              <div style={{ position: 'absolute', top: 12, right: 14, zIndex: 45, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 'var(--radius-pill)', background: 'var(--ink-800)', color: 'var(--paper-0)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '0.04em' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--peri-300)', animation: 'adv-spin 1s linear infinite' }} />
                {busyLabel}
              </div>
            )}

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

            {/* bottom dock: optional tray + the tool row */}
            <div ref={dockRef} className={`bw-cmp4-dock${tray ? '' : ' bw-cmp4-dock--flat'}`}>
              {(tray === 'tone' || tray === 'length') && (
                <div className="bw-cmp4-tray">
                  <div className="bw-cmp4-tray-inner">
                    <div className="bw-cmp4-tray-meta">
                      <span className="bw-cmp4-tray-kicker">Adjust the {tray === 'tone' ? 'Tone' : 'Length'}</span>
                      <span className="bw-cmp4-tray-word">{trayWord}</span>
                    </div>
                    <TraySlider
                      kind={tray}
                      value={tray === 'tone' ? state.tone : state.verbosity}
                      disabled={state.letterLoading}
                      onChange={(v) => {
                        dispatch({ type: tray === 'tone' ? 'SET_TONE' : 'SET_VERB', value: v })
                        scheduleTunePreview()
                      }}
                    />
                    <button className="bw-cmp4-close" aria-label="Close" onClick={() => closeTray(true)}>
                      <img src={`${G4}/close.svg`} alt="" style={{ width: 24, height: 24 }} />
                    </button>
                  </div>
                </div>
              )}
              {tray === 'add' && (
                <div className="bw-cmp4-tray" style={{ minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 12px 24px' }}>
                    <span className="bw-cmp4-tray-kicker">Add Something Else</span>
                    <button className="bw-cmp4-close" aria-label="Close" onClick={() => closeTray(true)}>
                      <img src={`${G4}/close.svg`} alt="" style={{ width: 24, height: 24 }} />
                    </button>
                  </div>
                  <div style={{ padding: '0 12px 0 24px', maxHeight: 240, overflowY: 'auto' }}>
                    {addSugs == null
                      ? [0, 1].map((i) => (
                          <div key={i} className="bw-cmp4-addsug" style={{ cursor: 'default' }}>
                            <div className="bw-shimmerbar" style={{ width: 120, height: 9, marginBottom: 7 }} />
                            <div className="bw-shimmerbar" style={{ width: '90%', height: 11 }} />
                          </div>
                        ))
                      : addSugs.map((sug, i) => (
                          <button key={i} className="bw-cmp4-addsug" disabled={addBusy} onClick={() => pickAdd(sug)}>
                            <span className="t-lab">{sug.label}</span>
                            <span className="t-body">“{sug.text}”</span>
                          </button>
                        ))}
                    <div className="bw-cmp-pop-row" style={{ margin: '2px 0 4px' }}>
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
                </div>
              )}
              <div className={`bw-cmp4-toolrow${tray ? ' bw-cmp4-toolrow--tray' : ''}`}>
                <div className="bw-cmp4-toolgrp">
                  <ToolButton kind="edit" active={!tray && tool === 'edit'} onClick={() => switchTool('edit')} />
                  <ToolButton kind="insert" active={!tray && tool === 'insert'} onClick={() => switchTool('insert')} />
                  <ToolButton kind="image" active={!tray && tool === 'image'} onClick={() => switchTool('image')} />
                  <ToolButton kind="add" active={tray === 'add'} onClick={() => openTray('add')} />
                  <ToolButton kind="tone" active={tray === 'tone'} onClick={() => openTray('tone')} />
                  <ToolButton kind="length" active={tray === 'length'} onClick={() => openTray('length')} />
                </div>
                <div className="bw-cmp4-toolgrp">
                  <button className="bw-cmp4-flat" title="Undo" aria-label="Undo" disabled={!canUndo || busy || state.letterLoading} onClick={doUndo}>
                    <img src={`${G4}/undo.svg`} alt="" style={{ width: 20, height: 20 }} />
                  </button>
                  <button className="bw-cmp4-flat" title="Redo" aria-label="Redo" disabled={!canRedo || busy || state.letterLoading} onClick={doRedo}>
                    <img className="is-flip" src={`${G4}/undo.svg`} alt="" style={{ width: 20, height: 20 }} />
                  </button>
                  <button className="bw-cmp4-flat" title="Copy the letter" aria-label="Copy the letter" onClick={copyLetter} style={{ borderRadius: 12 }}>
                    {copied ? <span style={{ color: '#3A356E' }}><CheckIcon size={19} /></span> : <img src={`${G4}/copy-btn.svg`} alt="" style={{ width: 48, height: 48 }} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* right: accordions (660:3142) */}
          <aside ref={railRef} className="bw-cmp4-rail">
            <div className={`bw-cmp4-acc${accPros ? ' is-open' : ''}`}>
              <button className="bw-cmp4-acc-head" aria-expanded={accPros} onClick={() => setAccPros((v) => !v)}>
                Pros &amp; Cons
                <img src={`${G4}/caret.svg`} alt="" />
              </button>
              {accPros && (
                <>
                  <div className="bw-cmp4-ecard">
                    <div className="bw-cmp4-pchead">
                      <span className="bw-cmp4-pcicon" style={{ background: '#52BB89' }}>
                        <img src={`${G4}/thumbs-up.svg`} alt="" />
                      </span>
                      <span className="bw-cmp4-pctitle">Pros</span>
                    </div>
                    {pros.map((p, i) => (
                      <button key={i} type="button" className="bw-cmp4-pcrow" style={{ '--dot': '#52BB89' }} disabled={!p.quote} onClick={() => highlightEvidence(p.quote, 'pro')} title={p.quote ? 'Show this passage in the letter' : undefined}>
                        <span className="t-title">{p.text}</span>
                        <span className="t-quote">“{p.quote || rowQuote}”</span>
                      </button>
                    ))}
                  </div>
                  <div className="bw-cmp4-ecard">
                    <div className="bw-cmp4-pchead">
                      <span className="bw-cmp4-pcicon" style={{ background: '#FFAA22' }}>
                        <img src={`${G4}/thumbs-down.svg`} alt="" />
                      </span>
                      <span className="bw-cmp4-pctitle">Cons</span>
                    </div>
                    {cons.map((c, i) => (
                      <button key={i} type="button" className="bw-cmp4-pcrow" style={{ '--dot': '#FFAA22' }} disabled={!c.quote} onClick={() => highlightEvidence(c.quote, 'con')} title={c.quote ? 'Show this passage in the letter' : undefined}>
                        <span className="t-title">{c.text}</span>
                        <span className="t-quote">“{c.quote || rowQuote}”</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className={`bw-cmp4-acc${accFeed ? ' is-open' : ''}`} style={{ gap: 6 }}>
              <button className="bw-cmp4-acc-head" aria-expanded={accFeed} onClick={() => setAccFeed((v) => !v)}>
                Feedback
                <img src={`${G4}/caret.svg`} alt="" />
              </button>
              {accFeed && (
                <>
                  <div className="bw-cmp4-fcard">
                    <div className="t-head">
                      <span className="t-name">Risk</span>
                      <span className="t-level">{meterWord(lr)}</span>
                    </div>
                    <div className="bw-cmp4-meter">
                      <span style={{ width: `${lr}%`, backgroundImage: 'linear-gradient(90deg, var(--honey-500), var(--coral-400))' }} />
                    </div>
                  </div>
                  <div className="bw-cmp4-fcard">
                    <div className="t-head">
                      <span className="t-name">Impact</span>
                      <span className="t-level">{meterWord(le)}</span>
                    </div>
                    <div className="bw-cmp4-meter">
                      <span style={{ width: `${le}%`, backgroundImage: 'linear-gradient(90deg, var(--blue-700), var(--blue-500))' }} />
                    </div>
                  </div>
                  <div className="bw-cmp4-fcard" style={{ minHeight: 97 }}>
                    <div className="t-head" style={{ marginBottom: 6 }}>
                      <span className="t-name">Likely Reaction</span>
                    </div>
                    <p className="bw-cmp4-reaction">{state.evalReaction ?? strat.reaction}</p>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      </div>

      {tour && <Onboarding steps={tourSteps} onDone={endTour} />}
    </main>
  )
}
