import React from 'react'
import DS from '../ds'
import { useStore } from '../store'

const CARDS = [
  {
    illo: 'pocketwatch', bg: 'var(--fog-1)', title: 'No reply yet?',
    body: 'When the silence stretches, we’ll judge the timing and draft a follow-up — from a gentle nudge to a firmer note that leans on any rule or term being missed.',
  },
  {
    illo: 'envelope', bg: 'var(--peri-200)', title: 'They replied?',
    body: 'Paste their response and we’ll read the tone, tell you whether your need was actually met, and draft your next move — including how to escalate if it wasn’t.',
  },
]

export default function Next() {
  const { dispatch } = useStore()
  const { Button } = DS

  return (
    <main className="bw-sec-pad" style={{ maxWidth: 920, margin: '0 auto', padding: '56px 32px 90px' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 12 }}>After you send</div>
        <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 46, lineHeight: 1.03, color: 'var(--ink-800)', margin: '0 0 14px' }}>We’ll be here for what comes next.</h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--text-muted)', margin: '0 auto', maxWidth: 520 }}>
          A conversation rarely ends with one message. Here’s how BetterWords will help once you’ve sent yours.
        </p>
      </div>

      <div className="bw-next-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {CARDS.map((c) => (
          <div key={c.title} style={{ position: 'relative', background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '30px 28px' }}>
            <span style={{ position: 'absolute', top: 18, right: 18, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: 'var(--fog-1)', color: 'var(--text-muted)' }}>Coming soon</span>
            <figure style={{ margin: '0 0 16px', width: 76, filter: 'drop-shadow(0 3px 8px rgba(21,18,62,0.2))' }}>
              <div className="edge-perforated" style={{ padding: 6, background: 'var(--cream-0)' }}>
                <div style={{ aspectRatio: '5/6', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 7 }}>
                  <img src={`/ds/assets/illustrations/${c.illo}.svg`} alt="" style={{ width: '86%', height: '86%', objectFit: 'contain' }} />
                </div>
              </div>
            </figure>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: 'var(--ink-800)', margin: '0 0 10px' }}>{c.title}</h3>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--text-body)', margin: 0 }}>{c.body}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 44 }}>
        <Button variant="outline" size="lg" onClick={() => dispatch({ type: 'RESTART' })}>Start another message</Button>
      </div>
    </main>
  )
}
