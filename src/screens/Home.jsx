import React from 'react'
import DS from '../ds'
import { SCENARIOS } from '../data/scenarios'
import { useStore } from '../store'
import Illustration from '../components/Illustration'

export default function Home() {
  const { dispatch } = useStore()
  const { Tag } = DS

  return (
    <main className="bw-container" style={{ paddingBlock: 'var(--space-10)' }}>
      <p className="bw-kicker">Where it helps</p>
      <h1 className="bw-display" style={{ fontSize: 'var(--text-3xl)', marginTop: 'var(--space-3)' }}>
        Where does it hurt?
      </h1>
      <p
        className="bw-serif"
        style={{ fontSize: 'var(--text-md)', maxWidth: '52ch', marginTop: 'var(--space-3)', color: 'var(--text-muted)' }}
      >
        Pick the situation that fits. A few quick questions next — then a handful of honest drafts to choose from.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-5)',
          marginTop: 'var(--space-8)',
        }}
      >
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className="bw-lift"
            onClick={() => dispatch({ type: 'PICK_SCENARIO', scenarioId: s.id })}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--surface-letter)',
              border: '1px solid var(--border-hair)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <Illustration name={s.illustration} size={52} style={{ color: 'var(--pencil-600)' }} />
            <p className="bw-kicker" style={{ marginTop: 'var(--space-2)' }}>{s.kicker}</p>
            <h2 className="bw-display" style={{ fontSize: 'var(--text-lg)' }}>{s.title}</h2>
            <p className="bw-serif" style={{ color: 'var(--text-body)' }}>{s.blurb}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {s.examples.slice(0, 4).map((ex) => (
                <Tag key={ex}>{ex}</Tag>
              ))}
            </div>
            <span
              style={{
                marginTop: 'var(--space-3)',
                color: 'var(--accent)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Start here →
            </span>
          </button>
        ))}
      </div>

      <p style={{ marginTop: 'var(--space-9)', color: 'var(--text-faint)', fontSize: 'var(--text-sm)' }}>
        Private by design · Nothing is sent until you seal it
      </p>
    </main>
  )
}
