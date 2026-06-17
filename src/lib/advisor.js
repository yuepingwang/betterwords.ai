// ------------------------------------------------------------------
// advisor.js — the single seam between the UI and "the AI".
//
// Today every function returns scripted/mock data synchronously-ish
// (wrapped in promises + small delays to mimic latency). To go live,
// replace the bodies with Anthropic API calls — the signatures and the
// shapes they return are the contract the screens depend on.
// ------------------------------------------------------------------

import { getQuestions } from '../data/scenarios'
import { getStrategies } from '../data/strategies'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// Intake questions for a scenario.
export async function getClarifyingQuestions(scenarioId) {
  return getQuestions(scenarioId)
}

// Generate the ranked strategy options from the gathered context.
// (Mock: returns the seeded strategies, ranked, recommended flag intact.)
export async function generateStrategies(scenarioId /*, answers */) {
  await delay(1500)
  return getStrategies(scenarioId).map((s, i) => ({ ...s, rank: i + 1 }))
}

// --- tone / length helpers ----------------------------------------

export function toneBand(tone) {
  if (tone < 34) return 'soft'
  if (tone > 66) return 'strong'
  return 'mid'
}

export function toneLabel(tone) {
  if (tone < 20) return 'Soft'
  if (tone < 40) return 'Gentle'
  if (tone < 60) return 'Balanced'
  if (tone < 80) return 'Firm'
  return 'Strong'
}

export function lengthLabel(length) {
  if (length < 20) return 'Terse'
  if (length < 40) return 'Succinct'
  if (length < 60) return 'Measured'
  if (length < 80) return 'Detailed'
  return 'Thorough'
}

function pickVariant(slot, band) {
  if (typeof slot === 'string') return slot
  if (slot.text) return slot.text
  return slot[band] || slot.mid || slot.soft || slot.strong
}

// Compose a concrete letter from a strategy + the current slider state.
// Returns a structured letter the composer renders and edits.
export function composeDraft(strategy, tone, length, extra = {}) {
  const band = toneBand(tone)
  const showDetail = length >= 55
  const showAll = length >= 80

  const body = strategy.body
    .filter((slot) => {
      if (!slot.detail) return true
      return showDetail || (showAll && slot.detail)
    })
    .map((slot) => pickVariant(slot, band))

  // Merge any user-inserted passages at their anchor positions.
  const inserts = extra.inserts || []
  const merged = []
  body.forEach((p, i) => {
    merged.push({ id: `p${i}`, text: p })
    inserts
      .filter((ins) => ins.after === i)
      .forEach((ins, j) => merged.push({ id: `ins-${i}-${j}`, text: ins.text, inserted: true }))
  })

  return {
    to: strategy.to,
    re: strategy.re,
    salutation: pickVariant(strategy.salutation, band),
    paragraphs: merged,
    closing: pickVariant(strategy.closing, band),
    signoff: strategy.signoff,
  }
}

// Live risk/impact as the sliders move. Firmer + more detailed reads as
// higher impact and somewhat higher risk; softer pulls both down.
export function liveMetrics(strategy, tone, length) {
  const toneDelta = (tone - 50) / 50 // -1 … 1
  const lenDelta = (length - 50) / 50
  const clamp = (n) => Math.max(4, Math.min(98, Math.round(n)))
  return {
    risk: clamp(strategy.risk + toneDelta * 22 + lenDelta * 4),
    impact: clamp(strategy.impact + toneDelta * 14 + lenDelta * 8),
  }
}

export function riskWord(n) {
  if (n < 30) return 'Low'
  if (n < 55) return 'Moderate'
  if (n < 75) return 'Elevated'
  return 'High'
}

export function impactWord(n) {
  if (n < 35) return 'Soft'
  if (n < 60) return 'Moderate'
  if (n < 80) return 'High'
  return 'Strong'
}

// --- selection-level edits ----------------------------------------

// Quick rephrase of a selected passage. (Mock: deterministic transforms.)
const QUICK = {
  soften: (t) =>
    t
      .replace(/\bI need\b/g, 'I’d really appreciate it if')
      .replace(/\bPlease\b/g, 'If you could,')
      .replace(/\brequire\b/g, 'would value')
      .replace(/\.$/,', if that works.'),
  firmer: (t) =>
    t
      .replace(/I’d really appreciate it if/g, 'I need')
      .replace(/I’d like/g, 'I need')
      .replace(/Could you/g, 'Please')
      .replace(/, if that works\.?$/, '.'),
  shorten: (t) => {
    const first = t.split(/(?<=[.!?])\s/)[0]
    return first || t
  },
  detail: (t) => t.replace(/\.$/, ', so we have a clear, shared record of what was agreed.'),
}

export async function reviseSelection(text, instruction) {
  await delay(450)
  const fn = QUICK[instruction]
  if (fn) return fn(text)
  // freeform note: lightly acknowledge the request inline (mock)
  return text
}

// Suggest where and what to add ("Add a passage").
export async function suggestInsertions(strategy, paragraphCount) {
  await delay(350)
  const last = Math.max(0, paragraphCount - 1)
  return [
    {
      after: 0,
      label: 'Add context',
      text: 'For background, this isn’t the first time I’ve raised it — I’d mentioned it informally before and wanted to put it more clearly this time.',
    },
    {
      after: Math.min(1, last),
      label: 'Acknowledge their side',
      text: 'I realize you’re juggling a lot, and I don’t assume any of this was deliberate.',
    },
    {
      after: last,
      label: 'Offer a next step',
      text: 'If it’s easier to talk it through, I’m happy to find a time that works for you.',
    },
  ]
}

export const plainText = (letter) => {
  const lines = [letter.salutation, '', ...letter.paragraphs.map((p) => p.text).join('\n\n').split('\n'), '', letter.closing, letter.signoff]
  return lines.join('\n')
}
