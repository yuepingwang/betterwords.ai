import React, { createContext, useContext, useMemo, useReducer } from 'react'

// ------------------------------------------------------------------
// BetterWords app store — a single reducer holding the whole flow.
// Routes: landing → home → clarify → generating → drafts → composer
//         → send → next
// ------------------------------------------------------------------

const initialState = {
  route: 'landing',
  scenarioId: null, // 'rights' | 'personal' | 'circle'
  answers: {}, // { [questionId]: value }
  strategies: [], // generated drafts
  selectedId: null, // chosen strategy id
  tone: 45, // 0 Soft … 100 Strong
  length: 50, // 0 Succinct … 100 Detailed
  notes: [], // [{ snippet, note }]
  inserts: [], // [{ after, label, text }]
  edits: {}, // { [paragraphId]: revisedText }
}

function reducer(state, action) {
  switch (action.type) {
    case 'GOTO':
      return { ...state, route: action.route }
    case 'PICK_SCENARIO':
      return { ...state, scenarioId: action.scenarioId, answers: {}, route: 'clarify' }
    case 'ANSWER':
      return { ...state, answers: { ...state.answers, [action.id]: action.value } }
    case 'SET_STRATEGIES':
      return { ...state, strategies: action.strategies }
    case 'SELECT_STRATEGY':
      return { ...state, selectedId: action.id, notes: [], inserts: [], edits: {}, tone: action.tone ?? state.tone, length: action.length ?? state.length }
    case 'SET_EDIT':
      return { ...state, edits: { ...state.edits, [action.pid]: action.text } }
    case 'SET_TONE':
      return { ...state, tone: action.value }
    case 'SET_LENGTH':
      return { ...state, length: action.value }
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.note] }
    case 'ADD_INSERT':
      return { ...state, inserts: [...state.inserts, action.insert] }
    case 'RESTART':
      return { ...initialState, route: 'home' }
    default:
      return state
  }
}

export const StoreContext = createContext(null)
export { reducer as _reducer, initialState as _initialState }

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => {
    const go = (route) => dispatch({ type: 'GOTO', route })
    return {
      state,
      dispatch,
      go,
      selected: state.strategies.find((s) => s.id === state.selectedId) || null,
    }
  }, [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
