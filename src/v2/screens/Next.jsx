import React from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'

const CARDS = [
  {
    art: 'ctx-waiting', title: 'No reply yet?',
    body: 'When the silence stretches, we’ll judge the timing and draft a follow-up — from a gentle nudge to a firmer note that leans on any rule or term being missed.',
  },
  {
    art: 'ctx-sent', title: 'They replied?',
    body: 'Paste their response and we’ll read the tone, tell you whether your need was actually met, and draft your next move — including how to escalate if it wasn’t.',
  },
]

export default function Next() {
  const { dispatch } = useStore()
  const { Card, Button, Badge } = DS2

  return (
    <main className="bw-sec-pad" style={{ maxWidth: 920, margin: '0 auto', padding: '56px 32px 90px' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>After you send</div>
        <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 46, lineHeight: 1.03, color: 'var(--text-strong)', margin: '0 0 14px' }}>We’ll be here for what comes next.</h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--text-muted)', margin: '0 auto', maxWidth: 520 }}>
          A conversation rarely ends with one message. Here’s how BetterWords will help once you’ve sent yours.
        </p>
      </div>

      <div className="bw-next-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {CARDS.map((c) => (
          <Card key={c.title} style={{ position: 'relative', padding: '30px 28px' }}>
            <span style={{ position: 'absolute', top: 18, right: 18 }}>
              <Badge tone="neutral" size="sm">Coming soon</Badge>
            </span>
            <img src={`/ds-v2/assets/characters/${c.art}.svg`} alt="" style={{ width: 120, height: 103, objectFit: 'contain', margin: '0 0 14px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 24, color: 'var(--text-strong)', margin: '0 0 10px' }}>{c.title}</h3>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--text-body)', margin: 0 }}>{c.body}</p>
          </Card>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 44 }}>
        <Button variant="outline" size="lg" onClick={() => dispatch({ type: 'RESTART' })}>Start another message</Button>
      </div>
    </main>
  )
}
