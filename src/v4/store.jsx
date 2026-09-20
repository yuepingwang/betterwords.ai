import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { getScenario } from './data/advocate'
import { DEMO_THREADS } from './lib/demo'

// ------------------------------------------------------------------
// BetterWords app store — mirrors the state model in Advocate.dc.html.
// Screens: landing → home → clarify → generating → drafts → editor
//          → send → next
// ------------------------------------------------------------------

const initialState = {
  screen: 'landing',
  scenarioId: null,
  clarifyStep: 0,
  answers: {},
  strategies: null, // AI-generated drafts; null → fall back to static DATA
  draftedAnswers: null, // answers snapshot the current drafts were generated from
  genLoading: false,
  selectedIdx: 1,
  draftMode: 'list',
  mapSelIdx: 1,
  tone: 50,
  verbosity: 50,
  letterParas: null, // AI working copy of the open letter; null → derive from mock
  letterLoading: false,
  evalWhy: null, // model's read of the CURRENT letter; null → use the strategy's copy
  evalReaction: null,
  evalPros: null, // fresh pros/cons from the model; null → static per-stance copy
  evalCons: null,
  evalRisk: null, // fresh risk/impact reads; null → local slider heuristics
  evalImpact: null,
  replacements: [],
  inserts: [],
  comments: [],
  sent: false,
  tourAsk: 0, // bumped by the header help button; Composer opens its tour
  threadId: null, // Supabase thread for this scenario run (null until first save)
  // --- conversations (v3.5) ---
  activeThreadId: null, // thread open on the conversation screen
  convoRefresh: 0, // bump to make the conversation screens refetch
  replyFlow: null, // { mode: 'respond' | 'followup', replyText, thread } while in the reply flow
  subjectOverride: null, // thread subject carried into the composer for replies/follow-ups
}

// Browser back/forward (see the history sync in StoreProvider). Within a
// session the flow state is usually still in memory, so restoring is mostly
// just pointing `screen` back; screens whose required state is gone — or that
// are transient, like the generating spinner — fall back to the nearest safe
// ancestor instead of stranding the user on a broken screen.
function navRestore(state, action) {
  let screen = action.screen
  const threadId = action.threadId || state.activeThreadId
  if (screen === 'generating') screen = state.scenarioId ? 'clarify' : 'dashboard'
  if (['clarify', 'drafts', 'editor', 'send', 'next'].includes(screen) && !state.scenarioId) screen = 'dashboard'
  if (screen === 'replyflow' && !state.replyFlow) screen = threadId ? 'conversation' : 'conversations'
  if (screen === 'conversation' && !threadId) screen = 'conversations'
  const next = { ...state, screen }
  if (screen === 'conversation') {
    next.activeThreadId = threadId
    next.threadId = threadId
    next.convoRefresh = state.convoRefresh + 1
  }
  // Like OPEN_HOME / OPEN_CONVERSATIONS: landing back on a list screen
  // closes the open thread (and refetches), so the URL drops `thread`.
  if (screen === 'conversations' || screen === 'dashboard') {
    next.activeThreadId = null
    next.convoRefresh = state.convoRefresh + 1
  }
  return next
}

