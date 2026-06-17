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
  selectedIdx: 1,
  draftMode: 'list',
  mapSelIdx: 1,
  tone: 50,
  verbosity: 50,
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
      return { ...state, screen: 'landing', scenarioId: null, clarifyStep: 0, answers: {}, sent: false }
    case 'RESTART':
      return { ...state, screen: 'home', scenarioId: null, clarifyStep: 0, answers: {}, sent: false }
    case 'START_SCENARIO':
      return { ...state, scenarioId: action.scenarioId, screen: 'clarify', clarifyStep: 0, answers: {} }
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
        replacements: [],
        inserts: [],
        comments: [],
      }
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
    return {
      state,
      dispatch,
      go: (screen) => dispatch({ type: 'GOTO', screen }),
      scenario,
      selected: scenario ? scenario.strategies[state.selectedIdx] : null,
    }
  }, [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
