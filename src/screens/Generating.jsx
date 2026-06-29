import React, { useEffect } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import { generateStrategies } from '../lib/advisor'

export default function Generating() {
  const { state, dispatch } = useStore()
  const { Sparkle } = DS

  useEffect(() => {
    let alive = true
    dispatch({ type: 'SET_GEN_LOADING', value: true })
    // Real AI generation (falls back to the mock internally if the key is
    // missing or the call fails), tailored to the clarify-step answers.
    generateStrategies(state.scenarioId, state.answers).then((strategies) => {
      if (!alive) return
      dispatch({ type: 'SET_STRATEGIES', strategies })
      const recIdx = strategies.findIndex((x) => x.recommended)
      dispatch({ type: 'SET_MAP_SEL', idx: recIdx < 0 ? 1 : recIdx })
      dispatch({ type: 'SET_DRAFT_MODE', mode: 'list' })
      dispatch({ type: 'GOTO', screen: 'drafts' })
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 22, textAlign: 'center' }}>
      <div style={{ animation: 'adv-spin 4s linear infinite', color: 'var(--royal-600)' }}>
        <Sparkle size={44} />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32, color: 'var(--ink-800)', margin: 0 }}>
        Composing a few ways to say this…
      </h2>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-muted)', margin: 0 }}>
        Weighing tone, risk, and how it’s likely to land.
      </p>
    </main>
  )
}