function reducer(state, action) {
  switch (action.type) {
    case 'GOTO':
      return { ...state, screen: action.screen }
    case 'NAV_RESTORE':
      return navRestore(state, action)
    case 'GO_LANDING':
      return { ...state, screen: 'landing', scenarioId: null, clarifyStep: 0, answers: {}, strategies: null, draftedAnswers: null, sent: false, threadId: null, activeThreadId: null, replyFlow: null, subjectOverride: null }
    case 'RESTART':
      return { ...state, screen: 'home', scenarioId: null, clarifyStep: 0, answers: {}, strategies: null, draftedAnswers: null, sent: false, threadId: null, activeThreadId: null, replyFlow: null, subjectOverride: null }
    case 'START_SCENARIO':
      return { ...state, scenarioId: action.scenarioId, screen: 'clarify', clarifyStep: 0, answers: {}, strategies: null, draftedAnswers: null, threadId: null, activeThreadId: null, replyFlow: null, subjectOverride: null }
    case 'OPEN_HOME':
      // Signed-in home (Figma 489:3991) — the dashboard the header's "Home"
      // link and a completed sign-in land on. Clears flow state like
      // OPEN_CONVERSATIONS so a later "+ New" starts fresh.
      return { ...state, screen: 'dashboard', activeThreadId: null, replyFlow: null, subjectOverride: null, sent: false, convoRefresh: state.convoRefresh + 1 }
    // --- conversations (v3.5) ---
    case 'OPEN_CONVERSATIONS':
      return { ...state, screen: 'conversations', activeThreadId: null, replyFlow: null, subjectOverride: null, sent: false, convoRefresh: state.convoRefresh + 1 }
    case 'OPEN_CONVERSATION':
      return { ...state, screen: 'conversation', activeThreadId: action.threadId, threadId: action.threadId, replyFlow: null, sent: false, convoRefresh: state.convoRefresh + 1 }
    case 'START_REPLY_FLOW':
      // Entering the respond/follow-up flow for a loaded thread. Carries the
      // thread's scenario + subject into the store so the composer, save, and
      // send all continue the SAME conversation instead of starting fresh.
      return {
        ...state,
        screen: 'replyflow',
        replyFlow: { mode: action.mode, replyText: action.replyText || null, thread: action.thread },
        // The composer needs a scenario for its strategy scaffolding — fall
        // back to 'rights' for threads that predate scenario tracking.
        scenarioId: action.thread?.scenarioId || state.scenarioId || 'rights',
        threadId: action.thread?.id ?? state.threadId,
        activeThreadId: action.thread?.id ?? state.activeThreadId,
        subjectOverride: action.thread?.subject || null,
        answers: action.thread?.context?.answers || state.answers,
        sent: false,
      }
    case 'PATCH_REPLY_FLOW':
      // Remember where the reply flow stands (current step, the cached
      // interpretation) so leaving for the composer and coming back lands
      // on the same screen without re-reading the reply.
      return state.replyFlow ? { ...state, replyFlow: { ...state.replyFlow, ...action.patch } } : state
    case 'SET_THREAD':
      // Supabase thread created by the first save/send of this run — later
      // saves append to it (see lib/db.js).
      return { ...state, threadId: action.threadId }
    case 'ASK_TOUR':
      return { ...state, tourAsk: state.tourAsk + 1 }
    case 'SET_GEN_LOADING':
      return { ...state, genLoading: action.value }
    case 'SET_STRATEGIES':
      // Remember which answers these drafts came from, so Clarify can offer
      // "View my options" (skip regeneration) when nothing changed since.
      return { ...state, strategies: action.strategies, draftedAnswers: state.answers, genLoading: false }
    case 'SET_STEP':
      return { ...state, clarifyStep: action.step }
    case 'ANSWER':
      return { ...state, answers: { ...state.answers, [action.id]: action.value } }
    case 'SET_DRAFT_MODE':
      return { ...state, draftMode: action.mode }
    case 'SET_MAP_SEL':
      return { ...state, mapSelIdx: action.idx }
    case 'OPEN_COMPOSER':
      return {
        ...state,
        selectedIdx: action.idx,
        screen: 'editor',
        tone: action.toneDefault,
        verbosity: 50,
        letterParas: action.paras ?? null,
        letterLoading: false,
        evalWhy: null,
        evalReaction: null,
        evalPros: null,
        evalCons: null,
        evalRisk: null,
        evalImpact: null,
        replacements: [],
        inserts: [],
        comments: [],
      }
    case 'SET_LETTER':
      return { ...state, letterParas: action.paras, letterLoading: false }
    case 'SET_EVAL':
      // Refresh the evaluation panel from the current draft. The tone/length
      // sliders are animated separately (SET_TONE / SET_VERB) so they glide.
      // Null fields keep the previous value (or the static fallback).
      return {
        ...state,
        evalWhy: action.why ?? state.evalWhy,
        evalReaction: action.reaction ?? state.evalReaction,
        evalPros: action.pros ?? state.evalPros,
        evalCons: action.cons ?? state.evalCons,
        evalRisk: action.risk ?? state.evalRisk,
        evalImpact: action.impact ?? state.evalImpact,
      }
    case 'SET_LETTER_LOADING':
      return { ...state, letterLoading: action.value }
    case 'RESTORE_EDIT':
      // Undo/redo in the composer — restore a full editing snapshot at once.
      return {
        ...state,
        letterParas: action.letterParas,
        replacements: action.replacements,
        inserts: action.inserts,
        tone: action.tone,
        verbosity: action.verbosity,
        letterLoading: false,
      }
    case 'SET_TONE':
      return { ...state, tone: action.value }
    case 'SET_VERB':
      return { ...state, verbosity: action.value }
    case 'ADD_REPLACEMENT':
      return { ...state, replacements: [...state.replacements, action.replacement] }
    case 'ADD_INSERT':
      return { ...state, inserts: [...state.inserts, action.insert] }
    case 'SET_INSERTS':
      return { ...state, inserts: action.inserts }
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.comment] }
    case 'SET_SENT':
      return { ...state, sent: action.sent }
    default:
      return state
  }
}

export const StoreContext = createContext(null)
export { reducer as _reducer, initialState as _initialState }

