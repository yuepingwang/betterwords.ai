import React from 'react'
import DS2 from '../ds2'
import { DATA, SCENARIO_IDS } from '../../data/advocate'
import { useStore } from '../store'

const SCENARIO_ART = { rights: 'ctx-dispute', personal: 'ctx-boundary', circle: 'ctx-speakup' }

export default function Home() {
  const { dispatch } = useStore()
  const { Card, Tag } = DS2

  return (
    <main className="bw-sec-pad" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 40px 96px' }}>
      <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px' }}>
        <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 46, lineHeight: 1.04, letterSpacing: '-0.015em', color: 'var(--text-strong)', margin: '0 0 20px' }}>
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
            <Card
              key={id}
              className="adv-card-hover bw-home-card"
              onClick={() => dispatch({ type: 'START_SCENARIO', scenarioId: id })}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '42px 30px', cursor: 'pointer' }}
            >
              <img src={`/ds-v2/assets/characters/${SCENARIO_ART[id]}.svg`} alt="" style={{ width: 132, height: 113, objectFit: 'contain', margin: '0 0 20px' }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>
                {d.kicker}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 26, lineHeight: 1.08, color: 'var(--text-strong)', margin: '0 0 16px' }}>
                {d.label}
              </h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16.5, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 28px' }}>
                {d.home.blurb}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', marginTop: 'auto' }}>
                {d.home.examples.map((ex) => (
                  <Tag key={ex}>{ex}</Tag>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
