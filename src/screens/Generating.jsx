import React, { useEffect } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import { generateStrategies } from '../lib/advisor'

export default function Generating() {
  const { state, dispatch, go } = useStore()
  const { Sparkle } = DS

  useEffect(() => {
    let alive = true
    generateStrategies(state.scenarioId, state.answers).then((strategies) => {
      if (!alive) return
      dispatch({ type: 'SET_STRATEGIES', strategies })
      go('drafts')
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-8)',
      }}
    >
      <div>
        <div style={{ display: 'inline-block', animation: 'bw-spin 2.4s linear infinite' }}>
          <Sparkle size={44} />
        </div>
        <h1 className="bw-display" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-5)' }}>
          Composing a few ways to say this…
        </h1>
        <p className="bw-serif" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
          Weighing tone, risk, and how it’s likely to land.
        </p>
      </div>
    </main>
  )
}