// Dev deep-link: `?screen=editor&scenario=rights[&idx=1]` boots straight
// into a screen with a mock scenario loaded — for design review/screenshots.
function initState() {
  try {
    const p = new URLSearchParams(window.location.search)
    const screen = p.get('screen')
    if (!screen) return initialState
    const scenarioId = p.get('scenario') || 'rights'
    const idx = Math.max(0, Math.min(2, Number(p.get('idx') ?? 1)))
    const sc = getScenario(scenarioId)
    const toneDefault = sc?.strategies?.[idx]?.toneDefault ?? 50
    // `&demo=1` prefills sample answers (first chip / de-e.g.'d placeholder)
    // as if the clarify flow was completed, for screens that recap them.
    let answers = {}
    let clarifyStep = 0
    if (p.get('demo') && sc) {
      sc.questions.forEach((q) => {
        answers[q.id] = q.type === 'text' ? (q.placeholder || '').replace(/^e\.g\.\s*/, '') : q.options[0]
      })
      clarifyStep = sc.questions.length - 1
    }
    // A drafts deep-link acts as if these answers already produced the drafts
    const draftedAnswers = screen === 'drafts' && Object.keys(answers).length ? answers : null
    // Conversation deep-links: `?screen=conversation&thread=demo-replied`
    const activeThreadId = p.get('thread') || null
    // Reply-mode composer deep-link: `?screen=editor&reply=respond|followup`
    // boots the composer as if the reply flow drafted from a demo thread —
    // for design review of the in-conversation composer (Figma 449:3223).
    let replyFlow = null
    const replyMode = p.get('reply')
    if (screen === 'editor' && (replyMode === 'respond' || replyMode === 'followup')) {
      const thread = DEMO_THREADS[replyMode === 'respond' ? 0 : 1]
      const lastOut = [...thread.messages].reverse().find((m) => m.kind === 'sent' || m.kind === 'followup')
      replyFlow = {
        mode: replyMode,
        replyText: thread.messages.find((m) => m.kind === 'reply')?.body || null,
        thread,
        draftParas: (lastOut?.body || '').split(/\n\n+/),
        moveTitle: replyMode === 'followup' ? 'The Gentle Nudge' : 'The Warm Confirm',
      }
    }
    return {
      ...initialState,
      screen,
      scenarioId: replyFlow?.thread?.scenarioId || scenarioId,
      selectedIdx: idx,
      tone: toneDefault,
      answers: replyFlow ? replyFlow.thread.context?.answers || {} : answers,
      clarifyStep,
      draftedAnswers,
      activeThreadId: replyFlow?.thread?.id || activeThreadId,
      threadId: replyFlow?.thread?.id || null,
      subjectOverride: replyFlow?.thread?.subject || null,
      replyFlow,
    }
  } catch {
    return initialState
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initState())

  // ---- history sync — the browser back/forward buttons work ----
  // State → URL: every screen change writes a `?screen=` history entry
  // (matching the deep-link format initState already reads, so reloads
  // restore too). The `v` fork param and everything else in the query
  // string ride along untouched.
  const popRef = useRef(false) // true while applying a popstate restore
  const firstRef = useRef(true)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    p.set('screen', state.screen)
    if (state.activeThreadId) p.set('thread', state.activeThreadId)
    else p.delete('thread')
    // `scenario` only matters to the composer-flow deep links — keep the
    // other screens' URLs clean of it (initState defaults it anyway).
    if (state.scenarioId && ['clarify', 'generating', 'drafts', 'editor', 'send', 'next'].includes(state.screen)) p.set('scenario', state.scenarioId)
    else p.delete('scenario')
    const qs = `?${p.toString()}`
    const entry = { screen: state.screen, thread: state.activeThreadId, scenario: state.scenarioId }
    // Replace instead of push when: seeding the initial entry, landing on a
    // popped entry (the browser already moved; pushing would orphan the
    // forward stack — this also realigns the URL after a fallback restore),
    // or the URL already matches (just seed the entry state).
    if (firstRef.current || popRef.current || qs === window.location.search) {
      firstRef.current = false
      window.history.replaceState(entry, '', qs)
    } else {
      window.history.pushState(entry, '', qs)
    }
  }, [state.screen, state.activeThreadId, state.scenarioId])

  // URL → state: back/forward restores the entry's screen via NAV_RESTORE.
  useEffect(() => {
    const onPop = (e) => {
      popRef.current = true
      // Effects run before timers, so this clears the flag right after the
      // restore commits — even when the restore turns out to be a no-op.
      setTimeout(() => { popRef.current = false }, 0)
      const p = new URLSearchParams(window.location.search)
      dispatch({
        type: 'NAV_RESTORE',
        screen: e.state?.screen || p.get('screen') || 'landing',
        threadId: e.state?.thread ?? p.get('thread') ?? null,
      })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const value = useMemo(() => {
    const scenario = state.scenarioId ? getScenario(state.scenarioId) : null
    // AI-generated strategies take precedence; the static DATA is the fallback.
    const strategies = state.strategies || (scenario ? scenario.strategies : [])
    return {
      state,
      dispatch,
      go: (screen) => dispatch({ type: 'GOTO', screen }),
      scenario,
      strategies,
      selected: strategies[state.selectedIdx] || null,
    }
  }, [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
