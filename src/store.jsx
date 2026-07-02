import React, { createContext, useContext, useMemo, useReducer } from 'react'
import { getScenario } from './data/advocate'

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
  replacements: [],
  inserts: [],
  comments: [],
  sent: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'GOTO':
      return { ...state, screen: action.screen }
    case 'GO_LANDING':
      return { ...state, screen: 'landing', scenarioId: null, clarifyStep: 0, answers: {}, strategies: null, sent: false }
    case 'RESTART':
      return { ...state, screen: 'home', scenarioId: null, clarifyStep: 0, answers: {}, strategies: null, sent: false }
    case 'START_SCENARIO':
      return { ...state, scenarioId: action.scenarioId, screen: 'clarify', clarifyStep: 0, answers: {}, strategies: null }
    case 'SET_GEN_LOADING':
      return { ...state, genLoading: action.value }
    case 'SET_STRATEGIES':
      return { ...state, strategies: action.strategies, genLoading: false }
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
        replacements: [],
        inserts: [],
        comments: [],
      }
    case 'SET_LETTER':
      return { ...state, letterParas: action.paras, letterLoading: false }
    case 'SET_EVAL':
      // Refresh the "why / reaction" copy from the current draft. The tone/length
      // sliders are animated separately (SET_TONE / SET_VERB) so they glide.
      return {
        ...state,
        evalWhy: action.why ?? state.evalWhy,
        evalReaction: action.reaction ?? state.evalReaction,
      }
    case 'SET_LETTER_LOADING':
      return { ...state, letterLoading: action.value }
    case 'SET_TONE':
      return { ...state, tone: action.value }
    case 'SET_VERB':
      return { ...state, verbosity: action.value }
    case 'ADD_REPLACEMENT':
      return { ...state, replacements: [...state.replacements, action.replacement] }
    case 'ADD_INSERT':
      return { ...state, inserts: [...state.inserts, action.insert] }
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

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
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
