// ------------------------------------------------------------------
// advisor.js — the single seam between the UI and the AI.
//
// Every "AI" capability is an async function that calls OpenAI (via the
// /api/chat proxy in server/index.js) and FALLS BACK to the original
// deterministic logic if the key is missing or a call fails — so the app
// always works, even in a no-key demo. The signatures and return shapes are
// the contract the screens depend on.
// ------------------------------------------------------------------

import { DATA, getScenario } from '../data/advocate'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// --- buckets & labels ---------------------------------------------
export const bucket = (t) => (t < 34 ? 'soft' : t < 67 ? 'bal' : 'strong')
export const lvl = (v) => (v < 34 ? 'Low' : v < 67 ? 'Moderate' : 'High')
export const clamp = (v) => Math.max(4, Math.min(98, Math.round(v)))
export const toneLabel = (t) => (bucket(t) === 'soft' ? 'Soft' : bucket(t) === 'bal' ? 'Balanced' : 'Strong')
export const verbLabel = (v) => (v >= 50 ? 'Detailed' : 'Succinct')

// ==================================================================
// Transport — the only place that talks to the proxy.
// ==================================================================

// Where the AI relay lives. Empty in dev → relative /api/* → the Vite proxy
// forwards to the local Express server (server/index.js). In the deployed
// app, the Amplify build injects the Lambda Function URL via VITE_API_BASE
// (see amplify/backend.ts + amplify.yml).
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '')

let _healthPromise = null
// Cached one-shot check: is a real key configured server-side?
export function aiAvailable() {
  if (!_healthPromise) {
    _healthPromise = fetch(`${API_BASE}/api/health`)
      .then((r) => (r.ok ? r.json() : { ai: false }))
      .then((d) => Boolean(d.ai))
      .catch(() => false)
  }
  return _healthPromise
}

async function chat(messages, { json = false } = {}) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, json }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `chat failed (${res.status})`)
  }
  const data = await res.json()
  return data.content || ''
}

// Parse a JSON object out of a model response, tolerating stray prose/fences.
function parseJson(content) {
  try {
    return JSON.parse(content)
  } catch {
    const m = content.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('Model did not return JSON')
  }
}

// Readable "Question: answer" lines from the clarify step, for prompt context.
function answersContext(scenarioId, answers = {}) {
  const sc = getScenario(scenarioId)
  if (!sc) return ''
  return sc.questions
    .map((q) => {
      const a = answers[q.id]
      if (a == null || a === '') return null
      return `- ${q.title} ${Array.isArray(a) ? a.join(', ') : a}`
    })
    .filter(Boolean)
    .join('\n')
}

// The recipient's ROLE only ("Your landlord"), never the mock's invented name
// ("— Mr. Aubert"), so the canned sample identity can't leak into a real draft.
export const recipientLabel = (scenario) =>
  scenario ? (scenario.recipient || '').split(/[—·]/)[0].trim() : ''

// Prompt context is deliberately GENERIC: the situation category and the
// recipient's role. We never pass the mock's fabricated specifics (sample
// names, the $1,850 deposit, "14 Rue Pelletier", draftContext), so they can't
// bleed into a draft built from the writer's own answers.
function scenarioContext(scenarioId) {
  const sc = getScenario(scenarioId)
  if (!sc) return ''
  const role = recipientLabel(sc)
  return [`Situation type: ${sc.label}`, role && `Writing to: ${role}`].filter(Boolean).join('\n')
}

// ==================================================================
// 1) Generate strategies — the drafts shown on the Drafts screen.
// ==================================================================

