import React, { useEffect } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { generateStrategies } from '../../lib/advisor'

export default function Generating() {
  const { state, dispatch } = useStore()
  const { Sparkle } = DS2

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
    <main className="anim-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '78vh', gap: 20, textAlign: 'center' }}>
      <Sparkle size={44} twinkle style={{ color: 'var(--spark)' }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: 0 }}>
        Composing a few ways to say this…
      </h2>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-md)', color: 'var(--text-muted)', margin: 0 }}>
        Weighing tone, risk, and how it’s likely to land.
      </p>
      {/* DS loading sweep (bw-shimmer, Motion spec) */}
      <div aria-hidden className="bw-shimmerbar" style={{ width: 180, height: 10, marginTop: 8 }} />
    </main>
  )
}
