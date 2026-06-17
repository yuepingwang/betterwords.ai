// ------------------------------------------------------------------
// advisor.js — the single seam between the UI and "the AI".
// Logic transcribed faithfully from Advocate.dc.html so the mock behaves
// exactly like the design. Swap these bodies for Anthropic API calls to go
// live; the signatures and return shapes are the contract the screens use.
// ------------------------------------------------------------------

import { DATA, getScenario } from '../data/advocate'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// --- buckets & labels ---------------------------------------------
export const bucket = (t) => (t < 34 ? 'soft' : t < 67 ? 'bal' : 'strong')
export const lvl = (v) => (v < 34 ? 'Low' : v < 67 ? 'Moderate' : 'High')
export const clamp = (v) => Math.max(4, Math.min(98, Math.round(v)))
export const toneLabel = (t) => (bucket(t) === 'soft' ? 'Soft' : bucket(t) === 'bal' ? 'Balanced' : 'Strong')
export const verbLabel = (v) => (v >= 50 ? 'Detailed' : 'Succinct')

// --- the generation step ------------------------------------------
export async function generateStrategies(scenarioId) {
  await delay(1600)
  return getScenario(scenarioId)?.strategies || []
}

// Build the letter's paragraphs from the current tone/verbosity, applying
// any selection replacements and inserted passages.
export function buildParas(scenarioId, selectedIdx, tone, verbosity, replacements = [], inserts = []) {
  const strat = DATA[scenarioId]?.strategies[selectedIdx]
  if (!strat) return []
  const b = bucket(tone)
  const detailed = verbosity >= 50
  let paras = strat.body
    .map((par) => par.s.filter((se) => !se.detail || detailed).map((se) => se[b]).join(' '))
    .filter(Boolean)
  paras.push(strat.close)
  replacements.forEach((rp) => {
    paras = paras.map((p) => (p.includes(rp.find) ? p.split(rp.find).join(rp.replace) : p))
  })
  const result = []
  paras.forEach((p, i) => {
    result.push(p)
    inserts.filter((ins) => ins.after === i).forEach((ins) => result.push(ins.text))
  })
  inserts.filter((ins) => ins.after >= paras.length).forEach((ins) => result.push(ins.text))
  return result
}

// Deterministic quick rephrase of a selected passage.
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

// Live risk / impact as the sliders move.
export function liveRisk(strat, tone, verbosity) {
  const b = bucket(tone)
  return clamp(strat.risk + (b === 'strong' ? 14 : b === 'soft' ? -12 : 0) + (verbosity >= 50 ? 0 : 5))
}
export function liveEff(strat, tone, verbosity) {
  const b = bucket(tone)
  return clamp(strat.eff + (b === 'strong' ? 10 : b === 'soft' ? -8 : 0) + (verbosity >= 50 ? 6 : -4))
}

// Stance badge presentation per strategy level.
export function badgeColors(level) {
  if (level === 'soft') return { bg: 'var(--peri-100)', fg: 'var(--ink-700)' }
  if (level === 'balanced') return { bg: 'var(--peri-200)', fg: 'var(--royal-700)' }
  return { bg: '#F6DAD1', fg: 'var(--coral-600)' }
}
export const stanceLabel = (level) => (level === 'soft' ? 'Gentle' : level === 'balanced' ? 'Balanced' : 'Direct')