const STRATEGY_SHAPE = `Return a JSON object: { "strategies": [ <three strategies> ] }.
Exactly three strategies, ordered soft → balanced → strong. Each strategy is:
{
  "name": short evocative title (e.g. "The Documented Request"),
  "level": "soft" | "balanced" | "strong",
  "toneDefault": integer 0-100 (soft~24, balanced~50, strong~80),
  "risk": integer 0-100 (chance it backfires or strains the relationship),
  "eff": integer 0-100 (likely effectiveness at getting the outcome),
  "recommended": boolean (true for EXACTLY the balanced one),
  "subject": a subject line for the message,
  "why": one sentence on why this approach works,
  "reaction": one sentence on how the recipient is likely to react,
  "paragraphs": array of 3-4 strings — the full message body at this tone,
                first-person, ready to send, NO greeting line and NO signature,
  "add": EXACTLY 3 optional insertions the writer could add to THIS draft —
         one near the opening, one in the middle, one near the close — each
         anchored to the draft's own content (not generic filler), each
         { "label": "After the opening — cite the clause", "after": <0-based paragraph index to insert after>, "text": the sentence }
}`

export async function generateStrategies(scenarioId, answers = {}) {
  try {
    const content = await chat(
      [
        {
          role: 'system',
          content:
            'You are BetterWords, an advocate that helps people say hard things clearly and with care. ' +
            'You write three real, sendable message drafts at escalating directness. Keep the writer honest, ' +
            'specific, and human — never robotic or legalese-heavy unless the situation calls for it. ' +
            'CRITICAL: Build the drafts ONLY from what the writer actually told you below. Never invent or ' +
            'carry over specific names, dollar amounts, dates, addresses, or case facts. Where a concrete ' +
            'detail would normally appear but the writer did not give it, use a clear bracketed placeholder ' +
            'like [amount], [date], [their name], or [address] so they can fill it in. ' +
            STRATEGY_SHAPE,
        },
        {
          role: 'user',
          content:
            `${scenarioContext(scenarioId)}\n\nWhat the writer told us:\n${answersContext(scenarioId, answers) || '(no extra detail)'}\n\nWrite the three strategies now.`,
        },
      ],
      { json: true }
    )
    const parsed = parseJson(content)
    const out = normalizeStrategies(parsed.strategies)
    if (out.length) return out
    throw new Error('empty strategies')
  } catch (err) {
    console.warn('[advisor] generateStrategies fell back to mock:', err.message)
    await delay(600)
    return getScenario(scenarioId)?.strategies || []
  }
}

const LEVELS = ['soft', 'balanced', 'strong']
function normalizeStrategies(arr) {
  if (!Array.isArray(arr)) return []
  return arr.slice(0, 3).map((s, i) => {
    const level = LEVELS.includes(s.level) ? s.level : LEVELS[i] || 'balanced'
    const paragraphs = Array.isArray(s.paragraphs) ? s.paragraphs.filter((p) => typeof p === 'string' && p.trim()) : []
    return {
      name: String(s.name || 'Draft'),
      level,
      toneDefault: clampInt(s.toneDefault, level === 'soft' ? 24 : level === 'strong' ? 80 : 50),
      risk: clampInt(s.risk, 45),
      eff: clampInt(s.eff, 70),
      recommended: level === 'balanced',
      subject: String(s.subject || ''),
      why: String(s.why || ''),
      reaction: String(s.reaction || ''),
      paragraphs,
      add: normalizeAdd(s.add, paragraphs.length),
    }
  })
}

// Position-appropriate safety-net insertions, used only to top a draft up to
// three "Add a passage" options when the model returns fewer than three.
const ADD_FALLBACKS = [
  { label: 'After the opening — add context', after: 0, text: 'For a little more context: here’s why this matters to me and what led to it.' },
  { label: 'In the middle — note your records', after: 1, text: 'I’ve kept records and copies of the relevant details, in case they’re helpful.' },
  { label: 'At the close — name a next step', after: 2, text: 'I’m happy to talk this through — just let me know what works best for you.' },
]

