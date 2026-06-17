import React from 'react'
import DS from '../ds'
import { useStore } from '../store'
import Illustration from '../components/Illustration'

const CARDS = [
  {
    illustration: 'pocketwatch',
    title: 'No reply yet?',
    body: 'When the wait stretches on, we’ll help you judge the right moment — and draft a follow-up that nudges without nagging.',
  },
  {
    illustration: 'envelope',
    title: 'They replied?',
    body: 'Paste what came back. We’ll read the tone, tell you whether your need was actually met, and draft your next move.',
  },
]

export default function Next() {
  const { dispatch } = useStore()
  const { Button, Tag } = DS

  return (
    <main className="bw-container" style={{ paddingBlock: 'var(--space-10)', maxWidth: 'var(--container-md)', textAlign: 'center' }}>
      <p className="bw-kicker">What happens next</p>
      <h1 className="bw-display" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-2)' }}>
        We’ll be here for the reply.
      </h1>
      <p className="bw-serif" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-3)', maxWidth: '54ch', marginInline: 'auto' }}>
        The hardest message is often the first one. When the response comes — or doesn’t — BetterWords keeps your context and helps you take the next step.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)', marginTop: 'var(--space-8)', textAlign: 'left' }}>
        {CARDS.map((c) => (
          <article
            key={c.title}
            style={{
              background: 'var(--surface-letter)',
              border: '1px solid var(--border-hair)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              padding: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Illustration name={c.illustration} size={48} />
              <Tag>Coming soon</Tag>
            </div>
            <h2 className="bw-display" style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)' }}>{c.title}</h2>
            <p className="bw-serif" style={{ color: 'var(--text-body)', marginTop: 'var(--space-2)' }}>{c.body}</p>
          </article>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <Button variant="outline" size="lg" onClick={() => dispatch({ type: 'RESTART' })}>
          Start another message
        </Button>
      </div>
    </main>
  )
}
