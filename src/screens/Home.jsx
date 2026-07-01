import React from 'react'
import { DATA, SCENARIO_IDS } from '../data/advocate'
import { useStore } from '../store'

export default function Home() {
  const { dispatch } = useStore()

  return (
    <main className="bw-sec-pad" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 40px 96px' }}>
      <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px' }}>
        <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 46, lineHeight: 1.04, letterSpacing: '-0.015em', color: 'var(--ink-800)', margin: '0 0 20px' }}>
          Where does it hurt?
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>
          Boundaries, disputes, speaking up. Tell us the situation and we’ll draft a few honest ways to send it — with the likely reaction for each.
        </p>
      </div>

      <div className="bw-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {SCENARIO_IDS.map((id) => {
          const d = DATA[id]
          return (
            <div
              key={id}
              className="adv-card-hover bw-home-card"
              onClick={() => dispatch({ type: 'START_SCENARIO', scenarioId: id })}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '42px 30px', background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
            >
              <figure style={{ margin: '0 0 28px', width: 88, filter: 'drop-shadow(0 3px 8px rgba(21,18,62,0.18))' }}>
                <div className="edge-perforated" style={{ padding: 7, background: 'var(--cream-0)' }}>
                  <div style={{ aspectRatio: '5 / 6', background: d.home.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                    <div style={{ width: '84%', height: '84%', backgroundImage: `url(/ds/assets/illustrations/${d.illo}.svg)`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
                  </div>
                </div>
              </figure>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 14 }}>
                {d.kicker}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.08, color: 'var(--ink-800)', margin: '0 0 16px' }}>
                {d.label}
              </h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16.5, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 28px' }}>
                {d.home.blurb}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', marginTop: 'auto' }}>
                {d.home.examples.map((ex) => (
                  <span key={ex} style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 500, color: 'var(--ink-700)', background: 'var(--cream-2)', borderRadius: 999, padding: '5px 12px' }}>
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