// Guarantee EXACTLY three insertions per draft: keep the model's (up to 3,
// with `after` clamped into range), then pad from the fallbacks.
function normalizeAdd(arr, paraCount) {
  const hi = paraCount > 0 ? paraCount - 1 : 8
  const out = Array.isArray(arr)
    ? arr
        .filter((a) => a && a.text)
        .slice(0, 3)
        .map((a) => ({ label: String(a.label || 'Add a passage'), after: clampInt(a.after, 0, 0, hi), text: String(a.text) }))
    : []
  for (let i = out.length; i < 3; i++) {
    const fb = ADD_FALLBACKS[i]
    out.push({ ...fb, after: Math.min(fb.after, hi) })
  }
  return out
}
function clampInt(v, fallback, lo = 0, hi = 100) {
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback
}

// ==================================================================
// 2) Compose the letter — one renderer for AI and mock strategies.
//    `letterParas` (when present) is the AI working copy; otherwise we
//    derive paragraphs from the mock's tone-variant sentence triplets.
// ==================================================================

// Derive paragraphs from a mock strategy's {soft,bal,strong} sentence triplets.
function deriveParas(strategy, tone, verbosity) {
  if (!strategy?.body) return strategy?.paragraphs ? [...strategy.paragraphs] : []
  const b = bucket(tone)
  const detailed = verbosity >= 50
  const paras = strategy.body
    .map((par) => par.s.filter((se) => !se.detail || detailed).map((se) => se[b]).join(' '))
    .filter(Boolean)
  if (strategy.close) paras.push(strategy.close)
  return paras
}

// A selection captured from the DOM (getSelection().toString()) often differs
// from the source string by whitespace at line wraps, non-breaking spaces, or
// smart-quote/dash variants — so an exact `includes` check silently misses and
// the rewrite appears to do nothing. This matcher is tolerant of all of those.
const QUOTE_CLASS = "[\"'‘’“”«»‹›]"
const DASH_CLASS = '[-‐‑‒–—―−]'
function looseRegex(find) {
  const pattern = find
    .trim()
    .split(/\s+/)
    .map((tok) =>
      tok
        .split('')
        .map((ch) => {
          if (/["'‘’“”«»‹›]/.test(ch)) return QUOTE_CLASS
          if (/[-‐‑‒–—―−]/.test(ch)) return DASH_CLASS
          return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        })
        .join('')
    )
    .join('\\s+')
  return new RegExp(pattern)
}

function applyReplacement(paras, find, replace) {
  // Fast path: exact substring (covers most edits).
  if (paras.some((p) => p.includes(find))) {
    return paras.map((p) => (p.includes(find) ? p.split(find).join(replace) : p))
  }
  // Tolerant path: match the same words allowing flexible whitespace/quotes.
  let re
  try {
    re = looseRegex(find)
  } catch {
    return paras
  }
  let done = false
  return paras.map((p) => {
    if (done || !re.test(p)) return p
    done = true
    return p.replace(re, () => replace) // function replacer → no $-substitution
  })
}

function applyEdits(paras, replacements = [], inserts = []) {
  let out = [...paras]
  replacements.forEach((rp) => {
    out = applyReplacement(out, rp.find, rp.replace)
  })
  const result = []
  out.forEach((p, i) => {
    result.push(p)
    inserts.filter((ins) => ins.after === i).forEach((ins) => result.push(ins.text))
  })
  inserts.filter((ins) => ins.after >= out.length).forEach((ins) => result.push(ins.text))
  return result
}

// The renderer the screens call. `state` carries tone/verbosity/replacements/
// inserts and an optional `letterParas` (AI working copy).
export function composeLetter(strategy, state) {
  if (!strategy) return []
  const base =
    Array.isArray(state.letterParas) && state.letterParas.length
      ? state.letterParas
      : deriveParas(strategy, state.tone, state.verbosity)
  return applyEdits(base, state.replacements, state.inserts)
}

// The working copy a strategy starts with when opened in the composer.
// For AI strategies this is the generated letter; for mock strategies we
// return null so composeLetter keeps re-deriving from the tone variants as
// the sliders move (no API call needed).
export function initialParas(strategy) {
  return strategy?.paragraphs?.length ? [...strategy.paragraphs] : null
}

// Back-compat shim: a few call sites still pass (scenarioId, idx, ...).
export function buildParas(scenarioId, selectedIdx, tone, verbosity, replacements = [], inserts = []) {
  const strat = DATA[scenarioId]?.strategies[selectedIdx]
  return applyEdits(deriveParas(strat, tone, verbosity), replacements, inserts)
}

// ==================================================================
// 3) Retune — regenerate the letter when the tone/length sliders move.
// ==================================================================

export async function retuneLetter({ scenarioId, strategy, paras, tone, verbosity }) {
  const fallback = () => deriveParas(strategy, tone, verbosity)
  if (!strategy?.paragraphs?.length) return fallback() // mock strategy → derive locally
  try {
    const content = await chat(
      [
        {
          role: 'system',
          content:
            'You rewrite a message to a target tone and length WITHOUT changing the facts, the ask, or the ' +
            'first-person voice. Preserve every concrete detail, and keep any [bracketed placeholders] exactly ' +
            'as they are — never invent names, dates, or amounts to fill them in. ' +
            'Return JSON: { "paragraphs": [ ...strings ] }. No greeting, no signature.',
        },
        {
          role: 'user',
          content:
            `${scenarioContext(scenarioId)}\n\nTarget tone: ${toneLabel(tone)} (${tone}/100, 0=soft, 100=firm).\n` +
            `Target length: ${verbLabel(verbosity)}.\n\nCurrent message:\n${paras.join('\n\n')}\n\nRewrite it.`,
        },
      ],
      { json: true }
    )
    const parsed = parseJson(content)
    const next = (parsed.paragraphs || []).filter((p) => typeof p === 'string' && p.trim())
    return next.length ? next : fallback()
  } catch (err) {
    console.warn('[advisor] retuneLetter fell back:', err.message)
    return fallback()
  }
}

// ==================================================================
// 3b) Nudge — apply ONE adjustment across the WHOLE letter (the "Nudge it"
//     preset chips: Warmer / Firmer / Shorter / Add a deadline). Like
//     retuneLetter, but driven by a free-form instruction rather than the
//     tone/length sliders. `mode` (optional) picks the deterministic
//     per-paragraph fallback used when AI is unavailable.
// ==================================================================

export async function nudgeLetter({ scenarioId, paras, instruction, mode }) {
  const base = Array.isArray(paras) ? paras : []
  const fallback = () => (mode ? base.map((p) => rephrase(p, mode)) : base)
  if (!instruction || !base.length) return fallback()
  try {
    const content = await chat(
      [
        {
          role: 'system',
          content:
            'You revise an entire message by applying ONE adjustment consistently across the whole thing, ' +
            'WITHOUT changing the facts, the ask, or the first-person voice. Preserve every concrete detail, ' +
            'and keep any [bracketed placeholders] exactly as they are — never invent names, dates, or amounts ' +
            'to fill them in. Return JSON: { "paragraphs": [ ...strings ] }. No greeting, no signature.',
        },
        {
          role: 'user',
          content:
            `${scenarioContext(scenarioId)}\n\nCurrent message:\n${base.join('\n\n')}\n\n` +
            `Adjustment to apply across the whole message: ${instruction}\n\nRewrite it.`,
        },
      ],
      { json: true }
    )
    const parsed = parseJson(content)
    const next = (parsed.paragraphs || []).filter((p) => typeof p === 'string' && p.trim())
    return next.length ? next : fallback()
  } catch (err) {
    console.warn('[advisor] nudgeLetter fell back:', err.message)
    return fallback()
  }
}

// ==================================================================
// 4) Rewrite a selected passage — inline Soften/Firmer/Shorten/Detail,
//    plus free-text "describe a change" instructions.
// ==================================================================

const MODE_INSTRUCTION = {
  soften: 'Make it warmer and more gentle, less demanding, while keeping the same meaning.',
  firmer: 'Make it more direct and firm, with a clear ask, without becoming hostile.',
  shorten: 'Make it noticeably shorter and more concise — one tight sentence if possible.',
  detail: 'Add a bit more concrete supporting detail, keeping the same tone.',
}

export async function rewritePassage({ text, mode, instruction, context = '' }) {
  const ask = instruction?.trim() || MODE_INSTRUCTION[mode]
  const fallback = () => rephrase(text, mode)
  if (!ask) return text
  try {
    const content = await chat([
      {
        role: 'system',
        content:
          'You revise a single highlighted passage from a longer message. Return ONLY the revised passage as ' +
          'plain text — no quotes, no preamble, no explanation. Keep the same first-person voice and any facts.',
      },
      {
        role: 'user',
        content:
          (context ? `For context, the full message is:\n${context}\n\n` : '') +
          `Revise this passage:\n"${text}"\n\nChange to apply: ${ask}`,
      },
    ])
    const out = content.trim().replace(/^["“]|["”]$/g, '').trim()
    return out || fallback()
  } catch (err) {
    console.warn('[advisor] rewritePassage fell back:', err.message)
    return fallback()
  }
}

// ==================================================================
// 4b) Insert a passage — the composer's insert-text tool. Writes one or two
//     new sentences to slot between two sentences (or as a new paragraph),
//     from the writer's instruction. Fallback (no AI): use the instruction
//     itself, tidied into a sentence, so the tool still works in mock mode.
// ==================================================================

export async function insertPassage({ scenarioId, before = '', after = '', context = '', instruction }) {
  const fallback = () => {
    let t = (instruction || '').trim()
    if (!t) return ''
    t = t[0].toUpperCase() + t.slice(1)
    if (!/[.!?…]$/.test(t)) t += '.'
    return t
  }
  if (!instruction?.trim()) return ''
  try {
    const placement =
      before || after
        ? `The new passage will be inserted ${before ? `right after: "${before.slice(-160)}"` : ''}` +
          `${before && after ? ' and ' : ''}${after ? `right before: "${after.slice(0, 160)}"` : ''}.`
        : 'The new passage will be added as its own paragraph.'
    const content = await chat([
      {
        role: 'system',
        content:
          'You write a short passage (one or two sentences) to be inserted into an existing message, matching ' +
          'its first-person voice and tone so the seam is invisible. Return ONLY the new passage as plain text — ' +
          'no quotes, no preamble, no explanation. Never invent names, dates, or amounts; use a [bracketed ' +
          'placeholder] if a specific is needed.',
      },
      {
        role: 'user',
        content:
          `${scenarioContext(scenarioId)}\n\nFull message:\n${context}\n\n${placement}\n\n` +
          `What it should convey: ${instruction}`,
      },
    ])
    const out = content.trim().replace(/^["“]|["”]$/g, '').trim()
    return out || fallback()
  } catch (err) {
    console.warn('[advisor] insertPassage fell back:', err.message)
    return fallback()
  }
}

// ==================================================================
// 5) Evaluate — read the CURRENT letter (after retunes, rewrites, inserts)
//    and produce a fresh "why this works" + "likely reaction", plus where the
//    draft now SITS on the tone/length scales so the sliders can follow an edit.
// ==================================================================

export async function evaluateLetter({ scenarioId, strategy, paras }) {
  const text = (paras || []).join('\n\n').trim()
  // No AI (or empty) → keep the strategy's original copy and leave the
  // sliders where they are (tone/verbosity null == "don't move them").
  const fallback = () => ({
    why: strategy?.why || '',
    reaction: strategy?.reaction || '',
    tone: null,
    verbosity: null,
  })
  if (!text) return fallback()
  try {
    const content = await chat(
      [
        {
          role: 'system',
          content:
            'You assess a near-final message the writer is about to send. Read the ACTUAL wording and return ' +
            'JSON: { "why": one sentence on why this version is effective for the writer, ' +
            '"reaction": one sentence on how the recipient is likely to react to THIS wording, ' +
            '"tone": integer 0-100 (0 = very soft and gentle, 100 = very firm and direct), ' +
            '"length": integer 0-100 (0 = very succinct, 100 = very detailed) }. ' +
            'Judge tone and length from the text itself, not from any prior version.',
        },
        {
          role: 'user',
          content: `${scenarioContext(scenarioId)}\n\nThe current message:\n${text}\n\nAssess it.`,
        },
      ],
      { json: true }
    )
    const parsed = parseJson(content)
    return {
      why: String(parsed.why || strategy?.why || ''),
      reaction: String(parsed.reaction || strategy?.reaction || ''),
      tone: parsed.tone == null ? null : clampInt(parsed.tone, 50),
      verbosity: parsed.length == null ? null : clampInt(parsed.length, 50),
    }
  } catch (err) {
    console.warn('[advisor] evaluateLetter fell back:', err.message)
    return fallback()
  }
}

// --- deterministic fallbacks --------------------------------------
// Quick regex rephrase used when AI is unavailable.
export function rephrase(text, mode) {
  const t = text.trim()
  const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1)
  if (mode === 'soften') {
    let r = t
      .replace(/\bmust\b/gi, 'would really appreciate it if you could')
      .replace(/\bneed to\b/gi, 'would appreciate it if you could')
      .replace(/\brequire\b/gi, 'would appreciate')
      .replace(/\bimmediately\b/gi, 'as soon as you’re able')
      .replace(/\bunacceptable\b/gi, 'really not what I was hoping for')
      .replace(/\bdemand\b/gi, 'ask')
    if (r === t) r = 'I’d be grateful if we could revisit this — ' + lc(t)
    return r
  }
  if (mode === 'firmer') {
    let r = t
      .replace(/\bI would appreciate it if you could\b/gi, 'I need you to')
      .replace(/\bI’d appreciate\b/gi, 'I expect')
      .replace(/\bcould you\b/gi, 'please')
      .replace(/\bI was hoping\b/gi, 'I expect')
      .replace(/\bI’d like\b/gi, 'I need')
      .replace(/\bas soon as you’re able\b/gi, 'within five business days')
    if (r === t) r = 'To be direct: ' + lc(t)
    return r
  }
  if (mode === 'shorten') {
    let first = (t.split(/(?<=[.!?])\s/)[0] || t).trim()
    if (first.length > 96) {
      first = first.split(/[,;—]/)[0].trim().replace(/[,;—]\s*$/, '')
      if (!/[.!?]$/.test(first)) first += '.'
    }
    return first
  }
  if (mode === 'detail') {
    return t.replace(/[.!?]?\s*$/, '') + ' — and I’ve kept dated records and copies of everything for reference.'
  }
  return t
}

// --- live meters / presentation (unchanged) -----------------------
export function liveRisk(strat, tone, verbosity) {
  const b = bucket(tone)
  return clamp(strat.risk + (b === 'strong' ? 14 : b === 'soft' ? -12 : 0) + (verbosity >= 50 ? 0 : 5))
}
export function liveEff(strat, tone, verbosity) {
  const b = bucket(tone)
  return clamp(strat.eff + (b === 'strong' ? 10 : b === 'soft' ? -8 : 0) + (verbosity >= 50 ? 6 : -4))
}
export function badgeColors(level) {
  if (level === 'soft') return { bg: 'var(--peri-100)', fg: 'var(--ink-700)' }
  if (level === 'balanced') return { bg: 'var(--peri-200)', fg: 'var(--royal-700)' }
  return { bg: '#F6DAD1', fg: 'var(--coral-600)' }
}
export const stanceLabel = (level) => (level === 'soft' ? 'Gentle' : level === 'balanced' ? 'Balanced' : 'Direct')
